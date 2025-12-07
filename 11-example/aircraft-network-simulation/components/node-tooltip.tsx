"use client"

import type React from "react"

import type { Node } from "@/lib/types"
import { AlertTriangle, Cpu, Fuel, Gauge, Monitor, Radio, Zap, Settings } from "lucide-react"

interface NodeTooltipProps {
  node: Node
  position: { x: number; y: number }
  isMesh?: boolean
  containerRect?: DOMRect
}

const nodeData: Record<
  string,
  {
    description: string
    realWorldInfo: string
    icon: React.ReactNode
  }
> = {
  core: {
    description:
      "Central data hub connecting all avionic computers. Acts as the backbone for communication between flight-critical systems.",
    realWorldInfo: "In Boeing 787, this is the Core Network Cabinet housing ARINC 664 switches and modules.",
    icon: <Cpu className="w-4 h-4" />,
  },
  fadec1: {
    description: "Controls all aspects of Engine 1 operation including fuel flow, ignition, and thrust management.",
    realWorldInfo: "Loss of FADEC communication results in immediate engine shutdown.",
    icon: <Settings className="w-4 h-4" />,
  },
  fadec2: {
    description: "Controls all aspects of Engine 2 operation including fuel flow, ignition, and thrust management.",
    realWorldInfo: "Loss of FADEC communication results in immediate engine shutdown.",
    icon: <Settings className="w-4 h-4" />,
  },
  fuel: {
    description: "Monitors and controls fuel distribution, tank levels, and fuel switch positions.",
    realWorldInfo: "In AI171, this system erroneously moved fuel switches to CUTOFF position.",
    icon: <Fuel className="w-4 h-4" />,
  },
  fms: {
    description: "Handles navigation, flight planning, and autopilot functions.",
    realWorldInfo: "While important, FMS failure alone does not cause immediate catastrophe.",
    icon: <Gauge className="w-4 h-4" />,
  },
  displays: {
    description: "Primary Flight Display (PFD) and Navigation Display showing critical flight information to pilots.",
    realWorldInfo: "Pilots can still fly with backup instruments if displays fail.",
    icon: <Monitor className="w-4 h-4" />,
  },
  sensors: {
    description: "Collects data from aircraft systems including airspeed, altitude, attitude, and system health.",
    realWorldInfo: "21 Remote Data Concentrators (RDCs) throughout the aircraft.",
    icon: <Radio className="w-4 h-4" />,
  },
  apu: {
    description: "Auxiliary Power Unit management for backup electrical power generation.",
    realWorldInfo: "Auto-started during AI171 emergency but could not save the aircraft.",
    icon: <Zap className="w-4 h-4" />,
  },
  rat: {
    description: "Ram Air Turbine emergency power. Deploys automatically when main power fails.",
    realWorldInfo: "Deployed automatically during AI171 when both engines lost power.",
    icon: <Zap className="w-4 h-4" />,
  },
}

export function NodeTooltip({ node, position, isMesh, containerRect }: NodeTooltipProps) {
  const data = nodeData[node.id] || {
    description: "Network component",
    realWorldInfo: "",
    icon: <Cpu className="w-4 h-4" />,
  }

  const statusColor = {
    active: "text-emerald-400 bg-emerald-500/20",
    failed: "text-red-400 bg-red-500/20",
    degraded: "text-amber-400 bg-amber-500/20",
    recovering: "text-blue-400 bg-blue-500/20",
  }

  const tooltipWidth = 280
  const tooltipHeight = 260

  let left = position.x
  let top = position.y - 10
  let transformX = "-50%"
  let transformY = "-100%"

  if (position.x - tooltipWidth / 2 < 10) {
    left = 10
    transformX = "0%"
  } else if (position.x + tooltipWidth / 2 > window.innerWidth - 10) {
    left = window.innerWidth - 10
    transformX = "-100%"
  }

  if (position.y - tooltipHeight < 10) {
    top = position.y + 20
    transformY = "0%"
  }

  return (
    <div
      className="fixed z-50 bg-slate-800/95 border border-slate-600 rounded-lg p-3 shadow-2xl pointer-events-none backdrop-blur-sm"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        transform: `translate(${transformX}, ${transformY})`,
        width: `${tooltipWidth}px`,
        maxWidth: "calc(100vw - 20px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-slate-400">{data.icon}</span>
        <span className="font-semibold text-slate-100 text-sm">{node.label}</span>
        <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${statusColor[node.status]}`}>
          {node.status.toUpperCase()}
        </span>
      </div>

      {/* Type and Critical badges */}
      <div className="flex gap-1.5 mb-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
          {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
        </span>
        {node.critical && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 flex items-center gap-0.5">
            <AlertTriangle className="w-2.5 h-2.5" /> Critical
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-[10px] text-slate-300 leading-relaxed mb-2 line-clamp-2">{data.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-1.5 text-[10px] border-t border-slate-700 pt-2 mb-2">
        <div>
          <span className="text-slate-500">Latency:</span>
          <span className="text-slate-300 ml-1">{node.latency}ms</span>
        </div>
        <div>
          <span className="text-slate-500">Connections:</span>
          <span className="text-slate-300 ml-1">{node.connections.length}</span>
        </div>
        <div>
          <span className="text-slate-500">Bandwidth:</span>
          <span className="text-slate-300 ml-1">{node.bandwidth} Mbps</span>
        </div>
        <div>
          <span className="text-slate-500">Redundancy:</span>
          <span className={`ml-1 ${isMesh ? "text-emerald-400" : "text-red-400"}`}>{isMesh ? "Yes" : "None"}</span>
        </div>
      </div>

      {/* Real-world info */}
      {data.realWorldInfo && (
        <div className="border-t border-slate-700 pt-3">
          <p className="text-[10px] text-slate-500 italic leading-relaxed">{data.realWorldInfo}</p>
        </div>
      )}

      {/* Click hint */}
      <div className="pt-1.5 border-t border-slate-700 text-center">
        <span className="text-[10px] text-slate-500">Click to simulate failure</span>
      </div>
    </div>
  )
}
