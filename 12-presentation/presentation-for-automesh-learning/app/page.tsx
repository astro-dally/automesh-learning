"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import {
  ChevronRight,
  ChevronLeft,
  Terminal,
  Shield,
  Plane,
  Skull,
  Network,
  Zap,
  Eye,
  Server,
  Wifi,
  ExternalLink,
  Github,
} from "lucide-react"

// Story-driven slide structure
const slides = [
  { id: 0, type: "boot", chapter: "INIT" },
  { id: 1, type: "intro", chapter: "01" },
  { id: 2, type: "mesh-explained", chapter: "02" },
  { id: 3, type: "self-healing", chapter: "03" },
  { id: 4, type: "simulator", chapter: "04" },
  { id: 5, type: "university", chapter: "05" },
  { id: 6, type: "air-india", chapter: "06" },
  { id: 7, type: "wannacry", chapter: "07" },
  { id: 8, type: "demos", chapter: "08" },
  { id: 9, type: "end", chapter: "END" },
]

function HL({
  children,
  color = "green",
}: { children: React.ReactNode; color?: "green" | "cyan" | "red" | "yellow" | "purple" }) {
  const colorClasses = {
    green: "text-primary bg-primary/10 px-1 rounded",
    cyan: "text-accent bg-accent/10 px-1 rounded",
    red: "text-destructive bg-destructive/10 px-1 rounded",
    yellow: "text-warning bg-warning/10 px-1 rounded",
    purple: "text-chart-5 bg-chart-5/10 px-1 rounded",
  }
  return <span className={colorClasses[color]}>{children}</span>
}

function KeyTerm({ children, color = "green" }: { children: React.ReactNode; color?: "green" | "cyan" | "red" }) {
  const classes = {
    green: "text-primary font-bold glow-green",
    cyan: "text-accent font-bold glow-cyan",
    red: "text-destructive font-bold glow-red",
  }
  return <span className={classes[color]}>{children}</span>
}

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [bootComplete, setBootComplete] = useState(false)

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < slides.length && !isAnimating) {
        setIsAnimating(true)
        setCurrentSlide(index)
        setTimeout(() => setIsAnimating(false), 500)
      }
    },
    [isAnimating],
  )

  const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide])
  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        nextSlide()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        prevSlide()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [nextSlide, prevSlide])

  useEffect(() => {
    if (currentSlide === 0) {
      const timer = setTimeout(() => setBootComplete(true), 2500)
      return () => clearTimeout(timer)
    }
  }, [currentSlide])

  const slide = slides[currentSlide]

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative cyber-grid">
      {/* Scanline effect overlay */}
      <div className="fixed inset-0 pointer-events-none scanline opacity-50" />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      <div className="relative h-screen flex flex-col">
        {/* Terminal-style header */}
        <header className="terminal-header flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/80" />
              <div className="w-3 h-3 rounded-full bg-warning/80" />
              <div className="w-3 h-3 rounded-full bg-primary/80" />
            </div>
            <div className="flex items-center gap-2 font-mono text-sm text-primary">
              <Terminal className="w-4 h-4" />
              <span>automesh@network:~</span>
              <span className="text-muted-foreground">/ chapter_{slide.chapter}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-muted-foreground">OPERATOR:</span>
            <span className="text-primary">Dally R (230143)</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-accent">
              [{currentSlide + 1}/{slides.length}]
            </span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-8">
          <div key={slide.id} className="w-full max-w-5xl animate-fade-in">
            {slide.type === "boot" && <BootSlide complete={bootComplete} />}
            {slide.type === "intro" && <IntroSlide />}
            {slide.type === "mesh-explained" && <MeshExplainedSlide />}
            {slide.type === "self-healing" && <SelfHealingSlide />}
            {slide.type === "simulator" && <SimulatorSlide />}
            {slide.type === "university" && <UniversitySlide />}
            {slide.type === "air-india" && <AirIndiaSlide />}
            {slide.type === "wannacry" && <WannaCrySlide />}
            {slide.type === "demos" && <DemosSlide />}
            {slide.type === "end" && <EndSlide />}
          </div>
        </main>

        {/* Navigation footer */}
        <footer className="flex items-center justify-between px-6 py-4 border-t border-border/50">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 px-4 py-2 font-mono text-sm border border-border rounded hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            PREV
          </button>

          <div className="flex items-center gap-1">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-primary neon-border"
                    : index < currentSlide
                      ? "w-2 bg-primary/50"
                      : "w-2 bg-muted hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center gap-2 px-4 py-2 font-mono text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            NEXT
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      </div>
    </div>
  )
}

// Boot sequence slide
function BootSlide({ complete }: { complete: boolean }) {
  // Compiling routing protocols...
  const bootLines = [
    { text: "[OK] Initializing AutoMesh Learning System...", delay: 0 },
    { text: "[OK] Loading network topology modules...", delay: 400 },
    { text: "[OK] Compiling routing protocols...", delay: 800 },
    { text: "[OK] Establishing secure connection...", delay: 1200 },
    { text: "[OK] System ready. Welcome, Operator.", delay: 1600 },
  ]

  return (
    <div className="terminal-window rounded-lg p-6 font-mono">
      <div className="space-y-2">
        {bootLines.map((line, index) => (
          <div
            key={index}
            className="text-sm animate-fade-in"
            style={{ animationDelay: `${line.delay}ms`, opacity: 0 }}
          >
            <span className="text-primary">{line.text}</span>
          </div>
        ))}
        {complete && (
          <div className="mt-8 animate-fade-in" style={{ animationDelay: "2000ms", opacity: 0 }}>
            <p className="text-3xl font-bold glow-green">AUTOMESH LEARNING</p>
            {/* A journey into self-healing networks... */}
            <p className="text-muted-foreground mt-2">A journey into self-healing networks...</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Chapter 01: Introduction - Rewrote with precise highlighting
function IntroSlide() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground px-2 py-1 border border-border rounded">
          CHAPTER_01
        </span>
        <h2 className="text-sm text-muted-foreground">THE PROBLEM</h2>
      </div>

      <h1 className="text-5xl font-bold leading-tight">
        One failure.
        <br />
        <KeyTerm color="red">Total collapse.</KeyTerm>
      </h1>

      <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
        Traditional networks rely on <HL color="red">single paths</HL>. When that path breaks — a router crashes, a
        cable snaps — <HL color="red">everything stops</HL>. This project builds networks that{" "}
        <HL color="green">heal themselves</HL>.
      </p>

      <div className="terminal-window rounded-lg p-4 font-mono text-sm max-w-lg">
        <p className="text-muted-foreground">$ ./start-mission</p>
        <div className="mt-2 space-y-1">
          <p>
            <HL color="cyan">OPERATOR</HL> Dally R (230143)
          </p>
          <p>
            <HL color="green">OBJECTIVE</HL> Build fault-tolerant mesh networks
          </p>
          <p>
            <HL color="yellow">MODULES</HL> 11 chapters, 5 live simulations
          </p>
        </div>
      </div>
    </div>
  )
}

// Chapter 02: Mesh Explained - Cleaner comparison
function MeshExplainedSlide() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground px-2 py-1 border border-border rounded">
          CHAPTER_02
        </span>
        <h2 className="text-sm text-muted-foreground">TOPOLOGY</h2>
      </div>

      <h1 className="text-4xl font-bold">
        Star vs <KeyTerm>Mesh</KeyTerm>
      </h1>

      <div className="grid grid-cols-2 gap-8">
        <div className="terminal-window rounded-lg p-4 border-destructive/30">
          <p className="font-mono text-sm text-destructive mb-3">✗ STAR (Centralized)</p>
          <pre className="text-xs font-mono text-muted-foreground leading-relaxed mb-4">
            {`       [PC]   [PC]
         \\   /
     [PC]─[HUB]─[PC]
         /   \\
       [PC]   [PC]`}
          </pre>
          <p className="text-xs">
            <HL color="red">Hub dies = Network dies</HL>
          </p>
        </div>

        <div className="terminal-window rounded-lg p-4 border-primary/30">
          <p className="font-mono text-sm text-primary mb-3">✓ MESH (Distributed)</p>
          <pre className="text-xs font-mono text-primary leading-relaxed mb-4">
            {`     [R1]━━━━━[R2]
      ┃╲     ╱┃
      ┃  ╲ ╱  ┃
      ┃   ╳   ┃
      ┃  ╱ ╲  ┃
      ┃╱     ╲┃
     [R3]━━━━━[R4]`}
          </pre>
          <p className="text-xs">
            <HL color="green">Any link fails = Traffic reroutes</HL>
          </p>
        </div>
      </div>

      <div className="terminal-window rounded-lg p-4 font-mono text-sm">
        <p className="text-muted-foreground mb-2">// Why mesh wins</p>
        <p>
          <HL color="green">Multiple paths</HL> between every node pair
        </p>
        <p>
          <HL color="cyan">No single point</HL> of failure
        </p>
        <p>
          <HL color="yellow">Self-organizing</HL> — nodes join/leave dynamically
        </p>
      </div>
    </div>
  )
}

// Chapter 03: Self-Healing - Precise timing breakdown
function SelfHealingSlide() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground px-2 py-1 border border-border rounded">
          CHAPTER_03
        </span>
        <h2 className="text-sm text-muted-foreground">MECHANISM</h2>
      </div>

      <h1 className="text-4xl font-bold">
        Self-Healing in <KeyTerm color="cyan">&lt;500ms</KeyTerm>
      </h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="terminal-window rounded-lg p-5 text-center">
          <Eye className="w-8 h-8 mx-auto text-warning mb-2" />
          <p className="text-2xl font-bold text-warning">~50ms</p>
          <p className="font-mono text-xs text-warning mt-1">DETECT</p>
          <p className="text-xs text-muted-foreground mt-2">
            <HL color="yellow">BFD</HL> sends heartbeats every 50ms. Miss 3? Link dead.
          </p>
        </div>

        <div className="terminal-window rounded-lg p-5 text-center">
          <Network className="w-8 h-8 mx-auto text-accent mb-2" />
          <p className="text-2xl font-bold text-accent">~150ms</p>
          <p className="font-mono text-xs text-accent mt-1">CALCULATE</p>
          <p className="text-xs text-muted-foreground mt-2">
            <HL color="cyan">Dijkstra</HL> computes new shortest paths instantly.
          </p>
        </div>

        <div className="terminal-window rounded-lg p-5 text-center">
          <Zap className="w-8 h-8 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold text-primary">~300ms</p>
          <p className="font-mono text-xs text-primary mt-1">REROUTE</p>
          <p className="text-xs text-muted-foreground mt-2">
            <HL color="green">ECMP</HL> shifts traffic. Users notice nothing.
          </p>
        </div>
      </div>

      <div className="terminal-window rounded-lg p-4 font-mono text-xs">
        <p className="text-muted-foreground">$ traceroute --live 192.168.1.254</p>
        <p className="text-primary mt-1">
          [00:00.000] R1 → R2 → R4 → DEST <HL color="green">✓ 12ms</HL>
        </p>
        <p className="text-destructive">
          [00:00.050] <HL color="red">R2 LINK DOWN</HL>
        </p>
        <p className="text-warning">[00:00.200] Recalculating...</p>
        <p className="text-primary">
          [00:00.350] R1 → R3 → R4 → DEST <HL color="green">✓ 15ms</HL>
        </p>
      </div>
    </div>
  )
}

// Chapter 04: Simulator - Fixed ASCII alignment
function SimulatorSlide() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground px-2 py-1 border border-border rounded">
          CHAPTER_04
        </span>
        <h2 className="text-sm text-muted-foreground">HANDS-ON</h2>
      </div>

      <h1 className="text-4xl font-bold">
        <KeyTerm>Packet Tracer</KeyTerm> Simulator
      </h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Build topologies. Send packets. <HL color="red">Kill links</HL>. Watch the mesh <HL color="green">heal</HL>.
          </p>

          <div className="terminal-window rounded-lg p-4 font-mono text-sm space-y-1">
            <p>
              <HL color="green">+</HL> Drag-and-drop devices
            </p>
            <p>
              <HL color="cyan">+</HL> Live packet animation
            </p>
            <p>
              <HL color="red">+</HL> Failure injection
            </p>
            <p>
              <HL color="yellow">+</HL> ICMP / TCP / UDP modes
            </p>
          </div>

          <a
            href="https://astro-dally.github.io/automesh-learning/08-packet-tracer-simulator/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline font-mono text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Launch Simulator
          </a>
        </div>

        <div className="terminal-window rounded-lg p-4">
          <div className="terminal-header rounded-t px-3 py-2 -m-4 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive/60" />
            <div className="w-2 h-2 rounded-full bg-warning/60" />
            <div className="w-2 h-2 rounded-full bg-primary/60" />
            <span className="text-xs text-muted-foreground ml-2">packet-tracer.sim</span>
          </div>
          <pre className="text-xs font-mono text-primary leading-relaxed">
            {`┌──────────────────────────────┐
│                              │
│  [ROUTER]═══════[ROUTER]     │
│      ║ ╲       ╱ ║           │
│      ║  ╲     ╱  ║           │
│  [SWITCH]  ╳  [SWITCH]       │
│      ║    ╱ ╲    ║           │
│      ║   ╱   ╲   ║           │
│    [PC]       [SERVER]       │
│                              │
│  ▶ Packet: 10.0.0.1 → .254   │
│  ✓ Status: Delivered         │
│  ⚡ Latency: 8ms              │
│                              │
└──────────────────────────────┘`}
          </pre>
        </div>
      </div>
    </div>
  )
}

// Chapter 05: University Network - Simplified
function UniversitySlide() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground px-2 py-1 border border-border rounded">
          CHAPTER_05
        </span>
        <h2 className="text-sm text-muted-foreground">PRODUCTION</h2>
      </div>

      <h1 className="text-4xl font-bold">
        Campus <KeyTerm color="cyan">Mesh Network</KeyTerm>
      </h1>

      <p className="text-muted-foreground">
        <HL color="cyan">108 devices</HL> across a 6-layer hierarchy. Real protocols. Real self-healing.
      </p>

      <div className="grid grid-cols-3 gap-4">
        <div className="terminal-window rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-primary">108</p>
          <p className="text-xs text-muted-foreground">Network Devices</p>
        </div>
        <div className="terminal-window rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-accent">24</p>
          <p className="text-xs text-muted-foreground">Access Points</p>
        </div>
        <div className="terminal-window rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-warning">6</p>
          <p className="text-xs text-muted-foreground">Network Layers</p>
        </div>
      </div>

      <div className="terminal-window rounded-lg p-4 font-mono text-sm">
        <p className="text-muted-foreground mb-2">// Network Stack</p>
        <div className="flex flex-wrap items-center gap-2">
          <HL color="green">Gateway</HL>
          <span className="text-muted-foreground">→</span>
          <HL color="red">Firewall</HL>
          <span className="text-muted-foreground">→</span>
          <HL color="cyan">Routers</HL>
          <span className="text-muted-foreground">→</span>
          <HL color="yellow">Switches</HL>
          <span className="text-muted-foreground">→</span>
          <HL color="purple">APs</HL>
          <span className="text-muted-foreground">→</span>
          <span className="text-muted-foreground">Devices</span>
        </div>
        <div className="mt-3 pt-3 border-t border-border/50">
          <p>
            <HL color="cyan">BATMAN IV</HL> — mesh routing protocol
          </p>
          <p>
            <HL color="yellow">Dijkstra</HL> — shortest path algorithm
          </p>
        </div>
      </div>

      <a
        href="https://v0-automesh-learning.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-accent hover:underline font-mono text-sm"
      >
        <ExternalLink className="w-4 h-4" />
        Launch Campus Network
      </a>
    </div>
  )
}

// Chapter 06: Air India - More impactful with key facts
function AirIndiaSlide() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-destructive px-2 py-1 border border-destructive/50 rounded">
          CHAPTER_06
        </span>
        <h2 className="text-sm text-destructive">CASE STUDY: AVIATION</h2>
      </div>

      <div className="flex items-center gap-4">
        <Plane className="w-10 h-10 text-destructive" />
        <h1 className="text-4xl font-bold">
          Air India <KeyTerm color="red">Flight 171</KeyTerm>
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="terminal-window rounded-lg p-3 text-center border-destructive/30">
          <p className="text-xl font-bold text-destructive">June 12</p>
          <p className="text-xs text-muted-foreground">2025</p>
        </div>
        <div className="terminal-window rounded-lg p-3 text-center border-destructive/30">
          <p className="text-xl font-bold text-destructive">Boeing 787</p>
          <p className="text-xs text-muted-foreground">Dreamliner</p>
        </div>
        <div className="terminal-window rounded-lg p-3 text-center border-destructive/30">
          <p className="text-xl font-bold text-destructive">279</p>
          <p className="text-xs text-muted-foreground">Lives Lost</p>
        </div>
        <div className="terminal-window rounded-lg p-3 text-center border-destructive/30">
          <p className="text-xl font-bold text-destructive">32 sec</p>
          <p className="text-xs text-muted-foreground">After Takeoff</p>
        </div>
      </div>

      <div className="terminal-window rounded-lg p-4 font-mono text-sm">
        <p className="text-destructive mb-2">// What happened</p>
        <p className="text-muted-foreground">
          Ahmedabad → London. <HL color="red">Fuel cutoff switches</HL> moved to "off" 32 seconds after takeoff. Engines
          lost thrust. <HL color="red">Centralized control</HL> — no redundancy. No recovery time.
        </p>
      </div>

      <div className="terminal-window rounded-lg p-4 font-mono text-sm">
        <p className="text-primary mb-2">// What mesh could have done</p>
        <p>
          <HL color="green">Distributed control nodes</HL> — partial thrust maintained
        </p>
        <p>
          <HL color="cyan">Automatic failover</HL> — bypass faulty switch
        </p>
        <p>
          <HL color="yellow">Graceful degradation</HL> — not total collapse
        </p>
      </div>

      <a
        href="https://v0-aircraft-network.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-destructive hover:underline font-mono text-sm"
      >
        <ExternalLink className="w-4 h-4" />
        View Aircraft Analysis
      </a>
    </div>
  )
}

// Chapter 07: WannaCry - Focus on spread mechanism
function WannaCrySlide() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-destructive px-2 py-1 border border-destructive/50 rounded">
          CHAPTER_07
        </span>
        <h2 className="text-sm text-destructive">CASE STUDY: CYBER ATTACK</h2>
      </div>

      <div className="flex items-center gap-4">
        <Skull className="w-10 h-10 text-destructive" />
        <h1 className="text-4xl font-bold">
          <KeyTerm color="red">WannaCry</KeyTerm> Ransomware
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="terminal-window rounded-lg p-3 text-center border-destructive/30">
          <p className="text-xl font-bold text-destructive">May 2017</p>
          <p className="text-xs text-muted-foreground">Attack Date</p>
        </div>
        <div className="terminal-window rounded-lg p-3 text-center border-destructive/30">
          <p className="text-xl font-bold text-destructive">200K+</p>
          <p className="text-xs text-muted-foreground">Systems Hit</p>
        </div>
        <div className="terminal-window rounded-lg p-3 text-center border-destructive/30">
          <p className="text-xl font-bold text-destructive">150</p>
          <p className="text-xs text-muted-foreground">Countries</p>
        </div>
        <div className="terminal-window rounded-lg p-3 text-center border-destructive/30">
          <p className="text-xl font-bold text-destructive">SMBv1</p>
          <p className="text-xs text-muted-foreground">Vulnerability</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="terminal-window rounded-lg p-4 border-destructive/30">
          <p className="font-mono text-sm text-destructive mb-2">// Attack Vector</p>
          <p className="text-sm text-muted-foreground">
            <HL color="red">EternalBlue</HL> — NSA exploit leaked by Shadow Brokers. Targeted{" "}
            <HL color="red">CVE-2017-0144</HL> in Windows SMBv1. Worm spread across LANs with{" "}
            <HL color="red">zero user interaction</HL>.
          </p>
        </div>

        <div className="terminal-window rounded-lg p-4 border-primary/30">
          <p className="font-mono text-sm text-primary mb-2">// Mesh Defense</p>
          <p className="text-sm text-muted-foreground">
            <HL color="green">Segmentation</HL> isolates infected nodes.
            <HL color="cyan">IDS</HL> detects SMB anomalies.
            <HL color="yellow">Firewall</HL> blocks lateral movement. One segment down ≠ total failure.
          </p>
        </div>
      </div>

      <a
        href="https://v0-wannacry.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-destructive hover:underline font-mono text-sm"
      >
        <ExternalLink className="w-4 h-4" />
        Launch WannaCry Simulation
      </a>
    </div>
  )
}

// Chapter 08: Demos - Cleaner layout
function DemosSlide() {
  const demos = [
    {
      name: "Packet Tracer",
      url: "https://astro-dally.github.io/automesh-learning/08-packet-tracer-simulator/",
      desc: "Build & break networks",
      icon: Network,
      color: "text-primary",
    },
    {
      name: "Network Core",
      url: "https://astro-dally.github.io/automesh-learning/09-final-showdown/",
      desc: "OSPF + ECMP + Dijkstra",
      icon: Server,
      color: "text-accent",
    },
    {
      name: "Campus Mesh",
      url: "https://v0-automesh-learning.vercel.app/",
      desc: "108-device simulation",
      icon: Wifi,
      color: "text-warning",
    },
    {
      name: "Flight 171",
      url: "https://v0-aircraft-network.vercel.app/",
      desc: "Aviation case study",
      icon: Plane,
      color: "text-destructive",
    },
    {
      name: "WannaCry",
      url: "https://v0-wannacry.vercel.app/",
      desc: "Ransomware simulation",
      icon: Skull,
      color: "text-destructive",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-primary px-2 py-1 border border-primary/50 rounded">CHAPTER_08</span>
        <h2 className="text-sm text-primary">LIVE DEMOS</h2>
      </div>

      <h1 className="text-4xl font-bold">
        <KeyTerm color="cyan">5 Live Apps</KeyTerm>
      </h1>

      <div className="grid grid-cols-5 gap-3">
        {demos.map((demo, i) => (
          <a
            key={i}
            href={demo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="terminal-window rounded-lg p-4 hover:bg-muted/50 transition-all group text-center"
          >
            <demo.icon className={`w-8 h-8 mx-auto mb-2 ${demo.color} group-hover:scale-110 transition-transform`} />
            <p className="font-bold text-sm mb-1">{demo.name}</p>
            <p className="text-xs text-muted-foreground">{demo.desc}</p>
          </a>
        ))}
      </div>

      <div className="terminal-window rounded-lg p-4 font-mono text-sm">
        <p className="text-muted-foreground">$ git clone https://github.com/astro-dally/automesh-learning</p>
        <p className="text-primary mt-1">
          <HL color="green">11 modules</HL> | <HL color="cyan">5 live apps</HL> |{" "}
          <HL color="yellow">Python + Next.js</HL>
        </p>
      </div>
    </div>
  )
}

// End slide - Cleaner conclusion
function EndSlide() {
  return (
    <div className="space-y-8 text-center">
      <div className="terminal-window rounded-lg p-8 max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* MISSION COMPLETE */}
          <Shield className="w-12 h-12 mx-auto text-primary" />
          <h1 className="text-4xl font-bold glow-green">MISSION COMPLETE</h1>

          {/* From mesh topology fundamentals to real-world disaster analysis — networks that heal themselves aren't science fiction. They're the future. */}
          <p className="text-muted-foreground">
            Networks that <HL color="green">heal themselves</HL> aren't science fiction.
            <br />
            From topology basics to disaster prevention — <HL color="cyan">this is the future</HL>.
          </p>

          <div className="pt-4 border-t border-border font-mono text-sm text-left space-y-1">
            <p>
              <span className="text-muted-foreground">OPERATOR:</span> <HL color="green">Dally R (230143)</HL>
            </p>
            <p>
              <span className="text-muted-foreground">PROJECT:</span> <HL color="cyan">AutoMesh Learning</HL>
            </p>
            <p>
              <span className="text-muted-foreground">STATUS:</span> <HL color="yellow">All systems operational</HL>
            </p>
          </div>

          <a
            href="https://github.com/astro-dally/automesh-learning"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded font-mono text-sm hover:bg-primary/90 transition-all"
          >
            <Github className="w-4 h-4" />
            View Repository
          </a>
        </div>
      </div>
    </div>
  )
}
