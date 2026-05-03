import { describe, it, expect, beforeEach } from "vitest"
import { ingestIncidentEvent, generateFingerprint } from "../lib/incidents/dedup"
import { INCIDENTS } from "../lib/incidents/data"

describe("Incident Deduplication", () => {
  const originalLength = INCIDENTS.length

  beforeEach(() => {
    // Reset any added incidents to keep tests isolated
    INCIDENTS.splice(0, INCIDENTS.length - originalLength)
  })

  it("should create a new incident on first event", async () => {
    const event = {
      provider: "Stripe",
      endpoint: "/v1/charges",
      errorCode: "502",
      normalizedMessage: "bad gateway",
      rawMessage: "Stripe returned 502 Bad Gateway on /v1/charges",
      severity: "high" as const,
      service: "payment-service",
      environment: "production",
      affectedSystems: ["payment-service"]
    }

    const incident = await ingestIncidentEvent(event)
    
    expect(incident.title).toContain("[Stripe]")
    expect(incident.fingerprint).toBeDefined()
    expect(incident.occurrenceCount).toBe(1)
    expect(INCIDENTS.length).toBe(originalLength + 1)
  })

  it("should deduplicate and increment occurrence on matching open incident", async () => {
    const event = {
      provider: "AWS",
      endpoint: "S3",
      errorCode: "403",
      normalizedMessage: "forbidden",
      rawMessage: "Access Denied on S3 bucket",
      severity: "medium" as const,
      service: "storage-service",
      environment: "production",
      affectedSystems: ["storage-service"]
    }

    // First event creates it
    const inc1 = await ingestIncidentEvent(event)
    const fp1 = inc1.fingerprint
    
    // Second event should dedup
    const inc2 = await ingestIncidentEvent(event)
    
    expect(inc2.id).toBe(inc1.id)
    expect(inc2.occurrenceCount).toBe(2)
    expect(INCIDENTS.length).toBe(originalLength + 1)
  })
})
