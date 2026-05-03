import { ArrowRight, Database, Brain, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Database,
    label: "Ingest",
    description: "Collect logs & alerts",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
  },
  {
    icon: Brain,
    label: "Analyze",
    description: "AI finds root cause",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
  },
  {
    icon: CheckCircle,
    label: "Resolve", 
    description: "Generate fix plan",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  }
]

export function HowItWorks() {
  return (
    <div className="rounded-lg sm:rounded-xl border border-border bg-card/50 p-3 sm:p-4">
      <div className="flex items-center justify-between sm:justify-center gap-1 sm:gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.label} className="flex items-center gap-1 sm:gap-4 flex-1 sm:flex-none">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 flex-1 sm:flex-none">
                <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-md sm:rounded-lg border flex items-center justify-center shrink-0 ${step.color}`}>
                  <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-[10px] sm:text-sm font-semibold text-foreground">{step.label}</p>
                  <p className="text-[9px] sm:text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground/50 shrink-0 hidden sm:block" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
