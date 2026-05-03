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
  const now = new Date().toISOString()

  // 1. Dedup: Check for open match
  const existingIndex = INCIDENTS.findIndex(
    (i) => i.fingerprint === fingerprint && ["open", "investigating"].includes(i.status)
  )

  if (existingIndex !== -1) {
    const existing = INCIDENTS[existingIndex]
    existing.occurrenceCount = (existing.occurrenceCount || 1) + 1
    existing.lastSeenAt = now
    
    // Only append to timeline if it's been a while or it's a significant milestone, 
    // but for simplicity we just append the event.
    // To prevent infinite growth, cap timeline
    if (existing.timeline.length < 50) {
      existing.timeline.push({
        at: now,
        event: `Repeated failure: ${event.rawMessage} (Count: ${existing.occurrenceCount})`
      })
    }
    
    return existing
  }

  // 2. Create new incident
  const nextId = `INC-${String(INCIDENTS.length + 1).padStart(3, "0")}`
  const newIncident: Incident = {
    id: nextId,
    title: `[${event.provider}] ${event.errorCode} on ${event.endpoint}`,
    severity: event.severity,
    status: "open",
    service: event.service,
    environment: event.environment,
    startedAt: now,
    lastSeenAt: now,
    description: `Automated detection: ${event.rawMessage}`,
    affectedSystems: event.affectedSystems,
    timeline: [
      { at: now, event: `Incident automatically created from event: ${event.rawMessage}` }
    ],
    tags: [event.provider, event.service, "auto-detected"],
    fingerprint,
    occurrenceCount: 1,
  }

  INCIDENTS.unshift(newIncident)

  // 3. Slack alert for Critical
  if (event.severity === "critical" || event.severity === "high") {
    // Fire and forget so we don't block
    sendCriticalAlert(newIncident).catch(console.error)
  }

  return newIncident
}
