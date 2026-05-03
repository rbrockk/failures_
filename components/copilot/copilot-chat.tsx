"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { SendHorizonal, StopCircle, AlertTriangle, Loader2 } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { StarterPrompts } from "./starter-prompts"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

type Status = "idle" | "loading" | "error"

export function CopilotChat() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<Status>("idle")
  const [apiUnavailable, setApiUnavailable] = useState(false)
  const [unavailableMsg, setUnavailableMsg] = useState("")
  const [providerInfo, setProviderInfo] = useState<{ provider: string; degraded: boolean } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const isLoading = status === "loading"

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, status])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    setErrorMsg(null)
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text }
    const assistantId = crypto.randomUUID()

    setMessages((prev) => [...prev, userMsg])
    setStatus("loading")

    const controller = new AbortController()
    abortRef.current = controller

    try {
      // Build messages array for the API (convert to UIMessage format)
      const apiMessages = [...messages, userMsg].map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        parts: [{ type: "text", text: m.content }],
      }))

      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      })

      // Read provider metadata from headers
      const providerUsed = res.headers.get("X-Provider-Used")
      const degradedMode = res.headers.get("X-Degraded-Mode") === "true"
      if (providerUsed) {
        setProviderInfo({ provider: providerUsed, degraded: degradedMode })
      }

      if (res.status === 503) {
        const data = await res.json()
        setApiUnavailable(true)
        setUnavailableMsg(data.message ?? "Copilot is unavailable.")
        setStatus("error")
        return
      }

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      // Read plain-text response body (streaming-friendly)
      const reader = res.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let accumulated = ""

      // Add placeholder assistant message
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
        )
      }

      setStatus("idle")
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setStatus("idle")
        return
      }
      console.error("Copilot error:", err)
      setErrorMsg("Something went wrong. Please try again.")
      setStatus("error")
    } finally {
      abortRef.current = null
    }
  }, [messages, isLoading])

  function handleSend() {
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage(text)
    setInput("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleStarterSelect(text: string) {
    sendMessage(text)
    inputRef.current?.focus()
  }

  function handleStop() {
    abortRef.current?.abort()
  }

  // Auto-resize textarea
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Provider Badge */}
      {providerInfo && (
        <div className="absolute top-2 right-4 flex items-center gap-2 text-xs z-10 pointer-events-none">
          {providerInfo.degraded ? (
            <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md font-medium border border-amber-500/20 backdrop-blur-md">
              <AlertTriangle className="w-3 h-3" />
              Degraded: Rules-only
            </span>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground bg-secondary/80 px-2 py-1 rounded-md font-medium backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Provider: {providerInfo.provider.charAt(0).toUpperCase() + providerInfo.provider.slice(1)}
            </span>
          )}
        </div>
      )}

      {/* Unavailable banner */}
      {apiUnavailable && (
        <div className="flex items-start gap-3 m-4 p-4 rounded-lg border border-amber-800/60 bg-amber-950/30 text-amber-300 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-0.5">Copilot unavailable</p>
            <p className="text-amber-400/80">{unavailableMsg}</p>
          </div>
        </div>
      )}

      {/* Messages or starter */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 && !apiUnavailable ? (
          <StarterPrompts onSelect={handleStarterSelect} />
        ) : (
          <div className="py-2">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* Typing indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 px-4 py-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Error state */}
            {errorMsg && (
              <div className="mx-4 mb-2 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-background p-3">
        <div
          className={cn(
            "flex items-end gap-2 rounded-xl border bg-card px-3 py-2 transition-colors",
            isLoading ? "border-border" : "border-border focus-within:border-ring",
          )}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about an incident, root cause, or fix plan…"
            disabled={apiUnavailable}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-40 leading-relaxed py-0.5"
            style={{ height: "24px" }}
          />
          {isLoading ? (
            <button
              onClick={handleStop}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Stop generation"
            >
              <StopCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || apiUnavailable}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              title="Send message"
            >
              <SendHorizonal className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Copilot uses real incident data. Always verify before acting.
        </p>
      </div>
    </div>
  )
}
