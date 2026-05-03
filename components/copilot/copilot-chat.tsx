"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { SendHorizonal, StopCircle, AlertTriangle, Loader2, Zap, Shield } from "lucide-react"
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
        <div className="absolute top-2 sm:top-3 right-2 sm:right-4 z-10">
          {providerInfo.degraded ? (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-amber-400 bg-amber-500/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium border border-amber-500/20 backdrop-blur-md shadow-lg">
              <AlertTriangle className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
              <span className="hidden sm:inline">Degraded Mode: Rules-only</span>
              <span className="sm:hidden">Degraded</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground bg-card/90 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium border border-border backdrop-blur-md shadow-lg">
              <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">AI Provider: {providerInfo.provider.charAt(0).toUpperCase() + providerInfo.provider.slice(1)}</span>
              <span className="sm:hidden">{providerInfo.provider}</span>
            </div>
          )}
        </div>
      )}

      {/* Unavailable banner */}
      {apiUnavailable && (
        <div className="flex items-start gap-2 sm:gap-3 m-2 sm:m-4 p-2 sm:p-4 rounded-lg sm:rounded-xl border border-amber-800/60 bg-amber-950/30 text-amber-300 text-xs sm:text-sm">
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-0.5 sm:mb-1">Copilot Unavailable</p>
            <p className="text-amber-400/80 text-xs">{unavailableMsg}</p>
          </div>
        </div>
      )}

      {/* Messages or starter */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 && !apiUnavailable ? (
          <StarterPrompts onSelect={handleStarterSelect} />
        ) : (
          <div className="py-2 sm:py-4 px-2 sm:px-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* Typing indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2 sm:gap-3 py-2 sm:py-4">
                <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
                  <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 text-white animate-spin" />
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-card border border-border">
                  <span className="inline-block w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
                  <span className="inline-block w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
                  <span className="inline-block w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
                  <span className="text-xs sm:text-sm text-muted-foreground ml-1 sm:ml-2">Analyzing incident data...</span>
                </div>
              </div>
            )}

            {/* Error state */}
            {errorMsg && (
              <div className="mx-0 sm:mx-4 mb-2 flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3">
                <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area - sticky/fixed at bottom with safe area */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm p-2 sm:p-4 sticky bottom-0 sm:static safe-area-inset-bottom">
        <div
          className={cn(
            "flex items-end gap-2 sm:gap-3 rounded-lg sm:rounded-xl border bg-card px-2 sm:px-4 py-2 sm:py-3 transition-all shadow-lg",
            isLoading ? "border-border" : "border-border focus-within:border-blue-500/50 focus-within:shadow-blue-500/10",
          )}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about an incident..."
            disabled={apiUnavailable}
            rows={1}
            className="flex-1 resize-none bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-40 leading-relaxed py-0.5"
            style={{ height: "24px" }}
          />
          {isLoading ? (
            <button
              onClick={handleStop}
              className="flex-shrink-0 w-8 sm:w-9 h-8 sm:h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title="Stop generation"
            >
              <StopCircle className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || apiUnavailable}
              className="flex-shrink-0 w-8 sm:w-9 h-8 sm:h-9 rounded-lg flex items-center justify-center bg-blue-600 text-white hover:bg-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
              title="Send message"
            >
              <SendHorizonal className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
          <Shield className="w-3 h-3 shrink-0" />
          <span className="hidden sm:inline">Copilot uses real incident data. Always verify before acting.</span>
          <span className="sm:hidden">Real data - verify before acting</span>
        </div>
      </div>
    </div>
  )
}
