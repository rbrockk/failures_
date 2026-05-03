import type { Metadata } from "next"
import { IncidentSidebar } from "@/components/copilot/incident-sidebar"
import { CopilotChat } from "@/components/copilot/copilot-chat"
import { Activity, ChevronRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { INCIDENTS } from "@/lib/incidents/data"

export const metadata: Metadata = {
  title: "Incident Copilot — Integration Failure Detective",
  description: "AI-powered SRE assistant for diagnosing and resolving integration failures in real time.",
}

export default function CopilotPage() {
  const openCount = INCIDENTS.filter(i => i.status === "open" || i.status === "investigating").length
  
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Top nav */}
      <header className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <Link href="/" className="text-sm font-medium hover:text-foreground transition-colors">
            Integration Failure Detective
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-sm font-medium text-foreground">Incident Copilot</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-xs font-medium text-emerald-400">LIVE</span>
          </div>
          
          {/* Incident count */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{INCIDENTS.length} incidents indexed</span>
            <span className="text-border">|</span>
            <span className="text-red-400 font-medium">{openCount} active</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <IncidentSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <CopilotChat />
        </main>
      </div>
    </div>
  )
}
