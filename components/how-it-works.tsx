import { ArrowRight, Database, Brain, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Database,
    label: "Ingest",
    description: "Collect logs, metrics & alerts",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
  },
  {
    icon: Brain,
    label: "Analyze",
    description: "AI identifies root cause",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
  },
  {
    icon: CheckCircle,
    label: "Resolve", 
    description: "Generate fix & postmortem",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  }
]

export function HowItWorks() {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.label} className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${step.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-foreground">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                <p className="sm:hidden text-xs font-medium text-foreground">{step.label}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
