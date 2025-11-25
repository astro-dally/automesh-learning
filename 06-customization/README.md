# Custom Mesh Network Builder

This directory contains tools for building and visualizing your own custom mesh networks. Whether you're learning about network topologies or designing a real-world mesh network, these tools give you full control over every node and connection.

## 📁 What's in This Directory?

- **`custom_network_builder.py`** - Python script for programmatically building mesh networks
- **`interactive_custom_network.html`** - Interactive web interface for building networks visually
- **`example*.png`** - Example network visualizations

## 🎯 What is a Mesh Network?

Think of a mesh network like a spider web where every point (node) is connected to multiple other points. Unlike a simple chain (where if one link breaks, everything breaks), a mesh network has **redundancy** - multiple paths between any two points.

**Key characteristics:**
- ✅ **Redundant paths** - Multiple ways to get from point A to point B
- ✅ **Self-healing** - If one connection fails, traffic automatically finds another path
- ✅ **Fault tolerant** - Can survive multiple failures without breaking
- ✅ **No single point of failure** - Removing one node doesn't disconnect the network

**Real-world examples:**
- WiFi mesh systems (like Google Nest WiFi)
- Internet backbone networks
- Military communication networks
- IoT sensor networks

## 🛠️ Two Ways to Build Networks

### 1. Python Script (`custom_network_builder.py`)

**Best for:** Programmatic control, automation, integration with other Python code

**What it does:**
- Create networks with custom node names
- Add links between nodes with custom properties (latency, bandwidth)
- Validate that your network is a proper mesh
- Calculate mesh metrics (redundancy, fault tolerance)
- Visualize networks with matplotlib
- Create full mesh or partial mesh networks automatically

**Quick Start:**
```python
from custom_network_builder import CustomNetworkBuilder

# Create a builder
builder = CustomNetworkBuilder()

# Add nodes
builder.add_node("RouterA")
builder.add_node("RouterB")
builder.add_node("RouterC")

# Connect them (creating a mesh)
builder.add_link("RouterA", "RouterB", latency=10.0, bandwidth=1000)
builder.add_link("RouterA", "RouterC", latency=15.0, bandwidth=1000)
builder.add_link("RouterB", "RouterC", latency=12.0, bandwidth=1000)

# Check if it's a valid mesh
if builder.is_mesh_network():
    print("✅ Valid mesh network!")
    
# Visualize it
builder.visualize()
```

**Key Features:**
- `add_node(name)` - Add a node to your network
- `add_link(node1, node2, latency, bandwidth)` - Connect two nodes
- `is_mesh_network()` - Check if network meets mesh requirements
- `get_mesh_metrics()` - Get detailed mesh statistics
- `create_full_mesh()` - Create a fully connected mesh automatically
- `create_partial_mesh()` - Create a mesh with minimum degree requirement
- `visualize()` - Draw your network

### 2. Interactive Web Interface (`interactive_custom_network.html`)

**Best for:** Visual design, learning, quick prototyping, interactive exploration

**What it does:**
- Drag-and-drop interface for building networks
- Real-time visualization with D3.js
- Visual mesh network validation (shows if your network is a valid mesh)
- Test routing between nodes
- Simulate failures and watch self-healing in action
- Export networks to JSON or Cisco Packet Tracer format

**Quick Start:**
1. Open `interactive_custom_network.html` in your web browser
2. Add nodes by typing a name and clicking "Add Node"
3. Connect nodes by selecting two nodes and clicking "Add Link"
4. Watch the mesh validation panel - it tells you if your network is a valid mesh!
5. Test routing by selecting source and target nodes
6. Try the self-healing feature - simulate failures and watch the network reroute

**Key Features:**

#### Network Building
- **Add Nodes** - Give them custom names (e.g., "Router1", "ServerA")
- **Add Links** - Connect nodes with custom latency and bandwidth
- **Visual Feedback** - See your network update in real-time
- **Drag Nodes** - Reposition nodes by dragging them

#### Mesh Validation
- **Real-time Status** - See "✓ Valid Mesh" or "⚠ Not a Mesh" badge
- **Mesh Score** - Get a percentage score (0-100%) of how "mesh-like" your network is
- **Detailed Metrics** - View min degree, avg degree, redundancy
- **Suggestions** - Get tips on how to fix your network if it's not a valid mesh

#### Testing & Analysis
- **Route Testing** - Find shortest path between any two nodes
- **Self-Healing Demo** - Simulate node/link failures and watch automatic rerouting
- **Network Health** - Visual health bar showing network resilience
- **Node/Link Lists** - See all nodes and links with their properties

#### Export/Import Options
- **Export JSON** - Save your network for later use
- **Import JSON** - Load a previously exported network from a JSON file
- **Download .pkt File** - Export to Cisco Packet Tracer format
- **Manual Guide** - Get step-by-step instructions for recreating in Packet Tracer

## 🎓 Learning Path

### Step 1: Start with the Web Interface
1. Open `interactive_custom_network.html` in your browser
2. Add 3-4 nodes with custom names
3. Connect them in a triangle or square pattern
4. Watch the mesh validation - it should show "✓ Valid Mesh"
5. Try removing a link - does it still stay connected?
6. **Bonus:** Export your network as JSON, then import it back to verify it works!

### Step 2: Test Self-Healing
1. Build a network with at least 4 nodes
2. Ensure each node has 2+ connections (check the mesh validation)
3. Use "Test Route" to find a path between two nodes
4. Click "Simulate Failure" to break a link or node
5. Click "Find Shortest Path" again - watch it find an alternative route!
6. Click "Heal Network" to restore everything

### Step 3: Experiment with Python Script
1. Open `custom_network_builder.py`
2. Look at the examples at the bottom
3. Run `example_1_basic_usage()` to see basic network building
4. Try `example_4_mesh_creation_methods()` to see automatic mesh creation
5. Modify the examples to create your own networks

### Step 4: Build Your Own Network
1. Design a network topology (maybe for a school, office, or IoT deployment)
2. Use either tool to build it
3. Validate it's a proper mesh
4. Test routing between different nodes
5. Simulate failures and verify self-healing works

## 📊 Understanding Mesh Network Validation

The tools check if your network is a valid mesh by verifying:

1. **Connectivity** - Are all nodes connected? (Can you reach any node from any other node?)
2. **Minimum Degree** - Does each node have at least 2 connections? (This ensures redundancy)
3. **Redundancy** - Are there multiple paths between node pairs? (This enables self-healing)

**Example of a valid mesh:**
```
    A ──── B
    │\   /│
    │ \ / │
    │  X  │
    │ / \ │
    │/   \│
    C ──── D
```
Each node has 3 connections, multiple paths exist between any two nodes.

**Example of NOT a mesh:**
```
    A ──── B ──── C ──── D
```
This is a chain - if B fails, A is disconnected from C and D. No redundancy!

## 🎨 Visual Features

### Color Coding
- **Green links** - Fast connections (< 10ms latency)
- **Yellow links** - Medium speed (10-50ms latency)
- **Red links** - Slow connections (> 50ms latency)
- **Green path** - Shortest route between selected nodes
- **Red dashed** - Failed nodes/links (in self-healing demo)

### Network Health Indicator
- **Red (0-30%)** - Network disconnected or very fragile
- **Yellow (30-70%)** - Connected but minimal redundancy
- **Green (70-100%)** - Well-connected mesh with good redundancy

## 💡 Tips for Building Good Mesh Networks

1. **Start with a ring** - Connect nodes in a circle first (ensures connectivity)
2. **Add cross-links** - Add extra connections between non-adjacent nodes (adds redundancy)
3. **Check mesh validation** - Keep an eye on the validation panel - aim for "✓ Valid Mesh"
4. **Aim for degree ≥ 2** - Each node should have at least 2 connections
5. **Test failures** - Use the self-healing feature to verify your network can handle failures

## 🔧 Advanced Features

### Python Script Advanced Usage

```python
# Create a full mesh (every node connected to every other node)
builder.create_full_mesh(["A", "B", "C", "D"], latency=10.0, bandwidth=1000)

# Create a partial mesh with minimum degree requirement
builder.create_partial_mesh(["A", "B", "C", "D", "E"], min_degree=3)

# Get detailed mesh metrics
metrics = builder.get_mesh_metrics()
print(f"Redundancy ratio: {metrics['redundancy_ratio']}")
print(f"Fault tolerance: {metrics['node_fault_tolerance']}")
```

### Web Interface Advanced Features

- **Keyboard shortcuts** - Press Enter after typing node name to add it quickly
- **Export JSON** - Save your network as JSON file for backup or sharing
- **Import JSON** - Load previously exported networks by uploading a JSON file
  - Click "Import JSON" button
  - Select your network.json file
  - Network will be loaded and visualized automatically
  - Supports the same format as exported files
- **Packet Tracer Export** - Generate .pkt files for Cisco Packet Tracer
- **Manual Guide Export** - Get step-by-step instructions for manual recreation

## 🐛 Troubleshooting

**Problem:** Mesh validation shows "⚠ Not a Mesh"
- **Solution:** Check that all nodes have at least 2 connections. Add more links!

**Problem:** Network shows as "Disconnected"
- **Solution:** Make sure all nodes are connected through a path. You might have isolated nodes.

**Problem:** Can't find route between nodes
- **Solution:** Ensure nodes are connected (check connectivity status). If simulating failures, try healing the network first.

**Problem:** Web interface not working
- **Solution:** Make sure you're opening the HTML file in a modern browser (Chrome, Firefox, Safari, Edge). Some features require JavaScript.

## 📚 Related Learning

- **Lesson 01** - Graph basics and mesh topologies
- **Lesson 03** - Routing algorithms (Dijkstra's algorithm)
- **Lesson 05** - Self-healing mechanisms
- **Lesson 07** - Exporting to Packet Tracer

## 🎯 What You'll Learn

By using these tools, you'll understand:
- ✅ How mesh networks differ from other topologies
- ✅ Why redundancy is important for fault tolerance
- ✅ How self-healing works in practice
- ✅ How to design networks that can survive failures
- ✅ How routing algorithms find alternative paths
- ✅ How to validate network topologies

## 🚀 Next Steps

After mastering custom network building:
1. **Export to Packet Tracer** - Use the export feature to simulate in Cisco Packet Tracer
2. **Design Real Networks** - Model real-world scenarios (school network, IoT deployment, etc.)
3. **Test Failure Scenarios** - Use self-healing features to test different failure patterns
4. **Optimize Topologies** - Experiment with different mesh configurations to find optimal designs

---

**Happy Network Building! 🎉**

Remember: A good mesh network is like a good friendship - it has multiple connections and can survive when one link breaks!

