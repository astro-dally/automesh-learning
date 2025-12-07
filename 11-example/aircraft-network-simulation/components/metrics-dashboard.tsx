"use client"

import type { Node, Packet } from "@/lib/types"

interface MetricsDashboardProps {
  nodes: Node[]
  packets: Packet[]
  isMesh: boolean
  simulationTime: number
}

export function MetricsDashboard({ nodes, packets, isMesh, simulationTime }: MetricsDashboardProps) {
  const activeNodes = nodes.filter((n) => n.status === "active" || n.status === "recovering")
  const failedNodes = nodes.filter((n) => n.status === "failed")
  const availability = Math.round((activeNodes.length / nodes.length) * 100)

  const criticalNodes = nodes.filter((n) => n.critical)
  const criticalActive = criticalNodes.filter((n) => n.status === "active" || n.status === "recovering")
  const criticalPathStatus =
    criticalActive.length === criticalNodes.length ? "OK" : criticalActive.length > 0 ? "DEG" : "FAIL"

  const avgLatency =
    activeNodes.length > 0 ? Math.round(activeNodes.reduce((sum, n) => sum + n.latency, 0) / activeNodes.length) : 0

  const packetLoss = failedNodes.length > 0 ? (isMesh ? 3 : 100) : 0

  const hasCoreFailure = simulationTime >= 42

  return (
    <div className="mt-2 bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex-shrink-0">
      <div className="grid grid-cols-4 gap-2 text-[10px]">
        <div>
          <div className="text-slate-500">Avail</div>
          <div
            className={`font-mono font-bold ${
              availability > 80 ? "text-emerald-400" : availability > 50 ? "text-amber-400" : "text-red-400"
            }`}
          >
            {availability}%
          </div>
        </div>

        <div>
          <div className="text-slate-500">Critical</div>
          <div
            className={`font-mono font-bold ${
              criticalPathStatus === "OK"
                ? "text-emerald-400"
                : criticalPathStatus === "DEG"
                  ? "text-amber-400"
                  : "text-red-400"
            }`}
          >
            {criticalPathStatus}
          </div>
        </div>

        <div>
          <div className="text-slate-500">Latency</div>
          <div className={`font-mono font-bold ${availability > 0 ? "text-slate-300" : "text-slate-600"}`}>
            {availability > 0 ? `${avgLatency}ms` : "N/A"}
          </div>
        </div>

        <div>
          <div className="text-slate-500">Loss</div>
          <div
            className={`font-mono font-bold ${
              packetLoss === 0 ? "text-emerald-400" : packetLoss < 10 ? "text-amber-400" : "text-red-400"
            }`}
          >
            {packetLoss}%
          </div>
        </div>
      </div>
    </div>
  )
}
