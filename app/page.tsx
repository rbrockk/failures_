import Link from "next/link"
import { INCIDENTS } from "@/lib/incidents/data"
import { Activity, Bot, AlertTriangle, CheckCircle2, Clock, ArrowRight, Play, Zap, Brain, Sparkles, TrendingUp, TrendingDown, Minus, Search, Filter, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { IncidentFilters } from "@/components/incident-filters"
import { IncidentTable } from "@/components/incident-table"
import { KpiCards } from "@/components/kpi-cards"
import { HowItWorks } from "@/components/how-it-works"

import { getIncidents } from "@/lib/incidents/repository"
import { Incident } from "@/lib/incidents/data"

export default async function HomePage() {
  const incidents = await getIncidents()
  const openCount = incidents.filter((i: Incident) => ["open", "investigating"].includes(i.status)).length
  const criticalCount = incidents.filter((i: Incident) => i.severity === "critical").length
  const resolvedCount = incidents.filter((i: Incident) => i.status === "resolved").length

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10 shrink-0">
              <Activity className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight truncate">Integration Failure Detective</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AI-Powered Incident Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/copilot"
              className="group flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 transition-all text-white text-xs sm:text-sm font-medium shadow-lg shadow-blue-600/25 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Bot className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span className="hidden sm:inline">Open Copilot</span>
              <span className="sm:hidden">Copilot</span>
              <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* How It Works Strip */}
        <HowItWorks />

        {/* Stats row */}
        <KpiCards 
          openCount={openCount} 
          criticalCount={criticalCount} 
          resolvedCount={resolvedCount} 
        />

        {/* Incident table */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
            <h2 className="text-xs sm:text-sm font-semibold text-foreground">All Incidents</h2>
            <Link href="/copilot" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors w-fit">
              Analyse with Copilot <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <IncidentFilters />
          <IncidentTable incidents={incidents} />
        </div>

        {/* Copilot CTA */}
        <div className="rounded-lg sm:rounded-xl border border-blue-900/50 bg-blue-950/20 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-blue-800/60 transition-colors">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1">Incident Copilot is ready</h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                Ask for root cause analysis, fix plans, and postmortem reports — powered by real incident data.
              </p>
            </div>
          </div>
          <Link
            href="/copilot"
            className="group flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 transition-all text-white text-xs sm:text-sm font-medium shrink-0 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/25 w-full sm:w-auto"
          >
            <Bot className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span>Launch Copilot</span>
            <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 transition-transform group-hover:translate-x-0.5 hidden sm:inline" />
          </Link>
        </div>

        {/* Impact Metrics */}
        <div className="rounded-lg sm:rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">AI-Powered Impact</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-emerald-400">73%</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Faster Triage Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-blue-400">12</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Incidents Auto-Analyzed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-amber-400">4</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Repeat Failures Prevented</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
