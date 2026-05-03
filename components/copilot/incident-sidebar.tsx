"use client"

import { INCIDENTS } from "@/lib/incidents/data"
import { cn } from "@/lib/utils"
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react"

const SEV_COLORS = {
  critical: "bg-red-500",
  high: "bg-amber-500",
  medium: "bg-yellow-500",
  low: "bg-emerald-500",
} as const

const STATUS_BADGE = {
  open: "text-red-400 bg-red-950/50 border-red-900/50",
  investigating: "text-amber-400 bg-amber-950/50 border-amber-900/50",
  mitigated: "text-blue-400 bg-blue-950/50 border-blue-900/50",
  resolved: "text-emerald-400 bg-emerald-950/50 border-emerald-900/50",
} as const

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

interface IncidentSidebarProps {
  onIncidentClick?: () => void
}

export function IncidentSidebar({ onIncidentClick }: IncidentSidebarProps) {
  const open = INCIDENTS.filter((i) => i.status === "open" || i.status === "investigating")
  const recent = INCIDENTS.filter((i) => i.status === "mitigated" || i.status === "resolved").slice(0, 3)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Active Incidents</p>
          <span className="ml-auto text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            {open.length}
          </span>
        </div>
      </div>

      {/* Incident list */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1 px-2">
        {open.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">All clear!</p>
          </div>
        ) : (
          open.map((inc) => (
            <button
              key={inc.id}
              onClick={onIncidentClick}
              className="w-full text-left group rounded-xl px-3 py-3 hover:bg-accent/50 transition-all cursor-pointer border border-transparent hover:border-border"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn("w-2 h-2 rounded-full shrink-0 animate-pulse", SEV_COLORS[inc.severity])} />
                  <span className="font-mono text-xs text-blue-400 bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-900/40">
                    {inc.id}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize whitespace-nowrap",
                    STATUS_BADGE[inc.status],
                  )}
                >
                  {inc.status}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
                {inc.title}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                <span className="font-mono truncate">{inc.service}</span>
                <span className="text-border shrink-0">•</span>
                <span className="flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatRelative(inc.startedAt)}
                </span>
              </div>
            </button>
          ))
        )}

        {/* Recent section */}
        {recent.length > 0 && (
          <>
            <div className="px-3 pt-5 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent</p>
            </div>
            {recent.map((inc) => (
              <button
                key={inc.id}
                onClick={onIncidentClick}
                className="w-full text-left group rounded-xl px-3 py-3 hover:bg-accent/50 transition-all cursor-pointer opacity-60 hover:opacity-100 border border-transparent hover:border-border"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", SEV_COLORS[inc.severity])} />
                    <span className="font-mono text-xs text-muted-foreground">{inc.id}</span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize whitespace-nowrap",
                      STATUS_BADGE[inc.status],
                    )}
                  >
                    {inc.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">{inc.title}</p>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Stats footer */}
      <div className="border-t border-border px-4 py-3 bg-sidebar">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-base font-bold text-red-400 tabular-nums">
              {INCIDENTS.filter((i) => i.severity === "critical").length}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">Critical</p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-amber-400 tabular-nums">{open.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Open</p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-emerald-400 tabular-nums">
              {INCIDENTS.filter((i) => i.status === "resolved").length}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">Resolved</p>
          </div>
        </div>
      </div>
    </div>
  )
}
