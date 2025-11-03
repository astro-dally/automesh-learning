# AutoMesh Learning Guide

A collection of hands-on examples covering the core concepts needed to build self-healing mesh networks. This learning path takes you from basic graph theory to implementing complete self-healing network systems.

## 🎯 What I'll Learn

This guide covers:
- Graph theory fundamentals and mesh network topologies
- Optimization algorithms (simulated annealing) for network design
- Routing and pathfinding algorithms
- Network visualization techniques
- Self-healing mechanisms and fault recovery

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

## 🚀 Getting Started

```bash
# Install dependencies
pip install -r requirements.txt

# Start with lesson 1
python 01-graphs/basic_graph.py
```

## 💡 Learning Tips

- Run each example and experiment with parameters
- Add debug print statements to trace execution flow
- Intentionally break things to understand error handling
- Each file includes extensive comments explaining concepts
- Try the suggested experiments at the end of each file

## ✅ What's Next

After completing these examples, I'll have the foundation to build a complete AutoMesh system that:
- Automatically designs optimal network topologies
- Visualizes networks in real-time
- Recovers from node and link failures
- Exports to simulation tools (Mininet/NS-3)

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
