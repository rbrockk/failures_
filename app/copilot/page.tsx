import type { Metadata } from "next"
import { IncidentSidebar } from "@/components/copilot/incident-sidebar"
import { CopilotChat } from "@/components/copilot/copilot-chat"
import { Activity, ChevronRight } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Incident Copilot — Integration Failure Detective",
  description: "AI-powered SRE assistant for diagnosing and resolving integration failures in real time.",
}

export default function CopilotPage() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Top nav */}
      <header className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="w-4 h-4" />
          <Link href="/" className="text-sm font-medium hover:text-foreground transition-colors">
            Integration Failure Detective
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-sm font-medium text-foreground">Incident Copilot</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono">LIVE</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">5 incidents indexed</span>
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
