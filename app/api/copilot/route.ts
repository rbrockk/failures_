import { UIMessage } from "ai"
import { copilotTools } from "@/lib/incidents/tools"
import { generateResponse } from "@/lib/llm/fallback-chain"

export const maxDuration = 60

export async function POST(req: Request) {
  const body = await req.json()

  // Accept messages in either format: {role, content} or full UIMessage with parts
  // We normalize them here so the fallback chain always gets valid UIMessages
  const rawMessages: Array<{ id?: string; role: string; content?: string; parts?: unknown[] }> =
    body.messages ?? []

  const messages: UIMessage[] = rawMessages.map((m, i) => {
    const id = m.id ?? `msg-${i}`
    const role = (m.role ?? "user") as "user" | "assistant" | "system"
    const text = m.content ?? ""
    const parts = m.parts ?? [{ type: "text", text }]
    return { id, role, parts } as UIMessage
  })

  if (messages.length === 0) {
    return new Response("No messages provided", { status: 400 })
  }

  // Execute fallback chain
  const result = await generateResponse(messages)

  return new Response(result.text || "(No response generated)", {
    headers: {
      "X-Provider-Used": result.provider,
      "X-Model-Used": result.model,
      "X-Fallback-Level": String(result.fallbackLevel),
      "X-Degraded-Mode": String(result.degradedMode),
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Expose-Headers": "X-Provider-Used, X-Model-Used, X-Fallback-Level, X-Degraded-Mode",
    },
  })
}
