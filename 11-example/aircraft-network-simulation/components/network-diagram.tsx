"use client"

import { useState, useEffect } from "react"
import type { Node, Packet } from "@/lib/types"
import { NodeTooltip } from "./node-tooltip"

interface NetworkDiagramProps {
  nodes: Node[]
  packets: Packet[]
  isMesh: boolean
  onNodeClick: (nodeId: string) => void
  showPackets: boolean
  showLatency: boolean
  showCriticalPaths: boolean
}

const PACKET_STYLES = {
  normal: { color: "#3B82F6", size: 6, glow: "0 0 6px #3B82F6" },
  critical: { color: "#10B981", size: 8, glow: "0 0 10px #10B981" },
  error: { color: "#EF4444", size: 6, glow: "0 0 8px #EF4444" },
  rerouted: { color: "#F59E0B", size: 7, glow: "0 0 8px #F59E0B" },
}

export function NetworkDiagram({
  nodes,
  packets,
  isMesh,
  onNodeClick,
  showPackets,
  showLatency,
  showCriticalPaths,
}: NetworkDiagramProps) {
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [failureAnimations, setFailureAnimations] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    const failedNodeIds = nodes.filter((n) => n.status === "failed").map((n) => n.id)
    const newAnimations = new Map(failureAnimations)

    for (const id of failedNodeIds) {
      if (!failureAnimations.has(id)) {
        newAnimations.set(id, Date.now())
      }
    }

    if (newAnimations.size !== failureAnimations.size) {
      setFailureAnimations(newAnimations)
    }
  }, [nodes, failureAnimations])

  const getNodeColor = (status: Node["status"]) => {
    switch (status) {
      case "active":
        return "#10B981"
      case "failed":
        return "#EF4444"
      case "degraded":
        return "#F59E0B"
      case "recovering":
        return "#3B82F6"
      default:
        return "#6B7280"
    }
  }

  const getConnections = () => {
    const connections: { from: Node; to: Node; isAlternate: boolean; isActive: boolean }[] = []

    for (const node of nodes) {
      for (const connId of node.connections) {
        const targetNode = nodes.find((n) => n.id === connId)
        if (targetNode && node.id < connId) {
          const isAlternate = isMesh && node.id !== "core" && connId !== "core"
          const isActive = node.status === "active" && targetNode.status === "active"
          connections.push({ from: node, to: targetNode, isAlternate, isActive })
        }
      }
    }

    return connections
  }

  const getPacketPosition = (packet: Packet) => {
    const fromNode = nodes.find((n) => n.id === packet.path[packet.currentSegment])
    const toNode = nodes.find((n) => n.id === packet.path[packet.currentSegment + 1])

    if (!fromNode || !toNode) return null

    return {
      x: fromNode.position.x + (toNode.position.x - fromNode.position.x) * packet.progress,
      y: fromNode.position.y + (toNode.position.y - fromNode.position.y) * packet.progress,
      type: packet.type,
    }
  }

  const connections = getConnections()

  const hasReroutedPath = packets.some(
    (p) => p.type === "rerouted" || (isMesh && !p.path.includes("core") && p.path.length > 1),
  )

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 400 350" className="w-full h-full" style={{ minHeight: "300px" }}>
        <defs>
          <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connections */}
        {connections.map(({ from, to, isAlternate, isActive }, idx) => {
          const isFailed = from.status === "failed" || to.status === "failed"
          const isRerouteActive = hasReroutedPath && isAlternate && isActive

          return (
            <g key={idx}>
              {isRerouteActive && (
                <line
                  x1={from.position.x}
                  y1={from.position.y}
                  x2={to.position.x}
                  y2={to.position.y}
                  stroke="#F59E0B"
                  strokeWidth={4}
                  opacity={0.3}
                  className="animate-pulse"
                />
              )}
              <line
                x1={from.position.x}
                y1={from.position.y}
                x2={to.position.x}
                y2={to.position.y}
                stroke={isFailed ? "#EF4444" : isRerouteActive ? "#F59E0B" : isAlternate ? "#6B7280" : "#9CA3AF"}
                strokeWidth={isActive && showCriticalPaths && from.critical && to.critical ? 3 : 2}
                strokeDasharray={isAlternate && !isRerouteActive ? "5,5" : "none"}
                opacity={isFailed ? 0.3 : isRerouteActive ? 1 : 0.6}
              />
              {isFailed && (
                <text
                  x={(from.position.x + to.position.x) / 2}
                  y={(from.position.y + to.position.y) / 2}
                  fill="#EF4444"
                  fontSize="14"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontWeight="bold"
                >
                  ✕
                </text>
              )}
            </g>
          )
        })}

        {showPackets &&
          packets.map((packet) => {
            const pos = getPacketPosition(packet)
            if (!pos) return null

            const style = PACKET_STYLES[pos.type]

            return (
              <g key={packet.id}>
                {/* Packet trail */}
                {pos.type !== "error" && (
                  <circle cx={pos.x} cy={pos.y} r={style.size + 4} fill={style.color} opacity={0.2} />
                )}
                {/* Main packet */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={style.size / 2}
                  fill={style.color}
                  style={{ filter: `drop-shadow(${style.glow})` }}
                >
                  {pos.type === "critical" && (
                    <animate
                      attributeName="r"
                      values={`${style.size / 2};${style.size / 2 + 2};${style.size / 2}`}
                      dur="0.5s"
                      repeatCount="indefinite"
                    />
                  )}
                  {pos.type === "error" && (
                    <animate attributeName="opacity" values="1;0.3;1" dur="0.2s" repeatCount="3" />
                  )}
                </circle>
              </g>
            )
          })}

        {/* Nodes */}
        {nodes.map((node) => {
          const failureTime = failureAnimations.get(node.id)
          const showFailureRipple = failureTime && Date.now() - failureTime < 1500

          return (
            <g
              key={node.id}
              className="cursor-pointer"
              onClick={() => onNodeClick(node.id)}
              onMouseEnter={(e) => {
                setHoveredNode(node)
                const rect = e.currentTarget.getBoundingClientRect()
                setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top })
              }}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {showFailureRipple && (
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={30}
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth={3}
                  filter="url(#glow-red)"
                >
                  <animate attributeName="r" from="30" to="80" dur="0.8s" repeatCount="1" />
                  <animate attributeName="opacity" from="1" to="0" dur="0.8s" repeatCount="1" />
                </circle>
              )}

              {/* Critical node glow */}
              {node.critical && node.status === "active" && (
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={35}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  opacity={0.4}
                  filter="url(#glow-amber)"
                  className="animate-pulse"
                />
              )}

              {/* Node background glow based on status */}
              <circle
                cx={node.position.x}
                cy={node.position.y}
                r={32}
                fill={getNodeColor(node.status)}
                opacity={0.2}
                filter={
                  node.status === "active"
                    ? "url(#glow-green)"
                    : node.status === "failed"
                      ? "url(#glow-red)"
                      : undefined
                }
              />

              {/* Node circle */}
              <circle
                cx={node.position.x}
                cy={node.position.y}
                r={28}
                fill={getNodeColor(node.status)}
                stroke={node.status === "failed" ? "#991B1B" : node.status === "active" ? "#065F46" : "#92400E"}
                strokeWidth={node.status === "failed" ? 3 : 2}
              />

              {/* Node icon/label */}
              <text
                x={node.position.x}
                y={node.position.y}
                fill="white"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {node.status === "failed" ? "✕" : node.label.substring(0, 4)}
              </text>

              {/* Node name below */}
              <text x={node.position.x} y={node.position.y + 42} fill="#9CA3AF" fontSize="9" textAnchor="middle">
                {node.label}
              </text>

              {/* Latency indicator */}
              {showLatency && node.status === "active" && (
                <text x={node.position.x} y={node.position.y + 52} fill="#6B7280" fontSize="8" textAnchor="middle">
                  {node.latency}ms
                </text>
              )}

              {node.status === "recovering" && (
                <g>
                  <circle
                    cx={node.position.x}
                    cy={node.position.y}
                    r={32}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from={`0 ${node.position.x} ${node.position.y}`}
                      to={`360 ${node.position.x} ${node.position.y}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {hoveredNode && <NodeTooltip node={hoveredNode} position={tooltipPos} isMesh={isMesh} />}
    </div>
  )
}
