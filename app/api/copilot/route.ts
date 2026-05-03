import { convertToModelMessages, stepCountIs, streamText, UIMessage, validateUIMessages } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { copilotTools } from "@/lib/incidents/tools"

export const maxDuration = 60

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const SYSTEM_PROMPT = `You are the Incident Copilot for "Integration Failure Detective" — a senior SRE AI assistant.

Your role is to help engineering teams understand, diagnose, and resolve production incidents.

## Response Format
When answering about an incident, ALWAYS structure your response as:
1. **What happened** — a clear, factual summary of the event
2. **Probable root cause** — the technical reason, with confidence if available
3. **Immediate fix** — actionable steps to stop the bleeding right now
4. **Prevention actions** — how to stop this class of incident from recurring

## Rules
- NEVER invent data. Always call the appropriate tool to fetch real incident data.
- If you don't have enough information, ask ONE short clarifying question.
- Always include the incident ID(s) as evidence references (e.g. [INC-001]).
- Prefer calling tools over guessing — even for simple summaries.
- Be concise but technically precise. Avoid filler. Engineers need signal, not noise.
- Use markdown formatting for clarity: bold for key points, code blocks for commands/config.

## Available tools
- listOpenCriticalIncidents: find what's urgent right now
- getIncidentById: get full details for a specific incident
- summarizeIncident: get a structured summary
- suggestRemediation: get fix plan and prevention steps
- getRootCauseClusters: identify systemic patterns across incidents
- exportIncidentMarkdown: generate a shareable postmortem report`

export async function POST(req: Request) {
  // Check for Groq API key
  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      {
        error: "COPILOT_UNAVAILABLE",
        message:
          "Copilot is unavailable — GROQ_API_KEY is not configured. Please add it in your project environment variables.",
      },
      { status: 503 },
    )
  }

  const body = await req.json()

  const messages: UIMessage[] = await validateUIMessages({
    messages: body.messages ?? [],
    tools: copilotTools,
  })

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: copilotTools,
    stopWhen: stepCountIs(8),
  })

  return result.toUIMessageStreamResponse()
}
