"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { NetworkVisualization } from "./network-visualization"
import { CompactMetrics } from "./compact-metrics"
import { CompactTimeline } from "./compact-timeline"
import { ModeSelector } from "./mode-selector"
import type {
  NetworkNode,
  NetworkEdge,
  AttackEvent,
  SimulationMetrics,
  SimulationMode,
  SimulationState,
  SecurityAlert,
} from "@/lib/simulation-types"
import { generateEnterpriseNetwork, getConnectedNodes } from "@/lib/network-generator"
import { Shield, ShieldAlert, Play, Pause, RotateCcw, Zap, Eye, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WannaCrySimulation() {
  const [mode, setMode] = useState<SimulationMode>("unprotected")
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [edges, setEdges] = useState<NetworkEdge[]>([])
  const [events, setEvents] = useState<AttackEvent[]>([])
  const [simulationState, setSimulationState] = useState<SimulationState>("idle")
  const [speed, setSpeed] = useState(1)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [patientZeroId, setPatientZeroId] = useState<string | null>(null)
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    totalNodes: 0,
    infectedNodes: 0,
    healthyNodes: 0,
    isolatedNodes: 0,
    protectedNodes: 0,
    infectionRate: 0,
    spreadRate: 0,
    timeToDetection: null,
    timeToContainment: null,
    blockedAttempts: 0,
    successfulExploits: 0,
    criticalAssetsCompromised: [],
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const eventIdRef = useRef(0)
  const alertIdRef = useRef(0)
  const detectionTimeRef = useRef<number | null>(null)
  const blockedAttemptsRef = useRef(0)
  const successfulExploitsRef = useRef(0)

  // Initialize network based on mode
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateEnterpriseNetwork(mode === "protected")
    setNodes(newNodes)
    setEdges(newEdges)
    setMetrics((prev) => ({
      ...prev,
      totalNodes: newNodes.length,
      healthyNodes: newNodes.filter((n) => n.status === "healthy").length,
      protectedNodes: newNodes.filter((n) => n.status === "protected").length,
    }))
  }, [mode])

  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityAlerts((prev) => prev.filter((a) => Date.now() - a.timestamp < 2000))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const addSecurityAlert = useCallback((type: SecurityAlert["type"], sourceId: string, targetId: string) => {
    const alert: SecurityAlert = {
      id: `alert-${alertIdRef.current++}`,
      type,
      sourceId,
      targetId,
      timestamp: Date.now(),
    }
    setSecurityAlerts((prev) => [...prev, alert])
  }, [])

  const addEvent = useCallback(
    (
      type: AttackEvent["type"],
      message: string,
      severity: AttackEvent["severity"],
      sourceNode?: string,
      targetNode?: string,
      details?: string,
    ) => {
      const newEvent: AttackEvent = {
        id: `evt-${eventIdRef.current++}`,
        timestamp: elapsedTime,
        type,
        message,
        severity,
        sourceNode,
        targetNode,
        details,
      }
      setEvents((prev) => [...prev.slice(-50), newEvent])
    },
    [elapsedTime],
  )

  const attemptInfection = useCallback(
    (sourceNode: NetworkNode, targetNode: NetworkNode): boolean => {
      if (mode === "protected") {
        if (targetNode.firewallEnabled && Math.random() < 0.6) {
          blockedAttemptsRef.current++
          addEvent(
            "firewall_block",
            `Firewall blocked SMB exploit attempt on ${targetNode.label}`,
            "low",
            sourceNode.id,
            targetNode.id,
          )
          addSecurityAlert("firewall_block", sourceNode.id, targetNode.id)
          return false
        }

        if (targetNode.idsMonitored && Math.random() < 0.7) {
          if (detectionTimeRef.current === null) {
            detectionTimeRef.current = elapsedTime
          }
          addEvent(
            "ids_alert",
            `IDS: Malicious EternalBlue signature detected targeting ${targetNode.label}`,
            "high",
            sourceNode.id,
            targetNode.id,
          )
          addSecurityAlert("ids_detection", sourceNode.id, targetNode.id)

          // IDS sends isolation command to firewall
          setTimeout(() => {
            addEvent(
              "isolation",
              `IDS Command: Isolating ${sourceNode.label} via firewall rules`,
              "info",
              sourceNode.id,
            )
            addSecurityAlert("isolation_command", "IDS-01", sourceNode.id)

            setNodes((prev) => prev.map((n) => (n.id === sourceNode.id ? { ...n, status: "isolated" as const } : n)))
            setEdges((prev) =>
              prev.map((e) => (e.source === sourceNode.id || e.target === sourceNode.id ? { ...e, active: false } : e)),
            )
          }, 1500 / speed)
          return false
        }

        // Patched system check
        if (targetNode.patched) {
          blockedAttemptsRef.current++
          addEvent(
            "blocked",
            `${targetNode.label}: MS17-010 patch applied - exploit rejected`,
            "low",
            sourceNode.id,
            targetNode.id,
          )
          return false
        }
      }

      const isVulnerable =
        targetNode.os === "Windows XP" || targetNode.os === "Windows 7" || targetNode.os === "Windows Server 2008"

      if (!isVulnerable) return false

      const exploitChance = targetNode.os === "Windows XP" ? 0.95 : 0.85

      if (Math.random() < exploitChance) {
        successfulExploitsRef.current++
        return true
      }

      return false
    },
    [mode, elapsedTime, speed, addEvent, addSecurityAlert],
  )

  const runSimulationTick = useCallback(() => {
    setNodes((currentNodes) => {
      const infectedNodes = currentNodes.filter((n) => n.status === "infected")
      if (infectedNodes.length === 0) return currentNodes

      let updatedNodes = [...currentNodes]

      infectedNodes.forEach((infectedNode) => {
        addEvent("scan", `${infectedNode.label}: Scanning port 445 (SMB)...`, "medium", infectedNode.id)

        const connectedNodeIds = getConnectedNodes(infectedNode.id, edges)

        connectedNodeIds.forEach((targetId) => {
          const targetNode = updatedNodes.find((n) => n.id === targetId)
          if (targetNode && targetNode.status === "healthy") {
            const infected = attemptInfection(infectedNode, targetNode)

            if (infected) {
              addEvent(
                "infection",
                `${targetNode.label} COMPROMISED via EternalBlue (MS17-010)`,
                "critical",
                infectedNode.id,
                targetNode.id,
              )
              updatedNodes = updatedNodes.map((n) => (n.id === targetId ? { ...n, status: "infected" as const } : n))

              if (targetNode.type === "server" || targetNode.type === "database") {
                setMetrics((prev) => ({
                  ...prev,
                  criticalAssetsCompromised: [...prev.criticalAssetsCompromised, targetNode.label],
                }))
              }
            }
          }
        })
      })

      return updatedNodes
    })
  }, [edges, attemptInfection, addEvent])

  useEffect(() => {
    if (simulationState !== "running") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const tickInterval = 2000 / speed

    intervalRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 2)
      runSimulationTick()
    }, tickInterval)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [simulationState, speed, runSimulationTick])

  useEffect(() => {
    const infectedCount = nodes.filter((n) => n.status === "infected").length
    const isolatedCount = nodes.filter((n) => n.status === "isolated").length
    const healthyCount = nodes.filter((n) => n.status === "healthy").length
    const protectedCount = nodes.filter((n) => n.status === "protected").length

    setMetrics((prev) => ({
      ...prev,
      infectedNodes: infectedCount,
      isolatedNodes: isolatedCount,
      healthyNodes: healthyCount,
      protectedNodes: protectedCount,
      infectionRate: nodes.length > 0 ? (infectedCount / nodes.length) * 100 : 0,
      spreadRate: elapsedTime > 0 ? (infectedCount / elapsedTime) * 60 : 0,
      timeToDetection: detectionTimeRef.current,
      blockedAttempts: blockedAttemptsRef.current,
      successfulExploits: successfulExploitsRef.current,
    }))

    if (simulationState === "running" && infectedCount > 0) {
      const vulnerableNodes = nodes.filter(
        (n) =>
          n.status === "healthy" && (n.os === "Windows XP" || n.os === "Windows 7" || n.os === "Windows Server 2008"),
      )

      if (vulnerableNodes.length === 0 || elapsedTime > 180) {
        setSimulationState("completed")
        addEvent("alert", "Simulation complete", "info")
      }
    }
  }, [nodes, elapsedTime, simulationState, addEvent])

  const startSimulation = useCallback(
    (selectedNodeId?: string) => {
      const vulnerableWorkstations = nodes.filter(
        (n) => n.type === "workstation" && n.status === "healthy" && !n.patched,
      )

      const patientZero = selectedNodeId
        ? nodes.find((n) => n.id === selectedNodeId)
        : vulnerableWorkstations[Math.floor(Math.random() * vulnerableWorkstations.length)]

      if (!patientZero) {
        addEvent("alert", "No vulnerable systems found", "info")
        return
      }

      setPatientZeroId(patientZero.id)
      setNodes((prev) =>
        prev.map((node) => (node.id === patientZero.id ? { ...node, status: "infected" as const } : node)),
      )

      setSimulationState("running")
      addEvent(
        "infection",
        `PATIENT ZERO: ${patientZero.label} - Initial compromise via phishing email`,
        "critical",
        undefined,
        patientZero.id,
      )
    },
    [nodes, addEvent],
  )

  const pauseSimulation = useCallback(() => setSimulationState("paused"), [])
  const resumeSimulation = useCallback(() => setSimulationState("running"), [])

  const resetSimulation = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } = generateEnterpriseNetwork(mode === "protected")
    setNodes(newNodes)
    setEdges(newEdges)
    setEvents([])
    setSecurityAlerts([])
    setSimulationState("idle")
    setElapsedTime(0)
    setPatientZeroId(null)
    detectionTimeRef.current = null
    blockedAttemptsRef.current = 0
    successfulExploitsRef.current = 0
    eventIdRef.current = 0
    alertIdRef.current = 0
    setMetrics({
      totalNodes: newNodes.length,
      infectedNodes: 0,
      healthyNodes: newNodes.filter((n) => n.status === "healthy").length,
      isolatedNodes: 0,
      protectedNodes: newNodes.filter((n) => n.status === "protected").length,
      infectionRate: 0,
      spreadRate: 0,
      timeToDetection: null,
      timeToContainment: null,
      blockedAttempts: 0,
      successfulExploits: 0,
      criticalAssetsCompromised: [],
    })
  }, [mode])

  const handleModeChange = useCallback(
    (newMode: SimulationMode) => {
      if (simulationState !== "idle") resetSimulation()
      setMode(newMode)
    },
    [simulationState, resetSimulation],
  )

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (simulationState === "idle") {
        const node = nodes.find((n) => n.id === nodeId)
        if (node?.type === "workstation" && node.status === "healthy") {
          startSimulation(nodeId)
        }
      }
    },
    [simulationState, nodes, startSimulation],
  )

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden">
      <header className="h-14 shrink-0 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShieldAlert className="w-7 h-7 text-destructive" />
            <Zap className="w-3.5 h-3.5 text-warning absolute -bottom-0.5 -right-0.5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">WannaCry Ransomware Simulation</h1>
            <p className="text-[10px] text-muted-foreground">
              Educational demonstration of mesh network vulnerability & protection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="font-mono text-base bg-muted px-3 py-1.5 rounded-md border border-border">
            {formatTime(elapsedTime)}
          </div>

          {/* Speed control */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1">
            {[1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  speed === s ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {simulationState === "idle" && (
              <Button size="sm" onClick={() => startSimulation()} className="h-8 px-4">
                <Play className="w-3.5 h-3.5 mr-1.5" /> Start Attack
              </Button>
            )}
            {simulationState === "running" && (
              <Button size="sm" variant="secondary" onClick={pauseSimulation} className="h-8 px-4">
                <Pause className="w-3.5 h-3.5 mr-1.5" /> Pause
              </Button>
            )}
            {simulationState === "paused" && (
              <Button size="sm" onClick={resumeSimulation} className="h-8 px-4">
                <Play className="w-3.5 h-3.5 mr-1.5" /> Resume
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={resetSimulation} className="h-8 px-3 bg-transparent">
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>

          <ModeSelector mode={mode} onModeChange={handleModeChange} disabled={simulationState !== "idle"} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Network visualization */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className={`h-9 shrink-0 flex items-center justify-between px-4 text-xs ${
              mode === "protected"
                ? "bg-success/10 text-success border-b border-success/20"
                : "bg-destructive/10 text-destructive border-b border-destructive/20"
            }`}
          >
            <div className="flex items-center gap-2">
              {mode === "protected" ? <Shield className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              <span className="font-semibold">
                {mode === "protected" ? "PROTECTED MODE" : "VULNERABLE MODE (May 2017 Conditions)"}
              </span>
            </div>
            {mode === "protected" && (
              <div className="flex items-center gap-4 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>IDS/IPS Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Firewall Enabled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span>MS17-010 Patched</span>
                </div>
              </div>
            )}
            {mode === "unprotected" && (
              <div className="flex items-center gap-3 text-[10px] opacity-80">
                <span>No IDS</span>
                <span>No Firewall</span>
                <span>Unpatched Systems</span>
                <span>SMBv1 Enabled</span>
              </div>
            )}
          </div>

          {/* Network graph */}
          <div className="flex-1 overflow-hidden">
            <NetworkVisualization
              nodes={nodes}
              edges={edges}
              onNodeClick={handleNodeClick}
              patientZeroId={patientZeroId}
              simulationState={simulationState}
              mode={mode}
              securityAlerts={securityAlerts}
            />
          </div>
        </div>

        {/* Right sidebar - metrics and timeline */}
        <div className="w-80 shrink-0 border-l border-border flex flex-col overflow-hidden bg-card/50">
          <CompactMetrics metrics={metrics} mode={mode} />
          <CompactTimeline events={events} />
        </div>
      </div>
    </div>
  )
}
