"use client"

import { AlertTriangle, FileText, Wrench, BarChart2, Sparkles } from "lucide-react"

const PROMPTS = [
  {
    icon: AlertTriangle,
    label: "Most urgent incident",
    description: "Find the highest priority issue",
    text: "What is the most urgent critical incident right now?",
    color: "text-red-400 bg-red-500/10 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/15",
  },
  {
    icon: FileText,
    label: "Summarize INC-001",
    description: "Get a quick overview",
    text: "Summarize INC-001",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/15",
  },
  {
    icon: Wrench,
    label: "Fix plan for INC-002",
    description: "Step-by-step remediation",
    text: "Give me a fix plan for INC-002",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/15",
  },
  {
    icon: BarChart2,
    label: "Root cause patterns",
    description: "Identify recurring issues",
    text: "Which root cause is most frequent this week?",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/15",
  },
]

interface StarterPromptsProps {
  onSelect: (text: string) => void
}

export function StarterPrompts({ onSelect }: StarterPromptsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6 py-12">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/10">
          <Sparkles className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Incident Copilot</h2>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          I can help you analyze incidents, identify root causes, create fix plans, and generate postmortem reports.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {PROMPTS.map((prompt) => {
          const Icon = prompt.icon
          return (
            <button
              key={prompt.text}
              onClick={() => onSelect(prompt.text)}
              className={`group flex items-start gap-3 px-4 py-4 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${prompt.color}`}
            >
              <div className="w-9 h-9 rounded-lg bg-background/50 flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground block">{prompt.label}</span>
                <span className="text-xs text-muted-foreground">{prompt.description}</span>
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Or type your own question below
      </p>
    </div>
  )
}
