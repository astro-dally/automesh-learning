"use client"

import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Zap, Clock, Activity } from "lucide-react"
import type { SimulationState } from "@/lib/types"

interface ControlPanelProps {
  simulationState: SimulationState
  onTogglePause: () => void
  onRestart: () => void
  onSetSpeed: (speed: number) => void
  onSeek: (time: number) => void
  showPackets: boolean
  showLatency: boolean
  showCriticalPaths: boolean
  onTogglePackets: () => void
  onToggleLatency: () => void
  onToggleCriticalPaths: () => void
}

export function ControlPanel({
  simulationState,
  onTogglePause,
  onRestart,
  onSetSpeed,
  onSeek,
  showPackets,
  showLatency,
  showCriticalPaths,
  onTogglePackets,
  onToggleLatency,
  onToggleCriticalPaths,
}: ControlPanelProps) {
  const timelineProgress = Math.min((simulationState.currentTime / 71) * 100, 100)

  return (
    <div className="bg-slate-900/95 border-t border-slate-700 backdrop-blur-sm">
      <div className="px-4 py-2">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="range"
              min="0"
              max="71"
              step="0.1"
              value={simulationState.currentTime}
              onChange={(e) => onSeek(Number.parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
              style={{
                background: `linear-gradient(to right, 
                  #10B981 0%, 
                  #10B981 ${Math.min(timelineProgress, 59)}%, 
                  #F59E0B ${Math.max(59, Math.min(timelineProgress, 66))}%, 
                  #EF4444 ${Math.max(66, timelineProgress)}%, 
                  #334155 ${timelineProgress}%, 
                  #334155 100%)`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 px-4 pb-2">
        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePause}
            className={`border-slate-600 hover:bg-slate-700 h-8 px-3 ${
              simulationState.status === "playing"
                ? "bg-amber-600 hover:bg-amber-500 border-amber-500 text-white"
                : "bg-transparent"
            }`}
          >
            {simulationState.status === "playing" ? (
              <>
                <Pause className="w-3 h-3 mr-1" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" /> Play
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRestart}
            className="border-slate-600 hover:bg-slate-700 bg-transparent h-8 w-8 p-0"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>

          {/* Speed Controls */}
          <div className="flex items-center gap-0.5 ml-2 bg-slate-800 rounded-md p-0.5">
            <Clock className="w-3 h-3 text-slate-500 mx-1" />
            {[0.5, 1, 2, 4].map((speed) => (
              <Button
                key={speed}
                variant={simulationState.speed === speed ? "default" : "ghost"}
                size="sm"
                onClick={() => onSetSpeed(speed)}
                className={`h-6 px-2 text-xs ${
                  simulationState.speed === speed
                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {speed}x
              </Button>
            ))}
          </div>

          {/* Time Display */}
          <div className="ml-2 font-mono text-sm">
            <span className="text-slate-300">{simulationState.currentTime.toFixed(1)}s</span>
            <span className="text-slate-600">/71</span>
          </div>
        </div>

        {/* View Options */}
        <div className="flex items-center gap-1.5">
          <Button
            variant={showPackets ? "default" : "outline"}
            size="sm"
            onClick={onTogglePackets}
            className={`h-7 px-2 text-xs ${
              showPackets ? "bg-blue-600 hover:bg-blue-500" : "border-slate-600 hover:bg-slate-700 bg-transparent"
            }`}
          >
            <Activity className="w-3 h-3 mr-1" />
            Packets
          </Button>

          <Button
            variant={showLatency ? "default" : "outline"}
            size="sm"
            onClick={onToggleLatency}
            className={`h-7 px-2 text-xs ${
              showLatency ? "bg-blue-600 hover:bg-blue-500" : "border-slate-600 hover:bg-slate-700 bg-transparent"
            }`}
          >
            <Clock className="w-3 h-3 mr-1" />
            Latency
          </Button>

          <Button
            variant={showCriticalPaths ? "default" : "outline"}
            size="sm"
            onClick={onToggleCriticalPaths}
            className={`h-7 px-2 text-xs ${
              showCriticalPaths
                ? "bg-amber-600 hover:bg-amber-500"
                : "border-slate-600 hover:bg-slate-700 bg-transparent"
            }`}
          >
            <Zap className="w-3 h-3 mr-1" />
            Critical
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-[10px] text-slate-500">
          <span className="bg-slate-800 px-1.5 py-0.5 rounded">Click node to fail</span>
        </div>
      </div>
    </div>
  )
}
