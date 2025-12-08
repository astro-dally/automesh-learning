"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, Pause, RotateCcw, Zap } from "lucide-react"

const PROTOCOLS = [
  {
    id: "batman",
    name: "BATMAN IV",
    fullName: "Better Approach To Mobile Ad-hoc Networking",
    color: "#f59e0b",
    description:
      "A proactive protocol where each node broadcasts OGMs to announce its presence. Neighbors track these messages to determine the best next-hop for any destination.",
    howItWorks: [
      "Each node periodically broadcasts OGM (Originator Message) packets",
      "OGMs contain: originator address, sequence number, TTL (Time To Live)",
      "Neighbors receive OGMs and track TQ (Transmission Quality) scores",
      "TQ decays with each hop, indicating path quality",
      "Best next-hop selected based on highest TQ value",
      "Bidirectional link check ensures reliable two-way communication",
    ],
    useCase: "Ideal for dense mesh networks with frequent topology changes.",
    messageType: "OGM (Originator Message)",
    acronyms: {
      OGM: "Originator Message - Periodic broadcast announcing node presence",
      TQ: "Transmission Quality - Score indicating link reliability (0-255)",
      TTL: "Time To Live - Hop limit to prevent infinite propagation",
    },
  },
  {
    id: "hwmp",
    name: "HWMP",
    fullName: "Hybrid Wireless Mesh Protocol (IEEE 802.11s)",
    color: "#3b82f6",
    description:
      "Combines proactive tree-building with reactive on-demand routing. Uses airtime link metric for path selection based on transmission time.",
    howItWorks: [
      "PREQ (Path Request) flooded to discover routes to destination",
      "PREP (Path Reply) sent back along reverse path",
      "PERR (Path Error) broadcast when link failure detected",
      "Root Announcement (RANN) builds proactive tree to mesh portal",
      "Airtime Link Metric considers data rate, overhead, and frame error rate",
      "Sequence numbers prevent routing loops",
    ],
    useCase: "Best for infrastructure mesh networks with a root/portal node.",
    messageType: "PREQ/PREP/PERR",
    acronyms: {
      PREQ: "Path Request - Broadcast message to discover route to destination",
      PREP: "Path Reply - Unicast response containing route information",
      PERR: "Path Error - Notification when a link or path fails",
      RANN: "Root Announcement - Proactive broadcast from mesh portal/root",
    },
  },
  {
    id: "olsr",
    name: "OLSR",
    fullName: "Optimized Link State Routing Protocol",
    color: "#10b981",
    description:
      "A proactive protocol using MPR (MultiPoint Relays) to minimize flooding overhead. Only MPR nodes forward control traffic.",
    howItWorks: [
      "HELLO messages discover 1-hop and 2-hop neighbors",
      "Each node selects an MPR set - minimum nodes to reach all 2-hop neighbors",
      "TC (Topology Control) messages flooded only by MPR nodes",
      "All nodes maintain a complete topology map",
      "Shortest path calculated using Dijkstra's algorithm",
      "MPR selection reduces broadcast overhead by ~90%",
    ],
    useCase: "Optimal for large, dense networks requiring low control overhead.",
    messageType: "TC (Topology Control)",
    acronyms: {
      TC: "Topology Control - Link state information broadcast by MPRs",
      MPR: "MultiPoint Relay - Selected nodes that forward broadcasts",
      HELLO: "Neighbor discovery message sent periodically",
      MS: "MPR Selector - Nodes that selected this node as their MPR",
    },
  },
  {
    id: "aodv",
    name: "AODV",
    fullName: "Ad hoc On-Demand Distance Vector",
    color: "#8b5cf6",
    description:
      "A reactive protocol that discovers routes only when needed. Reduces overhead in networks with low traffic.",
    howItWorks: [
      "RREQ (Route Request) flooded when route to destination needed",
      "RREP (Route Reply) sent back by destination or intermediate node with fresh route",
      "RERR (Route Error) broadcast when link break detected",
      "Sequence numbers ensure loop-free and fresh routes",
      "Route timeout removes stale entries from routing table",
      "Local repair attempts to fix broken links before RERR",
    ],
    useCase: "Best for sparse networks with intermittent communication patterns.",
    messageType: "RREQ/RREP/RERR",
    acronyms: {
      RREQ: "Route Request - Broadcast flood seeking path to destination",
      RREP: "Route Reply - Unicast message with route back to source",
      RERR: "Route Error - Notification of broken link or unreachable destination",
      HELLO: "Optional keepalive to detect link breaks",
    },
  },
]

const ALGORITHMS = [
  {
    id: "dijkstra",
    name: "Dijkstra's Algorithm",
    color: "#06b6d4",
    complexity: "O((V + E) log V)",
    description:
      "Finds shortest path from source to all nodes by greedily selecting the minimum distance unvisited node.",
    steps: [
      "Initialize: source distance = 0, all others = infinity",
      "Add source to priority queue (min-heap)",
      "Extract node with minimum distance",
      "For each neighbor: if new path shorter, update distance",
      "Add updated neighbors to priority queue",
      "Repeat until destination reached or queue empty",
    ],
    pros: ["Guaranteed optimal path", "Works with weighted edges", "Efficient with priority queue"],
    cons: ["Requires non-negative weights", "Explores many unnecessary nodes", "No heuristic guidance"],
  },
  {
    id: "bellman-ford",
    name: "Bellman-Ford Algorithm",
    color: "#f97316",
    complexity: "O(V × E)",
    description: "Relaxes all edges V-1 times to find shortest paths. Can detect negative cycles.",
    steps: [
      "Initialize: source distance = 0, all others = infinity",
      "Repeat V-1 times:",
      "  For each edge (u, v): if d[u] + weight < d[v], update d[v]",
      "Check for negative cycles (optional V-th iteration)",
      "If any distance updates in V-th iteration, negative cycle exists",
    ],
    pros: ["Handles negative edge weights", "Detects negative cycles", "Simpler implementation"],
    cons: ["Slower than Dijkstra", "Not suitable for real-time", "O(V×E) can be expensive"],
  },
  {
    id: "simulated-annealing",
    name: "Simulated Annealing",
    color: "#ec4899",
    complexity: "O(iterations × neighbors)",
    description:
      "Probabilistic optimization inspired by metallurgical annealing. Accepts worse solutions early to escape local optima.",
    steps: [
      "Start with initial solution and high temperature T",
      "Generate random neighbor solution",
      "If neighbor better: accept it",
      "If neighbor worse: accept with probability e^(-ΔE/T)",
      "Reduce temperature: T = T × cooling_rate",
      "Repeat until frozen (T ≈ 0) or max iterations",
    ],
    pros: ["Escapes local optima", "Works for complex problems", "Tunable parameters"],
    cons: ["No guarantee of optimal", "Requires parameter tuning", "Can be slow to converge"],
  },
  {
    id: "genetic",
    name: "Genetic Algorithm",
    color: "#84cc16",
    complexity: "O(generations × population × fitness)",
    description: "Evolution-inspired optimization using selection, crossover, and mutation to evolve better solutions.",
    steps: [
      "Initialize random population of candidate paths",
      "Evaluate fitness of each individual (path cost)",
      "Select parents based on fitness (tournament/roulette)",
      "Crossover: combine parent genes to create offspring",
      "Mutation: randomly modify some genes",
      "Replace population and repeat for G generations",
    ],
    pros: ["Explores large solution space", "Parallelizable", "Handles complex constraints"],
    cons: ["Computationally expensive", "May converge prematurely", "Parameter sensitive"],
  },
  {
    id: "astar",
    name: "A* Search Algorithm",
    color: "#6366f1",
    complexity: "O(E) best case, O(V²) worst",
    description:
      "Informed search using heuristic to guide exploration. Combines actual cost g(n) with estimated cost h(n).",
    steps: [
      "f(n) = g(n) + h(n) where g = actual cost, h = heuristic estimate",
      "Initialize: add source to open set with f = h(source)",
      "Extract node with lowest f value",
      "If goal reached: reconstruct and return path",
      "For each neighbor: calculate tentative g score",
      "If better path found: update parent and add to open set",
    ],
    pros: ["Optimal if h is admissible", "More efficient than Dijkstra", "Heuristic-guided search"],
    cons: ["Requires good heuristic", "Memory intensive (stores all nodes)", "Heuristic design is crucial"],
  },
]

function ProtocolAnimation({ protocol }: { protocol: (typeof PROTOCOLS)[0] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const isPlayingRef = useRef(true)
  const animationRef = useRef<number>()
  const progressRef = useRef(0)

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw network nodes
    const nodes = [
      { x: 200, y: 40, label: "Gateway", color: "#f59e0b", size: 16 },
      { x: 120, y: 100, label: "Router 1", color: "#a855f7", size: 14 },
      { x: 280, y: 100, label: "Router 2", color: "#a855f7", size: 14 },
      { x: 60, y: 170, label: "Switch A", color: "#3b82f6", size: 12 },
      { x: 160, y: 170, label: "Switch B", color: "#3b82f6", size: 12 },
      { x: 240, y: 170, label: "Switch C", color: "#3b82f6", size: 12 },
      { x: 340, y: 170, label: "Switch D", color: "#3b82f6", size: 12 },
      { x: 40, y: 230, label: "AP1", color: "#22c55e", size: 10 },
      { x: 100, y: 230, label: "AP2", color: "#22c55e", size: 10 },
      { x: 200, y: 230, label: "AP3", color: "#22c55e", size: 10 },
      { x: 300, y: 230, label: "AP4", color: "#22c55e", size: 10 },
      { x: 360, y: 230, label: "AP5", color: "#22c55e", size: 10 },
    ]

    const links = [
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [2, 5],
      [2, 6],
      [3, 7],
      [3, 8],
      [4, 8],
      [4, 9],
      [5, 9],
      [5, 10],
      [6, 10],
    ]

    // Draw links
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 1.5
    links.forEach(([from, to]) => {
      ctx.beginPath()
      ctx.moveTo(nodes[from].x, nodes[from].y)
      ctx.lineTo(nodes[to].x, nodes[to].y)
      ctx.stroke()
    })

    // Draw nodes
    nodes.forEach((node) => {
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
      ctx.fillStyle = node.color
      ctx.fill()

      ctx.fillStyle = "#fff"
      ctx.font = "9px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(node.label, node.x, node.y + node.size + 12)
    })

    // Protocol-specific animation
    const progress = progressRef.current
    const messageLabel = protocol.messageType.split("/")[0]

    // Show message type label
    ctx.fillStyle = protocol.color
    ctx.font = "bold 11px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(messageLabel, 10, 20)

    if (protocol.id === "batman") {
      // OGM flooding from all nodes
      const waveRadius = (progress % 100) * 3
      nodes.forEach((node, i) => {
        if (i < 7) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, waveRadius, 0, Math.PI * 2)
          ctx.strokeStyle = protocol.color + "60"
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })
    } else if (protocol.id === "hwmp") {
      // PREQ from source, PREP back
      const sourceNode = nodes[7]
      const destNode = nodes[0]
      if (progress < 50) {
        const t = progress / 50
        const x = sourceNode.x + (destNode.x - sourceNode.x) * t
        const y = sourceNode.y + (destNode.y - sourceNode.y) * t
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.fillStyle = protocol.color
        ctx.fill()
        ctx.fillStyle = "#fff"
        ctx.font = "8px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("PREQ", x, y + 3)
      } else {
        const t = (progress - 50) / 50
        const x = destNode.x + (sourceNode.x - destNode.x) * t
        const y = destNode.y + (sourceNode.y - destNode.y) * t
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.fillStyle = "#22c55e"
        ctx.fill()
        ctx.fillStyle = "#fff"
        ctx.font = "8px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("PREP", x, y + 3)
      }
    } else if (protocol.id === "olsr") {
      // TC messages from MPR nodes only
      const mprNodes = [1, 2, 4, 5]
      const waveRadius = (progress % 80) * 2.5
      mprNodes.forEach((i) => {
        ctx.beginPath()
        ctx.arc(nodes[i].x, nodes[i].y, waveRadius, 0, Math.PI * 2)
        ctx.strokeStyle = protocol.color + "50"
        ctx.lineWidth = 2
        ctx.stroke()
        // MPR indicator
        ctx.fillStyle = protocol.color
        ctx.font = "8px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("MPR", nodes[i].x, nodes[i].y - nodes[i].size - 5)
      })
    } else if (protocol.id === "aodv") {
      // RREQ flood then RREP back
      if (progress < 60) {
        const waveRadius = progress * 4
        ctx.beginPath()
        ctx.arc(nodes[10].x, nodes[10].y, waveRadius, 0, Math.PI * 2)
        ctx.strokeStyle = protocol.color + "60"
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.fillStyle = protocol.color
        ctx.font = "9px sans-serif"
        ctx.fillText("RREQ", nodes[10].x + waveRadius + 5, nodes[10].y)
      } else {
        const t = (progress - 60) / 40
        const path = [10, 6, 2, 0]
        const segmentIndex = Math.floor(t * (path.length - 1))
        const segmentT = (t * (path.length - 1)) % 1
        if (segmentIndex < path.length - 1) {
          const from = nodes[path[segmentIndex]]
          const to = nodes[path[segmentIndex + 1]]
          const x = from.x + (to.x - from.x) * segmentT
          const y = from.y + (to.y - from.y) * segmentT
          ctx.beginPath()
          ctx.arc(x, y, 8, 0, Math.PI * 2)
          ctx.fillStyle = "#22c55e"
          ctx.fill()
          ctx.fillStyle = "#fff"
          ctx.font = "8px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("RREP", x, y + 3)
        }
      }
    }

    if (isPlayingRef.current) {
      progressRef.current = (progress + 0.5) % 100
      animationRef.current = requestAnimationFrame(animate)
    }
  }, [protocol])

  useEffect(() => {
    isPlayingRef.current = isPlaying
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying, animate])

  const handleRestart = () => {
    progressRef.current = 0
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }

  return (
    <div className="relative w-full h-[280px] bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
      <canvas ref={canvasRef} width={400} height={260} className="w-full h-full" />
      <div className="absolute bottom-2 right-2 flex gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 bg-zinc-800/80 hover:bg-zinc-700"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 bg-zinc-800/80 hover:bg-zinc-700"
          onClick={handleRestart}
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

function AlgorithmAnimation({ algorithm }: { algorithm: (typeof ALGORITHMS)[0] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const isPlayingRef = useRef(true)
  const animationRef = useRef<number>()
  const progressRef = useRef(0)

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Simple graph for pathfinding
    const graphNodes = [
      { x: 50, y: 130, label: "S" },
      { x: 120, y: 60, label: "A" },
      { x: 120, y: 200, label: "B" },
      { x: 200, y: 100, label: "C" },
      { x: 200, y: 160, label: "D" },
      { x: 280, y: 80, label: "E" },
      { x: 280, y: 180, label: "F" },
      { x: 350, y: 130, label: "G" },
    ]

    const graphEdges = [
      [0, 1, 4],
      [0, 2, 2],
      [1, 3, 5],
      [1, 4, 1],
      [2, 4, 3],
      [2, 3, 8],
      [3, 5, 2],
      [4, 5, 3],
      [4, 6, 1],
      [5, 7, 3],
      [6, 7, 2],
    ]

    // Draw edges with weights
    graphEdges.forEach(([from, to, weight]) => {
      const fromNode = graphNodes[from]
      const toNode = graphNodes[to]
      ctx.strokeStyle = "#444"
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(fromNode.x, fromNode.y)
      ctx.lineTo(toNode.x, toNode.y)
      ctx.stroke()

      // Weight label
      const midX = (fromNode.x + toNode.x) / 2
      const midY = (fromNode.y + toNode.y) / 2
      ctx.fillStyle = "#666"
      ctx.font = "9px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(String(weight), midX, midY - 5)
    })

    const progress = progressRef.current
    const optimalPath = [0, 2, 4, 6, 7]

    // Algorithm-specific visualization
    if (algorithm.id === "dijkstra") {
      // Expanding distance circles
      const explored = Math.floor((progress / 100) * graphNodes.length)
      for (let i = 0; i <= explored && i < graphNodes.length; i++) {
        const node = graphNodes[i]
        ctx.beginPath()
        ctx.arc(node.x, node.y, 20 + (progress % 20), 0, Math.PI * 2)
        ctx.strokeStyle = algorithm.color + "40"
        ctx.lineWidth = 2
        ctx.stroke()
      }
    } else if (algorithm.id === "bellman-ford") {
      // Wave propagation through edges
      const wave = (progress % 50) / 50
      graphEdges.forEach(([from, to]) => {
        const fromNode = graphNodes[from]
        const toNode = graphNodes[to]
        const x = fromNode.x + (toNode.x - fromNode.x) * wave
        const y = fromNode.y + (toNode.y - fromNode.y) * wave
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = algorithm.color + "80"
        ctx.fill()
      })
    } else if (algorithm.id === "simulated-annealing") {
      // Random jumps that decrease over time
      const temp = 1 - progress / 100
      const jitter = temp * 30
      const pathIndex = Math.floor((progress / 100) * optimalPath.length)
      for (let i = 0; i <= pathIndex && i < optimalPath.length; i++) {
        const node = graphNodes[optimalPath[i]]
        const jx = node.x + (Math.random() - 0.5) * jitter
        const jy = node.y + (Math.random() - 0.5) * jitter
        ctx.beginPath()
        ctx.arc(jx, jy, 6, 0, Math.PI * 2)
        ctx.fillStyle = algorithm.color
        ctx.globalAlpha = 0.3 + temp * 0.5
        ctx.fill()
        ctx.globalAlpha = 1
      }
      // Temperature indicator
      ctx.fillStyle = algorithm.color
      ctx.font = "10px sans-serif"
      ctx.fillText(`Temp: ${(temp * 100).toFixed(0)}%`, 10, 20)
    } else if (algorithm.id === "genetic") {
      // Multiple paths converging
      const generation = Math.floor(progress / 20)
      const convergence = progress / 100
      for (let p = 0; p < 5; p++) {
        ctx.beginPath()
        ctx.strokeStyle = algorithm.color + (p === 0 ? "ff" : "40")
        ctx.lineWidth = p === 0 ? 2 : 1
        let pathOffset = (1 - convergence) * (p - 2) * 15
        ctx.moveTo(graphNodes[0].x, graphNodes[0].y + pathOffset)
        optimalPath.slice(1).forEach((nodeIdx) => {
          const node = graphNodes[nodeIdx]
          pathOffset *= 0.7
          ctx.lineTo(node.x, node.y + pathOffset)
        })
        ctx.stroke()
      }
      ctx.fillStyle = algorithm.color
      ctx.font = "10px sans-serif"
      ctx.fillText(`Gen: ${generation}`, 10, 20)
    } else if (algorithm.id === "astar") {
      // Heuristic-guided exploration toward goal
      const explored = Math.floor((progress / 100) * 6)
      const explorationOrder = [0, 1, 3, 5, 7] // More directed than Dijkstra
      explorationOrder.slice(0, explored).forEach((i) => {
        const node = graphNodes[i]
        ctx.beginPath()
        ctx.arc(node.x, node.y, 15, 0, Math.PI * 2)
        ctx.strokeStyle = algorithm.color + "60"
        ctx.lineWidth = 2
        ctx.stroke()
      })
      // Arrow pointing to goal
      const goal = graphNodes[7]
      ctx.beginPath()
      ctx.moveTo(goal.x - 30, goal.y)
      ctx.lineTo(goal.x - 15, goal.y)
      ctx.strokeStyle = algorithm.color
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.fillStyle = algorithm.color
      ctx.font = "10px sans-serif"
      ctx.fillText("f = g + h", 10, 20)
    }

    // Draw optimal path
    const pathProgress = Math.min(progress / 80, 1)
    const pathLength = Math.floor(pathProgress * (optimalPath.length - 1))
    ctx.strokeStyle = "#22c55e"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(graphNodes[optimalPath[0]].x, graphNodes[optimalPath[0]].y)
    for (let i = 1; i <= pathLength; i++) {
      ctx.lineTo(graphNodes[optimalPath[i]].x, graphNodes[optimalPath[i]].y)
    }
    ctx.stroke()

    // Draw nodes on top
    graphNodes.forEach((node, i) => {
      ctx.beginPath()
      ctx.arc(node.x, node.y, 12, 0, Math.PI * 2)
      ctx.fillStyle = i === 0 ? "#22c55e" : i === 7 ? "#f59e0b" : "#666"
      ctx.fill()
      ctx.fillStyle = "#fff"
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(node.label, node.x, node.y + 4)
    })

    if (isPlayingRef.current) {
      progressRef.current = (progress + 0.4) % 100
      animationRef.current = requestAnimationFrame(animate)
    }
  }, [algorithm])

  useEffect(() => {
    isPlayingRef.current = isPlaying
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying, animate])

  const handleRestart = () => {
    progressRef.current = 0
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }

  return (
    <div className="relative w-full h-[280px] bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
      <canvas ref={canvasRef} width={400} height={260} className="w-full h-full" />
      <div className="absolute bottom-2 right-2 flex gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 bg-zinc-800/80 hover:bg-zinc-700"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 bg-zinc-800/80 hover:bg-zinc-700"
          onClick={handleRestart}
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export default function LearnPage() {
  const [selectedProtocol, setSelectedProtocol] = useState(PROTOCOLS[0])
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(ALGORITHMS[0])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            prefetch={true}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Simulator</span>
          </Link>
          <h1 className="text-lg font-semibold">Protocols & Algorithms Explained</h1>
          <div className="w-32" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="protocols" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="protocols" className="data-[state=active]:bg-zinc-800">
              Routing Protocols
            </TabsTrigger>
            <TabsTrigger value="algorithms" className="data-[state=active]:bg-zinc-800">
              Path Algorithms
            </TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-zinc-800">
              Comparison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="protocols" className="mt-6">
            <div className="flex gap-6">
              {/* Left Sidebar - Protocol Selection */}
              <div className="w-64 flex-shrink-0">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Select Protocol</h3>
                <div className="space-y-2">
                  {PROTOCOLS.map((protocol) => (
                    <button
                      key={protocol.id}
                      onClick={() => setSelectedProtocol(protocol)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedProtocol.id === protocol.id
                          ? "bg-zinc-800 border-zinc-700"
                          : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: protocol.color }} />
                        <span className="font-medium text-sm">{protocol.name}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{protocol.messageType}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Content - Protocol Details */}
              <div className="flex-1 bg-zinc-900/30 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: selectedProtocol.color }}>
                      {selectedProtocol.name}
                    </h2>
                    <p className="text-sm text-zinc-500">{selectedProtocol.fullName}</p>
                  </div>
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: selectedProtocol.color + "20",
                      color: selectedProtocol.color,
                    }}
                  >
                    {selectedProtocol.messageType}
                  </Badge>
                </div>

                <p className="text-zinc-300 mb-6">{selectedProtocol.description}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* How It Works */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <Zap className="h-4 w-4 text-amber-400" />
                      How It Works
                    </h3>
                    <ol className="space-y-2">
                      {selectedProtocol.howItWorks.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <span
                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium"
                            style={{
                              backgroundColor: selectedProtocol.color + "30",
                              color: selectedProtocol.color,
                            }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-zinc-400">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Live Animation */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Live Animation</h3>
                    <ProtocolAnimation protocol={selectedProtocol} />
                  </div>
                </div>

                {/* Acronyms */}
                <div className="mt-6 bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-3">Key Terms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(selectedProtocol.acronyms).map(([acronym, desc]) => (
                      <div key={acronym} className="text-sm">
                        <span className="font-mono font-medium" style={{ color: selectedProtocol.color }}>
                          {acronym}
                        </span>
                        <span className="text-zinc-500"> — {desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best Use Case */}
                <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-emerald-400 mb-1">Best Use Case</h3>
                  <p className="text-sm text-zinc-300">{selectedProtocol.useCase}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="algorithms" className="mt-6">
            <div className="flex gap-6">
              {/* Left Sidebar - Algorithm Selection */}
              <div className="w-64 flex-shrink-0">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Select Algorithm</h3>
                <div className="space-y-2">
                  {ALGORITHMS.map((algorithm) => (
                    <button
                      key={algorithm.id}
                      onClick={() => setSelectedAlgorithm(algorithm)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedAlgorithm.id === algorithm.id
                          ? "bg-zinc-800 border-zinc-700"
                          : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: algorithm.color }} />
                        <span className="font-medium text-sm">{algorithm.name}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 font-mono">{algorithm.complexity}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Content - Algorithm Details */}
              <div className="flex-1 bg-zinc-900/30 rounded-xl border border-zinc-800 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: selectedAlgorithm.color }}>
                      {selectedAlgorithm.name}
                    </h2>
                  </div>
                  <Badge
                    className="text-xs font-mono"
                    style={{
                      backgroundColor: selectedAlgorithm.color + "20",
                      color: selectedAlgorithm.color,
                    }}
                  >
                    {selectedAlgorithm.complexity}
                  </Badge>
                </div>

                <p className="text-zinc-300 mb-6">{selectedAlgorithm.description}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Steps */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <Zap className="h-4 w-4 text-amber-400" />
                      Algorithm Steps
                    </h3>
                    <ol className="space-y-2">
                      {selectedAlgorithm.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <span
                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium"
                            style={{
                              backgroundColor: selectedAlgorithm.color + "30",
                              color: selectedAlgorithm.color,
                            }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-zinc-400">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Live Animation */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Live Animation</h3>
                    <AlgorithmAnimation algorithm={selectedAlgorithm} />
                  </div>
                </div>

                {/* Pros and Cons */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-emerald-400 mb-2">Advantages</h3>
                    <ul className="space-y-1">
                      {selectedAlgorithm.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-zinc-300 flex gap-2">
                          <span className="text-emerald-400">+</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-red-400 mb-2">Limitations</h3>
                    <ul className="space-y-1">
                      {selectedAlgorithm.cons.map((con, i) => (
                        <li key={i} className="text-sm text-zinc-300 flex gap-2">
                          <span className="text-red-400">-</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Protocol Comparison */}
              <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold mb-4">Protocol Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-2 text-zinc-400">Protocol</th>
                        <th className="text-left py-2 text-zinc-400">Type</th>
                        <th className="text-left py-2 text-zinc-400">Overhead</th>
                        <th className="text-left py-2 text-zinc-400">Convergence</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-zinc-800/50">
                        <td className="py-2 text-amber-400">BATMAN IV</td>
                        <td className="py-2 text-zinc-300">Proactive</td>
                        <td className="py-2 text-zinc-300">Medium</td>
                        <td className="py-2 text-zinc-300">Fast</td>
                      </tr>
                      <tr className="border-b border-zinc-800/50">
                        <td className="py-2 text-blue-400">HWMP</td>
                        <td className="py-2 text-zinc-300">Hybrid</td>
                        <td className="py-2 text-zinc-300">Low-Medium</td>
                        <td className="py-2 text-zinc-300">Medium</td>
                      </tr>
                      <tr className="border-b border-zinc-800/50">
                        <td className="py-2 text-emerald-400">OLSR</td>
                        <td className="py-2 text-zinc-300">Proactive</td>
                        <td className="py-2 text-zinc-300">Low (MPR)</td>
                        <td className="py-2 text-zinc-300">Fast</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-purple-400">AODV</td>
                        <td className="py-2 text-zinc-300">Reactive</td>
                        <td className="py-2 text-zinc-300">Very Low</td>
                        <td className="py-2 text-zinc-300">Slow</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Algorithm Comparison */}
              <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold mb-4">Algorithm Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-2 text-zinc-400">Algorithm</th>
                        <th className="text-left py-2 text-zinc-400">Complexity</th>
                        <th className="text-left py-2 text-zinc-400">Optimal</th>
                        <th className="text-left py-2 text-zinc-400">Best For</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-zinc-800/50">
                        <td className="py-2 text-cyan-400">Dijkstra</td>
                        <td className="py-2 font-mono text-zinc-300">O(V²)</td>
                        <td className="py-2 text-emerald-400">Yes</td>
                        <td className="py-2 text-zinc-300">Static</td>
                      </tr>
                      <tr className="border-b border-zinc-800/50">
                        <td className="py-2 text-orange-400">Bellman-Ford</td>
                        <td className="py-2 font-mono text-zinc-300">O(VE)</td>
                        <td className="py-2 text-emerald-400">Yes</td>
                        <td className="py-2 text-zinc-300">Negative weights</td>
                      </tr>
                      <tr className="border-b border-zinc-800/50">
                        <td className="py-2 text-pink-400">Sim. Annealing</td>
                        <td className="py-2 font-mono text-zinc-300">O(n·T)</td>
                        <td className="py-2 text-amber-400">Near</td>
                        <td className="py-2 text-zinc-300">Large search</td>
                      </tr>
                      <tr className="border-b border-zinc-800/50">
                        <td className="py-2 text-lime-400">Genetic</td>
                        <td className="py-2 font-mono text-zinc-300">O(g·p·n)</td>
                        <td className="py-2 text-amber-400">Near</td>
                        <td className="py-2 text-zinc-300">Multi-objective</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-indigo-400">A* Search</td>
                        <td className="py-2 font-mono text-zinc-300">O(E)</td>
                        <td className="py-2 text-emerald-400">Yes</td>
                        <td className="py-2 text-zinc-300">Known target</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommended Combinations */}
              <div className="lg:col-span-2 bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold mb-4">Recommended Combinations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Campus Network</h4>
                    <p className="text-sm text-zinc-400 mb-2">High mobility, medium density</p>
                    <div className="flex gap-2">
                      <Badge className="bg-amber-500/20 text-amber-400">BATMAN IV</Badge>
                      <Badge className="bg-cyan-500/20 text-cyan-400">Dijkstra</Badge>
                    </div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Enterprise Mesh</h4>
                    <p className="text-sm text-zinc-400 mb-2">Static nodes, need reliability</p>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-500/20 text-blue-400">HWMP</Badge>
                      <Badge className="bg-indigo-500/20 text-indigo-400">A*</Badge>
                    </div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">IoT Sensor Network</h4>
                    <p className="text-sm text-zinc-400 mb-2">Low power, sparse traffic</p>
                    <div className="flex gap-2">
                      <Badge className="bg-purple-500/20 text-purple-400">AODV</Badge>
                      <Badge className="bg-orange-500/20 text-orange-400">Bellman-Ford</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
