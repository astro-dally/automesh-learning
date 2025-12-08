# AutoMesh Learning Guide

A collection of hands-on examples covering the core concepts needed to build self-healing mesh networks. This learning path takes you from basic graph theory to implementing complete self-healing network systems.

## 🎯 What I'll Learn

This guide covers:
- Graph theory fundamentals and mesh network topologies
- Optimization algorithms (simulated annealing) for network design
- Routing and pathfinding algorithms
- Network visualization techniques
- Self-healing mechanisms and fault recovery
- Custom network building with full control
- Enterprise-grade network systems with OSPF/ECMP/Dijkstra

## 📚 Learning Path

I recommend following this order:

### 1. Graph Basics (01-graphs/)
Foundations of representing and manipulating network topologies.
- `basic_graph.py` - Graph operations and properties
- `mesh_topology.py` - Building mesh networks with controlled connectivity

### 2. Optimization Algorithms (02-optimization/)
Finding optimal network configurations.
- `simulated_annealing_intro.py` - Core optimization technique
- Experiment: Modify cost functions and cooling schedules

### 3. Routing & Pathfinding (03-routing/)
How data travels through networks.
- `dijkstra_pathfinding.py` - Shortest path algorithms
- Practice: Finding multiple alternate paths

### 4. Visualization (04-visualization/)
Visually representing network structures.
- `static_network_plot.py` - Multiple layout techniques
- Experiment: Custom node coloring and edge weights

### 5. Self-Healing (05-self-healing/)
Fault detection and automatic recovery.
- `complete_self_healing.py` - Full simulation with failure scenarios
- Practice: Testing different failure patterns

### 6. Custom Network Builder (06-customization/)
Build networks with full control over nodes and links.
- `custom_network_builder.py` - Create custom topologies with your own node names and connections
- `interactive_custom_network.html` - Interactive web interface for building and visualizing custom networks
- Practice: Design networks for specific scenarios, model real-world topologies

### 7. Packet Tracer Export (07-packet-tracer-export/)
Export your networks to Cisco Packet Tracer format for simulation.
- `pkt_converter.py` - Convert networks to .pkt format
- `export_example.py` - Examples and integration guide
- Practice: Export networks and test in Cisco Packet Tracer

### 8. Packet Tracer Simulator (08-packet-tracer-simulator/) ⭐ **NEW**
Full-featured web-based network simulator with auto-healing capabilities.
- `index.html` - Interactive Cisco Packet Tracer-like interface
- Real-time packet tracing and visualization
- Auto-healing mesh network with failure detection
- Drag-and-drop device placement
- Multiple device types (Router, Switch, PC, Server, Cloud, Firewall)
- Live packet animation through the network
- Network export/import functionality
- Practice: Build networks, send packets, simulate failures, watch auto-healing in action!

### 9. Final Showdown: OSPF/ECMP/Dijkstra System (09-final-showdown/)
Enterprise-grade university core network with reactive rerouting and minimal service degradation.
- `index.html` - Interactive network visualization with D3.js
- `automes_simulation.js` - Complete OSPF/Dijkstra/ECMP implementation
- Real-time failure detection (~100ms) and automatic rerouting (~500ms)
- Visual healing paths with traffic particle animation
- Click-to-fail any device (router, switch, AP, or client)
- Performance metrics dashboard (detection time, reroute time, packet loss)
- Mini/full network view toggle
- Step-by-step Dijkstra algorithm visualization
- Scenario information modal
- Practice: Simulate failures, observe self-healing in action, analyze performance metrics!

### 10. Final Outcome: Mesh Network Simulator (10-final-outcome/) ⭐ **NEW**
Production-ready Next.js application with a comprehensive mesh network simulator.
- `mesh-network-simulator/` - Full-featured React/Next.js application
- Interactive mesh network visualization with D3.js
- Real-time protocol message visualization (OSPF, BGP, BFD)
- Traffic packet animation through network paths
- Device management (gateway, firewall, router, switch, AP, devices)
- Network topology builder with drag-and-drop interface
- Self-healing capabilities with automatic rerouting
- Performance metrics and network health monitoring
- Modern UI built with Radix UI and Tailwind CSS
- Practice: Build complex networks, simulate traffic, test resilience!

### 11. Example: Aircraft Network Simulation (11-example/) ⭐ **NEW**
Comparative simulation demonstrating centralized vs. mesh network architectures for aircraft communication.
- `aircraft-network-simulation/` - Next.js application comparing network topologies
- Side-by-side visualization of centralized and mesh networks
- Real-time packet routing and latency visualization
- Failure scenario simulation with automatic recovery
- Performance comparison metrics (latency, packet loss, recovery time)
- Event timeline and detailed logging
- Interactive network diagrams with node tooltips
- Landing screen with scenario introduction
- Summary dashboard with comparative analysis
- Practice: Compare network architectures, analyze failure scenarios, understand trade-offs!

## 🚀 Getting Started

### Python Examples (Lessons 1-9)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start with lesson 1
python 01-graphs/basic_graph.py
```

### Next.js Applications (Lessons 10-11)

For the modern web applications, you'll need Node.js and npm/pnpm:

```bash
# For 10-final-outcome/mesh-network-simulator
cd 10-final-outcome/mesh-network-simulator
npm install  # or pnpm install
npm run dev  # or pnpm dev

# For 11-example/aircraft-network-simulation
cd 11-example/aircraft-network-simulation
npm install  # or pnpm install
npm run dev  # or pnpm dev
```

Both applications will be available at `http://localhost:3000`

## 💡 Learning Tips

- Run each example and experiment with parameters
- Add debug print statements to trace execution flow
- Intentionally break things to understand error handling
- Each file includes extensive comments explaining concepts
- Try the suggested experiments at the end of each file

## ✅ Project Status

This learning project has evolved from basic Python examples to full-featured web applications:

**Completed:**
- ✅ Core Python learning modules (graph theory, optimization, routing, visualization)
- ✅ Self-healing network implementations
- ✅ Packet Tracer export functionality
- ✅ Interactive web simulators (HTML/JavaScript)
- ✅ Production-ready Next.js applications with modern UI
- ✅ Comparative network architecture simulations

**What You Can Build:**
After completing these examples, you'll have the foundation to build a complete AutoMesh system that:
- Automatically designs optimal network topologies
- Visualizes networks in real-time with interactive interfaces
- Recovers from node and link failures with sub-second convergence
- Exports to simulation tools (Cisco Packet Tracer, Mininet/NS-3)
- Implements enterprise-grade protocols (OSPF, ECMP, BFD) for production networks
- Compares different network architectures and their trade-offs

## 📖 Additional Resources

Check out **[REFERENCES.md](REFERENCES.md)** for curated learning materials:
- 📚 Blog posts and tutorials
- 📄 Research papers on self-healing mesh networks
- 🎥 Video explanations and visualizations
- 🛠️ Network simulation tools (Mininet, NS-3, Gephi)
- 📝 Week-by-week reading plan

## 🤝 Contributing

Found a bug or have improvements? Feel free to open an issue or submit a pull request!

## 📝 License

Feel free to use these examples for learning and building your own projects.

---

**Remember**: Build incrementally, test often, and don't be afraid to experiment!
