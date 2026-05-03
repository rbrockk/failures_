import { prisma } from "../prisma"
import { INCIDENTS, Incident, IncidentSeverity } from "./data"
import { sendCriticalAlert } from "./slack"

export interface IncidentEvent {
  provider: string
  endpoint: string
  errorCode: string
  normalizedMessage: string
  rawMessage: string
  severity: IncidentSeverity
  service: string
  environment: string
  affectedSystems: string[]
}

export function generateFingerprint(event: IncidentEvent): string {
  const data = `${event.provider}|${event.endpoint}|${event.errorCode}|${event.normalizedMessage}`
  // Basic hash function
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `fp-${Math.abs(hash).toString(16)}`
}

export async function ingestIncidentEvent(event: IncidentEvent): Promise<Incident> {
  const fingerprint = generateFingerprint(event)
  const now = new Date()

  // Use Prisma if not in mock demo mode
  if (process.env.DEMO_MODE !== "true") {
    try {
      // Find open/investigating incidents with matching fingerprint via EventLog
      const existingLogs = await prisma.eventLog.findFirst({
        where: {
          fingerprint,
          incident: {
            status: { in: ["Open", "Investigating", "open", "investigating"] }
          }
        },
        orderBy: { createdAt: 'desc' },
        include: { incident: true }
      })

      if (existingLogs && existingLogs.incident) {
        const inc = existingLogs.incident
        
        // Update incident occurrence count and last seen
        const updated = await prisma.incident.update({
          where: { id: inc.id },
          data: {
            occurrenceCount: { increment: 1 },
            lastSeenAt: now,
            eventLogs: {
              create: {
                provider: event.provider,
                endpoint: event.endpoint,
                errorCode: event.errorCode,
                normalizedMessage: event.normalizedMessage,
                fingerprint,
                severity: event.severity,
                rawPayload: { message: event.rawMessage },
                createdAt: now,
              }
            }
          }
        })
        
        // Return mapped
        return {
          id: updated.code,
          title: updated.title,
          severity: updated.severity.toLowerCase() as any,
          status: updated.status.toLowerCase() as any,
          service: updated.service || "unknown",
          environment: updated.environment || "production",
          startedAt: updated.firstSeenAt.toISOString(),
          lastSeenAt: updated.lastSeenAt.toISOString(),
          description: updated.description,
          rootCause: updated.rootCause ? {
            category: updated.rootCause,
            description: "",
            confidence: updated.confidence ?? 0
          } : undefined,
          affectedSystems: event.affectedSystems,
          timeline: [], // mock
          remediationSteps: [],
          tags: [updated.provider],
          fingerprint,
          occurrenceCount: updated.occurrenceCount
        }
      } else {
        // Create new
        // Get next code number
        const count = await prisma.incident.count()
        const code = `INC-${String(count + 1).padStart(3, "0")}`
        
        const newInc = await prisma.incident.create({
          data: {
            code,
            title: `[${event.provider}] ${event.errorCode} on ${event.endpoint}`,
            provider: event.provider,
            severity: event.severity,
            status: "Open",
            service: event.service,
            environment: event.environment,
            description: `Automated detection: ${event.rawMessage}`,
            firstSeenAt: now,
            lastSeenAt: now,
            occurrenceCount: 1,
            eventLogs: {
              create: {
                provider: event.provider,
                endpoint: event.endpoint,
                errorCode: event.errorCode,
                normalizedMessage: event.normalizedMessage,
                fingerprint,
                severity: event.severity,
                rawPayload: { message: event.rawMessage },
                createdAt: now,
              }
            }
          }
        })
        
        const mapped: Incident = {
          id: newInc.code,
          title: newInc.title,
          severity: newInc.severity.toLowerCase() as any,
          status: "open",
          service: newInc.service || "unknown",
          environment: newInc.environment || "production",
          startedAt: newInc.firstSeenAt.toISOString(),
          lastSeenAt: newInc.lastSeenAt.toISOString(),
          description: newInc.description,
          affectedSystems: event.affectedSystems,
          timeline: [{ at: now.toISOString(), event: `Incident automatically created from event: ${event.rawMessage}` }],
          tags: [newInc.provider, "auto-detected"],
          fingerprint,
          occurrenceCount: 1
        }
        
        if (event.severity === "critical" || event.severity === "high") {
          sendCriticalAlert(mapped).catch(console.error)
        }
        return mapped
      }
    } catch (err) {
      console.error("[DB Error] Failed to ingest to Prisma, falling back to in-memory:", err)
    }
  }

  // MOCK/FALLBACK LOGIC
  const existingIndex = INCIDENTS.findIndex(
    (i) => i.fingerprint === fingerprint && ["open", "investigating"].includes(i.status)
  )

  if (existingIndex !== -1) {
    const existing = INCIDENTS[existingIndex]
    existing.occurrenceCount = (existing.occurrenceCount || 1) + 1
    existing.lastSeenAt = now.toISOString()
    if (existing.timeline.length < 50) {
      existing.timeline.push({
        at: now.toISOString(),
        event: `Repeated failure: ${event.rawMessage} (Count: ${existing.occurrenceCount})`
      })
    }
    return existing
  }

  const nextId = `INC-${String(INCIDENTS.length + 1).padStart(3, "0")}`
  const newIncident: Incident = {
    id: nextId,
    title: `[${event.provider}] ${event.errorCode} on ${event.endpoint}`,
    severity: event.severity,
    status: "open",
    service: event.service,
    environment: event.environment,
    startedAt: now.toISOString(),
    lastSeenAt: now.toISOString(),
    description: `Automated detection: ${event.rawMessage}`,
    affectedSystems: event.affectedSystems,
    timeline: [
      { at: now.toISOString(), event: `Incident automatically created from event: ${event.rawMessage}` }
    ],
    tags: [event.provider, event.service, "auto-detected"],
    fingerprint,
    occurrenceCount: 1,
  }

  INCIDENTS.unshift(newIncident)

  if (event.severity === "critical" || event.severity === "high") {
    sendCriticalAlert(newIncident).catch(console.error)
  }

  return newIncident
}
