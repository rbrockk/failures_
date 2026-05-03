"use client"

import { Clock, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Incident } from "@/lib/incidents/data"
import Link from "next/link"

const SEV_COLORS = {
  critical: "text-red-400 border-red-900/60 bg-red-950/40",
  high: "text-amber-400 border-amber-900/60 bg-amber-950/40",
  medium: "text-yellow-400 border-yellow-900/60 bg-yellow-950/40",
  low: "text-emerald-400 border-emerald-900/60 bg-emerald-950/40",
} as const

const STATUS_DOT = {
  open: "bg-red-500 animate-pulse",
  investigating: "bg-amber-500 animate-pulse",
  mitigated: "bg-blue-500",
  resolved: "bg-emerald-500",
} as const

const STATUS_BADGE = {
  open: "text-red-400 bg-red-950/30 border-red-900/40",
  investigating: "text-amber-400 bg-amber-950/30 border-amber-900/40",
  mitigated: "text-blue-400 bg-blue-950/30 border-blue-900/40",
  resolved: "text-emerald-400 bg-emerald-950/30 border-emerald-900/40",
} as const

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

import { useState, useEffect } from "react"

interface IncidentTableProps {
  incidents: Incident[]
}

export function IncidentTable({ incidents: initialIncidents }: IncidentTableProps) {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents)

  // Poll new data from backend every 5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout
    
    async function poll() {
      try {
        const res = await fetch("/api/incidents")
        if (res.ok) {
          const data = await res.json()
          if (data.incidents) {
            setIncidents(data.incidents)
          }
        }
      } catch (err) {
        console.error("Failed to poll incidents:", err)
      }
    }

    timer = setInterval(poll, 5000)
    return () => clearInterval(timer)
  }, [])

  // Keep up to date if initialIncidents changes
  useEffect(() => {
    setIncidents(initialIncidents)
  }, [initialIncidents])

  if (incidents.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1">No incidents found</h3>
        <p className="text-xs text-muted-foreground">Try adjusting your filters or search query</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg sm:rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-muted/50 backdrop-blur-sm">
              <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-16 sm:w-24">ID</th>
              <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[120px] sm:min-w-0">Title</th>
              <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-16 sm:w-24">Severity</th>
              <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-20 sm:w-28">Status</th>
              <th className="hidden md:table-cell text-left px-2 sm:px-4 py-2 sm:py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-28 sm:w-36">Service</th>
              <th className="hidden md:table-cell text-left px-2 sm:px-4 py-2 sm:py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-20 sm:w-28">Started</th>
              <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-8 sm:w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {incidents.map((inc) => (
              <tr 
                key={inc.id} 
                className="bg-card hover:bg-muted/30 transition-colors group cursor-pointer"
              >
                <td className="px-2 sm:px-4 py-2 sm:py-3.5">
                  <span className="font-mono text-xs text-blue-400 bg-blue-950/30 border border-blue-900/40 px-1.5 py-0.5 rounded">
                    {inc.id}
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3.5 max-w-xs">
                  <span className="font-medium text-xs sm:text-sm text-foreground line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {inc.title}
                  </span>
                  {inc.rootCause && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 hidden sm:block">
                      {inc.rootCause.category}
                    </p>
                  )}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium px-1.5 sm:px-2 py-1 rounded border capitalize whitespace-nowrap",
                      SEV_COLORS[inc.severity],
                    )}
                  >
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      inc.severity === "critical" && "bg-red-400 animate-pulse",
                      inc.severity === "high" && "bg-amber-400",
                      inc.severity === "medium" && "bg-yellow-400",
                      inc.severity === "low" && "bg-emerald-400"
                    )} />
                    <span className="hidden sm:inline">{inc.severity}</span>
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3.5">
                  <span className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium px-1.5 sm:px-2 py-1 rounded border capitalize whitespace-nowrap",
                    STATUS_BADGE[inc.status]
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", STATUS_DOT[inc.status])} />
                    <span className="hidden sm:inline">{inc.status}</span>
                  </span>
                </td>
                <td className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3.5">
                  <span className="font-mono text-xs text-muted-foreground">{inc.service}</span>
                </td>
                <td className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3.5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 shrink-0" />
                    {formatRelative(inc.startedAt)}
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3.5">
                  <Link 
                    href={`/copilot?incident=${inc.id}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-blue-400 inline-flex items-center justify-center"
                  >
                    <ExternalLink className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
