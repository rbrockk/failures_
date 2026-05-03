"use client"

import { useState } from "react"
import type { Metadata } from "next"
import { IncidentSidebar } from "@/components/copilot/incident-sidebar"
import { CopilotChat } from "@/components/copilot/copilot-chat"
import { Activity, ChevronRight, Sparkles, Menu, X } from "lucide-react"
import Link from "next/link"
import { INCIDENTS } from "@/lib/incidents/data"
import { cn } from "@/lib/utils"

export default function CopilotPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const openCount = INCIDENTS.filter(i => i.status === "open" || i.status === "investigating").length
  
  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Top nav */}
      <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border bg-card/80 backdrop-blur-sm shrink-0 z-30">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground min-w-0 flex-1">
          <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Activity className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-blue-400" />
          </div>
          <Link href="/" className="text-xs sm:text-sm font-medium hover:text-foreground transition-colors truncate hidden sm:block">
            Integration Failure Detective
          </Link>
          <ChevronRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0 hidden sm:block" />
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-blue-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-foreground truncate">Incident Copilot</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="relative">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-emerald-400">LIVE</span>
          </div>
          
          {/* Incident count - hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{INCIDENTS.length} incidents</span>
            <span className="text-border">|</span>
            <span className="text-red-400 font-medium">{openCount} active</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - drawer on mobile, static on desktop */}
        <aside 
          className={cn(
            "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto",
            "w-72 sm:w-80 lg:w-72 flex-shrink-0",
            "transform transition-transform duration-300 ease-in-out lg:transform-none",
            "bg-sidebar border-r border-border",
            "flex flex-col overflow-hidden",
            "pt-[57px] lg:pt-0", // Account for header on mobile
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors z-10"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <IncidentSidebar onIncidentClick={() => setSidebarOpen(false)} />
        </aside>

        {/* Chat area */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <CopilotChat />
        </main>
      </div>
    </div>
  )
}
