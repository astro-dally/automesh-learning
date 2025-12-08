"use client"

import { useEffect, useRef } from "react"
import { AlertTriangle, Shield, Scan, Bell, Zap } from "lucide-react"
import type { AttackEvent } from "@/lib/simulation-types"

interface AttackTimelineProps {
  events: AttackEvent[]
}

export function AttackTimeline({ events }: AttackTimelineProps) {
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
        return Bell
      case "isolation":
      case "blocked":
        return Shield
      case "exploit":
        return Zap
      default:
        return Bell
    }
  }

  const getEventStyles = (severity: AttackEvent["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 border-destructive/30 text-destructive"
      case "high":
        return "bg-warning/10 border-warning/30 text-warning"
      case "medium":
        return "bg-orange-500/10 border-orange-500/30 text-orange-400"
      case "low":
        return "bg-success/10 border-success/30 text-success"
      default:
        return "bg-primary/10 border-primary/30 text-primary"
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">Attack Timeline</h2>
        <span className="text-xs text-muted-foreground">{events.length} events</span>
      </div>

      <div ref={scrollRef} className="h-[200px] overflow-y-auto p-3 space-y-2">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Waiting for simulation to start...
          </div>
        ) : (
          events.map((event) => {
            const Icon = getEventIcon(event.type)
            const styles = getEventStyles(event.severity)

            return (
              <div key={event.id} className={`flex items-start gap-3 p-2.5 rounded-lg border text-sm ${styles}`}>
                <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs opacity-60">[{formatTime(event.timestamp)}]</span>
                    <span className="font-medium truncate">{event.message}</span>
                  </div>
                  {event.details && <p className="text-xs opacity-70 mt-0.5">{event.details}</p>}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
