# 📁 Example Networks

Pre-built network topologies you can import and experiment with.

## 📂 Available Examples

### 1. `simple-mesh-network.json`
**Description:** Basic 4-router mesh network with full redundancy

**Use Case:** 
- Learning mesh network basics
- Testing auto-healing with simple topology
- Understanding redundant paths

**Topology:**
```
R1 ——— R2
|\   /|
| \ / |
| / \ |
|/   \|
R3 ——— R4
```

**Features:**
- 4 routers with 6 connections
- Every router connected to every other router
- High-speed fiber optic links (10Gbps)
- Perfect for testing packet rerouting

**Try This:**
1. Import the network
2. Send packet from R1 to R4
3. Fail R2 mid-transit
4. Watch packet reroute through R3

---

### 2. `enterprise-network.json`
**Description:** Corporate network with core-edge architecture

**Use Case:**
- Understanding hierarchical network design
- Testing multi-layer redundancy
- Simulating real enterprise topology

**Topology:**
```
       Internet
          ↓
      Firewall
        /  \
    Core1  Core2
     / \  / \
    E1 E2 E3 E4
     \ /    \ /
     S1      S2
```

**Components:**
- 2 Core routers (redundant backbone)
- 4 Edge routers (access layer)
- 2 Servers (resources)
- 1 Firewall (security)
- 1 Cloud (internet connection)

**Features:**
- Multiple redundant paths
- Realistic enterprise architecture
- Internet connectivity
- Security layer

**Try This:**
1. Send packet from Server-1 to Internet
2. Trace path through network layers
3. Fail Core-Router-1
4. Verify traffic reroutes through Core-Router-2

---

### 3. `iot-sensor-network.json`
**Description:** Wireless IoT sensor mesh network

**Use Case:**
- IoT deployment planning
- Wireless mesh networks
- Sensor data collection

**Topology:**
```
    Cloud Server
         ↓
      Gateway
      /  |  \
    S1  S3  S4
    |   |   |
    S2  S5  S6
```

**Components:**
- 1 Gateway (central router)
- 6 Sensors (PCs representing IoT devices)
- 1 Cloud server (data storage)

**Features:**
- Wireless connections (300Mbps)
- Mesh connectivity between sensors
- Cloud data upload
- Battery-efficient routing

**Try This:**
1. Send data from Sensor-6 to Cloud-Server
2. Observe multi-hop path through gateway
3. Fail Sensor-3
4. Watch sensors reroute through neighbors

---

## 🚀 How to Use Examples

### Method 1: Import in Simulator
1. Open `index.html` in browser
2. Click **"📂 Import"** button
3. Select example JSON file
4. Network loads instantly!

### Method 2: Quick Preview
```bash
# View network structure
cat simple-mesh-network.json | python -m json.tool

# Count devices
cat simple-mesh-network.json | grep '"id"' | wc -l

# List connections
cat simple-mesh-network.json | grep '"source"'
```

### Method 3: Modify & Customize
1. Open JSON file in text editor
2. Change device positions (x, y coordinates)
3. Add/remove devices or connections
4. Save and import into simulator

---

## 🎓 Learning Exercises

### Exercise 1: Compare Topologies
**Objective:** Understand topology trade-offs

1. Import `simple-mesh-network.json`
2. Click "Test All Connections"
3. Note average hop count
4. Import `enterprise-network.json`
5. Test again
6. Compare: Which has fewer hops? Which is more resilient?

### Exercise 2: Failure Cascade
**Objective:** Test network resilience limits

1. Import `simple-mesh-network.json`
2. Enable auto-heal
3. Fail 1 router - still works?
4. Fail 2 routers - still works?
5. Fail 3 routers - find the breaking point!

### Exercise 3: Optimize IoT Network
**Objective:** Reduce power consumption

1. Import `iot-sensor-network.json`
2. Test all connections
3. Identify longest paths
4. Add connections to shorten paths
5. Export improved version

### Exercise 4: Build Your Own
**Objective:** Create custom topology

1. Start with example network
2. Add your own devices
3. Modify connections
4. Test thoroughly
5. Export and save

---

## 📊 Network Statistics

| Network | Devices | Connections | Avg Degree | Max Hops |
|---------|---------|-------------|------------|----------|
| Simple Mesh | 4 | 6 | 3.0 | 1 |
| Enterprise | 10 | 14 | 2.8 | 4 |
| IoT Sensors | 8 | 11 | 2.75 | 5 |

---

## 🔧 Customization Guide

### Change Device Positions
```json
{
  "x": 500,  // Horizontal position (pixels from left)
  "y": 300   // Vertical position (pixels from top)
}
```

### Change Device Properties
```json
{
  "id": "my-router",        // Device name
  "type": "router",          // Device type
  "ip": "10.0.0.1",         // IP address
  "mac": "aa:bb:cc:dd:ee:ff" // MAC address
}
```

### Add New Connection
```json
{
  "source": "device-1",    // Source device ID
  "target": "device-2",    // Target device ID
  "type": "ethernet",      // Connection type
  "bandwidth": 1000,       // Mbps
  "latency": 5.5          // milliseconds
}
```

### Connection Types Available
- `ethernet` - 1000 Mbps
- `fiber` - 10000 Mbps
- `wireless` - 300 Mbps

---

## 💡 Tips for Creating Examples

### Design Principles
1. **Clarity:** Use descriptive device IDs
2. **Balance:** Don't overload one device
3. **Redundancy:** Ensure multiple paths
4. **Realism:** Model real-world scenarios

### Testing Checklist
- [ ] All devices have valid IPs
- [ ] All connections reference existing devices
- [ ] Network is connected (no isolated devices)
- [ ] Topology makes logical sense
- [ ] Auto-healing works as expected

### Common Pitfalls to Avoid
❌ Device IDs don't match in connections
❌ Overlapping device positions
❌ Missing required fields
❌ Invalid IP addresses
❌ Zero or negative coordinates

---

## 🎨 Creating Your Own Examples

### Template Structure
```json
{
  "name": "My Custom Network",
  "devices": [
    {
      "id": "device-1",
      "type": "router|switch|pc|server|cloud|firewall",
      "x": 0,
      "y": 0,
      "ip": "192.168.1.1",
      "mac": "00:11:22:33:44:55",
      "status": "online"
    }
  ],
  "connections": [
    {
      "source": "device-1",
      "target": "device-2",
      "type": "ethernet|fiber|wireless",
      "bandwidth": 1000,
      "latency": 5.0
    }
  ]
}
```

### Example Creation Workflow
1. **Plan:** Sketch topology on paper
2. **Build:** Create in simulator first
3. **Export:** Use "💾 Export" button
4. **Polish:** Edit JSON for clarity
5. **Test:** Re-import and verify
6. **Document:** Add to this README

---

## 🤝 Contributing Examples

Have a great network example? Here's how to share:

1. Create your network in the simulator
2. Test thoroughly (all features working)
3. Export as JSON
4. Add descriptive filename
5. Document in this README
6. Submit (if contributing to project)

**Good Example Names:**
- `campus-network.json`
- `data-center-mesh.json`
- `home-lab-setup.json`
- `redundant-wan.json`

---

## 📚 Additional Resources

- **Main README:** `../README.md` - Full simulator documentation
- **Quick Start:** `../docs/QUICKSTART.md` - Getting started guide
- **Module 06:** `../../06-customization/` - Network builder basics
- **Module 05:** `../../05-self-healing/` - Self-healing concepts

---

**Ready to experiment? Import an example and start learning!** 🚀

