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
    <div className={cn("flex items-center gap-1 text-[10px] sm:text-xs", colors[trend])}>
      <Icon className="w-3 h-3 shrink-0" />
      <span className="hidden sm:inline">{value}</span>
    </div>
  )
}

export function KpiCards({ openCount, criticalCount, resolvedCount }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {/* Active Incidents */}
      <div className="group rounded-lg sm:rounded-xl border border-border bg-card p-3 sm:p-5 hover:border-red-900/50 transition-all hover:shadow-lg hover:shadow-red-500/5">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-md sm:rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3 sm:w-4 h-3 sm:h-4 text-red-400" />
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Active</p>
          </div>
          <TrendIndicator trend="up" value="+2 today" />
        </div>
        <p className="text-xl sm:text-3xl font-bold text-foreground tabular-nums">{openCount}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">open incidents</p>
      </div>

      {/* Critical */}
      <div className="group rounded-lg sm:rounded-xl border border-border bg-card p-3 sm:p-5 hover:border-red-900/50 transition-all hover:shadow-lg hover:shadow-red-500/5">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-md sm:rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-red-500 animate-pulse" />
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Critical</p>
          </div>
          <TrendIndicator trend="neutral" value="stable" />
        </div>
        <p className="text-xl sm:text-3xl font-bold text-red-400 tabular-nums">{criticalCount}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">require immediate action</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 sm:hidden">immediate</p>
      </div>

      {/* Resolved */}
      <div className="group rounded-lg sm:rounded-xl border border-border bg-card p-3 sm:p-5 hover:border-emerald-900/50 transition-all hover:shadow-lg hover:shadow-emerald-500/5">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-md sm:rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3 sm:w-4 h-3 sm:h-4 text-emerald-400" />
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Resolved</p>
          </div>
          <TrendIndicator trend="down" value="+3 this week" />
        </div>
        <p className="text-xl sm:text-3xl font-bold text-emerald-400 tabular-nums">{resolvedCount}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">this week</p>
      </div>
    </div>
  )
}
