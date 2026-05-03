"use client"

import { useState } from "react"
import { Search, Filter, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

const SEVERITY_OPTIONS = ["all", "critical", "high", "medium", "low"] as const
const STATUS_OPTIONS = ["all", "open", "investigating", "mitigated", "resolved"] as const

export function IncidentFilters() {
  const [search, setSearch] = useState("")
  const [severity, setSeverity] = useState<string>("all")
  const [status, setStatus] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = severity !== "all" || status !== "all" || search.length > 0

  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search incidents by ID, title, or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 h-9 px-3 rounded-lg border text-sm font-medium transition-all",
            showFilters || hasActiveFilters
              ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
              : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border"
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
              {(severity !== "all" ? 1 : 0) + (status !== "all" ? 1 : 0) + (search ? 1 : 0)}
            </span>
          )}
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showFilters && "rotate-180")} />
        </button>
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="flex items-center gap-3 flex-wrap">
          {/* Severity */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Severity:</span>
            <div className="flex gap-1">
              {SEVERITY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSeverity(opt)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize",
                    severity === opt
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            <div className="flex gap-1">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setStatus(opt)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize",
                    status === opt
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch("")
                setSeverity("all")
                setStatus("all")
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  )
}
