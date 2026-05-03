"use client"

import { AlertTriangle, FileText, Wrench, BarChart2 } from "lucide-react"

const PROMPTS = [
  {
    icon: AlertTriangle,
    label: "Most urgent incident",
    text: "What is the most urgent critical incident right now?",
    color: "text-red-400 bg-red-950/40 border-red-900/60",
  },
  {
    icon: FileText,
    label: "Summarize INC-001",
    text: "Summarize INC-001",
    color: "text-amber-400 bg-amber-950/40 border-amber-900/60",
  },
  {
    icon: Wrench,
    label: "Fix plan for INC-002",
    text: "Give me a fix plan for INC-002",
    color: "text-blue-400 bg-blue-950/40 border-blue-900/60",
  },
  {
    icon: BarChart2,
    label: "Frequent root causes",
    text: "Which root cause is most frequent this week?",
    color: "text-emerald-400 bg-emerald-950/40 border-emerald-900/60",
  },
]

interface StarterPromptsProps {
  onSelect: (text: string) => void
}

export function StarterPrompts({ onSelect }: StarterPromptsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-4 py-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-600/40 flex items-center justify-center mx-auto mb-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-6 h-6 text-blue-400"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground">Incident Copilot</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Ask me about open incidents, root causes, fix plans, or request a postmortem report.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {PROMPTS.map((prompt) => {
          const Icon = prompt.icon
          return (
            <button
              key={prompt.text}
              onClick={() => onSelect(prompt.text)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] ${prompt.color}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{prompt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
