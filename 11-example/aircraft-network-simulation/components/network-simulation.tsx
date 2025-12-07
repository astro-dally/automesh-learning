"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { LandingScreen } from "./landing-screen"
import { SimulationView } from "./simulation-view"
import { ComparisonSummary } from "./comparison-summary"
import type { SimulationState, Node, Packet } from "@/lib/types"
import { createCentralizedNodes, createMeshNodes, TIMELINE_EVENTS, findPath } from "@/lib/network-utils"

export function NetworkSimulation() {
  const [screen, setScreen] = useState<"landing" | "simulation" | "summary">("landing")
  const [simulationState, setSimulationState] = useState<SimulationState>({
    status: "ready",
    currentTime: 0,
    speed: 1,
  })
  const [centralizedNodes, setCentralizedNodes] = useState<Node[]>(() => createCentralizedNodes())
  const [meshNodes, setMeshNodes] = useState<Node[]>(() => createMeshNodes())
  const [centralizedPackets, setCentralizedPackets] = useState<Packet[]>([])
  const [meshPackets, setMeshPackets] = useState<Packet[]>([])
  const [failedNodes, setFailedNodes] = useState<Set<string>>(new Set())
  const [showPackets, setShowPackets] = useState(true)
  const [showLatency, setShowLatency] = useState(true)
  const [showCriticalPaths, setShowCriticalPaths] = useState(true)

  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const packetIdRef = useRef(0)

  const resetSimulation = useCallback(() => {
    setCentralizedNodes(createCentralizedNodes())
    setMeshNodes(createMeshNodes())
    setCentralizedPackets([])
    setMeshPackets([])
    setFailedNodes(new Set())
    setSimulationState({ status: "ready", currentTime: 0, speed: 1 })
    lastTimeRef.current = 0
  }, [])

  const startSimulation = useCallback(() => {
    resetSimulation()
    setScreen("simulation")
    setSimulationState((prev) => ({ ...prev, status: "playing" }))
  }, [resetSimulation])

  const togglePause = useCallback(() => {
    setSimulationState((prev) => ({
      ...prev,
      status: prev.status === "playing" ? "paused" : "playing",
    }))
  }, [])

  const setSpeed = useCallback((speed: number) => {
    setSimulationState((prev) => ({ ...prev, speed }))
  }, [])

  const seekTo = useCallback((time: number) => {
    setSimulationState((prev) => ({ ...prev, currentTime: time }))

    // Reset and recalculate state based on time
    if (time < 42) {
      // Before core failure - reset everything
      setCentralizedNodes(createCentralizedNodes())
      setMeshNodes(createMeshNodes())
      setFailedNodes(new Set())
    } else if (time < 47) {
      // After core failure, before engine cutoff
      setFailedNodes(new Set(["core"]))
      setCentralizedNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          status: "failed",
        })),
      )
      setMeshNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          status: node.id === "core" ? "failed" : "active",
        })),
      )
    } else {
      // After engine cutoff
      setFailedNodes(new Set(["core"]))
      setCentralizedNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          status: "failed",
        })),
      )
      setMeshNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          status: node.id === "core" ? "failed" : "active",
        })),
      )
    }
  }, [])

  const generatePackets = useCallback(
    (nodes: Node[], isMesh: boolean, currentTime: number) => {
      const activeNodes = nodes.filter((n) => n.status === "active" || n.status === "recovering")
      if (activeNodes.length < 2) return []

      const newPackets: Packet[] = []
      const criticalPairs = [
        ["fuel", "fadec1"],
        ["fuel", "fadec2"],
      ]
      const normalPairs = [
        ["sensors", "core"],
        ["core", "displays"],
        ["fms", "displays"],
      ]

      // Critical packets
      for (const [sourceId, destId] of criticalPairs) {
        const source = nodes.find((n) => n.id === sourceId)
        const dest = nodes.find((n) => n.id === destId)

        if (source && dest && source.status === "active" && dest.status === "active") {
          const path = findPath(source.id, dest.id, nodes, failedNodes, isMesh)
          if (path && path.length > 1) {
            // Determine if this is a rerouted packet (mesh network, path doesn't go through core)
            const isRerouted = isMesh && !path.includes("core") && failedNodes.has("core")

            newPackets.push({
              id: `packet-${packetIdRef.current++}`,
              sourceNode: source.id,
              destNode: dest.id,
              path,
              currentSegment: 0,
              progress: 0,
              type: isRerouted ? "rerouted" : "critical",
              speed: 200,
              createdAt: currentTime,
            })
          }
        }
      }

      // Normal packets
      for (const [sourceId, destId] of normalPairs) {
        const source = nodes.find((n) => n.id === sourceId)
        const dest = nodes.find((n) => n.id === destId)

        if (source && dest && source.status === "active" && dest.status === "active") {
          const path = findPath(source.id, dest.id, nodes, failedNodes, isMesh)
          if (path && path.length > 1) {
            newPackets.push({
              id: `packet-${packetIdRef.current++}`,
              sourceNode: source.id,
              destNode: dest.id,
              path,
              currentSegment: 0,
              progress: 0,
              type: "normal",
              speed: 180,
              createdAt: currentTime,
            })
          }
        }
      }

      return newPackets
    },
    [failedNodes],
  )

  // Main simulation loop
  useEffect(() => {
    if (simulationState.status !== "playing") {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const deltaTime = (timestamp - lastTimeRef.current) * simulationState.speed
      lastTimeRef.current = timestamp

      setSimulationState((prev) => {
        const newTime = prev.currentTime + deltaTime / 1000

        // Check for timeline events
        for (const event of TIMELINE_EVENTS) {
          if (prev.currentTime < event.time && newTime >= event.time) {
            if (event.type === "core_failure") {
              setFailedNodes(new Set(["core"]))

              // Centralized: cascade failure
              setCentralizedNodes((nodes) =>
                nodes.map((node) => {
                  if (node.id === "core") {
                    return { ...node, status: "failed" }
                  }
                  return node
                }),
              )

              // After brief delay, cascade to all nodes in centralized
              setTimeout(() => {
                setCentralizedNodes((nodes) =>
                  nodes.map((node) => ({
                    ...node,
                    status: "failed",
                  })),
                )
                setCentralizedPackets((packets) => packets.map((p) => ({ ...p, type: "error" as const })))
              }, 800 / simulationState.speed)

              // Mesh: only core fails, others degrade briefly then recover
              setMeshNodes((nodes) =>
                nodes.map((node) => {
                  if (node.id === "core") {
                    return { ...node, status: "failed" }
                  }
                  return { ...node, status: "degraded" }
                }),
              )

              setTimeout(() => {
                setMeshNodes((nodes) =>
                  nodes.map((node) => {
                    if (node.id === "core") return node
                    return { ...node, status: "active" }
                  }),
                )
              }, 200 / simulationState.speed)
            }

            if (event.type === "engine_cutoff") {
              setCentralizedNodes((nodes) =>
                nodes.map((node) => ({
                  ...node,
                  status: "failed",
                })),
              )
            }

            if (event.type === "crash") {
              setScreen("summary")
              return { ...prev, status: "finished", currentTime: newTime }
            }
          }
        }

        return { ...prev, currentTime: newTime }
      })

      // Update packets
      const updatePackets = (packets: Packet[], nodes: Node[]): Packet[] => {
        return packets
          .map((packet) => {
            // Error packets fade out quickly
            if (packet.type === "error") {
              const age = simulationState.currentTime - packet.createdAt
              if (age > 0.5) return null
            }

            const newProgress = packet.progress + (deltaTime / 1000) * (packet.speed / 100)

            if (newProgress >= 1) {
              if (packet.currentSegment < packet.path.length - 2) {
                // Check if next node is failed
                const nextNode = nodes.find((n) => n.id === packet.path[packet.currentSegment + 2])
                if (nextNode?.status === "failed") {
                  return { ...packet, type: "error" as const, progress: 1 }
                }
                return {
                  ...packet,
                  currentSegment: packet.currentSegment + 1,
                  progress: 0,
                }
              }
              return null // Packet arrived
            }

            return { ...packet, progress: newProgress }
          })
          .filter((p): p is Packet => p !== null)
      }

      setCentralizedPackets((prev) => updatePackets(prev, centralizedNodes))
      setMeshPackets((prev) => updatePackets(prev, meshNodes))

      // Generate new packets periodically
      if (Math.random() < 0.03) {
        setCentralizedPackets((prev) => [
          ...prev,
          ...generatePackets(centralizedNodes, false, simulationState.currentTime),
        ])
        setMeshPackets((prev) => [...prev, ...generatePackets(meshNodes, true, simulationState.currentTime)])
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [
    simulationState.status,
    simulationState.speed,
    centralizedNodes,
    meshNodes,
    generatePackets,
    simulationState.currentTime,
  ])

  // Handle node click for manual failure injection
  const handleNodeClick = useCallback((nodeId: string, isCentralized: boolean) => {
    if (isCentralized) {
      setCentralizedNodes((nodes) => nodes.map((node) => (node.id === nodeId ? { ...node, status: "failed" } : node)))
      // Mark packets going to/from this node as errors
      setCentralizedPackets((packets) =>
        packets.map((p) => (p.path.includes(nodeId) ? { ...p, type: "error" as const } : p)),
      )
    } else {
      setMeshNodes((nodes) => {
        const updatedNodes = nodes.map((node) =>
          node.id === nodeId ? { ...node, status: "failed" } : { ...node, status: "degraded" },
        )
        // Recover non-failed nodes after brief degradation
        setTimeout(() => {
          setMeshNodes((n) => n.map((node) => (node.status === "degraded" ? { ...node, status: "active" } : node)))
        }, 200)
        return updatedNodes
      })
      // Mark affected packets as rerouted
      setMeshPackets((packets) =>
        packets.map((p) => (p.path.includes(nodeId) ? { ...p, type: "rerouted" as const } : p)),
      )
      setFailedNodes((prev) => new Set([...prev, nodeId]))
    }
  }, [])

  if (screen === "landing") {
    return <LandingScreen onStart={startSimulation} />
  }

  if (screen === "summary") {
    return (
      <ComparisonSummary
        onRestart={() => {
          resetSimulation()
          setScreen("landing")
        }}
        onTryAgain={startSimulation}
      />
    )
  }

  return (
    <SimulationView
      simulationState={simulationState}
      centralizedNodes={centralizedNodes}
      meshNodes={meshNodes}
      centralizedPackets={centralizedPackets}
      meshPackets={meshPackets}
      onTogglePause={togglePause}
      onRestart={() => {
        resetSimulation()
        startSimulation()
      }}
      onSetSpeed={setSpeed}
      onSeek={seekTo}
      onNodeClick={handleNodeClick}
      showPackets={showPackets}
      showLatency={showLatency}
      showCriticalPaths={showCriticalPaths}
      onTogglePackets={() => setShowPackets((p) => !p)}
      onToggleLatency={() => setShowLatency((l) => !l)}
      onToggleCriticalPaths={() => setShowCriticalPaths((c) => !c)}
    />
  )
}
