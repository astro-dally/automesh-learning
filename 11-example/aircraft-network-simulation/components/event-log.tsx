"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import type { EventLogEntry } from "@/lib/types"
import {
  CheckCircle,
  XCircle,
  Info,
  Plane,
  Activity,
  Search,
  RefreshCw,
  Fuel,
  User,
  Zap,
  Radio,
  AlertCircle,
} from "lucide-react"

interface EventLogProps {
  events: EventLogEntry[]
  currentTime: number
  activeFilter: "both" | "centralized" | "mesh"
  onFilterChange: (filter: "both" | "centralized" | "mesh") => void
}

const iconMap: Record<string, React.ReactNode> = {
  check: <CheckCircle className="w-3 h-3" />,
  alert: <AlertCircle className="w-3 h-3" />,
  x: <XCircle className="w-3 h-3" />,
  plane: <Plane className="w-3 h-3" />,
  activity: <Activity className="w-3 h-3" />,
  search: <Search className="w-3 h-3" />,
  refresh: <RefreshCw className="w-3 h-3" />,
  fuel: <Fuel className="w-3 h-3" />,
  user: <User className="w-3 h-3" />,
  zap: <Zap className="w-3 h-3" />,
  radio: <Radio className="w-3 h-3" />,
}

export function EventLog({ events, currentTime, activeFilter, onFilterChange }: EventLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const visibleEvents = events
    .filter((e) => currentTime >= e.time)
    .filter((e) => activeFilter === "both" || e.topology === activeFilter || e.topology === "both")
    .sort((a, b) => b.time - a.time)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [visibleEvents.length])

  const getTypeStyles = (type: EventLogEntry["type"]) => {
    switch (type) {
      case "info":
        return "bg-blue-500/10 border-blue-500/30 text-blue-400"
      case "warning":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400"
      case "critical":
        return "bg-red-500/10 border-red-500/30 text-red-400"
      case "success":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
    }
  }

  const getIconColor = (type: EventLogEntry["type"]) => {
    switch (type) {
      case "info":
        return "text-blue-400"
      case "warning":
        return "text-amber-400"
      case "critical":
        return "text-red-400"
      case "success":
        return "text-emerald-400"
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-900/95 border border-slate-700 rounded-lg overflow-hidden backdrop-blur-sm">
      <div className="p-2 border-b border-slate-700 bg-slate-800/50 flex-shrink-0">
        <h3 className="text-xs font-semibold text-slate-200 mb-1.5">Event Timeline</h3>
        <div className="flex gap-1">
          {(["both", "centralized", "mesh"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                activeFilter === filter ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {filter === "both" ? "All" : filter === "centralized" ? "Cent" : "Mesh"}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-1.5 space-y-1">
        {visibleEvents.length === 0 ? (
          <div className="text-center py-4 text-slate-500 text-[10px]">Simulation starting...</div>
        ) : (
          visibleEvents.map((event, idx) => (
            <div
              key={event.id}
              className={`flex items-start gap-1.5 p-1.5 rounded border transition-all duration-300 ${getTypeStyles(event.type)}`}
              style={{
                opacity: currentTime - event.time < 3 ? 1 : 0.7,
                animation: idx === 0 && currentTime - event.time < 0.5 ? "slideIn 0.3s ease-out" : "none",
              }}
            >
              <span className="font-mono text-[9px] text-slate-500 min-w-[36px]">{event.time.toFixed(0)}s</span>
              <span className={`flex-shrink-0 ${getIconColor(event.type)}`}>
                {iconMap[event.icon] || <Info className="w-3 h-3" />}
              </span>
              <span className="text-[10px] flex-1 leading-tight line-clamp-2">{event.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
