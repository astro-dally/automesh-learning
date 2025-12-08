"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Zap, RefreshCw, Wifi, Server, Router, Globe, Shield, Monitor } from "lucide-react"

// Types
interface NetworkNode {
  id: string
  type: "gateway" | "firewall" | "router" | "switch" | "ap" | "device"
  deviceType?: "laptop" | "phone" | "desktop"
  label: string
  x: number
  y: number
  status: "active" | "failed" | "rerouting"
  connectedTo?: string
  meshNeighbors?: string[]
  load: number
}

interface NetworkLink {
  id: string
  source: string
  target: string
  type: "backbone" | "distribution" | "access" | "mesh" | "device"
  status: "active" | "failed" | "rerouting"
  quality: number
}

interface TrafficPacket {
  id: string
  path: string[]
  progress: number
  segment: number
  speed: number
  type: "upload" | "download"
}

interface ProtocolMessage {
  id: string
  from: string
  to: string
  type: string
  label: string
  color: string
  progress: number
}

interface HealingEvent {
  phase: string
  title: string
  description: string
  protocol: string
  algorithm?: string
  timestamp: number
}

interface AlgorithmVisual {
  id: string
  type:
    | "path-explore"
    | "wave"
    | "convergence"
    | "shortest-path"
    | "wave-propagation"
    | "temperature-decay"
    | "population-evolution"
    | "heuristic-guided"
  nodes: string[]
  progress: number
  color: string
  protocolColor?: string // Added to store protocol color
}

interface ReroutePath {
  id: string
  from: string
  to: string
  via: string[]
  progress: number
  color: string
}

// Protocol and Algorithm definitions
const PROTOCOLS = {
  batman: {
    name: "BATMAN IV",
    color: "#f59e0b",
    message: "OGM",
    description: "Originator Messages flood network",
    visualStyle: "flood", // Messages flood outward from origin
  },
  hwmp: {
    name: "HWMP",
    color: "#3b82f6",
    message: "PREQ",
    description: "Path Request seeks destination",
    visualStyle: "directed", // Messages travel to specific targets
  },
  olsr: {
    name: "OLSR",
    color: "#10b981",
    message: "TC",
    description: "Topology Control via MPR nodes",
    visualStyle: "mpr", // Multi-Point Relay broadcast pattern
  },
  aodv: {
    name: "AODV",
    color: "#8b5cf6",
    message: "RREQ",
    description: "Route Request with expanding ring",
    visualStyle: "ring", // Expanding ring search
  },
}

const ALGORITHMS = {
  dijkstra: {
    name: "Dijkstra",
    color: "#06b6d4",
    visual: "shortest-path",
    description: "Explores nodes by shortest distance",
  },
  bellman: {
    name: "Bellman-Ford",
    color: "#f97316",
    visual: "wave-propagation",
    description: "Relaxes edges in waves",
  },
  annealing: {
    name: "Simulated Annealing",
    color: "#ec4899",
    visual: "temperature-decay",
    description: "Cooling search with random jumps",
  },
  genetic: {
    name: "Genetic Algorithm",
    color: "#84cc16",
    visual: "population-evolution",
    description: "Evolves population of solutions",
  },
  astar: {
    name: "A* Search",
    color: "#6366f1",
    visual: "heuristic-guided",
    description: "Heuristic-guided path exploration",
  },
}

const deviceTypes: ("laptop" | "phone" | "desktop")[] = ["laptop", "phone", "desktop"]

// Create network topology - regular function, not a hook
function createNetwork(): { nodes: NetworkNode[]; links: NetworkLink[] } {
  const nodes: NetworkNode[] = []
  const links: NetworkLink[] = []

  // Core infrastructure - adjusted y positions
  nodes.push({ id: "gateway", type: "gateway", label: "Internet Gateway", x: 700, y: 45, status: "active", load: 0.4 })
  nodes.push({ id: "firewall", type: "firewall", label: "Firewall", x: 700, y: 105, status: "active", load: 0.5 })
  nodes.push({ id: "router-1", type: "router", label: "Router 1", x: 540, y: 175, status: "active", load: 0.6 })
  nodes.push({ id: "router-2", type: "router", label: "Router 2", x: 860, y: 175, status: "active", load: 0.5 })
  nodes.push({ id: "switch-a", type: "switch", label: "Switch A", x: 200, y: 260, status: "active", load: 0.5 })
  nodes.push({ id: "switch-b", type: "switch", label: "Switch B", x: 520, y: 260, status: "active", load: 0.5 })
  nodes.push({ id: "switch-c", type: "switch", label: "Switch C", x: 840, y: 260, status: "active", load: 0.5 })
  nodes.push({ id: "switch-d", type: "switch", label: "Switch D", x: 1160, y: 260, status: "active", load: 0.5 })

  // Backbone links
  links.push({ id: "l1", source: "gateway", target: "firewall", type: "backbone", status: "active", quality: 1 })
  links.push({ id: "l2", source: "firewall", target: "router-1", type: "backbone", status: "active", quality: 0.95 })
  links.push({ id: "l3", source: "firewall", target: "router-2", type: "backbone", status: "active", quality: 0.95 })
  links.push({ id: "l4", source: "router-1", target: "router-2", type: "mesh", status: "active", quality: 0.9 })

  // Distribution links
  links.push({ id: "l5", source: "router-1", target: "switch-a", type: "distribution", status: "active", quality: 0.9 })
  links.push({ id: "l6", source: "router-1", target: "switch-b", type: "distribution", status: "active", quality: 0.9 })
  links.push({ id: "l7", source: "router-2", target: "switch-c", type: "distribution", status: "active", quality: 0.9 })
  links.push({ id: "l8", source: "router-2", target: "switch-d", type: "distribution", status: "active", quality: 0.9 })

  // Switch mesh links (critical for failover)
  links.push({ id: "sm1", source: "switch-a", target: "switch-b", type: "mesh", status: "active", quality: 0.85 })
  links.push({ id: "sm2", source: "switch-b", target: "switch-c", type: "mesh", status: "active", quality: 0.85 })
  links.push({ id: "sm3", source: "switch-c", target: "switch-d", type: "mesh", status: "active", quality: 0.85 })
  links.push({ id: "sm4", source: "switch-a", target: "switch-c", type: "mesh", status: "active", quality: 0.8 })
  links.push({ id: "sm5", source: "switch-b", target: "switch-d", type: "mesh", status: "active", quality: 0.8 })

  // Buildings with APs and devices
  const buildings = [
    { name: "A", switch: "switch-a", baseX: 60, baseY: 330, width: 300, height: 200 },
    { name: "B", switch: "switch-b", baseX: 380, baseY: 330, width: 300, height: 200 },
    { name: "C", switch: "switch-c", baseX: 700, baseY: 330, width: 300, height: 200 },
    { name: "D", switch: "switch-d", baseX: 1020, baseY: 330, width: 300, height: 200 },
  ]

  buildings.forEach((building, buildingIdx) => {
    // Create 6 APs per building in 2 rows
    const apPositions = [
      { x: building.baseX + 50, y: building.baseY + 50 },
      { x: building.baseX + 150, y: building.baseY + 50 },
      { x: building.baseX + 250, y: building.baseY + 50 },
      { x: building.baseX + 50, y: building.baseY + 130 },
      { x: building.baseX + 150, y: building.baseY + 130 },
      { x: building.baseX + 250, y: building.baseY + 130 },
    ]

    apPositions.forEach((pos, apIdx) => {
      const apId = `ap-${buildingIdx * 6 + apIdx + 1}`
      nodes.push({
        id: apId,
        type: "ap",
        label: `AP${buildingIdx * 6 + apIdx + 1}`,
        x: pos.x,
        y: pos.y,
        status: "active",
        meshNeighbors: [],
        load: 0.3 + Math.random() * 0.3,
      })

      links.push({
        id: `access-${apId}`,
        source: building.switch,
        target: apId,
        type: "access",
        status: "active",
        quality: 0.9 + Math.random() * 0.1,
      })

      const deviceCount = 4 + Math.floor(Math.random() * 2)
      const deviceTypes: Array<"laptop" | "phone" | "desktop"> = ["laptop", "phone", "desktop"]

      for (let d = 0; d < deviceCount; d++) {
        const deviceId = `device-${buildingIdx}-${apIdx}-${d}`
        const angle = (d / deviceCount) * Math.PI * 2 + Math.random() * 0.5
        const dist = 20 + Math.random() * 15

        // Calculate position and clamp to building boundaries
        let dx = pos.x + Math.cos(angle) * dist
        let dy = pos.y + Math.sin(angle) * dist

        // Strict boundary clamping with padding
        const padding = 15
        dx = Math.max(building.baseX + padding, Math.min(building.baseX + building.width - padding, dx))
        dy = Math.max(building.baseY + padding + 30, Math.min(building.baseY + building.height - padding, dy))

        nodes.push({
          id: deviceId,
          type: "device",
          label: `D${buildingIdx * 30 + apIdx * 5 + d + 1}`,
          x: dx,
          y: dy,
          status: "active",
          connectedTo: apId,
          deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
          load: Math.random() * 0.5,
        })
      }
    })

    // AP mesh links within building
    for (let i = 0; i < apPositions.length; i++) {
      for (let j = i + 1; j < apPositions.length; j++) {
        if (Math.random() > 0.4) {
          const apId1 = `ap-${buildingIdx * 6 + i + 1}`
          const apId2 = `ap-${buildingIdx * 6 + j + 1}`
          links.push({
            id: `mesh-ap-${buildingIdx}-${i}-${j}`,
            source: apId1,
            target: apId2,
            type: "mesh",
            status: "active",
            quality: 0.7 + Math.random() * 0.2,
          })
          const node1 = nodes.find((n) => n.id === apId1)
          const node2 = nodes.find((n) => n.id === apId2)
          if (node1) node1.meshNeighbors = node1.meshNeighbors || []
          if (node2) node2.meshNeighbors = node2.meshNeighbors || []
          if (node1 && node1.meshNeighbors) node1.meshNeighbors.push(apId2)
          if (node2 && node2.meshNeighbors) node2.meshNeighbors.push(apId1)
        }
      }
    }
  })

  // Cross-building AP mesh links for switch failure recovery
  const crossBuildingPairs = [
    ["ap-3", "ap-7"], // Block A to Block B
    ["ap-6", "ap-10"], // Block A to Block B
    ["ap-9", "ap-13"], // Block B to Block C
    ["ap-12", "ap-16"], // Block B to Block C
    ["ap-15", "ap-19"], // Block C to Block D
    ["ap-18", "ap-22"], // Block C to Block D
  ]

  crossBuildingPairs.forEach(([ap1, ap2], idx) => {
    const node1 = nodes.find((n) => n.id === ap1)
    const node2 = nodes.find((n) => n.id === ap2)
    if (node1 && node2) {
      links.push({
        id: `cross-mesh-${idx}`,
        source: ap1,
        target: ap2,
        type: "mesh",
        status: "active",
        quality: 0.65 + Math.random() * 0.15,
      })
      node1.meshNeighbors = node1.meshNeighbors || []
      node2.meshNeighbors = node2.meshNeighbors || []
      node1.meshNeighbors.push(ap2)
      node2.meshNeighbors.push(ap1)
    }
  })

  return { nodes, links }
}

function findNearbyWorkingAP(
  device: NetworkNode,
  nodes: NetworkNode[],
  links: NetworkLink[],
  excludeAP?: string,
): string | null {
  const workingAPs = nodes.filter((n) => n.type === "ap" && n.status !== "failed" && n.id !== excludeAP)

  if (workingAPs.length === 0) return null

  // Find closest working AP by distance
  let closestAP: NetworkNode | null = null
  let minDist = Number.POSITIVE_INFINITY

  for (const ap of workingAPs) {
    // Check if this AP has a working path to gateway
    const apToSwitch = links.find((l) => l.type === "access" && l.target === ap.id && l.status !== "failed")
    if (!apToSwitch) continue

    const switchNode = nodes.find((n) => n.id === apToSwitch.source)
    if (!switchNode || switchNode.status === "failed") continue

    const dist = Math.hypot(device.x - ap.x, device.y - ap.y)
    if (dist < minDist) {
      minDist = dist
      closestAP = ap
    }
  }

  return closestAP?.id || null
}

export default function MeshNetworkSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [links, setLinks] = useState<NetworkLink[]>([])
  const [packets, setPackets] = useState<TrafficPacket[]>([])
  const [protocolMessages, setProtocolMessages] = useState<ProtocolMessage[]>([])
  const [algorithmVisuals, setAlgorithmVisuals] = useState<AlgorithmVisual[]>([])
  const [healingEvents, setHealingEvents] = useState<HealingEvent[]>([])
  const [reroutePaths, setReroutePaths] = useState<ReroutePath[]>([])

  const [selectedProtocol, setSelectedProtocol] = useState<keyof typeof PROTOCOLS>("batman")
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<keyof typeof ALGORITHMS>("dijkstra")
  const [healingPhase, setHealingPhase] = useState<string>("idle")
  const [showDevices, setShowDevices] = useState(true)
  const [showTraffic, setShowTraffic] = useState(true)
  const [showMesh, setShowMesh] = useState(true)
  const [failedNode, setFailedNode] = useState<string | null>(null)

  useEffect(() => {
    const { nodes: n, links: l } = createNetwork()
    setNodes(n)
    setLinks(l)
  }, [])

  const buildFullPath = useCallback(
    (deviceId: string, excludeNode?: string): string[] => {
      const device = nodes.find((n) => n.id === deviceId)
      if (!device || device.type !== "device") return []

      const path: string[] = [deviceId]
      const nodeMap = new Map(nodes.map((n) => [n.id, n]))

      // Step 1: Device -> AP
      let ap = device.connectedTo ? nodeMap.get(device.connectedTo) : null

      if (!ap || ap.status === "failed" || ap.id === excludeNode) {
        // Find any working AP the device can reach (within range)
        const workingAPs = nodes.filter((n) => n.type === "ap" && n.status !== "failed" && n.id !== excludeNode)

        // Find closest working AP with valid path to switch
        let bestAP: NetworkNode | null = null
        let minDist = Number.POSITIVE_INFINITY

        for (const candidateAP of workingAPs) {
          const dist = Math.hypot(device.x - candidateAP.x, device.y - candidateAP.y)
          if (dist > 150) continue // Max range for device to AP

          // Check if this AP connects to a working switch
          const apLink = links.find((l) => l.type === "access" && l.target === candidateAP.id && l.status !== "failed")
          if (!apLink) continue

          const sw = nodeMap.get(apLink.source)
          if (!sw || sw.status === "failed" || sw.id === excludeNode) continue

          if (dist < minDist) {
            minDist = dist
            bestAP = candidateAP
          }
        }

        if (!bestAP) return path // No reachable working AP
        ap = bestAP
      }

      path.push(ap.id)

      // Step 2: AP -> Switch (with AP mesh failover)
      const apToSwitch = links.find((l) => l.type === "access" && l.target === ap!.id && l.status !== "failed")

      let currentSwitchId: string | null = null
      let switchNode: NetworkNode | undefined = undefined

      if (apToSwitch) {
        currentSwitchId = apToSwitch.source
        switchNode = nodeMap.get(currentSwitchId)
      }

      if (!switchNode || switchNode.status === "failed" || switchNode.id === excludeNode) {
        // Primary switch is failed - find alternate path through AP mesh links
        let foundAlternate = false

        // BFS through AP mesh to find an AP connected to a working switch
        const visited = new Set<string>([ap.id])
        const queue: { apId: string; meshPath: string[] }[] = [{ apId: ap.id, meshPath: [] }]

        while (queue.length > 0 && !foundAlternate) {
          const current = queue.shift()!
          const currentApNode = nodeMap.get(current.apId)
          if (!currentApNode) continue

          // Find AP mesh links from current AP
          const apMeshLinks = links.filter(
            (l) =>
              l.type === "mesh" && (l.source === current.apId || l.target === current.apId) && l.status !== "failed",
          )

          for (const meshLink of apMeshLinks) {
            const neighborApId = meshLink.source === current.apId ? meshLink.target : meshLink.source
            const neighborAp = nodeMap.get(neighborApId)

            if (!neighborAp || neighborAp.type !== "ap" || visited.has(neighborApId)) continue
            if (neighborAp.status === "failed" || neighborAp.id === excludeNode) continue

            visited.add(neighborApId)

            const neighborApToSwitch = links.find(
              (l) => l.type === "access" && l.target === neighborApId && l.status !== "failed",
            )

            if (neighborApToSwitch) {
              const neighborSwitchId = neighborApToSwitch.source
              const neighborSwitch = nodeMap.get(neighborSwitchId)

              if (
                neighborSwitch &&
                neighborSwitch.type === "switch" &&
                neighborSwitch.status !== "failed" &&
                neighborSwitch.id !== excludeNode
              ) {
                // Found a working switch through AP mesh!
                current.meshPath.forEach((p) => path.push(p))
                path.push(neighborApId)
                path.push(neighborSwitchId)
                currentSwitchId = neighborSwitchId
                switchNode = neighborSwitch
                foundAlternate = true
                break
              }
            }

            // Add to queue for further exploration
            queue.push({
              apId: neighborApId,
              meshPath: [...current.meshPath, neighborApId],
            })
          }
        }

        // If still no switch found, try switch mesh links
        if (!foundAlternate && currentSwitchId) {
          const switchMeshLinks = links.filter(
            (l) =>
              l.type === "mesh" &&
              (l.source === currentSwitchId || l.target === currentSwitchId) &&
              l.status !== "failed",
          )

          for (const meshLink of switchMeshLinks) {
            const altSwitchId = meshLink.source === currentSwitchId ? meshLink.target : meshLink.source
            const altSwitch = nodeMap.get(altSwitchId)

            if (
              altSwitch &&
              altSwitch.type === "switch" &&
              altSwitch.status !== "failed" &&
              altSwitch.id !== excludeNode
            ) {
              path.push(altSwitchId) // Add the intermediate switch
              currentSwitchId = altSwitchId
              switchNode = altSwitch
              foundAlternate = true
              break
            }
          }
        }

        if (!foundAlternate) {
          return path
        }
      } else {
        path.push(currentSwitchId!)
      }

      // Step 3: Switch -> Router (with mesh failover)
      let routerId: string | null = null
      let routerNode: NetworkNode | undefined = undefined

      // First try direct connection
      const switchToRouter = links.find(
        (l) =>
          l.type === "distribution" &&
          (l.source === currentSwitchId || l.target === currentSwitchId) &&
          l.status !== "failed",
      )

      if (switchToRouter) {
        routerId = switchToRouter.source === currentSwitchId ? switchToRouter.target : switchToRouter.source
        routerNode = nodeMap.get(routerId)
      }

      // If router failed, try alternate via router mesh
      if (!routerNode || routerNode.status === "failed" || routerNode.id === excludeNode) {
        // Try to find path through switch mesh to a switch with working router
        const switchMeshLinks = links.filter(
          (l) =>
            l.type === "mesh" &&
            (l.source === currentSwitchId || l.target === currentSwitchId) &&
            l.status !== "failed",
        )

        for (const meshLink of switchMeshLinks) {
          const altSwitchId = meshLink.source === currentSwitchId ? meshLink.target : meshLink.source
          const altSwitch = nodeMap.get(altSwitchId)

          if (!altSwitch || altSwitch.status === "failed" || altSwitch.id === excludeNode) continue

          const altSwitchToRouter = links.find(
            (l) =>
              l.type === "distribution" &&
              (l.source === altSwitchId || l.target === altSwitchId) &&
              l.status !== "failed",
          )

          if (altSwitchToRouter) {
            const altRouterId =
              altSwitchToRouter.source === altSwitchId ? altSwitchToRouter.target : altSwitchToRouter.source
            const altRouter = nodeMap.get(altRouterId)

            if (altRouter && altRouter.status !== "failed" && altRouter.id !== excludeNode) {
              path.push(altSwitchId) // Add the intermediate switch
              routerId = altRouterId
              routerNode = altRouter
              break
            }
          }
        }

        // Still no router? Try router mesh link
        if ((!routerNode || routerNode.status === "failed") && routerId) {
          const routerMesh = links.find(
            (l) => l.type === "mesh" && (l.source === routerId || l.target === routerId) && l.status !== "failed",
          )
          if (routerMesh) {
            const altRouterId = routerMesh.source === routerId ? routerMesh.target : routerMesh.source
            const altRouter = nodeMap.get(altRouterId)
            if (altRouter && altRouter.status !== "failed" && altRouter.id !== excludeNode) {
              routerId = altRouterId
              routerNode = altRouter
            }
          }
        }

        if (!routerNode || routerNode.status === "failed" || routerNode.id === excludeNode) {
          return path
        }
      }

      path.push(routerId!)

      // Step 4: Router -> Firewall
      const firewall = nodeMap.get("firewall")
      if (!firewall || firewall.status === "failed" || firewall.id === excludeNode) return path
      path.push("firewall")

      // Step 5: Firewall -> Gateway
      const gateway = nodeMap.get("gateway")
      if (!gateway || gateway.status === "failed" || gateway.id === excludeNode) return path
      path.push("gateway")

      return path
    },
    [nodes, links],
  )

  // Generate traffic
  const generateTraffic = useCallback(() => {
    if (!showTraffic || nodes.length === 0) return

    const devices = nodes.filter((n) => n.type === "device" && n.status !== "failed")
    if (devices.length === 0) return

    const newPackets: TrafficPacket[] = []

    // Generate upload packets - increased to 60
    for (let i = 0; i < 60; i++) {
      const device = devices[Math.floor(Math.random() * devices.length)]
      const path = buildFullPath(device.id, failedNode || undefined)

      if (path.length >= 4) {
        newPackets.push({
          id: `pkt-${Date.now()}-${i}`,
          path,
          progress: Math.random() * 0.3,
          segment: Math.floor(Math.random() * (path.length - 1)),
          speed: 0.018 + Math.random() * 0.012,
          type: "upload",
        })
      }
    }

    // Generate download packets - increased to 50
    for (let i = 0; i < 50; i++) {
      const device = devices[Math.floor(Math.random() * devices.length)]
      const path = buildFullPath(device.id, failedNode || undefined)

      if (path.length >= 4) {
        const reversedPath = [...path].reverse()
        newPackets.push({
          id: `pkt-dl-${Date.now()}-${i}`,
          path: reversedPath,
          progress: Math.random() * 0.3,
          segment: Math.floor(Math.random() * (reversedPath.length - 1)),
          speed: 0.015 + Math.random() * 0.01,
          type: "download",
        })
      }
    }

    setPackets((prev) => [...prev.slice(-350), ...newPackets])
  }, [nodes, showTraffic, buildFullPath, failedNode])

  // Animate packets
  useEffect(() => {
    const interval = setInterval(() => {
      setPackets(
        (prev) =>
          prev
            .map((p) => {
              let { progress, segment } = p
              progress += p.speed

              if (progress >= 1) {
                progress = 0
                segment++
              }

              if (segment >= p.path.length - 1) {
                return null
              }

              return { ...p, progress, segment }
            })
            .filter(Boolean) as TrafficPacket[],
      )

      // Animate protocol messages
      setProtocolMessages((prev) =>
        prev.map((m) => ({ ...m, progress: m.progress + 0.03 })).filter((m) => m.progress < 1),
      )

      // Animate algorithm visuals
      setAlgorithmVisuals((prev) =>
        prev.map((v) => ({ ...v, progress: v.progress + 0.02 })).filter((v) => v.progress < 1),
      )

      setReroutePaths((prev) => prev.map((r) => ({ ...r, progress: r.progress + 0.015 })).filter((r) => r.progress < 1))
    }, 16)

    return () => clearInterval(interval)
  }, [])

  // Generate traffic periodically
  useEffect(() => {
    const interval = setInterval(generateTraffic, 80)
    return () => clearInterval(interval)
  }, [generateTraffic])

  const addHealingEvent = useCallback(
    (phase: string, title: string, description: string, protocol: string, algorithm?: string) => {
      setHealingEvents((prev) => [...prev, { phase, title, description, protocol, algorithm, timestamp: Date.now() }])
    },
    [],
  )

  const sendProtocolMessage = useCallback(
    (type: string, from: string, to: string, label: string, color: string) => {
      // Send main message
      setProtocolMessages((prev) => [
        ...prev,
        { id: `msg-${Date.now()}-${Math.random()}`, from, to, type, label, color, progress: 0 },
      ])

      const fromNode = nodes.find((n) => n.id === from)
      if (fromNode) {
        // Determine visual style based on protocol
        const protocolInfo = PROTOCOLS[selectedProtocol]
        let visualType: AlgorithmVisual["type"] = "wave" // Default

        if (protocolInfo.visualStyle === "flood") {
          visualType = "wave"
        } else if (protocolInfo.visualStyle === "directed") {
          visualType = "shortest-path" // Using shortest-path for directed visual
        } else if (protocolInfo.visualStyle === "mpr") {
          visualType = "convergence" // Using convergence for MPR visual
        } else if (protocolInfo.visualStyle === "ring") {
          visualType = "wave-propagation" // Using wave-propagation for ring visual
        }

        setAlgorithmVisuals((prev) => [
          ...prev,
          {
            id: `ripple-${Date.now()}-${Math.random()}`,
            type: visualType,
            nodes: [from],
            progress: 0,
            color: color,
          },
        ])
      }
    },
    [nodes, selectedProtocol],
  )

  const showAlgorithmVisual = useCallback(
    (nodeIds: string[]) => {
      const algo = ALGORITHMS[selectedAlgorithm]
      const proto = PROTOCOLS[selectedProtocol]

      nodeIds.forEach((nodeId, idx) => {
        // Different timing patterns based on algorithm
        let delay = idx * 50
        if (algo.visual === "wave-propagation") {
          delay = idx * 30 // Faster waves for Bellman-Ford
        } else if (algo.visual === "temperature-decay") {
          delay = Math.random() * 200 + idx * 20 // Random jumps for SA
        } else if (algo.visual === "population-evolution") {
          delay = Math.floor(idx / 5) * 100 // Batch processing for GA
        } else if (algo.visual === "heuristic-guided") {
          delay = idx * 40 // Slightly faster than Dijkstra (heuristic helps)
        }

        setTimeout(() => {
          setAlgorithmVisuals((prev) => [
            ...prev,
            {
              id: `vis-${Date.now()}-${idx}`,
              type: algo.visual as
                | "shortest-path"
                | "wave-propagation"
                | "temperature-decay"
                | "population-evolution"
                | "heuristic-guided",
              nodes: [nodeId],
              progress: 0,
              color: algo.color,
              protocolColor: proto.color,
            },
          ])
        }, delay)
      })
    },
    [selectedAlgorithm, selectedProtocol],
  )

  const showReroutePath = useCallback(
    (deviceId: string, newPath: string[]) => {
      if (newPath.length < 2) return
      const algo = ALGORITHMS[selectedAlgorithm]
      setReroutePaths((prev) => [
        ...prev,
        {
          id: `reroute-${Date.now()}-${deviceId}`,
          from: deviceId,
          to: newPath[newPath.length - 1],
          via: newPath,
          progress: 0,
          color: algo.color,
        },
      ])
    },
    [selectedAlgorithm],
  )

  const healNetwork = useCallback(
    (type: "ap" | "switch" | "router") => {
      if (healingPhase !== "idle" && healingPhase !== "healed") return

      setHealingPhase("idle")
      setHealingEvents([])
      setProtocolMessages([])
      setReroutePaths([])

      const candidates = nodes.filter((n) => n.type === type && n.status === "active")
      if (candidates.length === 0) return

      const target = candidates[Math.floor(Math.random() * candidates.length)]
      setFailedNode(target.id)

      // Mark node as failed
      setNodes((prev) => prev.map((n) => (n.id === target.id ? { ...n, status: "failed" } : n)))
      setLinks((prev) =>
        prev.map((l) => (l.source === target.id || l.target === target.id ? { ...l, status: "failed" } : l)),
      )

      const protocolInfo = PROTOCOLS[selectedProtocol]
      const algorithmInfo = ALGORITHMS[selectedAlgorithm]

      // Find affected devices
      let affectedDevices: string[] = []
      if (type === "ap") {
        affectedDevices = nodes.filter((n) => n.type === "device" && n.connectedTo === target.id).map((n) => n.id)
      } else if (type === "switch") {
        const affectedAPs = links.filter((l) => l.type === "access" && l.source === target.id).map((l) => l.target)
        affectedDevices = nodes
          .filter((n) => n.type === "device" && affectedAPs.includes(n.connectedTo || ""))
          .map((n) => n.id)
      } else if (type === "router") {
        const affectedSwitches = links
          .filter((l) => l.type === "distribution" && (l.source === target.id || l.target === target.id))
          .map((l) => (l.source === target.id ? l.target : l.source))
        const affectedAPs = links
          .filter((l) => l.type === "access" && affectedSwitches.includes(l.source))
          .map((l) => l.target)
        affectedDevices = nodes
          .filter((n) => n.type === "device" && affectedAPs.includes(n.connectedTo || ""))
          .map((n) => n.id)
      }

      setNodes((prev) => prev.map((n) => (affectedDevices.includes(n.id) ? { ...n, status: "rerouting" } : n)))

      // Get neighbors for protocol messages
      const neighbors = links
        .filter((l) => l.source === target.id || l.target === target.id)
        .map((l) => (l.source === target.id ? l.target : l.source))
        .filter((id) => nodes.find((n) => n.id === id)?.status !== "failed")

      // Phase 1: Detection
      setHealingPhase("detection")
      addHealingEvent(
        "detection",
        `${target.label} Failure Detected`,
        `${protocolInfo.name} detected HELLO timeout after 3 beacon intervals.`,
        protocolInfo.name,
      )

      // Phase 2: Notification
      setTimeout(() => {
        setHealingPhase("notification")
        addHealingEvent(
          "notification",
          `${protocolInfo.message} Broadcast`,
          `${protocolInfo.name} sending ${protocolInfo.message} messages to ${neighbors.length} neighbors.`,
          protocolInfo.name,
        )

        neighbors.forEach((neighbor, idx) => {
          setTimeout(() => {
            sendProtocolMessage(
              protocolInfo.message.toLowerCase(),
              target.id,
              neighbor,
              protocolInfo.message,
              protocolInfo.color,
            )
          }, idx * 80)
        })
      }, 600)

      // Phase 3: Discovery + Algorithm Visual
      setTimeout(() => {
        setHealingPhase("discovery")
        addHealingEvent(
          "discovery",
          "Route Discovery Started",
          `Flooding ${protocolInfo.message} through mesh. ${algorithmInfo.name} exploring ${nodes.filter((n) => n.type === "ap").length} APs.`,
          protocolInfo.name,
          algorithmInfo.name,
        )

        // Show algorithm exploration visual on all mesh-connected nodes
        const meshNodes = nodes
          .filter((n) => (n.type === "ap" || n.type === "switch") && n.status !== "failed")
          .map((n) => n.id)
        showAlgorithmVisual(meshNodes)
      }, 1400)

      // Phase 4: Computation
      setTimeout(() => {
        setHealingPhase("computation")
        addHealingEvent(
          "computation",
          `${algorithmInfo.name} Computing Paths`,
          `Calculating optimal alternate routes for ${affectedDevices.length} affected devices.`,
          protocolInfo.name,
          algorithmInfo.name,
        )
      }, 2200)

      // Phase 5: Rerouting - Actually reassign devices and show paths
      setTimeout(() => {
        setHealingPhase("rerouting")
        addHealingEvent(
          "rerouting",
          "Traffic Rerouting",
          `Reassigning ${affectedDevices.length} devices to alternate APs/paths.`,
          protocolInfo.name,
          algorithmInfo.name,
        )

        const updatedNodes = [...nodes]
        let successfulReroutes = 0

        affectedDevices.forEach((deviceId, idx) => {
          setTimeout(() => {
            // Build new path (will automatically find alternate routes)
            const newPath = buildFullPath(deviceId, target.id)

            if (newPath.length >= 4) {
              successfulReroutes++
              showReroutePath(deviceId, newPath)

              // If AP failed, update device's connectedTo
              if (type === "ap" && newPath.length > 1) {
                const newApId = newPath[1]
                const deviceIdx = updatedNodes.findIndex((n) => n.id === deviceId)
                if (deviceIdx >= 0) {
                  updatedNodes[deviceIdx] = { ...updatedNodes[deviceIdx], connectedTo: newApId, status: "active" }
                }
              }
            }
          }, idx * 25)
        })

        // Update nodes with reassignments
        setTimeout(
          () => {
            setNodes((prev) =>
              prev.map((n) => {
                const updated = updatedNodes.find((u) => u.id === n.id)
                if (updated && affectedDevices.includes(n.id)) {
                  return { ...updated, status: "active" }
                }
                return affectedDevices.includes(n.id) ? { ...n, status: "active" } : n
              }),
            )
          },
          affectedDevices.length * 25 + 100,
        )
      }, 3000)

      // Phase 6: Healed
      setTimeout(() => {
        setHealingPhase("healed")
        addHealingEvent(
          "healed",
          "Network Healed",
          `Self-healing complete. All ${affectedDevices.length} devices now have alternate paths to gateway.`,
          protocolInfo.name,
          algorithmInfo.name,
        )
      }, 4000)
    },
    [
      nodes,
      links,
      selectedProtocol,
      selectedAlgorithm,
      addHealingEvent,
      sendProtocolMessage,
      showAlgorithmVisual,
      showReroutePath,
      buildFullPath,
      healingPhase,
    ],
  )

  const resetNetwork = useCallback(() => {
    const { nodes: n, links: l } = createNetwork()
    setNodes(n)
    setLinks(l)
    setFailedNode(null)
    setHealingPhase("idle")
    setHealingEvents([])
    setProtocolMessages([])
    setAlgorithmVisuals([])
    setReroutePaths([]) // Clear reroute paths on reset
  }, [])

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const render = () => {
      ctx.fillStyle = "#09090b"
      ctx.fillRect(0, 0, rect.width, rect.height)

      const nodeMap = new Map(nodes.map((n) => [n.id, n]))

      // Draw buildings
      const buildings = [
        { name: "Block A", x: 60, y: 330, w: 300, h: 200 },
        { name: "Block B", x: 380, y: 330, w: 300, h: 200 },
        { name: "Block C", x: 700, y: 330, w: 300, h: 200 },
        { name: "Block D", x: 1020, y: 330, w: 300, h: 200 },
      ]

      buildings.forEach((b) => {
        ctx.fillStyle = "rgba(39, 39, 42, 0.4)"
        ctx.strokeStyle = "rgba(63, 63, 70, 0.6)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(b.x, b.y, b.w, b.h, 8)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = "rgba(161, 161, 170, 0.9)"
        ctx.font = "bold 13px Inter, system-ui, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(b.name, b.x + b.w / 2, b.y + b.h - 12)
        ctx.textAlign = "left"
      })

      // Draw links
      links.forEach((link) => {
        const source = nodeMap.get(link.source)
        const target = nodeMap.get(link.target)
        if (!source || !target) return

        if (link.type === "mesh" && !showMesh) return

        ctx.beginPath()
        ctx.moveTo(source.x, source.y)
        ctx.lineTo(target.x, target.y)

        if (link.status === "failed") {
          ctx.strokeStyle = "rgba(239, 68, 68, 0.5)"
          ctx.setLineDash([4, 4])
        } else if (link.type === "mesh") {
          ctx.strokeStyle = "rgba(161, 161, 170, 0.25)"
          ctx.setLineDash([3, 3])
        } else if (link.type === "backbone") {
          ctx.strokeStyle = "rgba(251, 191, 36, 0.6)"
          ctx.setLineDash([])
        } else if (link.type === "distribution") {
          ctx.strokeStyle = "rgba(168, 85, 247, 0.5)"
          ctx.setLineDash([])
        } else {
          ctx.strokeStyle = "rgba(74, 222, 128, 0.4)"
          ctx.setLineDash([])
        }

        ctx.lineWidth = link.type === "backbone" ? 2.5 : link.type === "distribution" ? 2 : 1
        ctx.stroke()
        ctx.setLineDash([])
      })

      reroutePaths.forEach((reroute) => {
        if (reroute.via.length < 2) return

        const pathProgress = Math.min(reroute.progress * 2, 1) // Complete path in half the animation time
        const glowAlpha = (1 - reroute.progress) * 0.8

        // Draw the reroute path
        ctx.beginPath()
        const startNode = nodeMap.get(reroute.via[0])
        if (!startNode) return
        ctx.moveTo(startNode.x, startNode.y)

        const nodesDrawn = Math.ceil(reroute.via.length * pathProgress)
        for (let i = 1; i < nodesDrawn; i++) {
          const node = nodeMap.get(reroute.via[i])
          if (node) {
            ctx.lineTo(node.x, node.y)
          }
        }

        ctx.strokeStyle =
          reroute.color +
          Math.floor(glowAlpha * 255)
            .toString(16)
            .padStart(2, "0")
        ctx.lineWidth = 3
        ctx.setLineDash([8, 4])
        ctx.stroke()
        ctx.setLineDash([])

        // Draw animated dot traveling along the path
        if (pathProgress > 0) {
          const dotProgress = reroute.progress * 1.5 // Dot moves faster
          const totalSegments = reroute.via.length - 1
          const currentSegment = Math.floor(dotProgress * totalSegments) % totalSegments
          const segmentProgress = (dotProgress * totalSegments) % 1

          const fromNode = nodeMap.get(reroute.via[currentSegment])
          const toNode = nodeMap.get(reroute.via[Math.min(currentSegment + 1, reroute.via.length - 1)])

          if (fromNode && toNode) {
            const dotX = fromNode.x + (toNode.x - fromNode.x) * segmentProgress
            const dotY = fromNode.y + (toNode.y - fromNode.y) * segmentProgress

            // Glowing dot
            ctx.beginPath()
            ctx.arc(dotX, dotY, 8, 0, Math.PI * 2)
            ctx.fillStyle = reroute.color + "40"
            ctx.fill()

            ctx.beginPath()
            ctx.arc(dotX, dotY, 5, 0, Math.PI * 2)
            ctx.fillStyle = reroute.color
            ctx.fill()
          }
        }
      })

      // Draw algorithm visuals with enhanced effects for each algorithm type
      algorithmVisuals.forEach((visual) => {
        visual.nodes.forEach((nodeId) => {
          const node = nodeMap.get(nodeId)
          if (!node) return

          const progress = visual.progress

          if (visual.type === "shortest-path") {
            // Dijkstra: Concentric circles expanding outward showing distance exploration
            const radius = 20 + progress * 40
            const alpha = (1 - progress) * 0.6

            // Multiple distance rings
            for (let i = 0; i < 3; i++) {
              const ringRadius = radius - i * 12
              if (ringRadius > 5) {
                ctx.beginPath()
                ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2)
                ctx.strokeStyle =
                  visual.color +
                  Math.floor(alpha * (1 - i * 0.25) * 255)
                    .toString(16)
                    .padStart(2, "0")
                ctx.lineWidth = 2 - i * 0.5
                ctx.stroke()
              }
            }

            // Center node highlight
            ctx.beginPath()
            ctx.arc(node.x, node.y, 8, 0, Math.PI * 2)
            ctx.fillStyle =
              visual.color +
              Math.floor(alpha * 255)
                .toString(16)
                .padStart(2, "0")
            ctx.fill()
          } else if (visual.type === "wave-propagation") {
            // Bellman-Ford: Wave-like propagation pattern
            const waveCount = 2
            const alpha = (1 - progress) * 0.5

            for (let w = 0; w < waveCount; w++) {
              const waveProgress = (progress + w * 0.3) % 1
              const radius = 15 + waveProgress * 45

              ctx.beginPath()
              ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
              ctx.strokeStyle =
                visual.color +
                Math.floor((1 - waveProgress) * alpha * 255)
                  .toString(16)
                  .padStart(2, "0")
              ctx.lineWidth = 3
              ctx.stroke()
            }

            // Directional arrows showing edge relaxation
            const arrowAngle = progress * Math.PI * 4
            const arrowLen = 20
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(node.x + Math.cos(arrowAngle) * arrowLen, node.y + Math.sin(arrowAngle) * arrowLen)
            ctx.strokeStyle = visual.color + "80"
            ctx.lineWidth = 2
            ctx.stroke()
          } else if (visual.type === "temperature-decay") {
            // Simulated Annealing: Pulsing heat effect that cools down
            const temperature = 1 - progress // High temp = more random, low temp = converging
            const pulseFreq = 8 - progress * 6 // Faster pulses at high temp
            const pulseRadius = 15 + Math.sin(progress * Math.PI * pulseFreq) * (20 * temperature)
            const alpha = (1 - progress) * 0.7

            // Heat glow (larger at high temp)
            const glowRadius = 25 + temperature * 20
            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius)
            gradient.addColorStop(
              0,
              visual.color +
                Math.floor(alpha * 200)
                  .toString(16)
                  .padStart(2, "0"),
            )
            gradient.addColorStop(
              0.5,
              visual.color +
                Math.floor(alpha * 100)
                  .toString(16)
                  .padStart(2, "0"),
            )
            gradient.addColorStop(1, visual.color + "00")

            ctx.beginPath()
            ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2)
            ctx.fillStyle = gradient
            ctx.fill()

            // Inner pulse
            ctx.beginPath()
            ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2)
            ctx.strokeStyle = visual.color
            ctx.lineWidth = 2
            ctx.stroke()

            // Random "jump" particles at high temperature
            if (temperature > 0.3) {
              for (let i = 0; i < 3; i++) {
                const angle = (progress * 10 + i * 2.1) * Math.PI
                const jumpDist = 15 + Math.random() * 15 * temperature
                ctx.beginPath()
                ctx.arc(node.x + Math.cos(angle) * jumpDist, node.y + Math.sin(angle) * jumpDist, 3, 0, Math.PI * 2)
                ctx.fillStyle =
                  visual.color +
                  Math.floor(alpha * 150)
                    .toString(16)
                    .padStart(2, "0")
                ctx.fill()
              }
            }
          } else if (visual.type === "population-evolution") {
            // Genetic Algorithm: Multiple "individuals" converging
            const alpha = (1 - progress) * 0.6
            const generation = Math.floor(progress * 5) // 5 generations
            const populationSize = 6 - generation // Population shrinks as it converges

            // Draw population individuals orbiting
            for (let i = 0; i < populationSize; i++) {
              const angle = (i / populationSize) * Math.PI * 2 + progress * Math.PI
              const orbitRadius = 25 - generation * 4 // Orbits get tighter
              const indX = node.x + Math.cos(angle) * orbitRadius
              const indY = node.y + Math.sin(angle) * orbitRadius

              // Individual
              ctx.beginPath()
              ctx.arc(indX, indY, 4, 0, Math.PI * 2)
              ctx.fillStyle =
                visual.color +
                Math.floor(alpha * 255)
                  .toString(16)
                  .padStart(2, "0")
              ctx.fill()

              // Connection line to center (fitness)
              ctx.beginPath()
              ctx.moveTo(node.x, node.y)
              ctx.lineTo(indX, indY)
              ctx.strokeStyle =
                visual.color +
                Math.floor(alpha * 100)
                  .toString(16)
                  .padStart(2, "0")
              ctx.lineWidth = 1
              ctx.stroke()
            }

            // Best solution highlight at center
            ctx.beginPath()
            ctx.arc(node.x, node.y, 6 + progress * 4, 0, Math.PI * 2)
            ctx.fillStyle =
              visual.color +
              Math.floor(alpha * 200)
                .toString(16)
                .padStart(2, "0")
            ctx.fill()

            // DNA helix effect
            const helixY1 = node.y - 15 + Math.sin(progress * Math.PI * 6) * 8
            const helixY2 = node.y - 15 - Math.sin(progress * Math.PI * 6) * 8
            ctx.beginPath()
            ctx.arc(node.x - 20, helixY1, 2, 0, Math.PI * 2)
            ctx.arc(node.x - 20, helixY2, 2, 0, Math.PI * 2)
            ctx.fillStyle = visual.color + "60"
            ctx.fill()
          } else if (visual.type === "heuristic-guided") {
            // A* Search: Directed exploration with heuristic indicator
            const alpha = (1 - progress) * 0.6
            const radius = 18 + progress * 35

            // Main exploration ring
            ctx.beginPath()
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
            ctx.strokeStyle =
              visual.color +
              Math.floor(alpha * 255)
                .toString(16)
                .padStart(2, "0")
            ctx.lineWidth = 2
            ctx.stroke()

            // Heuristic direction arrow (points toward goal - gateway)
            const gateway = nodes.find((n) => n.type === "gateway")
            if (gateway) {
              const angle = Math.atan2(gateway.y - node.y, gateway.x - node.x)
              const arrowLen = 25 + progress * 10
              const arrowX = node.x + Math.cos(angle) * arrowLen
              const arrowY = node.y + Math.sin(angle) * arrowLen

              // Arrow line
              ctx.beginPath()
              ctx.moveTo(node.x, node.y)
              ctx.lineTo(arrowX, arrowY)
              ctx.strokeStyle =
                visual.color +
                Math.floor(alpha * 200)
                  .toString(16)
                  .padStart(2, "0")
              ctx.lineWidth = 2
              ctx.stroke()

              // Arrow head
              const headLen = 8
              ctx.beginPath()
              ctx.moveTo(arrowX, arrowY)
              ctx.lineTo(arrowX - Math.cos(angle - 0.4) * headLen, arrowY - Math.sin(angle - 0.4) * headLen)
              ctx.lineTo(arrowX - Math.cos(angle + 0.4) * headLen, arrowY - Math.sin(angle + 0.4) * headLen)
              ctx.closePath()
              ctx.fillStyle =
                visual.color +
                Math.floor(alpha * 200)
                  .toString(16)
                  .padStart(2, "0")
              ctx.fill()
            }

            // f(n) = g(n) + h(n) label
            ctx.fillStyle =
              visual.color +
              Math.floor(alpha * 255)
                .toString(16)
                .padStart(2, "0")
            ctx.font = "bold 8px monospace"
            ctx.textAlign = "center"
            ctx.fillText("f=g+h", node.x, node.y - radius - 5)
          }
        })
      })

      // Draw traffic packets
      if (showTraffic) {
        packets.forEach((packet) => {
          if (packet.segment >= packet.path.length - 1) return

          const fromNode = nodeMap.get(packet.path[packet.segment])
          const toNode = nodeMap.get(packet.path[packet.segment + 1])
          if (!fromNode || !toNode) return

          const x = fromNode.x + (toNode.x - fromNode.x) * packet.progress
          const y = fromNode.y + (toNode.y - fromNode.y) * packet.progress

          ctx.beginPath()
          ctx.arc(x, y, 3, 0, Math.PI * 2)
          ctx.fillStyle = packet.type === "upload" ? "#22d3ee" : "#f472b6"
          ctx.fill()
        })
      }

      // Draw protocol messages with protocol-specific visual styles
      protocolMessages.forEach((msg) => {
        const fromNode = nodeMap.get(msg.from)
        const toNode = nodeMap.get(msg.to)
        if (!fromNode || !toNode) return

        const x = fromNode.x + (toNode.x - fromNode.x) * msg.progress
        const y = fromNode.y + (toNode.y - fromNode.y) * msg.progress

        const proto = PROTOCOLS[selectedProtocol]

        if (proto.visualStyle === "flood") {
          // BATMAN: Flooding pattern - multiple small packets spreading
          const spread = 8
          for (let i = 0; i < 3; i++) {
            const offsetAngle = (i / 3) * Math.PI * 2 + msg.progress * Math.PI
            const offsetX = Math.cos(offsetAngle) * spread * (1 - msg.progress)
            const offsetY = Math.sin(offsetAngle) * spread * (1 - msg.progress)

            ctx.beginPath()
            ctx.arc(x + offsetX, y + offsetY, 4, 0, Math.PI * 2)
            ctx.fillStyle = msg.color + "80"
            ctx.fill()
          }

          // Main message
          ctx.beginPath()
          ctx.arc(x, y, 7, 0, Math.PI * 2)
          ctx.fillStyle = msg.color
          ctx.fill()
        } else if (proto.visualStyle === "directed") {
          // HWMP: Directed arrow toward target
          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fillStyle = msg.color
          ctx.fill()

          // Direction trail
          const trailLen = 12
          const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)
          ctx.beginPath()
          ctx.moveTo(x - Math.cos(angle) * trailLen, y - Math.sin(angle) * trailLen)
          ctx.lineTo(x, y)
          ctx.strokeStyle = msg.color + "60"
          ctx.lineWidth = 3
          ctx.stroke()
        } else if (proto.visualStyle === "mpr") {
          // OLSR: MPR relay pattern - larger node with relay indicators
          ctx.beginPath()
          ctx.arc(x, y, 8, 0, Math.PI * 2)
          ctx.fillStyle = msg.color
          ctx.fill()

          // MPR indicator rays
          for (let i = 0; i < 4; i++) {
            const rayAngle = (i / 4) * Math.PI * 2 + msg.progress * Math.PI * 2
            const rayLen = 12
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x + Math.cos(rayAngle) * rayLen, y + Math.sin(rayAngle) * rayLen)
            ctx.strokeStyle = msg.color + "80"
            ctx.lineWidth = 2
            ctx.stroke()
          }
        } else if (proto.visualStyle === "ring") {
          // AODV: Expanding ring search visualization
          const ringProgress = msg.progress
          const ringRadius = 5 + ringProgress * 15

          ctx.beginPath()
          ctx.arc(x, y, ringRadius, 0, Math.PI * 2)
          ctx.strokeStyle =
            msg.color +
            Math.floor((1 - ringProgress * 0.5) * 255)
              .toString(16)
              .padStart(2, "0")
          ctx.lineWidth = 2
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(x, y, 5, 0, Math.PI * 2)
          ctx.fillStyle = msg.color
          ctx.fill()
        } else {
          // Default
          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fillStyle = msg.color
          ctx.fill()
        }

        // Label
        ctx.fillStyle = "#fff"
        ctx.font = "bold 8px Inter, system-ui, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(msg.label, x, y - 12)
      })

      // Draw nodes with icons
      nodes.forEach((node) => {
        if (node.type === "device" && !showDevices) return

        const { x, y, type, status } = node

        // Glow effect for failed/rerouting
        if (status === "failed") {
          ctx.beginPath()
          ctx.arc(x, y, 25, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(239, 68, 68, 0.2)"
          ctx.fill()
        } else if (status === "rerouting") {
          ctx.beginPath()
          ctx.arc(x, y, 20, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(251, 191, 36, 0.2)"
          ctx.fill()
        }

        // Draw node icon based on type
        ctx.save()
        ctx.translate(x, y)

        if (type === "gateway") {
          // Globe icon
          const s = 22
          ctx.beginPath()
          ctx.arc(0, 0, s, 0, Math.PI * 2)
          ctx.fillStyle = status === "failed" ? "#7f1d1d" : "#f59e0b"
          ctx.fill()
          ctx.strokeStyle = "#fff"
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(-s * 0.7, 0)
          ctx.lineTo(s * 0.7, 0)
          ctx.stroke()
          ctx.beginPath()
          ctx.ellipse(0, 0, s * 0.35, s * 0.7, 0, 0, Math.PI * 2)
          ctx.stroke()
        } else if (type === "firewall") {
          // Shield icon
          const s = 18
          ctx.beginPath()
          ctx.moveTo(0, -s)
          ctx.lineTo(s, -s * 0.4)
          ctx.lineTo(s, s * 0.3)
          ctx.quadraticCurveTo(0, s * 1.2, 0, s)
          ctx.quadraticCurveTo(0, s * 1.2, -s, s * 0.3)
          ctx.lineTo(-s, -s * 0.4)
          ctx.closePath()
          ctx.fillStyle = status === "failed" ? "#7f1d1d" : "#ef4444"
          ctx.fill()
          ctx.strokeStyle = "#fff"
          ctx.lineWidth = 1.5
          ctx.stroke()
        } else if (type === "router") {
          // Router box with antennas
          const s = 16
          ctx.fillStyle = status === "failed" ? "#581c87" : "#a855f7"
          ctx.beginPath()
          ctx.roundRect(-s, -s * 0.6, s * 2, s * 1.2, 3)
          ctx.fill()
          // Antennas
          ctx.strokeStyle = "#fff"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(-s * 0.5, -s * 0.6)
          ctx.lineTo(-s * 0.5, -s * 1.1)
          ctx.moveTo(s * 0.5, -s * 0.6)
          ctx.lineTo(s * 0.5, -s * 1.1)
          ctx.stroke()
          // LEDs
          ctx.fillStyle = status === "failed" ? "#7f1d1d" : "#4ade80"
          ctx.beginPath()
          ctx.arc(-s * 0.5, 0, 3, 0, Math.PI * 2)
          ctx.arc(0, 0, 3, 0, Math.PI * 2)
          ctx.arc(s * 0.5, 0, 3, 0, Math.PI * 2)
          ctx.fill()
        } else if (type === "switch") {
          // Switch rectangle with ports
          const s = 18
          ctx.fillStyle = status === "failed" ? "#1e3a5f" : "#3b82f6"
          ctx.beginPath()
          ctx.roundRect(-s, -s * 0.5, s * 2, s, 3)
          ctx.fill()
          // Ports
          ctx.fillStyle = status === "failed" ? "#7f1d1d" : "#22d3ee"
          for (let i = -3; i <= 3; i++) {
            ctx.beginPath()
            ctx.roundRect(i * 4 - 2, -3, 4, 6, 1)
            ctx.fill()
          }
        } else if (type === "ap") {
          // AP antenna with waves
          const s = 10
          ctx.fillStyle = status === "failed" ? "#14532d" : "#22c55e"
          // Base
          ctx.beginPath()
          ctx.roundRect(-s * 0.8, 0, s * 1.6, s * 0.6, 2)
          ctx.fill()
          // Antenna pole
          ctx.beginPath()
          ctx.roundRect(-2, -s * 1.2, 4, s * 1.4, 2)
          ctx.fill()
          // Signal waves
          ctx.strokeStyle = status === "failed" ? "#14532d" : "rgba(74, 222, 128, 0.6)"
          ctx.lineWidth = 1.5
          for (let i = 1; i <= 2; i++) {
            ctx.beginPath()
            ctx.arc(0, -s * 0.8, i * 6, -Math.PI * 0.7, -Math.PI * 0.3)
            ctx.stroke()
          }
        } else if (type === "device") {
          const s = 6
          ctx.fillStyle = status === "rerouting" ? "#fbbf24" : "#22d3ee"
          if (node.deviceType === "laptop") {
            // Laptop
            ctx.beginPath()
            ctx.roundRect(-s, -s * 0.5, s * 2, s, 2)
            ctx.fill()
            ctx.beginPath()
            ctx.roundRect(-s * 1.2, s * 0.5, s * 2.4, s * 0.3, 1)
            ctx.fill()
          } else if (node.deviceType === "phone") {
            // Phone
            ctx.beginPath()
            ctx.roundRect(-s * 0.4, -s, s * 0.8, s * 2, 2)
            ctx.fill()
          } else {
            // Desktop
            ctx.beginPath()
            ctx.roundRect(-s, -s * 0.8, s * 2, s * 1.4, 2)
            ctx.fill()
            ctx.beginPath()
            ctx.roundRect(-s * 0.3, s * 0.6, s * 0.6, s * 0.4, 1)
            ctx.fill()
          }
        }

        // Failed X mark
        if (status === "failed") {
          ctx.strokeStyle = "#fff"
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(-8, -8)
          ctx.lineTo(8, 8)
          ctx.moveTo(8, -8)
          ctx.lineTo(-8, 8)
          ctx.stroke()
        }

        ctx.restore()

        // Labels for infrastructure nodes
        if (type !== "device") {
          ctx.fillStyle = "#a1a1aa"
          ctx.font = "10px Inter, system-ui, sans-serif"
          ctx.textAlign = "center"
          const labelY = type === "ap" ? y + 22 : y + 30
          ctx.fillText(node.label, x, labelY)
        }
      })

      animationRef.current = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationRef.current)
  }, [nodes, links, packets, protocolMessages, algorithmVisuals, reroutePaths, showDevices, showTraffic, showMesh]) // Add reroutePaths to dependency array

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 bg-zinc-900/95 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">AutoMesh Network</h1>
            <p className="text-[10px] text-zinc-500">Self-Healing Simulator</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Fixed Learn button - using Next.js Link properly without nested interactivity issues */}
          <Link
            href="/learn"
            prefetch={true}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Learn
          </Link>

          <div className="flex items-center gap-2 relative z-[100]">
            <span className="text-zinc-500 text-xs">Protocol:</span>
            <Select value={selectedProtocol} onValueChange={(v: keyof typeof PROTOCOLS) => setSelectedProtocol(v)}>
              <SelectTrigger className="w-28 h-7 bg-zinc-800 border-zinc-600 text-xs hover:bg-zinc-700 focus:ring-1 focus:ring-emerald-500/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600 z-[200]" position="popper" sideOffset={4}>
                {Object.entries(PROTOCOLS).map(([key, val]) => (
                  <SelectItem key={key} value={key} className="text-xs hover:bg-zinc-700 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: val.color }} />
                      {val.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 relative z-[100]">
            <span className="text-zinc-500 text-xs">Algorithm:</span>
            <Select value={selectedAlgorithm} onValueChange={(v: keyof typeof ALGORITHMS) => setSelectedAlgorithm(v)}>
              <SelectTrigger className="w-36 h-7 bg-zinc-800 border-zinc-600 text-xs hover:bg-zinc-700 focus:ring-1 focus:ring-emerald-500/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600 z-[200]" position="popper" sideOffset={4}>
                {Object.entries(ALGORITHMS).map(([key, val]) => (
                  <SelectItem key={key} value={key} className="text-xs hover:bg-zinc-700 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: val.color }} />
                      {val.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-4 w-px bg-zinc-700" />

          <div className="text-xs text-zinc-400">
            {nodes.filter((n) => n.type === "device").length} devices · {nodes.filter((n) => n.type === "ap").length}{" "}
            APs
          </div>

          <div
            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
              healingPhase === "healed"
                ? "bg-emerald-500/20 text-emerald-400"
                : healingPhase === "normal"
                  ? "bg-zinc-700 text-zinc-400"
                  : "bg-amber-500/20 text-amber-400"
            }`}
          >
            {healingPhase === "healed" ? "Healed" : healingPhase === "normal" ? "Normal" : "Healing..."}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        <div className="w-14 border-r border-zinc-800 bg-zinc-900/50 flex flex-col items-center py-3 gap-2 shrink-0">
          <span className="text-[10px] text-zinc-500 mb-1">Fail</span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => healNetwork("ap")}
            disabled={healingPhase !== "idle" && healingPhase !== "healed"}
            className="w-10 h-10 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
            title="Fail AP"
          >
            <Wifi className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => healNetwork("switch")}
            disabled={healingPhase !== "idle" && healingPhase !== "healed"}
            className="w-10 h-10 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
            title="Fail Switch"
          >
            <Server className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => healNetwork("router")}
            disabled={healingPhase !== "idle" && healingPhase !== "healed"}
            className="w-10 h-10 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400"
            title="Fail Router"
          >
            <Router className="w-4 h-4" />
          </Button>

          <div className="h-px w-8 bg-zinc-700 my-2" />

          <Button
            size="icon"
            variant="ghost"
            onClick={resetNetwork}
            className="w-10 h-10 hover:bg-zinc-800 text-zinc-400"
            title="Reset"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <div className="h-px w-8 bg-zinc-700 my-2" />

          <span className="text-[10px] text-zinc-500 mb-1">View</span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowDevices(!showDevices)}
            className={cn("w-10 h-10", showDevices ? "bg-cyan-500/20 text-cyan-400" : "text-zinc-500")}
            title="Toggle Devices"
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowTraffic(!showTraffic)}
            className={cn("w-10 h-10", showTraffic ? "bg-pink-500/20 text-pink-400" : "text-zinc-500")}
            title="Toggle Traffic"
          >
            <Zap className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowMesh(!showMesh)}
            className={cn("w-10 h-10", showMesh ? "bg-zinc-500/20 text-zinc-300" : "text-zinc-500")}
            title="Toggle Mesh"
          >
            <Globe className="w-4 h-4" />
          </Button>
        </div>

        {/* Canvas + Legend */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 relative">
          <div className="absolute top-3 right-3 z-10 bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-lg px-3 py-2 flex items-center gap-4">
            {[
              { icon: Globe, color: "#f59e0b", label: "Gateway" },
              { icon: Shield, color: "#ef4444", label: "Firewall" },
              { icon: Router, color: "#a855f7", label: "Router" },
              { icon: Server, color: "#3b82f6", label: "Switch" },
              { icon: Wifi, color: "#22c55e", label: "AP" },
              { icon: Monitor, color: "#22d3ee", label: "Device" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                <span className="text-[10px] text-zinc-400">{item.label}</span>
              </div>
            ))}
          </div>

          <canvas ref={canvasRef} className="flex-1 w-full min-h-0" />

          {/* Logs panel with proper horizontal scroll and visible cards */}
          {/* Logs Panel - Fixed at Bottom */}
          <div className="h-40 border-t border-zinc-800 bg-zinc-900/95 flex flex-col shrink-0">
            <div className="px-4 py-1.5 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white">Healing Timeline</span>
                <span className="text-[10px] text-zinc-500">
                  {PROTOCOLS[selectedProtocol].name} + {ALGORITHMS[selectedAlgorithm].name}
                </span>
              </div>
              {healingEvents.length > 0 && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                >
                  {healingEvents.length} events
                </Badge>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
              <div className="px-4 py-2 flex gap-3 h-full min-w-max items-start">
                {healingEvents.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 whitespace-nowrap">
                    Click a failure button on the left to simulate network healing
                  </p>
                ) : (
                  healingEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "shrink-0 w-56 p-2.5 rounded-lg border text-xs flex flex-col",
                        event.phase === "healed"
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-zinc-800/50 border-zinc-700/50",
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded",
                            event.phase === "detection" && "bg-red-500/20 text-red-400",
                            event.phase === "notification" && "bg-amber-500/20 text-amber-400",
                            event.phase === "discovery" && "bg-blue-500/20 text-blue-400",
                            event.phase === "computation" && "bg-purple-500/20 text-purple-400",
                            event.phase === "rerouting" && "bg-cyan-500/20 text-cyan-400",
                            event.phase === "healed" && "bg-emerald-500/20 text-emerald-400",
                          )}
                        >
                          {event.phase.toUpperCase()}
                        </span>
                        <span className="text-zinc-500 text-[10px]">{event.protocol}</span>
                      </div>
                      <p className="font-medium text-white text-[11px] mb-0.5">{event.title}</p>
                      <p className="text-zinc-400 text-[10px] leading-snug">{event.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
