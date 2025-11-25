# 🚀 Quick Start Guide - AutoMesh Packet Tracer Simulator

Get started in 5 minutes!

## ⚡ Instant Start (3 Steps)

### Step 1: Open the Simulator
```bash
cd 08-packet-tracer-simulator
open index.html
```

### Step 2: Add Your First Device
1. Look at the **left palette** (vertical bar with device icons)
2. **Drag** the Router icon (🔀) onto the canvas
3. Your first device is now on the network!

### Step 3: Send Your First Packet
1. Add another device (drag a PC 💻)
2. Connect them:
   - Click **"🔗 Add Connection Mode"**
   - Click the Router
   - Click the PC
3. Send a packet:
   - Select Router as source
   - Select PC as destination
   - Click **"📤 Send Packet"**
4. Click **"▶️ Start Simulation"**
5. **Watch the packet travel!** 🎉

---

## 🎓 5-Minute Tutorial: Auto-Healing Demo

### Part 1: Build a Mesh Network (2 minutes)

**Step 1:** Add 4 routers
- Drag Router icon 4 times onto canvas
- Space them out nicely

**Step 2:** Create mesh connections
- Click **"🕸️ Create Mesh Network"** button
- System auto-connects everything with redundancy

**Step 3:** Verify connectivity
- Click **"🧪 Test All Connections"**
- Check console - all devices should be reachable

### Part 2: Test Auto-Healing (3 minutes)

**Step 4:** Enable auto-healing
- Click **"🔄 Auto-Heal: OFF"** button (turns to ON)
- Green indicator ready

**Step 5:** Send a packet
- Source: Router-1
- Destination: Router-4
- Click **"📤 Send Packet"**
- Click **"▶️ Start Simulation"**

**Step 6:** Cause a failure mid-transit!
- While packet is moving, select Router-2 from failure dropdown
- Click **"❌ Simulate Failure"**
- Watch the magic:
  - Router-2 becomes transparent
  - "Auto-Healing Network..." indicator appears
  - Packet **reroutes automatically**
  - Packet still reaches Router-4! ✨

**Congratulations!** You just witnessed self-healing in action!

---

## 🎯 Common Tasks

### Task: Create a Star Network
```
Goal: One central router with 4 PCs around it

1. Add 1 Router (place in center)
2. Add 4 PCs (place around router)
3. Enable "Add Connection Mode"
4. Connect Router to each PC (5 clicks total)
5. Done! Test connectivity
```

### Task: Send Different Packet Types
```
1. Connect two devices
2. Select source and destination
3. Change "Packet Type" dropdown:
   - ICMP (Ping) - test connectivity
   - TCP - reliable connection
   - UDP - fast streaming
   - HTTP - web traffic
4. Start simulation and watch!
```

### Task: Test Network Under Stress
```
1. Build mesh with 5+ devices
2. Enable Auto-Heal
3. Start simulation
4. Send multiple packets (different source/dest pairs)
5. Fail random devices while packets are in transit
6. Watch network adapt in real-time
```

### Task: Save Your Work
```
To Export:
1. Click "💾 Export" button
2. File downloads as network-TIMESTAMP.json
3. Save it somewhere safe

To Import:
1. Click "📂 Import" button
2. Select your .json file
3. Network loads instantly!
```

---

## 🎨 Interface Overview

### Top Bar (Header)
```
[Logo] [Start Sim] [Auto-Heal] [Clear] [Export] [Import]
```
- **Start Simulation:** Begin packet animation
- **Auto-Heal:** Enable self-healing
- **Clear:** Delete everything (with confirmation)
- **Export/Import:** Save/load networks

### Left Side (Device Palette)
```
🔀 Router
⚡ Switch
💻 PC
🖥️ Server
☁️ Cloud
🛡️ Firewall
```
Drag any icon to the canvas to add device

### Middle (Canvas)
- Drop devices here
- Devices can be dragged to reposition
- Click devices to select them
- Connection lines show network topology

### Right Side (Stats & Info)
```
Network Status
├─ Total Devices
├─ Active Connections
├─ Failed Devices
└─ Packets Sent

Selected Device Info
└─ Shows details when device clicked

Quick Actions
├─ Create Mesh Network
├─ Test All Connections
└─ Optimize Network
```

### Bottom (Console)
```
[Time] Message
[14:30:25] 📤 Packet sent: router-1 → pc-1
[14:30:26] Packet at router-1
[14:30:27] 📥 Packet delivered to pc-1
```
Real-time event log

---

## 🧪 Experiment Ideas

### Experiment 1: Path Redundancy
```
Question: How many paths exist between two devices?

1. Create mesh network with 4 routers
2. Click "Test All Connections"
3. Count paths shown for Router-1 → Router-4
4. Add more connections
5. Test again - more paths!
```

### Experiment 2: Failure Recovery Time
```
Question: How fast does auto-healing work?

1. Build simple linear path: A → B → C → D
2. Send packet from A to D
3. Note timestamp when packet sent
4. Fail device B immediately
5. Note timestamp when "No route" error appears
6. Add alternate path: A → E → D
7. Send packet again, fail B
8. Note timestamp when packet reroutes
9. Calculate recovery time!
```

### Experiment 3: Network Efficiency
```
Question: Are more connections always better?

1. Build network with minimal connections
2. Test all connections, note hop counts
3. Click "Create Mesh Network"
4. Test again, compare hop counts
5. Observation: More connections = fewer hops!
```

---

## 💡 Pro Tips

### Tip 1: Quick Device Placement
Hold Shift while dragging to snap to grid (coming soon)

### Tip 2: Connection Management
Click a device to see how many connections it has in the info panel

### Tip 3: Visual Debugging
Watch the console while testing - it shows exactly what's happening

### Tip 4: Network Naming
Change "Network Name" before exporting for better organization

### Tip 5: Performance
For smooth animation:
- Keep device count under 50
- Limit simultaneous packets to 5-10
- Use "Optimize Network" if devices overlap

---

## ❓ FAQ

**Q: Why isn't my packet moving?**
A: Make sure "Start Simulation" button is active (shows "⏸️ Pause")

**Q: Can I delete a device?**
A: Not yet - use "Clear" to start fresh, or just don't connect unwanted devices

**Q: What's the difference between connection types?**
A: Ethernet (1000Mbps), Fiber (10000Mbps), Wireless (300Mbps) - affects bandwidth display

**Q: How do I know if auto-healing worked?**
A: Watch for:
1. "Auto-Healing Network..." indicator
2. Console log: "Packet rerouted through..."
3. Packet still reaches destination

**Q: Can I import Cisco Packet Tracer files?**
A: Not directly, but you can manually recreate the topology and export as JSON

**Q: What if two devices aren't connecting?**
A: Make sure you:
1. Clicked "Add Connection Mode" first
2. Clicked source device
3. Clicked destination device
4. Console shows "Connected X ↔ Y"

---

## 🎯 Your First Success Checklist

- [ ] Opened index.html in browser
- [ ] Added at least 2 devices
- [ ] Created a connection between them
- [ ] Sent a packet and watched it move
- [ ] Enabled auto-heal mode
- [ ] Simulated a device failure
- [ ] Watched network reroute automatically
- [ ] Exported your network as JSON
- [ ] Imported it back successfully
- [ ] Created a mesh network with 4+ devices

**Completed all?** You're now an AutoMesh expert! 🏆

---

## 🆘 Need Help?

1. **Check the Console:** Bottom panel shows detailed logs
2. **Read the README:** Full documentation in README.md
3. **Try Examples:** Load example networks from examples/ folder
4. **Start Simple:** Begin with 2-3 devices before complex networks

---

## 🎉 What's Next?

After mastering the basics:

1. **Build Complex Topologies**
   - Try all topology patterns (star, ring, mesh, hierarchical)
   - Experiment with different device types

2. **Test Edge Cases**
   - What happens if you fail all routers?
   - Can packets still deliver with 50% device failure?
   - How many redundant paths do you need?

3. **Design Real Networks**
   - Model your home network
   - Design your school/office network
   - Plan IoT sensor deployment

4. **Integrate with Other Modules**
   - Export JSON and use in Module 06 visualizations
   - Apply concepts from Module 05 self-healing
   - Compare with Module 07 Packet Tracer export

---

**Ready to start? Open index.html and build something amazing!** 🚀

