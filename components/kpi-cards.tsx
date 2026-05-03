"use client"

import { AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardsProps {
  openCount: number
  criticalCount: number
  resolvedCount: number
}

function TrendIndicator({ trend, value }: { trend: "up" | "down" | "neutral"; value: string }) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const colors = {
    up: "text-red-400",
    down: "text-emerald-400", 
    neutral: "text-muted-foreground"
  }
  
  return (
    <div className={cn("flex items-center gap-1 text-xs", colors[trend])}>
      <Icon className="w-3 h-3" />
      <span>{value}</span>
    </div>
  )
}

export function KpiCards({ openCount, criticalCount, resolvedCount }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Active Incidents */}
      <div className="group rounded-xl border border-border bg-card p-5 hover:border-red-900/50 transition-all hover:shadow-lg hover:shadow-red-500/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active</p>
          </div>
          <TrendIndicator trend="up" value="+2 today" />
        </div>
        <p className="text-3xl font-bold text-foreground tabular-nums">{openCount}</p>
        <p className="text-xs text-muted-foreground mt-1">open incidents</p>
      </div>

      {/* Critical */}
      <div className="group rounded-xl border border-border bg-card p-5 hover:border-red-900/50 transition-all hover:shadow-lg hover:shadow-red-500/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Critical</p>
          </div>
          <TrendIndicator trend="neutral" value="stable" />
        </div>
        <p className="text-3xl font-bold text-red-400 tabular-nums">{criticalCount}</p>
        <p className="text-xs text-muted-foreground mt-1">require immediate action</p>
      </div>

      {/* Resolved */}
      <div className="group rounded-xl border border-border bg-card p-5 hover:border-emerald-900/50 transition-all hover:shadow-lg hover:shadow-emerald-500/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Resolved</p>
          </div>
          <TrendIndicator trend="down" value="+3 this week" />
        </div>
        <p className="text-3xl font-bold text-emerald-400 tabular-nums">{resolvedCount}</p>
        <p className="text-xs text-muted-foreground mt-1">this week</p>
      </div>
    </div>
  )
}
