"use client"

import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"

export interface SimpleMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatMessageProps {
  message: SimpleMessage
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n")
  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("```")) return <div key={i} className="font-mono text-xs text-muted-foreground">{line}</div>
        if (line.startsWith("### ")) return <h3 key={i} className="font-semibold text-sm mt-4 mb-1.5 text-foreground">{line.slice(4)}</h3>
        if (line.startsWith("## ")) return <h2 key={i} className="font-semibold text-sm mt-4 mb-1.5 text-foreground border-b border-border pb-1.5">{line.slice(3)}</h2>
        if (line.startsWith("# ")) return <h1 key={i} className="font-semibold text-base mt-3 mb-1.5 text-foreground">{line.slice(2)}</h1>
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2.5 ml-1">
              <span className="text-blue-400 mt-0.5 shrink-0">•</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          )
        }
        const numbered = line.match(/^(\d+)\.\s(.+)/)
        if (numbered) {
          return (
            <div key={i} className="flex gap-2.5 ml-1">
              <span className="text-blue-400 shrink-0 font-mono text-xs w-5 mt-0.5">{numbered[1]}.</span>
              <span>{renderInline(numbered[2])}</span>
            </div>
          )
        }
        if (line.startsWith("|")) {
          return <div key={i} className="font-mono text-xs text-muted-foreground overflow-x-auto">{line}</div>
        }
        if (line.trim() === "") return <div key={i} className="h-2" />
        return <p key={i}>{renderInline(line)}</p>
      })}
    </div>
  )
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[INC-\d+\])/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="font-mono text-xs bg-muted/80 px-1.5 py-0.5 rounded text-amber-400 border border-border">
              {part.slice(1, -1)}
            </code>
          )
        }
        if (part.match(/^\[INC-\d+\]$/)) {
          return (
            <span key={i} className="font-mono text-xs bg-blue-950/50 text-blue-400 border border-blue-800/50 px-1.5 py-0.5 rounded">
              {part.slice(1, -1)}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const text = message.content

  return (
    <div className={cn("flex gap-3 px-4 py-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 shadow-lg",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-blue-600 text-white shadow-blue-600/20",
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className={cn("flex flex-col gap-1 max-w-[85%]", isUser && "items-end")}>
        {/* Text bubble */}
        {text && (
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm shadow-lg",
              isUser
                ? "bg-blue-600 text-white rounded-br-md shadow-blue-600/20"
                : "bg-card border border-border text-foreground rounded-bl-md",
            )}
          >
            {isUser ? <p className="leading-relaxed">{text}</p> : <MarkdownText text={text} />}
          </div>
        )}
      </div>
    </div>
  )
}
