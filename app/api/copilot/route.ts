import { UIMessage } from "ai"
import { copilotTools } from "@/lib/incidents/tools"
import { generateResponse } from "@/lib/llm/fallback-chain"

export const maxDuration = 60

// In-memory cache: query hash -> { response, expiresAt }
const responseCache = new Map<string, { result: any; expiresAt: number }>()

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

  // Cost/latency mode: caching
  const lastUserMsg = messages.filter(m => m.role === "user").pop()?.parts?.[0]
  const cacheKey = lastUserMsg && typeof lastUserMsg === 'object' && 'text' in lastUserMsg 
    ? lastUserMsg.text.trim().toLowerCase() 
    : "default"
    
  const now = Date.now()
  if (responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey)!
    if (now < cached.expiresAt) {
      const result = cached.result
      return new Response(result.text, {
        headers: {
          "X-Provider-Used": result.provider + " (cached)",
          "X-Model-Used": result.model,
          "X-Fallback-Level": String(result.fallbackLevel),
          "X-Degraded-Mode": String(result.degradedMode),
          "Content-Type": "text/plain; charset=utf-8",
          "Access-Control-Expose-Headers": "X-Provider-Used, X-Model-Used, X-Fallback-Level, X-Degraded-Mode",
        },
      })
    }
  }

  // Execute fallback chain
  const result = await generateResponse(messages)

  // Save to cache (TTL 3 min)
  responseCache.set(cacheKey, { result, expiresAt: now + 3 * 60 * 1000 })

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
