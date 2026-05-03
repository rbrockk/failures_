import { generateText, UIMessage, convertToModelMessages, stepCountIs } from "ai"
import { copilotTools } from "@/lib/incidents/tools"
import { getConfiguredProviders } from "./providers"
import { rulesFallbackResponse } from "./rules-fallback"

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
- Be extremely concise. Give brief, bulleted answers by default to save tokens and latency.
- Use markdown formatting for clarity: bold for key points, code blocks for commands/config.`

export interface GenerateResponseResult {
  text: string
  provider: string
  model: string
  fallbackLevel: number
  degradedMode: boolean
}

export async function generateResponse(messages: UIMessage[]): Promise<GenerateResponseResult> {
  const providers = getConfiguredProviders()
  const modelMessages = await convertToModelMessages(messages)
  
  let fallbackLevel = 0

  for (const provider of providers) {
    try {
      console.log(`[LLM Fallback] Attempting provider: ${provider.name} (${provider.modelId})`)
      
      const { text } = await generateText({
        model: provider.modelInstance,
        system: SYSTEM_PROMPT,
        messages: modelMessages,
        tools: copilotTools,
        stopWhen: stepCountIs(5),
        abortSignal: AbortSignal.timeout(10000), // 10s timeout per provider
      })

      return {
        text,
        provider: provider.name,
        model: provider.modelId,
        fallbackLevel,
        degradedMode: false
      }
      
    } catch (error) {
      console.warn(`[LLM Fallback] Provider ${provider.name} failed:`, error instanceof Error ? error.message : error)
      fallbackLevel++
    }
  }

  console.warn("[LLM Fallback] All providers failed. Using rules-based fallback.")
  
  // Rules-only fallback
  const text = await rulesFallbackResponse(messages)
  return {
    text,
    provider: "none",
    model: "rules-engine",
    fallbackLevel,
    degradedMode: true
  }
}
