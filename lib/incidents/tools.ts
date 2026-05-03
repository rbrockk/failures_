import { tool } from "ai"
import { z } from "zod"
import { INCIDENTS, type TimeRange } from "./data"

// ---------------------------------------------------------------------------
// listOpenCriticalIncidents
// ---------------------------------------------------------------------------
export const listOpenCriticalIncidentsTool = tool({
  description:
    "List all open or investigating incidents with critical or high severity. Use this to answer questions like 'what is urgent right now?' or 'what is the most critical incident?'",
  inputSchema: z.object({}),
  execute: async () => {
    const results = INCIDENTS.filter(
      (i) => ["open", "investigating"].includes(i.status) && ["critical", "high"].includes(i.severity),
    ).map((i) => ({
      id: i.id,
      title: i.title,
      severity: i.severity,
      status: i.status,
      service: i.service,
      startedAt: i.startedAt,
      affectedSystems: i.affectedSystems,
    }))
    
    // Cost/latency mode: Limit context to top 5
    const top5 = results.slice(0, 5)
    return { 
      incidents: top5, 
      total: results.length,
      note: results.length > 5 ? `Showing top 5 out of ${results.length} critical incidents.` : undefined
    }
  },
})

// ---------------------------------------------------------------------------
// getIncidentById
// ---------------------------------------------------------------------------
export const getIncidentByIdTool = tool({
  description:
    "Get full details for a specific incident by its ID (e.g. INC-001). Returns all fields including timeline, root cause, and remediation steps.",
  inputSchema: z.object({
    id: z.string().describe("The incident ID, e.g. 'INC-001'"),
  }),
  execute: async ({ id }) => {
    const incident = INCIDENTS.find((i) => i.id.toUpperCase() === id.toUpperCase())
    if (!incident) {
      return { error: `Incident ${id} not found. Available IDs: ${INCIDENTS.map((i) => i.id).join(", ")}` }
    }
    return { incident }
  },
})

// ---------------------------------------------------------------------------
// summarizeIncident
// ---------------------------------------------------------------------------
export const summarizeIncidentTool = tool({
  description:
    "Return a structured summary of an incident: what happened, probable root cause, current status, and duration. Good for quick overviews.",
  inputSchema: z.object({
    id: z.string().describe("The incident ID, e.g. 'INC-002'"),
  }),
  execute: async ({ id }) => {
    const incident = INCIDENTS.find((i) => i.id.toUpperCase() === id.toUpperCase())
    if (!incident) {
      return { error: `Incident ${id} not found.` }
    }

    const startMs = new Date(incident.startedAt).getTime()
    const endMs = incident.resolvedAt ? new Date(incident.resolvedAt).getTime() : Date.now()
    const durationMinutes = Math.round((endMs - startMs) / 60000)
    const durationLabel =
      durationMinutes < 60 ? `${durationMinutes}m` : `${Math.round(durationMinutes / 60)}h ${durationMinutes % 60}m`

    return {
      id: incident.id,
      title: incident.title,
      severity: incident.severity,
      status: incident.status,
      service: incident.service,
      whatHappened: incident.description,
      rootCause: incident.rootCause ?? null,
      affectedSystems: incident.affectedSystems,
      duration: durationLabel,
      timelineEvents: incident.timeline.length,
    }
  },
})

// ---------------------------------------------------------------------------
// suggestRemediation
// ---------------------------------------------------------------------------
export const suggestRemediationTool = tool({
  description:
    "Return the remediation steps and fix plan for an incident. Use this when asked for a fix plan, resolution steps, or how to prevent recurrence.",
  inputSchema: z.object({
    id: z.string().describe("The incident ID, e.g. 'INC-003'"),
  }),
  execute: async ({ id }) => {
    const incident = INCIDENTS.find((i) => i.id.toUpperCase() === id.toUpperCase())
    if (!incident) {
      return { error: `Incident ${id} not found.` }
    }

    return {
      id: incident.id,
      title: incident.title,
      severity: incident.severity,
      immediateSteps: incident.remediationSteps?.slice(0, 2) ?? [],
      preventionSteps: incident.remediationSteps?.slice(2) ?? [],
      rootCause: incident.rootCause ?? null,
      tags: incident.tags,
    }
  },
})

// ---------------------------------------------------------------------------
// getRootCauseClusters
// ---------------------------------------------------------------------------
export const getRootCauseClustersTool = tool({
  description:
    "Aggregate and cluster root cause categories across incidents in a given time range to identify patterns and systemic issues.",
  inputSchema: z.object({
    timeRange: z
      .enum(["1h", "6h", "24h", "7d", "30d"])
      .describe("Time window to analyse: '1h', '6h', '24h', '7d', '30d'"),
  }),
  execute: async ({ timeRange }: { timeRange: TimeRange }) => {
    const now = Date.now()
    const rangeMs: Record<TimeRange, number> = {
      "1h": 3600000,
      "6h": 21600000,
      "24h": 86400000,
      "7d": 604800000,
      "30d": 2592000000,
    }
    const cutoff = now - rangeMs[timeRange]

    const inRange = INCIDENTS.filter((i) => new Date(i.startedAt).getTime() >= cutoff)

    const clusters: Record<string, { count: number; incidents: string[]; avgConfidence: number }> = {}

    for (const incident of inRange) {
      if (!incident.rootCause) continue
      const cat = incident.rootCause.category
      if (!clusters[cat]) {
        clusters[cat] = { count: 0, incidents: [], avgConfidence: 0 }
      }
      clusters[cat].count += 1
      clusters[cat].incidents.push(incident.id)
      clusters[cat].avgConfidence =
        (clusters[cat].avgConfidence * (clusters[cat].count - 1) + incident.rootCause.confidence) /
        clusters[cat].count
    }

    const sorted = Object.entries(clusters)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([category, data]) => ({ category, ...data }))

    return {
      timeRange,
      totalIncidents: inRange.length,
      clusters: sorted,
      mostFrequent: sorted[0] ?? null,
    }
  },
})

// ---------------------------------------------------------------------------
// exportIncidentMarkdown
// ---------------------------------------------------------------------------
export const exportIncidentMarkdownTool = tool({
  description:
    "Generate a Markdown incident report for a given incident ID. Useful for sharing, postmortems, or documentation.",
  inputSchema: z.object({
    id: z.string().describe("The incident ID, e.g. 'INC-001'"),
  }),
  execute: async ({ id }) => {
    const incident = INCIDENTS.find((i) => i.id.toUpperCase() === id.toUpperCase())
    if (!incident) {
      return { error: `Incident ${id} not found.` }
    }

    const lines: string[] = [
      `# Incident Report: ${incident.id}`,
      `## ${incident.title}`,
      "",
      `| Field | Value |`,
      `|---|---|`,
      `| **Severity** | ${incident.severity.toUpperCase()} |`,
      `| **Status** | ${incident.status} |`,
      `| **Service** | ${incident.service} |`,
      `| **Environment** | ${incident.environment} |`,
      `| **Started** | ${incident.startedAt} |`,
      incident.resolvedAt ? `| **Resolved** | ${incident.resolvedAt} |` : "",
      "",
      `## What Happened`,
      incident.description,
      "",
      `## Root Cause`,
      incident.rootCause
        ? `**${incident.rootCause.category}** (confidence: ${Math.round(incident.rootCause.confidence * 100)}%)\n\n${incident.rootCause.description}`
        : "Under investigation.",
      "",
      `## Affected Systems`,
      incident.affectedSystems.map((s) => `- ${s}`).join("\n"),
      "",
      `## Timeline`,
      incident.timeline.map((e) => `- \`${e.at}\` — ${e.event}`).join("\n"),
      "",
      `## Remediation Steps`,
      incident.remediationSteps?.map((s, i) => `${i + 1}. ${s}`).join("\n") ?? "TBD",
    ]

    return { id: incident.id, markdown: lines.filter((l) => l !== null).join("\n") }
  },
})

// ---------------------------------------------------------------------------
// Export all tools as a map
// ---------------------------------------------------------------------------
export const copilotTools = {
  listOpenCriticalIncidents: listOpenCriticalIncidentsTool,
  getIncidentById: getIncidentByIdTool,
  summarizeIncident: summarizeIncidentTool,
  suggestRemediation: suggestRemediationTool,
  getRootCauseClusters: getRootCauseClustersTool,
  exportIncidentMarkdown: exportIncidentMarkdownTool,
}
