"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { SendHorizonal, StopCircle, AlertTriangle, Loader2 } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { StarterPrompts } from "./starter-prompts"
import { cn } from "@/lib/utils"

export function CopilotChat() {
  const [input, setInput] = useState("")
  const [apiUnavailable, setApiUnavailable] = useState(false)
  const [unavailableMsg, setUnavailableMsg] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/copilot",
      async fetch(input, init) {
        const res = await fetch(input, init)
        if (res.status === 503) {
          const data = await res.clone().json()
          setApiUnavailable(true)
          setUnavailableMsg(data.message ?? "Copilot is unavailable.")
        }
        return res
      },
    }),
  })

  const isLoading = status === "submitted" || status === "streaming"

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, status])

  function handleSend() {
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInput("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleStarterSelect(text: string) {
    sendMessage({ text })
    inputRef.current?.focus()
  }

  // Auto-resize textarea
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Unavailable banner */}
      {apiUnavailable && (
        <div className="flex items-start gap-3 m-4 p-4 rounded-lg border border-amber-800/60 bg-amber-950/30 text-amber-300 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-0.5">Copilot unavailable</p>
            <p className="text-amber-400/80">{unavailableMsg}</p>
            <p className="mt-1 text-amber-400/60 text-xs">
              Add <code className="font-mono bg-amber-950 px-1 py-0.5 rounded">AI_GATEWAY_API_KEY</code> to your
              environment variables to enable the Copilot.
            </p>
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
            {error && (
              <div className="mx-4 mb-2 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Something went wrong. Please try again.</span>
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
              onClick={stop}
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
