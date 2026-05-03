import { UIMessage } from "ai"
import { copilotTools } from "@/lib/incidents/tools"

/**
 * A basic deterministic fallback for when all LLM APIs fail.
 * It searches the user's latest message for keywords or incident IDs
 * and invokes the relevant tools to return a structured markdown response.
 */
export async function rulesFallbackResponse(messages: UIMessage[]): Promise<string> {
  const lastMessage = messages[messages.length - 1]
  const text = (lastMessage as any)?.content || ""
  
  // Basic Regex for Incident IDs like INC-001 or incident 001
  const incidentMatch = text.match(/INC-\d+/i) || text.match(/incident\s*(\d+)/i)
  
  if (incidentMatch) {
    const id = incidentMatch[0].toUpperCase().replace("INCIDENT ", "INC-")
    
    // Check if they are asking for summary, root cause, or fix
    if (text.toLowerCase().includes("fix") || text.toLowerCase().includes("remediation")) {
      const tool = copilotTools.suggestRemediation
      const result = (await tool.execute!({ id }, { toolCallId: "fallback-1", messages: [] })) as any
      
      return `**What happened**: Degraded mode (Rules-only). Retrieved fix for ${id}.
      
**Immediate fix**:
${result.immediateSteps ? result.immediateSteps.join('\\n') : 'N/A'}

**Prevention actions**:
${result.preventionSteps ? result.preventionSteps.join('\\n') : 'N/A'}`
    }
    
    // Default to summary
    const tool = copilotTools.summarizeIncident
    const result = (await tool.execute!({ id }, { toolCallId: "fallback-2", messages: [] })) as any
    
    return `**What happened**: Degraded mode (Rules-only). 
Incident ${result.id} (${result.status}): ${result.whatHappened}

**Probable root cause**:
${result.rootCause ? JSON.stringify(result.rootCause) : 'Unknown'}

**Immediate fix**:
Check the incident dashboard or ask for a remediation plan.`
  }

  // If asking about general open incidents
  if (text.toLowerCase().includes("open") || text.toLowerCase().includes("critical")) {
    const tool = copilotTools.listOpenCriticalIncidents
    const result = (await tool.execute!({ limit: 5 } as any, { toolCallId: "fallback-3", messages: [] })) as any
    
    const lines = result.incidents.map((inc: any) => `- **${inc.id}** (${inc.severity}): ${inc.title}`).join("\n")
    
    return `**What happened**: Degraded mode (Rules-only). Found ${result.incidents.length} open critical incidents.

${lines}

**Probable root cause**: Unknown without inspecting specific incident.
**Immediate fix**: Investigate incidents above.
**Prevention actions**: N/A`
  }

  return `**What happened**: I am currently operating in Degraded Mode (Rules-only) because all LLM providers are unavailable.

I can only answer direct questions about specific incidents (e.g. "Summarize INC-001" or "How to fix INC-002") or list open critical incidents.

**Probable root cause**: API Rate limits or missing API keys for configured providers.
**Immediate fix**: Provide an incident ID or check the system configuration.
**Prevention actions**: Add valid API keys to \`.env\`.`
}
