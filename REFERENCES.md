# 📚 Reference Materials for AutoMesh

A curated collection of resources for learning about self-healing mesh networks. These materials range from beginner-friendly tutorials to advanced research papers, plus real-world case studies demonstrating the critical importance of fault-tolerant network design.

---

## 🌍 Real-World Case Studies

### Case Study 1: Air India Flight 171 - Aviation Network Failure

**The Incident:**
- **Date:** June 12, 2025
- **Aircraft:** Boeing 787-8 Dreamliner
- **Route:** Ahmedabad → London Gatwick
- **Fatalities:** 260 (241 passengers/crew + 19 on ground)
- **Cause:** Both engine fuel control switches moved to "CUTOFF" position simultaneously

**Key Resources:**

**Wikipedia - Air India Flight 171**
- URL: https://en.wikipedia.org/wiki/Air_India_Flight_171
- What it covers: Comprehensive overview of the accident, investigation timeline, and technical details
- Useful for: Understanding the sequence of events and system architecture

**Reuters - Fuel Switches Investigation**
- URL: https://www.reuters.com/business/aerospace-defense/what-are-fuel-switches-centre-air-india-crash-probe-2025-07-11/
- What it covers: Technical explanation of fuel control switches and their operation
- Useful for: Understanding the mechanical systems and failure modes

**India Today - Preliminary Report**
- URL: https://www.indiatoday.in/india/story/both-engines-shut-down-within-seconds-of-take-off-air-india-crash-probe-report-2754626-2025-07-12
- What it covers: Detailed analysis of the preliminary investigation report
- Useful for: Understanding the timeline and sequence of events

**Al Jazeera - Investigation Analysis**
- URL: https://www.aljazeera.com/news/2025/7/17/what-happened-to-the-fuel-control-switches-on-doomed-air-india-flight-171
- What it covers: Analysis of potential causes and ongoing investigation
- Useful for: Understanding the complexity of failure analysis

**Live Simulation:**
- **Aircraft Network Simulation:** https://v0-aircraft-network.vercel.app/
- Compare centralized vs. mesh network architectures
- Visualize failure scenarios and recovery mechanisms

**Why This Matters:**
This case study demonstrates the catastrophic consequences of single points of failure in critical systems. A mesh network architecture with distributed control nodes could have prevented total system failure, allowing for graceful degradation and partial functionality.

---

### Case Study 2: WannaCry Ransomware Attack - Network Security Failure

**The Attack:**
- **Date:** May 2017
- **Systems Affected:** 300,000+ computers
- **Countries Affected:** 150+
- **Vulnerability:** CVE-2017-0144 (SMBv1 protocol)
- **Exploit:** EternalBlue (leaked NSA tool)

**Key Resources:**

**Wikipedia - WannaCry Ransomware Attack**
- URL: https://en.wikipedia.org/wiki/WannaCry_ransomware_attack
- What it covers: Comprehensive overview of the attack, timeline, impact, and response
- Useful for: Understanding the scale and mechanism of the attack

**Microsoft Security Blog - MS17-010 Patch**
- URL: https://www.microsoft.com/en-us/security/blog/2017/05/12/wannacrypt-ransomware-worm-targets-out-of-date-systems/
- What it covers: Official Microsoft response, patch details, and mitigation strategies
- Useful for: Understanding the vulnerability and official security guidance

**ESET - CVE-2017-0144 Vulnerability Details**
- URL: https://support.eset.com/en/ca6443-vulnerability-cve-2017-0144-in-smb-exploited-by-wannacryptor-ransomware-to-spread-over-lan
- What it covers: Technical details of the SMB vulnerability and exploitation
- Useful for: Understanding the technical attack vector

**Live Simulation:**
- **WannaCry Simulation Dashboard:** https://v0-wannacry.vercel.app/
- Visualize attack spread across network segments
- See mesh network defense mechanisms in action
- Understand segmentation, IDS, and firewall protection

**Why This Matters:**
WannaCry demonstrates how a single vulnerability can cascade through entire networks when proper segmentation and redundancy aren't in place. Mesh networks with proper segmentation can isolate infected segments, preventing total network compromise.

---

## 🌐 Essential Blog Posts & Tutorials

### Interactive Notebooks

**AutoMesh Learning Notebook (Google Colab)**
- URL: https://colab.research.google.com/drive/1WPMVVRItPtnzhM13ZBg6xRRwx2MgMUYn?usp=sharing
- What it covers: Interactive notebook with all examples and exercises
- Useful for: Running code without local setup, experimenting in the browser

### Graph Theory & Network Fundamentals

**NetworkX Documentation**
- URL: https://networkx.org/documentation/stable/tutorial.html
- What it covers: Official tutorial with practical graph examples
- Useful for: Learning graph creation, algorithms, and analysis

**Introduction to Graph Theory for Software Engineers**
- URL: https://www.freecodecamp.org/news/graph-theory-tutorial-introduction-to-graphs-and-graph-algorithms/
- What it covers: Beginner-friendly explanations with visuals
- Useful for: Understanding nodes, edges, paths, and connectivity

**Visualizing Networks with Python**
- URL: https://towardsdatascience.com/visualizing-networks-in-python-d70f4cbeb259
- What it covers: Practical visualization techniques
- Useful for: Learning matplotlib, layouts, and customization

### Optimization Algorithms

**Simulated Annealing Explained**
- URL: https://towardsdatascience.com/optimization-techniques-simulated-annealing-d6a4785a1de7
- What it covers: Clear explanation with Python code
- Useful for: Understanding temperature schedules and acceptance criteria

**Metaheuristic Optimization (Nature of Code)**
- URL: https://natureofcode.com/book/chapter-9-the-evolution-of-code/
- What it covers: Visual, intuitive approach to optimization
- Useful for: Learning genetic algorithms and evolutionary strategies

**Graph Optimization Problems**
- URL: https://brilliant.org/wiki/graph-theory/
- What it covers: Interactive examples and problem-solving
- Useful for: Practicing shortest paths, spanning trees, and flow algorithms

### Routing & Pathfinding

**Dijkstra's Algorithm Visualization**
- URL: https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/
- What it covers: Step-by-step walkthrough with animations
- Useful for: Understanding algorithm mechanics and implementation

**Network Routing Basics**
- URL: https://www.cloudflare.com/learning/network-layer/what-is-routing/
- What it covers: Real-world context for routing concepts
- Useful for: Learning routing tables, protocols, and forwarding

### Mesh Networks

**What is a Mesh Network? (Cloudflare)**
- URL: https://www.cloudflare.com/learning/network-layer/what-is-a-mesh-network/
- What it covers: Industry perspective on mesh architecture
- Useful for: Understanding use cases, advantages, and challenges

**Building Resilient Networks**
- URL: https://medium.com/@AnalyticsVidhya/network-resilience-and-redundancy-explained-b0b20d8e9c7e
- What it covers: Practical resilience strategies
- Useful for: Learning redundancy, failover, and recovery techniques

---

## 🛠️ Tools & Simulators to Explore

**Mininet** (http://mininet.org)
- What it does: Network emulator for testing topologies
- Useful for: Testing designs in virtual networks

**NS-3** (https://www.nsnam.org)
- What it does: Network simulator
- Useful for: Simulating packet flows and measuring performance

**Gephi** (https://gephi.org)
- What it does: Graph visualization tool
- Useful for: Interactive exploration of large networks

**Cytoscape** (https://cytoscape.org)
- What it does: Complex network analysis
- Useful for: Advanced metrics and visualization

**Cisco Packet Tracer**
- What it does: Network simulation and visualization
- Useful for: Learning enterprise networking concepts and protocols

---

## 🎮 Live Simulations & Demos

**AutoMesh Packet Tracer Simulator**
- URL: https://astro-dally.github.io/automesh-learning/08-packet-tracer-simulator/
- What it covers: Interactive network builder with auto-healing capabilities
- Useful for: Building networks, testing failures, watching self-healing in action

**Network Core Simulator (OSPF/ECMP/Dijkstra)**
- URL: https://astro-dally.github.io/automesh-learning/09-final-showdown/
- What it covers: Enterprise-grade routing with real-time failure detection
- Useful for: Understanding OSPF, ECMP, and Dijkstra in production networks

**Campus Mesh Network Simulator**
- URL: https://v0-automesh-learning.vercel.app/
- What it covers: 108-device campus network with full protocol visualization
- Useful for: Large-scale network design and management

**Aircraft Network Comparison**
- URL: https://v0-aircraft-network.vercel.app/
- What it covers: Centralized vs. mesh network architectures
- Useful for: Understanding trade-offs in critical systems

**WannaCry Attack Simulation**
- URL: https://v0-wannacry.vercel.app/
- What it covers: Ransomware spread and mesh network defense
- Useful for: Understanding network security and segmentation

---

## 📄 Research Papers & Advanced Topics

### MPLS Fast Reroute (FRR) - Telecommunications Backbone

**[1] MPLS FAST-REROUTE – A PACKET VIEW**
- URL: https://r2079.wordpress.com/2015/08/08/mpls-fast-reroute-a-packet-view/
- What it covers: Blog post discussing deployment and implementation differences
- Useful for: Understanding MPLS FRR packet-level behavior and real-world deployment

**[2] Fast-reroute as a local protection approach over MPLS**
- URL: https://www.researchgate.net/figure/Fast-reroute-as-a-local-protection-approach-over-MPLS_fig23_282192264
- What it covers: Research/Technical figure demonstrating the concept
- Useful for: Visual understanding of MPLS FRR protection mechanisms

**[3] This Week – Deploying MPLS**
- URL: https://jncie.files.wordpress.com/2011/05/thisweek_deployingmpls.pdf
- What it covers: Technical document with real-world configuration examples
- Useful for: Practical MPLS configuration and deployment guidance

### Segment Routing TI-LFA - Cloud Data Center Fabric

**[4] SRv6 TI-LFA: The Ultimate Solution for Fast Rerouting**
- URL: https://arrcus.com/blog/srv6-ti-lfa-the-ultimate-solution-for-fast-rerouting
- What it covers: Vendor blog post detailing the benefits and operation
- Useful for: Understanding TI-LFA advantages and operational details

**[5] ISIS-SR with TI-LFA in OcNOS**
- URL: https://www.ipinfusion.com/blogs/isis-sr-with-ti-lfa-in-ocnos/
- What it covers: Technical blog post on implementation and configuration
- Useful for: Practical TI-LFA configuration examples

**[6] Fast Failover: Techniques and Technologies**
- URL: https://blog.ipspace.net/2020/12/fast-failover-techniques/
- What it covers: Blog post comparing LFA, FRR, and TI-LFA
- Useful for: Understanding differences between fast reroute technologies

### Wireless Sensor Network Self-Healing

**[7] SHR: Self-Healing Routing for wireless ad hoc sensor networks**
- URL: https://www.cs.rpi.edu/~szymansk/papers/spects07.pdf
- What it covers: Research paper on a novel self-healing protocol
- Useful for: Understanding health-aware routing in resource-constrained networks

**[8] Health, link quality and reputation aware routing protocol...**
- URL: https://ieeexplore.ieee.org/document/6297112/
- What it covers: Research paper on HLR-AODV (Health/Link Quality/Reputation Aware AODV)
- Useful for: Learning about multi-metric routing in sensor networks

**[9] Self-healing routing: a study in efficiency and resiliency of...**
- URL: https://www.spiedigitallibrary.org/conference-proceedings-of-spie/6562/1/Self-healing-routing--a-study-in-efficiency-and-resiliency/10.1117/12.723515.full
- What it covers: Research on the efficiency of self-healing routing
- Useful for: Understanding performance metrics and efficiency trade-offs

---

## 📝 Week-by-Week Reading Plan

### Week 1: Foundations
- Graph theory basics (NetworkX tutorial)
- Mesh network concepts (Cloudflare article)
- Start with `01-graphs/` examples

### Week 2: Algorithms
- Dijkstra's algorithm (GeeksforGeeks)
- Optimization techniques (Simulated Annealing)
- Work through `02-optimization/` and `03-routing/`

### Week 3: Visualization & Self-Healing
- Network visualization (Towards Data Science)
- Self-healing mechanisms (Research papers)
- Complete `04-visualization/` and `05-self-healing/`

### Week 4: Advanced Topics
- MPLS FRR and TI-LFA (Blog posts)
- Wireless sensor networks (Research papers)
- Explore `06-customization/` and `07-packet-tracer-export/`

### Week 5: Case Studies & Production
- Air India Flight 171 case study
- WannaCry attack analysis
- Explore live simulations and production apps

---

## 🎬 Interactive Presentation

**AutoMesh Learning Presentation**
- Local: Run `cd 12-presentation/presentation-for-automesh-learning && npm run dev`
- What it covers: Interactive journey through all concepts and case studies
- Useful for: Comprehensive overview and visual learning

---

**Remember**: Build incrementally, test often, and don't be afraid to experiment and break things!

The case studies above demonstrate why self-healing mesh networks aren't just academic exercises—they're critical for preventing catastrophic failures in real-world systems.
