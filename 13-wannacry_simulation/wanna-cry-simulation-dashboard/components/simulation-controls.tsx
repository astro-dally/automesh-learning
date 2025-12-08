"use client"

import { Play, Pause, RotateCcw, FastForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SimulationState } from "@/lib/simulation-types"

interface SimulationControlsProps {
  state: SimulationState
  speed: number
  elapsedTime: number
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
}

export function SimulationControls({
  state,
  speed,
  elapsedTime,
  onStart,
  onPause,
  onResume,
  onReset,
  onSpeedChange,
}: SimulationControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex items-center gap-3">
      {/* Timer */}
      <div className="font-mono text-sm bg-secondary px-3 py-1.5 rounded-md border border-border">
        <span className="text-muted-foreground mr-1">T+</span>
        <span className="text-foreground font-semibold">{formatTime(elapsedTime)}</span>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-1 bg-secondary rounded-md border border-border p-0.5">
        {[1, 2, 5].map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              speed === s
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Play/Pause Controls */}
      <div className="flex items-center gap-1">
        {state === "idle" && (
          <Button onClick={onStart} size="sm" className="gap-1.5">
            <Play className="w-3.5 h-3.5" />
            Start Attack
          </Button>
        )}
        {state === "running" && (
          <Button onClick={onPause} size="sm" variant="secondary" className="gap-1.5">
            <Pause className="w-3.5 h-3.5" />
            Pause
          </Button>
        )}
        {state === "paused" && (
          <Button onClick={onResume} size="sm" className="gap-1.5">
            <Play className="w-3.5 h-3.5" />
            Resume
          </Button>
        )}
        {state === "completed" && (
          <div className="flex items-center gap-1.5 text-sm text-success font-medium px-2">
            <FastForward className="w-4 h-4" />
            Complete
          </div>
        )}

        <Button onClick={onReset} size="sm" variant="outline" className="gap-1.5 bg-transparent">
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      </div>
    </div>
  )
}
