# 🔷 AutoMesh Learning

```
[OK] Initializing AutoMesh Learning System...
[OK] Loading network topology modules...
[OK] Compiling routing protocols...
[OK] Establishing secure connection...
[OK] System ready. Welcome, Operator.
```

> **A journey into self-healing networks**

---

## ⚠️ The Problem

**One failure. Total collapse.**

Traditional networks rely on single paths. When that path breaks — a router crashes, a cable snaps — **everything stops**. This project builds networks that **heal themselves**.

---

## 🎯 The Mission

**OPERATOR:** Dally R (230143)  
**OBJECTIVE:** Build fault-tolerant mesh networks  
**MODULES:** 11 chapters, 5 live simulations  
**STATUS:** All systems operational

---

## 🌐 Star vs Mesh: Why Mesh Wins

### ✗ STAR (Centralized)
```
       [PC]   [PC]
         \   /
     [PC]─[HUB]─[PC]
         /   \
       [PC]   [PC]
```
**Hub dies = Network dies**

### ✓ MESH (Distributed)
```
     [R1]━━━━━[R2]
      ┃╲     ╱┃
      ┃  ╲ ╱  ┃
      ┃   ╳   ┃
      ┃  ╱ ╲  ┃
      ┃╱     ╲┃
     [R3]━━━━━[R4]
```
**Any link fails = Traffic reroutes**

**Why mesh wins:**
- ✅ **Multiple paths** between every node pair
- ✅ **No single point** of failure
- ✅ **Self-organizing** — nodes join/leave dynamically

---

## ⚡ Self-Healing in <500ms

| Phase | Time | Mechanism |
|-------|------|-----------|
| 🔍 **DETECT** | ~50ms | BFD sends heartbeats every 50ms. Miss 3? Link dead. |
| 🧮 **CALCULATE** | ~150ms | Dijkstra computes new shortest paths instantly. |
| 🔄 **REROUTE** | ~300ms | ECMP shifts traffic. Users notice nothing. |

**Total recovery time: <500ms** — faster than a human blink.

```
$ traceroute --live 192.168.1.254
[00:00.000] R1 → R2 → R4 → DEST ✓ 12ms
[00:00.050] R2 LINK DOWN
[00:00.200] Recalculating...
[00:00.350] R1 → R3 → R4 → DEST ✓ 15ms
```

---

## 🚀 Live Demos

Experience self-healing networks in action:

| Demo | Description | Link |
|------|-------------|------|
| 🎮 **Packet Tracer** | Build & break networks | [Launch](https://astro-dally.github.io/automesh-learning/08-packet-tracer-simulator/) |
| 🏛️ **Network Core** | OSPF + ECMP + Dijkstra | [Launch](https://astro-dally.github.io/automesh-learning/09-final-showdown/) |
| 🏫 **Campus Mesh** | 108-device simulation | [Launch](https://v0-automesh-learning.vercel.app/) |
| ✈️ **Flight 171** | Aviation case study | [Launch](https://v0-aircraft-network.vercel.app/) |
| 💀 **WannaCry** | Ransomware simulation | [Launch](https://v0-wannacry.vercel.app/) |

**🎬 [View Full Presentation](http://localhost:3000)** — Interactive cyber network journey

---

## 📚 Learning Path

### Foundation Modules (Python)

#### 1. Graph Basics (`01-graphs/`)
Foundations of representing and manipulating network topologies.
- `basic_graph.py` - Graph operations and properties
- `mesh_topology.py` - Building mesh networks with controlled connectivity

#### 2. Optimization Algorithms (`02-optimization/`)
Finding optimal network configurations.
- `simulated_annealing_intro.py` - Core optimization technique
- **Experiment:** Modify cost functions and cooling schedules

#### 3. Routing & Pathfinding (`03-routing/`)
How data travels through networks.
- `dijkstra_pathfinding.py` - Shortest path algorithms
- **Practice:** Finding multiple alternate paths

#### 4. Visualization (`04-visualization/`)
Visually representing network structures.
- `static_network_plot.py` - Multiple layout techniques
- **Experiment:** Custom node coloring and edge weights

#### 5. Self-Healing (`05-self-healing/`)
Fault detection and automatic recovery.
- `complete_self_healing.py` - Full simulation with failure scenarios
- **Practice:** Testing different failure patterns

#### 6. Custom Network Builder (`06-customization/`)
Build networks with full control over nodes and links.
- `custom_network_builder.py` - Create custom topologies
- `interactive_custom_network.html` - Interactive web interface
- **Practice:** Design networks for specific scenarios

#### 7. Packet Tracer Export (`07-packet-tracer-export/`)
Export your networks to Cisco Packet Tracer format.
- `pkt_converter.py` - Convert networks to .pkt format
- `export_example.py` - Examples and integration guide

---

### Production Applications (Next.js)

#### 8. Packet Tracer Simulator (`08-packet-tracer-simulator/`) ⭐
Full-featured web-based network simulator with auto-healing capabilities.
- Interactive Cisco Packet Tracer-like interface
- Real-time packet tracing and visualization
- Drag-and-drop device placement
- Multiple device types (Router, Switch, PC, Server, Cloud, Firewall)
- **Live Demo:** [Launch Simulator](https://astro-dally.github.io/automesh-learning/08-packet-tracer-simulator/)

#### 9. Final Showdown: OSPF/ECMP/Dijkstra (`09-final-showdown/`)
Enterprise-grade university core network with reactive rerouting.
- Real-time failure detection (~100ms) and automatic rerouting (~500ms)
- Visual healing paths with traffic particle animation
- Click-to-fail any device
- Performance metrics dashboard
- **Live Demo:** [Launch Network Core](https://astro-dally.github.io/automesh-learning/09-final-showdown/)

#### 10. Final Outcome: Mesh Network Simulator (`10-final-outcome/`) ⭐
Production-ready Next.js application with comprehensive mesh network simulator.
- Interactive mesh network visualization with D3.js
- Real-time protocol message visualization (OSPF, BGP, BFD)
- Traffic packet animation through network paths
- Device management (gateway, firewall, router, switch, AP, devices)
- Network topology builder with drag-and-drop interface
- **Live Demo:** [Launch Campus Mesh](https://v0-automesh-learning.vercel.app/)

#### 11. Aircraft Network Simulation (`11-example/`) ⭐
Comparative simulation: centralized vs. mesh network architectures.
- Side-by-side visualization of network topologies
- Real-time packet routing and latency visualization
- Failure scenario simulation with automatic recovery
- Performance comparison metrics
- **Live Demo:** [Launch Aircraft Analysis](https://v0-aircraft-network.vercel.app/)

#### 12. WannaCry Simulation (`13-wannacry_simulation/`) ⭐
Ransomware attack simulation demonstrating mesh network defense.
- Attack timeline visualization
- Network spread simulation
- Defense mechanisms (segmentation, IDS, firewall)
- **Live Demo:** [Launch WannaCry Simulation](https://v0-wannacry.vercel.app/)

---

## 🎬 Interactive Presentation

Experience the full cyber network journey:

```bash
cd 12-presentation/presentation-for-automesh-learning
npm install  # or pnpm install
npm run dev  # or pnpm dev
```

Navigate to `http://localhost:3000` for an immersive presentation covering:
- The problem: Single points of failure
- Mesh topology explained
- Self-healing mechanisms (<500ms)
- Live simulators and demos
- Real-world case studies (Air India Flight 171, WannaCry)
- Production applications

**Keyboard Controls:** Arrow keys or Space to navigate

---

## 🚀 Quick Start

### Python Examples (Modules 1-7)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start with module 1
python 01-graphs/basic_graph.py
```

### Next.js Applications (Modules 8-12)

```bash
# For any Next.js application
cd <module-directory>/<app-name>
npm install  # or pnpm install
npm run dev  # or pnpm dev
```

All applications will be available at `http://localhost:3000`

---

## 💡 Learning Tips

- **Run each example** and experiment with parameters
- **Add debug print statements** to trace execution flow
- **Intentionally break things** to understand error handling
- Each file includes extensive comments explaining concepts
- Try the suggested experiments at the end of each file
- **Watch the presentation** for context and real-world applications

---

## 🌍 Real-World Impact

### Case Study: Air India Flight 171
**June 12, 2025** — Boeing 787 Dreamliner  
**279 lives lost** — 32 seconds after takeoff

**What happened:** Fuel cutoff switches moved to "off". Centralized control — no redundancy. No recovery time.

**What mesh could have done:**
- ✅ Distributed control nodes — partial thrust maintained
- ✅ Automatic failover — bypass faulty switch
- ✅ Graceful degradation — not total collapse

### Case Study: WannaCry Ransomware
**May 2017** — 200K+ systems hit across 150 countries

**Attack vector:** EternalBlue exploit targeting Windows SMBv1. Worm spread across LANs with zero user interaction.

**Mesh defense:**
- ✅ Segmentation isolates infected nodes
- ✅ IDS detects SMB anomalies
- ✅ Firewall blocks lateral movement
- ✅ One segment down ≠ total failure

---

## ✅ Project Status

**Completed:**
- ✅ Core Python learning modules (graph theory, optimization, routing, visualization)
- ✅ Self-healing network implementations
- ✅ Packet Tracer export functionality
- ✅ Interactive web simulators (HTML/JavaScript)
- ✅ Production-ready Next.js applications with modern UI
- ✅ Comparative network architecture simulations
- ✅ Real-world case study analyses
- ✅ Interactive presentation system

**What You Can Build:**
After completing these examples, you'll have the foundation to build a complete AutoMesh system that:
- Automatically designs optimal network topologies
- Visualizes networks in real-time with interactive interfaces
- Recovers from node and link failures with **sub-second convergence**
- Exports to simulation tools (Cisco Packet Tracer, Mininet/NS-3)
- Implements enterprise-grade protocols (OSPF, ECMP, BFD) for production networks
- Compares different network architectures and their trade-offs
- Analyzes real-world failure scenarios and prevention strategies

---

## 📖 Additional Resources

Check out **[REFERENCES.md](REFERENCES.md)** for curated learning materials:
- 📚 Blog posts and tutorials
- 📄 Research papers on self-healing mesh networks
- 🎥 Video explanations and visualizations
- 🛠️ Network simulation tools (Mininet, NS-3, Gephi)
- 📝 Week-by-week reading plan

---

## 🤝 Contributing

Found a bug or have improvements? Feel free to open an issue or submit a pull request!

---

## 📝 License

Feel free to use these examples for learning and building your own projects.

---

## 🎯 Remember

**Build incrementally. Test often. Don't be afraid to experiment.**

Networks that **heal themselves** aren't science fiction.  
From topology basics to disaster prevention — **this is the future**.

---

```
OPERATOR: Dally R (230143)
PROJECT: AutoMesh Learning
STATUS: All systems operational
```

**MISSION COMPLETE** ✓
