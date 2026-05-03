"use client"

import type { UIMessage } from "ai"
import { cn } from "@/lib/utils"
import { Bot, User, Wrench, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

interface ChatMessageProps {
  message: UIMessage
}

function MarkdownText({ text }: { text: string }) {
  // Minimal inline markdown: bold, inline code, code blocks
  const lines = text.split("\n")
  return (
    <div className="space-y-1 leading-relaxed">
      {lines.map((line, i) => {
        // Code block start/end handled as raw
        if (line.startsWith("```")) return <div key={i} className="font-mono text-xs text-muted-foreground">{line}</div>
        // Headings
        if (line.startsWith("### ")) return <h3 key={i} className="font-semibold text-sm mt-3 mb-1 text-foreground">{line.slice(4)}</h3>
        if (line.startsWith("## ")) return <h2 key={i} className="font-semibold text-sm mt-3 mb-1 text-foreground border-b border-border pb-1">{line.slice(3)}</h2>
        if (line.startsWith("# ")) return <h1 key={i} className="font-semibold text-base mt-2 mb-1 text-foreground">{line.slice(2)}</h1>
        // List items
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-muted-foreground mt-1 shrink-0">•</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          )
        }
        // Numbered list
        const numbered = line.match(/^(\d+)\.\s(.+)/)
        if (numbered) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-muted-foreground shrink-0 font-mono text-xs w-4 mt-0.5">{numbered[1]}.</span>
              <span>{renderInline(numbered[2])}</span>
            </div>
          )
        }
        // Table rows
        if (line.startsWith("|")) {
          return (
            <div key={i} className="font-mono text-xs text-muted-foreground">{line}</div>
          )
        }
        if (line.trim() === "") return <div key={i} className="h-1" />
        return <p key={i}>{renderInline(line)}</p>
      })}
    </div>
  )
}

function renderInline(text: string): React.ReactNode {
  // **bold**, `code`, [INC-xxx] references
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[INC-\d+\])/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="font-mono text-xs bg-muted px-1 py-0.5 rounded text-amber-400">
              {part.slice(1, -1)}
            </code>
          )
        }
        if (part.match(/^\[INC-\d+\]$/)) {
          return (
            <span key={i} className="font-mono text-xs bg-blue-950 text-blue-400 border border-blue-800 px-1.5 py-0.5 rounded">
              {part.slice(1, -1)}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function ToolCallPart({ part }: { part: UIMessage["parts"][number] }) {
  if (part.type !== "tool-invocation") return null
  const { toolName, state } = part.toolInvocation

  const toolLabels: Record<string, string> = {
    listOpenCriticalIncidents: "Listing critical incidents",
    getIncidentById: "Fetching incident details",
    summarizeIncident: "Summarizing incident",
    suggestRemediation: "Loading remediation steps",
    getRootCauseClusters: "Analysing root cause clusters",
    exportIncidentMarkdown: "Generating incident report",
  }

  const label = toolLabels[toolName] ?? `Calling ${toolName}`

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border border-border rounded px-3 py-1.5 my-1">
      {state === "output-available" ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      ) : state === "output-error" ? (
        <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
      ) : (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-blue-400" />
      )}
      <Wrench className="w-3 h-3 shrink-0" />
      <span>{label}</span>
      {"input" in part.toolInvocation && "id" in (part.toolInvocation.input as object ?? {}) && (
        <span className="font-mono text-blue-400">
          {(part.toolInvocation.input as { id?: string }).id ?? ""}
        </span>
      )}
    </div>
  )
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const text = getUIMessageText(message)

  return (
    <div className={cn("flex gap-3 px-4 py-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5",
          isUser ? "bg-primary text-primary-foreground" : "bg-blue-600 text-white",
        )}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Content */}
      <div className={cn("flex flex-col gap-1 max-w-[85%]", isUser && "items-end")}>
        {/* Tool call indicators (assistant only) */}
        {!isUser &&
          message.parts
            ?.filter((p) => p.type === "tool-invocation")
            .map((p, i) => <ToolCallPart key={i} part={p} />)}

        {/* Text bubble */}
        {text && (
          <div
            className={cn(
              "rounded-lg px-3.5 py-2.5 text-sm",
              isUser
                ? "bg-primary text-primary-foreground rounded-br-none"
                : "bg-card border border-border text-foreground rounded-bl-none",
            )}
          >
            {isUser ? <p>{text}</p> : <MarkdownText text={text} />}
          </div>
        )}
      </div>
    </div>
  )
}
