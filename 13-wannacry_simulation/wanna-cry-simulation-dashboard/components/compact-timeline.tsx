"use client"

import { useEffect, useRef } from "react"
import { AlertTriangle, Scan, Bell, Zap, Eye, ShieldCheck, Lock } from "lucide-react"
import type { AttackEvent } from "@/lib/simulation-types"

interface CompactTimelineProps {
  events: AttackEvent[]
}

export function CompactTimeline({ events }: CompactTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  const getEventIcon = (type: AttackEvent["type"]) => {
    switch (type) {
      case "infection":
      case "spread":
        return AlertTriangle
      case "scan":
        return Scan
      case "detection":
      case "ids_alert":
        return Eye
      case "isolation":
        return Lock
      case "blocked":
      case "firewall_block":
        return ShieldCheck
      case "exploit":
        return Zap
      default:
        return Bell
    }
  }

  const getEventColor = (type: AttackEvent["type"], severity: AttackEvent["severity"]) => {
    // IDS events are always amber/orange
    if (type === "ids_alert" || type === "detection") {
      return "text-amber-400 bg-amber-400/10 border-l-2 border-amber-400"
    }
    // Firewall blocks are blue
    if (type === "firewall_block") {
      return "text-blue-400 bg-blue-400/10 border-l-2 border-blue-400"
    }
    // Isolation events are green (success)
    if (type === "isolation") {
      return "text-emerald-400 bg-emerald-400/10 border-l-2 border-emerald-400"
    }
    // Blocked events
    if (type === "blocked") {
      return "text-green-400 bg-green-400/10 border-l-2 border-green-400"
    }

    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-400/10 border-l-2 border-red-400"
      case "high":
        return "text-orange-400 bg-orange-400/10 border-l-2 border-orange-400"
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-l-2 border-yellow-400"
      case "low":
        return "text-green-400 bg-green-400/10 border-l-2 border-green-400"
      default:
        return "text-slate-400 bg-slate-400/10 border-l-2 border-slate-400"
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="shrink-0 px-3 py-2 border-b border-border flex items-center justify-between bg-muted/30">
        <span className="text-xs font-semibold">Attack Timeline</span>
        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted rounded">{events.length} events</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-2">
            <Scan className="w-8 h-8 opacity-30" />
            <span>Click a workstation to begin</span>
          </div>
        ) : (
          events.map((event) => {
            const Icon = getEventIcon(event.type)
            const colorClass = getEventColor(event.type, event.severity)

            return (
              <div key={event.id} className={`flex items-start gap-2 p-2 rounded text-[11px] ${colorClass}`}>
                <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-1.5">
                    <span className="font-mono opacity-60 shrink-0">[{formatTime(event.timestamp)}]</span>
                    <span className="font-medium">{event.message}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
