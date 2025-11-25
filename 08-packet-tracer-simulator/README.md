# 🌐 AutoMesh Packet Tracer Simulator

A fully-featured, web-based network simulation tool inspired by Cisco Packet Tracer, with advanced **auto-healing mesh network** capabilities and real-time **packet tracing visualization**.

## ✨ Key Features

### 🎯 Core Functionalities

1. **Device Management**
   - Drag-and-drop device placement
   - Multiple device types: Router, Switch, PC, Server, Cloud, Firewall
   - Automatic IP and MAC address assignment
   - Device configuration and status monitoring

2. **Network Topology**
   - Visual connection builder
   - Multiple connection types (Ethernet, Fiber Optic, Wireless)
   - Mesh network auto-creation
   - Network optimization with force-directed layout

3. **Packet Simulation & Tracing** 🎯
   - Real-time packet visualization
   - Multiple protocol support (ICMP, TCP, UDP, HTTP)
   - Animated packet flow through the network
   - Shortest path routing using BFS algorithm
   - Packet delivery tracking and logging

4. **Auto-Healing Mesh Network** 🔄
   - Automatic failure detection
   - Real-time rerouting when devices fail
   - Self-healing indicator
   - Network health monitoring
   - Redundant path discovery

5. **Failure Testing**
   - Simulate device failures
   - Test network resilience
   - Recovery testing
   - Connection testing

6. **Export/Import**
   - Save network configurations as JSON
   - Load existing networks
   - Share network topologies

## 🚀 Quick Start

### Option 1: Direct Browser Access
Simply open `index.html` in any modern web browser:

```bash
cd 08-packet-tracer-simulator
open index.html  # macOS
# or
xdg-open index.html  # Linux
# or double-click index.html in Windows
```

### Option 2: Local Server (Recommended)
For better performance and no CORS issues:

```bash
cd 08-packet-tracer-simulator
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

## 📖 User Guide

### 1️⃣ Adding Devices

1. **Drag devices** from the left palette onto the canvas
2. Supported device types:
   - 🔀 **Router** - For routing between networks
   - ⚡ **Switch** - For connecting devices in a LAN
   - 💻 **PC** - End-user devices
   - 🖥️ **Server** - Network servers
   - ☁️ **Cloud** - Internet connection
   - 🛡️ **Firewall** - Security device

3. Each device automatically gets:
   - Unique ID (e.g., `router-1`, `pc-2`)
   - IP address (192.168.x.x)
   - MAC address
   - Device-specific interfaces

### 2️⃣ Creating Connections

**Method 1: Manual Connection**
1. Click **"🔗 Add Connection Mode"** button
2. Click on the **source device**
3. Click on the **destination device**
4. Connection is created automatically

**Method 2: Auto Mesh Network**
1. Add at least 3 devices to the canvas
2. Click **"🕸️ Create Mesh Network"** button
3. System automatically creates redundant connections

### 3️⃣ Sending Packets

1. Select **source device** from dropdown
2. Select **destination device** from dropdown
3. Choose **packet type** (ICMP, TCP, UDP, HTTP)
4. Set **packet size** (64-1500 bytes)
5. Click **"📤 Send Packet"**
6. Watch the packet animate through the network!

**What happens:**
- System finds shortest path using BFS algorithm
- Packet animates along the path
- Each hop is logged in the console
- Packet delivery is confirmed when complete

### 4️⃣ Testing Auto-Healing

This is the **killer feature** of this simulator!

**Steps:**
1. Create a mesh network with at least 4 devices
2. Send a packet from one device to another
3. Enable **"Auto-Heal"** mode (top button)
4. While packet is in transit, **simulate a device failure**:
   - Select device from "Failure Testing" panel
   - Click **"❌ Simulate Failure"**
5. Watch the magic:
   - Failed device becomes transparent
   - Auto-heal indicator appears
   - Packets automatically reroute around failure
   - New paths are discovered in real-time
   - Network continues functioning!

**Example Scenario:**
```
Initial Path: PC-1 → Router-1 → Router-2 → Server-1
[Router-2 fails]
New Path: PC-1 → Router-1 → Router-3 → Server-1
```

### 5️⃣ Network Testing

**Test All Connections:**
- Click **"🧪 Test All Connections"**
- System tests connectivity between every device pair
- Shows hop count for each path
- Identifies disconnected devices

**Optimize Network:**
- Click **"⚡ Optimize Network"**
- Uses force-directed layout algorithm
- Organizes devices for better visualization
- Maintains all connections

### 6️⃣ Exporting & Importing

**Export Network:**
1. Click **"💾 Export"** button
2. Network saved as JSON file
3. Includes all devices, connections, and configurations

**Import Network:**
1. Click **"📂 Import"** button
2. Select a previously exported JSON file
3. Network loads with all settings preserved

## 🎓 Learning Scenarios

### Scenario 1: Basic Network Setup
**Goal:** Create a simple office network

1. Add devices:
   - 1 Router
   - 1 Switch
   - 3 PCs
2. Connect Router ↔ Switch
3. Connect each PC to Switch
4. Test connectivity by sending packets

### Scenario 2: Mesh Network Resilience
**Goal:** Demonstrate self-healing capabilities

1. Add 5 Routers
2. Click "Create Mesh Network"
3. Enable Auto-Heal
4. Send continuous packets
5. Fail random routers and watch rerouting

### Scenario 3: Data Center Architecture
**Goal:** Model a redundant data center

1. Add devices:
   - 2 Core Routers
   - 4 Edge Routers
   - 2 Servers
   - 1 Firewall
2. Create redundant connections
3. Test all paths
4. Simulate failures to verify redundancy

### Scenario 4: Packet Flow Visualization
**Goal:** Understand how packets traverse networks

1. Create a linear topology: PC → Router1 → Router2 → Router3 → Server
2. Send an ICMP packet
3. Watch packet hop through each device
4. Observe latency accumulation

## 🔧 Advanced Features

### Network Statistics Dashboard
The right sidebar shows real-time metrics:
- **Total Devices:** Count of all devices
- **Active Connections:** Number of links
- **Failed Devices:** Devices in failed state
- **Packets Sent:** Total packet counter
- **Network Status:** Health indicator (Healthy/Warning/Critical)

### Console Logging
The bottom console shows:
- 🔵 **Info messages** - General operations
- 🟢 **Success messages** - Completed actions
- 🟡 **Warning messages** - Potential issues
- 🔴 **Error messages** - Failures
- 🟣 **Packet messages** - Packet lifecycle events

### Device Information Panel
Click any device to see:
- Device ID and type
- Current status
- IP and MAC addresses
- Number of connections
- Interface details

## 🧪 Testing & Debugging

### Test Network Resilience
1. Create a mesh network
2. Enable simulation mode
3. Send packets continuously
4. Randomly fail devices
5. Verify packets still deliver via alternate paths

### Test Routing Algorithm
1. Create complex topology
2. Click "Test All Connections"
3. Verify all device pairs have paths
4. Check hop counts are optimal

### Test Auto-Healing Speed
1. Send packet
2. Fail device in packet's path
3. Measure time until reroute (should be ~1 second)
4. Verify packet reaches destination

## 📊 Network Topology Patterns

### Star Topology
```
     Router (center)
    /   |   \
  PC1  PC2  PC3
```
**Use Case:** Simple office network
**Steps:** Place router in center, connect PCs around it

### Ring Topology
```
  Router1 — Router2
    |         |
  Router4 — Router3
```
**Use Case:** Redundant backbone
**Steps:** Create circular connections between routers

### Full Mesh Topology
```
    R1 ———— R2
    |  \  / |
    |   X   |
    |  / \  |
    R3 ———— R4
```
**Use Case:** Maximum redundancy
**Steps:** Use "Create Mesh Network" button

### Hierarchical Topology
```
     Core Router
      /        \
   Edge1      Edge2
   / | \      / | \
  PC PC PC  PC PC PC
```
**Use Case:** Large enterprise network
**Steps:** Build layer by layer from top down

## 🎨 Visual Indicators

### Device Colors
- 🔵 **Blue** - Router
- 🟣 **Purple** - Switch
- 🟢 **Green** - PC
- 🟠 **Orange** - Server
- 🔵 **Cyan** - Cloud
- 🔴 **Red** - Firewall

### Connection States
- **Solid line** - Active connection
- **Dashed red line** - Failed connection
- **Thick blue line** - Currently active route

### Device States
- **Full opacity** - Online and functioning
- **Transparent/Grayscale** - Failed state
- **Yellow border** - Currently selected

### Status Badges
- 🟢 **Healthy** - No failures (0% failure rate)
- 🟡 **Warning** - Some failures (1-30% failure rate)
- 🔴 **Critical** - Many failures (>30% failure rate)

## 🔄 Auto-Healing Algorithm

The simulator implements a sophisticated self-healing algorithm:

```javascript
1. Detect Failure
   - Device status changes to 'failed'
   - Device added to failedDevices set

2. Trigger Auto-Heal (if enabled)
   - Wait 1 second for stability
   - Identify affected packets

3. Reroute Packets
   For each packet in transit:
     - Get current position
     - Find new path using BFS
     - Exclude failed devices
     - Update packet path
     - Continue delivery

4. Update Network State
   - Recalculate network health
   - Update connection statuses
   - Log rerouting events
```

### Routing Algorithm (BFS)
```
function findPath(source, destination):
    queue = [[source]]
    visited = {source}
    
    while queue not empty:
        path = queue.dequeue()
        node = path.last
        
        if node == destination:
            return path
        
        for neighbor in getNeighbors(node):
            if neighbor not failed and not visited:
                visited.add(neighbor)
                queue.enqueue(path + [neighbor])
    
    return null  // No path found
```

## 🎯 Use Cases

### 1. Education & Training
- Teach network topology concepts
- Demonstrate routing protocols
- Visualize packet flow
- Practice network design

### 2. Network Planning
- Prototype network designs
- Test redundancy scenarios
- Calculate optimal device placement
- Verify connectivity requirements

### 3. Failure Analysis
- Simulate disaster scenarios
- Test backup routes
- Measure network resilience
- Identify single points of failure

### 4. Research & Development
- Test routing algorithms
- Study mesh network behavior
- Analyze self-healing mechanisms
- Benchmark network performance

## 🔍 Troubleshooting

### Packets not sending?
- ✓ Check source and destination are selected
- ✓ Verify devices are connected
- ✓ Start simulation mode
- ✓ Check for failed devices in path

### Auto-healing not working?
- ✓ Enable "Auto-Heal" button (should show ON)
- ✓ Ensure mesh network has redundant paths
- ✓ Check that alternate routes exist
- ✓ Verify simulation is running

### Devices not connecting?
- ✓ Click "Add Connection Mode" first
- ✓ Click source device, then target device
- ✓ Connection should appear immediately
- ✓ Check console for error messages

### Network looks messy?
- ✓ Click "Optimize Network" to reorganize
- ✓ Manually drag devices to preferred positions
- ✓ Remove unnecessary connections
- ✓ Use "Clear" and rebuild cleanly

## 🌟 Best Practices

### Network Design
- ✅ Each device should have ≥2 connections (mesh requirement)
- ✅ Use descriptive network names
- ✅ Test connectivity before simulating failures
- ✅ Export regularly to save your work

### Testing
- ✅ Start with small networks (3-5 devices)
- ✅ Test basic connectivity first
- ✅ Enable auto-heal before failure testing
- ✅ Watch console for detailed logs

### Performance
- ✅ Limit to <50 devices for smooth animation
- ✅ Avoid too many simultaneous packets
- ✅ Close other browser tabs if laggy
- ✅ Use Chrome/Firefox for best performance

## 🚀 Future Enhancements

Planned features for future versions:
- [ ] Bandwidth simulation and congestion
- [ ] Latency-based routing
- [ ] VLAN support
- [ ] Routing protocol simulation (OSPF, BGP)
- [ ] Packet capture and inspection
- [ ] Custom device properties
- [ ] 3D network visualization
- [ ] Multi-user collaboration
- [ ] Integration with real Packet Tracer files

## 🤝 Integration with Other Modules

This simulator integrates concepts from:
- **Module 01** (Graphs): Device and connection representation
- **Module 03** (Routing): BFS pathfinding algorithm
- **Module 05** (Self-Healing): Auto-healing mechanisms
- **Module 06** (Customization): Network building interface
- **Module 07** (Export): JSON import/export compatibility

## 📚 Technical Details

### Technologies Used
- **D3.js v7** - Force-directed layout and visualization
- **HTML5 Canvas/SVG** - Graphics rendering
- **Vanilla JavaScript** - No framework dependencies
- **CSS3** - Modern UI with glassmorphism design

### Browser Compatibility
- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Performance
- Smooth animation up to 50 devices
- Real-time packet simulation
- < 50ms packet animation frame rate
- Instant failure detection and rerouting

## 📝 Keyboard Shortcuts

- **Esc** - Deselect device / Exit connection mode
- **Delete** - Delete selected device
- **Ctrl/Cmd + S** - Export network
- **Ctrl/Cmd + O** - Import network
- **Space** - Toggle simulation

## 💡 Tips & Tricks

1. **Quick Mesh Creation:** Add 5+ devices, click "Create Mesh Network" instantly
2. **Packet Testing:** Use ICMP (ping) for simple connectivity tests
3. **Failure Cascades:** Fail multiple devices to test extreme scenarios
4. **Visual Organization:** Use "Optimize Network" after adding many devices
5. **Console Watching:** Keep console visible to understand packet flow
6. **Export Often:** Save your work frequently - browser refresh clears state

## 📖 Example Workflows

### Workflow 1: Build Enterprise Network
```
1. Add 2 core routers (Router-1, Router-2)
2. Connect them for redundancy
3. Add 4 edge routers
4. Connect each edge router to both core routers
5. Add PCs and servers to edge routers
6. Test connectivity: PC-1 to Server-1
7. Enable auto-heal
8. Fail Router-1, verify traffic reroutes through Router-2
```

### Workflow 2: Study Packet Flow
```
1. Create linear topology: PC → R1 → R2 → R3 → Server
2. Send ICMP packet from PC to Server
3. Watch packet hop through each router
4. Note hop count in console
5. Add shortcut: PC → R2 connection
6. Send another packet
7. Observe it takes shorter path
```

### Workflow 3: Test Mesh Resilience
```
1. Add 6 routers
2. Create mesh network
3. Start simulation
4. Send packets between random pairs
5. Fail 2 random routers
6. Verify all packets still deliver
7. Check redundancy in "Test All Connections"
```

---

## 🎉 Getting Started Now!

1. Open `index.html` in your browser
2. Drag 3 routers onto the canvas
3. Click "Create Mesh Network"
4. Enable "Auto-Heal"
5. Send a packet
6. Fail a router mid-transit
7. Watch the magic happen! ✨

**Welcome to the future of network simulation!** 🚀

---

**Questions? Issues?** Check the console log for detailed diagnostic information!

