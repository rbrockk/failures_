import Link from "next/link"
import { INCIDENTS } from "@/lib/incidents/data"
import { Activity, Bot, AlertTriangle, CheckCircle2, Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const SEV_COLORS = {
  critical: "text-red-400 border-red-900/60 bg-red-950/30",
  high: "text-amber-400 border-amber-900/60 bg-amber-950/30",
  medium: "text-yellow-400 border-yellow-900/60 bg-yellow-950/30",
  low: "text-emerald-400 border-emerald-900/60 bg-emerald-950/30",
} as const

const STATUS_DOT = {
  open: "bg-red-500 animate-pulse",
  investigating: "bg-amber-500 animate-pulse",
  mitigated: "bg-blue-500",
  resolved: "bg-emerald-500",
} as const

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export default function HomePage() {
  const openCount = INCIDENTS.filter((i) => ["open", "investigating"].includes(i.status)).length
  const criticalCount = INCIDENTS.filter((i) => i.severity === "critical").length
  const resolvedCount = INCIDENTS.filter((i) => i.status === "resolved").length

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-600/40 flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">Integration Failure Detective</h1>
              <p className="text-xs text-muted-foreground">Production Incident Intelligence</p>
            </div>
          </div>
          <Link
            href="/copilot"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-medium"
          >
            <Bot className="w-4 h-4" />
            Open Copilot
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active</p>
            </div>
            <p className="text-3xl font-semibold text-foreground">{openCount}</p>
            <p className="text-xs text-muted-foreground mt-1">open incidents</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Critical</p>
            </div>
            <p className="text-3xl font-semibold text-red-400">{criticalCount}</p>
            <p className="text-xs text-muted-foreground mt-1">require immediate action</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Resolved</p>
            </div>
            <p className="text-3xl font-semibold text-emerald-400">{resolvedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">this week</p>
          </div>
        </div>

        {/* Incident table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">All Incidents</h2>
            <Link href="/copilot" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Analyse with Copilot <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Severity</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {INCIDENTS.map((inc) => (
                  <tr key={inc.id} className="bg-card hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">{inc.id}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="font-medium text-foreground line-clamp-1">{inc.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded border capitalize",
                          SEV_COLORS[inc.severity],
                        )}
                      >
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[inc.status])} />
                        <span className="text-xs text-muted-foreground capitalize">{inc.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">{inc.service}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatRelative(inc.startedAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Copilot CTA */}
        <div className="rounded-xl border border-blue-900/50 bg-blue-950/20 p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Incident Copilot is ready</h3>
            <p className="text-sm text-muted-foreground">
              Ask for root cause analysis, fix plans, and postmortem reports — powered by real incident data.
            </p>
          </div>
          <Link
            href="/copilot"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-medium shrink-0 ml-6"
          >
            <Bot className="w-4 h-4" />
            Launch Copilot
          </Link>
        </div>
      </main>
    </div>
  )
}
