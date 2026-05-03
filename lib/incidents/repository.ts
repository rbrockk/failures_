import { prisma } from "../prisma"
import { INCIDENTS as MOCK_INCIDENTS } from "./data"

export async function getIncidents() {
  if (process.env.DEMO_MODE === "true" || !prisma) {
    return MOCK_INCIDENTS
  }
  
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { updatedAt: 'desc' }
    })
    
    // Map to expected UI model format if needed
    return incidents.map(inc => ({
      id: inc.code, // UI expects string IDs like INC-001
      title: inc.title,
      severity: inc.severity.toLowerCase() as any,
      status: inc.status.toLowerCase() as any,
      service: inc.service || "unknown",
      environment: inc.environment || "production",
      startedAt: inc.firstSeenAt.toISOString(),
      resolvedAt: inc.resolvedAt?.toISOString(),
      lastSeenAt: inc.lastSeenAt.toISOString(),
      description: inc.description,
      rootCause: inc.rootCause ? {
        category: inc.rootCause,
        description: "", // Missing from basic model
        confidence: inc.confidence ?? 0
      } : undefined,
      affectedSystems: [], // Not fully modeled
      timeline: [],
      remediationSteps: [],
      tags: [inc.provider],
      fingerprint: undefined,
      occurrenceCount: inc.occurrenceCount
    }))
  } catch (error) {
    console.error("[DB Error] Failed to get incidents:", error)
    return MOCK_INCIDENTS // graceful fallback
  }
}

export async function getIncidentByCode(code: string) {
  if (process.env.DEMO_MODE === "true" || !prisma) {
    return MOCK_INCIDENTS.find(i => i.id.toUpperCase() === code.toUpperCase())
  }
  
  try {
    const inc = await prisma.incident.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        eventLogs: {
          orderBy: { createdAt: 'desc' }
        },
        fixSteps: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    })
    
    if (!inc) return null
    
    return {
      id: inc.code,
      title: inc.title,
      severity: inc.severity.toLowerCase() as any,
      status: inc.status.toLowerCase() as any,
      service: inc.service || "unknown",
      environment: inc.environment || "production",
      startedAt: inc.firstSeenAt.toISOString(),
      resolvedAt: inc.resolvedAt?.toISOString(),
      lastSeenAt: inc.lastSeenAt.toISOString(),
      description: inc.description,
      rootCause: inc.rootCause ? {
        category: inc.rootCause,
        description: "",
        confidence: inc.confidence ?? 0
      } : undefined,
      affectedSystems: [], 
      timeline: inc.eventLogs.map(log => ({
        at: log.createdAt.toISOString(),
        event: log.normalizedMessage
      })),
      remediationSteps: inc.fixSteps.map(step => step.title),
      tags: [inc.provider],
      occurrenceCount: inc.occurrenceCount
    }
  } catch (error) {
    console.error("[DB Error] Failed to get incident:", error)
    return MOCK_INCIDENTS.find(i => i.id.toUpperCase() === code.toUpperCase())
  }
}
