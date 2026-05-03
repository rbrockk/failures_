import { INCIDENTS } from "@/lib/incidents/data"
import { cn } from "@/lib/utils"

const SEV_COLORS = {
  critical: "bg-red-500",
  high: "bg-amber-500",
  medium: "bg-yellow-500",
  low: "bg-emerald-500",
} as const

const STATUS_BADGE = {
  open: "text-red-400 bg-red-950/40 border-red-900/60",
  investigating: "text-amber-400 bg-amber-950/40 border-amber-900/60",
  mitigated: "text-blue-400 bg-blue-950/40 border-blue-900/60",
  resolved: "text-emerald-400 bg-emerald-950/40 border-emerald-900/60",
} as const

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export function IncidentSidebar() {
  const open = INCIDENTS.filter((i) => i.status === "open" || i.status === "investigating")
  const recent = INCIDENTS.filter((i) => i.status === "mitigated" || i.status === "resolved").slice(0, 2)

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-sidebar flex flex-col overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Active Incidents</p>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
        {open.map((inc) => (
          <div
            key={inc.id}
            className="group rounded-lg px-3 py-2.5 hover:bg-accent/50 transition-colors cursor-default"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", SEV_COLORS[inc.severity])} />
                <span className="font-mono text-xs text-muted-foreground">{inc.id}</span>
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize",
                  STATUS_BADGE[inc.status],
                )}
              >
                {inc.status}
              </span>
            </div>
            <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">{inc.title}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{inc.service}</p>
            <p className="text-[11px] text-muted-foreground">{formatRelative(inc.startedAt)}</p>
          </div>
        ))}

        {recent.length > 0 && (
          <>
            <div className="px-3 pt-4 pb-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Recent</p>
            </div>
            {recent.map((inc) => (
              <div
                key={inc.id}
                className="group rounded-lg px-3 py-2.5 hover:bg-accent/50 transition-colors cursor-default opacity-60"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", SEV_COLORS[inc.severity])} />
                    <span className="font-mono text-xs text-muted-foreground">{inc.id}</span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize",
                      STATUS_BADGE[inc.status],
                    )}
                  >
                    {inc.status}
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">{inc.title}</p>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Stats footer */}
      <div className="border-t border-border px-4 py-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-base font-semibold text-red-400">{INCIDENTS.filter((i) => i.severity === "critical").length}</p>
          <p className="text-[10px] text-muted-foreground">Critical</p>
        </div>
        <div>
          <p className="text-base font-semibold text-amber-400">{open.length}</p>
          <p className="text-[10px] text-muted-foreground">Open</p>
        </div>
        <div>
          <p className="text-base font-semibold text-emerald-400">
            {INCIDENTS.filter((i) => i.status === "resolved").length}
          </p>
          <p className="text-[10px] text-muted-foreground">Resolved</p>
        </div>
      </div>
    </aside>
  )
}
