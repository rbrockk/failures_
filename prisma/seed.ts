import { PrismaClient } from "@prisma/client"
import { INCIDENTS } from "../lib/incidents/data"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")
  
  // Clear existing data
  await prisma.fixStep.deleteMany()
  await prisma.detectionResult.deleteMany()
  await prisma.eventLog.deleteMany()
  await prisma.incident.deleteMany()

  for (const mockInc of INCIDENTS) {
    const inc = await prisma.incident.create({
      data: {
        code: mockInc.id,
        title: mockInc.title,
        provider: mockInc.tags[0] || "Unknown",
        severity: mockInc.severity.charAt(0).toUpperCase() + mockInc.severity.slice(1),
        status: mockInc.status.charAt(0).toUpperCase() + mockInc.status.slice(1),
        service: mockInc.service,
        environment: mockInc.environment,
        description: mockInc.description,
        rootCause: mockInc.rootCause?.category,
        confidence: mockInc.rootCause?.confidence,
        firstSeenAt: new Date(mockInc.startedAt),
        lastSeenAt: mockInc.lastSeenAt ? new Date(mockInc.lastSeenAt) : new Date(mockInc.startedAt),
        resolvedAt: mockInc.resolvedAt ? new Date(mockInc.resolvedAt) : null,
        occurrenceCount: mockInc.occurrenceCount || 1,
        
        eventLogs: {
          create: mockInc.timeline.map((t, idx) => ({
            provider: mockInc.tags[0] || "Unknown",
            normalizedMessage: t.event,
            fingerprint: `fp-seed-${mockInc.id}-${idx}`,
            severity: mockInc.severity.charAt(0).toUpperCase() + mockInc.severity.slice(1),
            rawPayload: { event: t.event },
            createdAt: new Date(t.at)
          }))
        },
        
        fixSteps: mockInc.remediationSteps ? {
          create: mockInc.remediationSteps.map((step, idx) => ({
            stepNumber: idx + 1,
            title: step,
            description: step,
          }))
        } : undefined
      }
    })
    
    console.log(`Created incident: ${inc.code}`)
  }
  
  console.log("Seeding finished.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
