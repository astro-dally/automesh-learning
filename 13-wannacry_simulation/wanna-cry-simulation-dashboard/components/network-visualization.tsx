"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import type { NetworkNode, NetworkEdge, SimulationState, SecurityAlert } from "@/lib/simulation-types"
import { Monitor, Server, Database, Radio, Cloud, Skull, Lock, ScanSearch, ShieldCheck, Eye } from "lucide-react"

interface NetworkVisualizationProps {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
  onNodeClick: (nodeId: string) => void
  patientZeroId: string | null
  simulationState: SimulationState
  mode: "protected" | "unprotected"
  securityAlerts: SecurityAlert[]
}

export function NetworkVisualization({
  nodes,
  edges,
  onNodeClick,
  patientZeroId,
  simulationState,
  mode,
  securityAlerts,
}: NetworkVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [idsScanAngle, setIdsScanAngle] = useState(0)

  useEffect(() => {
    if (mode !== "protected" || simulationState !== "running") return
    const interval = setInterval(() => {
      setIdsScanAngle((prev) => (prev + 3) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [mode, simulationState])

  const getNodeColor = (node: NetworkNode) => {
    switch (node.status) {
      case "healthy":
        return "#22c55e"
      case "infected":
        return "#ef4444"
      case "isolated":
        return "#6b7280"
      case "protected":
        return "#3b82f6"
      case "scanning":
        return "#f59e0b"
      default:
        return "#22c55e"
    }
  }

  const getNodeIcon = (node: NetworkNode) => {
    if (node.status === "isolated") return Lock
    if (node.status === "infected") return Skull
    if (node.status === "scanning") return ScanSearch

    switch (node.type) {
      case "workstation":
        return Monitor
      case "server":
        return Server
      case "database":
        return Database
      case "firewall":
        return ShieldCheck
      case "ids":
        return Eye
      case "router":
        return Radio
      case "cloud":
        return Cloud
      default:
        return Monitor
    }
  }

  const getNodeSize = (node: NetworkNode) => {
    switch (node.type) {
      case "router":
        return 22
      case "firewall":
      case "ids":
        return 24
      case "server":
      case "database":
      case "cloud":
        return 18
      default:
        return 14
    }
  }

  // Find IDS and Firewall positions for visualization
  const idsNode = nodes.find((n) => n.type === "ids")
  const firewallNode = nodes.find((n) => n.type === "firewall")

  const edgeElements = useMemo(() => {
    return edges.map((edge, idx) => {
      const sourceNode = nodes.find((n) => n.id === edge.source)
      const targetNode = nodes.find((n) => n.id === edge.target)
      if (!sourceNode || !targetNode) return null

      const isInfectionPath =
        sourceNode.status === "infected" && (targetNode.status === "infected" || targetNode.status === "healthy")
      const isMonitored = edge.monitored && mode === "protected"
      const isBlocked = !edge.active

      return (
        <g key={`${edge.source}-${edge.target}-${idx}`}>
          <line
            x1={sourceNode.x}
            y1={sourceNode.y}
            x2={targetNode.x}
            y2={targetNode.y}
            stroke={isBlocked ? "#374151" : isInfectionPath ? "#ef4444" : isMonitored ? "#3b82f6" : "#475569"}
            strokeOpacity={isBlocked ? 0.1 : isInfectionPath ? 0.8 : isMonitored ? 0.4 : 0.3}
            strokeWidth={isInfectionPath ? 2.5 : isMonitored ? 1.5 : 1}
            strokeDasharray={isMonitored && !isInfectionPath ? "4 2" : undefined}
            className={isInfectionPath ? "animate-pulse" : ""}
          />
          {isInfectionPath && (
            <>
              <circle r="3" fill="#ef4444" filter="url(#glow-red)">
                <animateMotion
                  dur="0.6s"
                  repeatCount="indefinite"
                  path={`M${sourceNode.x},${sourceNode.y} L${targetNode.x},${targetNode.y}`}
                />
              </circle>
              {/* Malware packet icon */}
              <g>
                <animateMotion
                  dur="0.6s"
                  repeatCount="indefinite"
                  path={`M${sourceNode.x},${sourceNode.y} L${targetNode.x},${targetNode.y}`}
                />
                <text fontSize="8" fill="#ef4444" textAnchor="middle" dy="-6">
                  SMB
                </text>
              </g>
            </>
          )}
          {isMonitored && !isInfectionPath && simulationState === "running" && (
            <circle r="2" fill="#3b82f6" opacity="0.6">
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                path={`M${sourceNode.x},${sourceNode.y} L${targetNode.x},${targetNode.y}`}
              />
            </circle>
          )}
        </g>
      )
    })
  }, [edges, nodes, mode, simulationState])

  const securityAlertElements = useMemo(() => {
    return securityAlerts.slice(-5).map((alert) => {
      const sourceNode = nodes.find((n) => n.id === alert.sourceId)
      const targetNode = nodes.find((n) => n.id === alert.targetId)
      if (!sourceNode || !targetNode) return null

      if (alert.type === "ids_detection") {
        return (
          <g key={alert.id}>
            {/* Detection beam from IDS to threat */}
            <line
              x1={idsNode?.x || sourceNode.x}
              y1={idsNode?.y || sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke="#f59e0b"
              strokeWidth="3"
              strokeDasharray="8 4"
              opacity="0.8"
              filter="url(#glow-orange)"
            >
              <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.3s" repeatCount="indefinite" />
            </line>
            {/* Alert icon at target */}
            <g transform={`translate(${targetNode.x}, ${targetNode.y - 25})`}>
              <rect x="-20" y="-8" width="40" height="16" rx="4" fill="#f59e0b" />
              <text fontSize="8" fill="black" textAnchor="middle" dy="3" fontWeight="bold">
                DETECTED
              </text>
            </g>
          </g>
        )
      }

      if (alert.type === "firewall_block") {
        return (
          <g key={alert.id}>
            {/* Block effect */}
            <line
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke="#ef4444"
              strokeWidth="4"
              opacity="0.6"
            />
            {/* X mark at blocked point */}
            <g transform={`translate(${(sourceNode.x + targetNode.x) / 2}, ${(sourceNode.y + targetNode.y) / 2})`}>
              <circle r="12" fill="#1e1e1e" stroke="#ef4444" strokeWidth="2" />
              <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ef4444" strokeWidth="2" />
              <line x1="5" y1="-5" x2="-5" y2="5" stroke="#ef4444" strokeWidth="2" />
            </g>
            {/* Blocked label */}
            <g transform={`translate(${(sourceNode.x + targetNode.x) / 2}, ${(sourceNode.y + targetNode.y) / 2 - 20})`}>
              <rect x="-22" y="-8" width="44" height="16" rx="4" fill="#ef4444" />
              <text fontSize="8" fill="white" textAnchor="middle" dy="3" fontWeight="bold">
                BLOCKED
              </text>
            </g>
          </g>
        )
      }

      if (alert.type === "isolation_command") {
        return (
          <g key={alert.id}>
            {/* Command line from IDS to target */}
            <line
              x1={idsNode?.x || 420}
              y1={idsNode?.y || 210}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke="#22c55e"
              strokeWidth="2"
              strokeDasharray="4 2"
              filter="url(#glow-green)"
            >
              <animate attributeName="stroke-dashoffset" from="12" to="0" dur="0.2s" repeatCount="indefinite" />
            </line>
            {/* Isolation indicator */}
            <g transform={`translate(${targetNode.x}, ${targetNode.y - 25})`}>
              <rect x="-22" y="-8" width="44" height="16" rx="4" fill="#22c55e" />
              <text fontSize="8" fill="black" textAnchor="middle" dy="3" fontWeight="bold">
                ISOLATED
              </text>
            </g>
          </g>
        )
      }

      return null
    })
  }, [securityAlerts, nodes, idsNode])

  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <svg ref={svgRef} className="w-full h-full" viewBox="0 0 800 550" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="radar-gradient" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {mode === "protected" && idsNode && simulationState === "running" && (
          <g transform={`translate(${idsNode.x}, ${idsNode.y})`}>
            {/* Radar sweep */}
            <g transform={`rotate(${idsScanAngle})`}>
              <path d={`M 0 0 L 200 -30 A 200 200 0 0 1 200 30 Z`} fill="url(#radar-gradient)" opacity="0.4" />
            </g>
            {/* Radar circles */}
            {[60, 120, 180].map((r) => (
              <circle
                key={r}
                r={r}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.5"
                opacity="0.2"
                strokeDasharray="4 4"
              />
            ))}
          </g>
        )}

        {mode === "protected" && firewallNode && (
          <g transform={`translate(${firewallNode.x}, ${firewallNode.y})`}>
            {/* Pulsing shield */}
            <circle r="35" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3">
              <animate attributeName="r" values="30;40;30" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        <g>{edgeElements}</g>

        <g>{securityAlertElements}</g>

        {nodes.map((node) => {
          const Icon = getNodeIcon(node)
          const color = getNodeColor(node)
          const size = getNodeSize(node)
          const isPatientZero = node.id === patientZeroId
          const isClickable = simulationState === "idle" && node.type === "workstation" && node.status === "healthy"
          const isSecurityDevice = node.type === "firewall" || node.type === "ids"

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onClick={() => onNodeClick(node.id)}
              className={isClickable ? "cursor-pointer" : "cursor-default"}
              style={{
                filter:
                  node.status === "infected"
                    ? "url(#glow-red)"
                    : node.status === "protected" || isSecurityDevice
                      ? "url(#glow-blue)"
                      : undefined,
              }}
            >
              {isPatientZero && (
                <circle
                  r={size + 8}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  className="animate-ping"
                  opacity={0.5}
                />
              )}

              {node.status === "isolated" && (
                <circle r={size + 4} fill="none" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="3 2" />
              )}

              {isSecurityDevice && (
                <circle r={size + 6} fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5">
                  <animate
                    attributeName="r"
                    values={`${size + 4};${size + 10};${size + 4}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              <circle
                r={size}
                fill={isSecurityDevice ? "#1e40af" : color}
                className={`transition-all duration-300 ${node.status === "infected" ? "animate-pulse" : ""}`}
                opacity={node.status === "isolated" ? 0.5 : 1}
              />

              <circle r={size - 3} fill="rgba(0,0,0,0.25)" />

              <foreignObject x={-7} y={-7} width={14} height={14} className="pointer-events-none">
                <div className="flex items-center justify-center w-full h-full">
                  <Icon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
              </foreignObject>

              <text y={size + 12} textAnchor="middle" className="fill-muted-foreground text-[8px] font-medium">
                {node.label}
              </text>

              {node.patched && node.status === "healthy" && (
                <circle cx={size - 2} cy={-size + 2} r={4} fill="#22c55e" stroke="#15803d" strokeWidth={1} />
              )}
            </g>
          )
        })}
      </svg>

      {/* Compact legend */}
      <div className="absolute bottom-2 left-2 bg-card/90 backdrop-blur-sm rounded-md px-2 py-1.5 border border-border text-[10px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <span className="text-muted-foreground">Healthy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span className="text-muted-foreground">Infected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
            <span className="text-muted-foreground">Protected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#6b7280]" />
            <span className="text-muted-foreground">Isolated</span>
          </div>
          {mode === "protected" && (
            <>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#3b82f6]" />
                <span className="text-muted-foreground">IDS</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#3b82f6]" />
                <span className="text-muted-foreground">Firewall</span>
              </div>
            </>
          )}
        </div>
      </div>

      {simulationState === "idle" && (
        <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm rounded-md px-2 py-1 border border-border text-[10px] text-muted-foreground">
          Click any workstation to start infection
        </div>
      )}
    </div>
  )
}
