"use client"

import { useState } from "react"
import { NetworkDiagram } from "./network-diagram"
import { ControlPanel } from "./control-panel"
import { MetricsDashboard } from "./metrics-dashboard"
import { EventLog } from "./event-log"
import type { SimulationState, Node, Packet } from "@/lib/types"
import { SIMULATION_EVENTS } from "@/lib/network-utils"

interface SimulationViewProps {
  simulationState: SimulationState
  centralizedNodes: Node[]
  meshNodes: Node[]
  centralizedPackets: Packet[]
  meshPackets: Packet[]
  onTogglePause: () => void
  onRestart: () => void
  onSetSpeed: (speed: number) => void
  onSeek: (time: number) => void
  onNodeClick: (nodeId: string, isCentralized: boolean) => void
  showPackets: boolean
  showLatency: boolean
  showCriticalPaths: boolean
  onTogglePackets: () => void
  onToggleLatency: () => void
  onToggleCriticalPaths: () => void
}

export function SimulationView({
  simulationState,
  centralizedNodes,
  meshNodes,
  centralizedPackets,
  meshPackets,
  onTogglePause,
  onRestart,
  onSetSpeed,
  onSeek,
  onNodeClick,
  showPackets,
  showLatency,
  showCriticalPaths,
  onTogglePackets,
  onToggleLatency,
  onToggleCriticalPaths,
}: SimulationViewProps) {
  const [eventLogFilter, setEventLogFilter] = useState<"both" | "centralized" | "mesh">("both")

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `T+${mins}:${secs.toString().padStart(2, "0")}`
  }

  const centralizedFailed = centralizedNodes.filter((n) => n.status === "failed").length > centralizedNodes.length / 2
  const meshHealthy =
    meshNodes.filter((n) => n.status === "active" || n.status === "recovering").length / meshNodes.length

  const getPhase = () => {
    if (simulationState.currentTime < 42) return { label: "Normal Operations", color: "text-emerald-400" }
    if (simulationState.currentTime < 47) return { label: "Core Failure", color: "text-amber-400" }
    if (simulationState.currentTime < 71) return { label: "Engine Cutoff", color: "text-red-400" }
    return { label: "Simulation Complete", color: "text-slate-400" }
  }

  const phase = getPhase()

  return (
    <div className="h-screen bg-slate-950 text-slate-50 flex flex-col overflow-hidden">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-mono text-xs">{formatTime(simulationState.currentTime)}</span>
              <span className={`text-xs font-medium ${phase.color}`}>{phase.label}</span>
            </div>
            <div className="text-xs">
              <span className={centralizedFailed ? "text-red-400" : "text-emerald-400"}>
                Centralized: {centralizedFailed ? "FAILED" : "OK"}
              </span>
              <span className="text-slate-600 mx-2">|</span>
              <span
                className={
                  meshHealthy > 0.8 ? "text-emerald-400" : meshHealthy > 0.5 ? "text-amber-400" : "text-red-400"
                }
              >
                Mesh: {Math.round(meshHealthy * 100)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className="h-full transition-all duration-100 rounded-full"
                style={{
                  width: `${Math.min((simulationState.currentTime / 71) * 100, 100)}%`,
                  background:
                    simulationState.currentTime < 42
                      ? "#10B981"
                      : simulationState.currentTime < 47
                        ? "linear-gradient(to right, #10B981, #F59E0B)"
                        : "linear-gradient(to right, #10B981, #F59E0B, #EF4444)",
                }}
              />
              <div className="absolute top-1/2 -translate-y-1/2 left-[59%] w-1.5 h-1.5 bg-amber-500 rounded-full border border-slate-900" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[66%] w-1.5 h-1.5 bg-red-500 rounded-full border border-slate-900" />
            </div>
            <span className="text-slate-500 font-mono text-[10px]">71s</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-hidden">
        {/* Networks Section */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
          {/* Centralized Network */}
          <div className="flex flex-col min-h-0">
            <div
              className={`rounded-t-lg px-3 py-2 text-center font-semibold text-sm transition-colors flex-shrink-0 ${
                centralizedFailed
                  ? "bg-red-900/50 border border-red-800 text-red-300"
                  : "bg-slate-800 border border-slate-700 text-slate-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${centralizedFailed ? "bg-red-500" : "bg-emerald-500"} animate-pulse`}
                />
                CENTRALIZED (Boeing 787)
              </div>
            </div>
            <div
              className={`flex-1 min-h-0 rounded-b-lg border-x border-b p-2 transition-colors ${
                centralizedFailed ? "bg-red-950/20 border-red-900" : "bg-slate-900/50 border-slate-800"
              }`}
            >
              <NetworkDiagram
                nodes={centralizedNodes}
                packets={centralizedPackets}
                isMesh={false}
                onNodeClick={(id) => onNodeClick(id, true)}
                showPackets={showPackets}
                showLatency={showLatency}
                showCriticalPaths={showCriticalPaths}
              />
            </div>
            <MetricsDashboard
              nodes={centralizedNodes}
              packets={centralizedPackets}
              isMesh={false}
              simulationTime={simulationState.currentTime}
            />
          </div>

          {/* Mesh Network */}
          <div className="flex flex-col min-h-0">
            <div
              className={`rounded-t-lg px-3 py-2 text-center font-semibold text-sm transition-colors flex-shrink-0 ${
                meshHealthy > 0.8
                  ? "bg-emerald-900/50 border border-emerald-800 text-emerald-300"
                  : meshHealthy > 0.5
                    ? "bg-amber-900/50 border border-amber-800 text-amber-300"
                    : "bg-red-900/50 border border-red-800 text-red-300"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${meshHealthy > 0.8 ? "bg-emerald-500" : meshHealthy > 0.5 ? "bg-amber-500" : "bg-red-500"} animate-pulse`}
                />
                MESH NETWORK (Alternative)
              </div>
            </div>
            <div
              className={`flex-1 min-h-0 rounded-b-lg border-x border-b p-2 transition-colors ${
                meshHealthy > 0.8
                  ? "bg-emerald-950/20 border-emerald-900"
                  : meshHealthy > 0.5
                    ? "bg-amber-950/20 border-amber-900"
                    : "bg-red-950/20 border-red-900"
              }`}
            >
              <NetworkDiagram
                nodes={meshNodes}
                packets={meshPackets}
                isMesh={true}
                onNodeClick={(id) => onNodeClick(id, false)}
                showPackets={showPackets}
                showLatency={showLatency}
                showCriticalPaths={showCriticalPaths}
              />
            </div>
            <MetricsDashboard
              nodes={meshNodes}
              packets={meshPackets}
              isMesh={true}
              simulationTime={simulationState.currentTime}
            />
          </div>
        </div>

        <div className="hidden xl:flex w-64 flex-shrink-0 min-h-0">
          <EventLog
            events={SIMULATION_EVENTS}
            currentTime={simulationState.currentTime}
            activeFilter={eventLogFilter}
            onFilterChange={setEventLogFilter}
          />
        </div>
      </div>

      {/* Control Panel - flex-shrink-0 to keep at bottom */}
      <div className="flex-shrink-0">
        <ControlPanel
          simulationState={simulationState}
          onTogglePause={onTogglePause}
          onRestart={onRestart}
          onSetSpeed={onSetSpeed}
          onSeek={onSeek}
          showPackets={showPackets}
          showLatency={showLatency}
          showCriticalPaths={showCriticalPaths}
          onTogglePackets={onTogglePackets}
          onToggleLatency={onToggleLatency}
          onToggleCriticalPaths={onToggleCriticalPaths}
        />
      </div>
    </div>
  )
}
