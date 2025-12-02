// University Core Network Simulation
// OSPF/Dijkstra/ECMP Self-Healing Visualization with Traffic Flow

class NetworkSimulation {
    constructor() {
        const svgEl = document.getElementById('networkCanvas');
        if (!svgEl) {
            console.error('Main network canvas not found!');
            return;
        }
        
        this.svg = d3.select('#networkCanvas');
        if (this.svg.empty()) {
            console.error('Failed to select main network canvas!');
            return;
        }
        
        this.width = 1600;
        this.height = 1000;
        this.simulation = null;
        this.nodes = [];
        this.links = [];
        this.nodeElements = null;
        this.linkElements = null;
        this.labelElements = null;
        this.trafficParticles = [];
        this.particleGroup = null;
        this.container = null;
        this.state = 'idle'; // idle, normal, failure, healing, calculating
        this.failureTime = null;
        this.detectionTime = null;
        this.rerouteTime = null;
        this.packetLoss = 0;
        this.serviceDegradation = 0;
        this.zoom = null;
        this.transform = d3.zoomIdentity;
        this.algorithmStep = null;
        this.visitedNodes = new Set();
        this.currentPath = [];
        this.pathCalculationGroup = null;
        this.isMiniView = false; // Track current view mode
        
        // Setup zoom and pan
        this.setupZoom();
        this.initializeNetwork();
        this.setupEventListeners();
    }

    setupZoom() {
        // Create zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.3, 3])
            .on('zoom', (event) => {
                this.transform = event.transform;
                this.updateTransform();
            });

        this.svg.call(this.zoom);

        // Zoom controls - prevent event propagation to avoid interfering with other buttons
        document.getElementById('zoomIn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.svg.transition().call(this.zoom.scaleBy, 1.5);
        });

        document.getElementById('zoomOut').addEventListener('click', (e) => {
            e.stopPropagation();
            this.svg.transition().call(this.zoom.scaleBy, 0.67);
        });

        document.getElementById('resetZoom').addEventListener('click', (e) => {
            e.stopPropagation();
            this.svg.transition().call(this.zoom.transform, d3.zoomIdentity);
        });
    }

    updateTransform() {
        if (this.container) {
            this.container.attr('transform', this.transform);
        }
    }

    initializeNetwork() {
        // Full network topology: 2 Routers, 2 Switches, 30 APs, 100 Clients
        
        // Core routers - positioned at top
        const routerA = { id: 'R-A', type: 'router', x: 300, y: 150, fixed: true, status: 'normal', distance: Infinity, previous: null };
        const routerB = { id: 'R-B', type: 'router', x: 1300, y: 150, fixed: true, status: 'normal', distance: Infinity, previous: null };
        
        // Core switches - positioned in middle
        const switchC = { id: 'S-C', type: 'switch', x: 500, y: 450, fixed: true, status: 'normal', distance: Infinity, previous: null };
        const switchD = { id: 'S-D', type: 'switch', x: 1100, y: 450, fixed: true, status: 'normal', distance: Infinity, previous: null };
        
        // Access Points (30 APs) - positioned below switches
        const aps = [];
        const apRows = 5;
        const apCols = 6;
        const apStartX = 150;
        const apStartY = 700;
        const apSpacingX = 250;
        const apSpacingY = 50;
        
        for (let i = 0; i < 30; i++) {
            const row = Math.floor(i / apCols);
            const col = i % apCols;
            aps.push({
                id: `AP-${i + 1}`,
                type: 'ap',
                x: apStartX + col * apSpacingX,
                y: apStartY + row * apSpacingY,
                fixed: true,
                status: 'normal',
                distance: Infinity,
                previous: null
            });
        }
        
        // Clients (100 clients) - positioned at bottom
        const clients = [];
        const clientRows = 10;
        const clientCols = 10;
        const clientStartX = 100;
        const clientStartY = 950;
        const clientSpacingX = 140;
        const clientSpacingY = 5;
        
        for (let i = 0; i < 100; i++) {
            const row = Math.floor(i / clientCols);
            const col = i % clientCols;
            clients.push({
                id: `C-${i + 1}`,
                type: 'client',
                x: clientStartX + col * clientSpacingX,
                y: clientStartY + row * clientSpacingY,
                fixed: true,
                status: 'normal',
                size: 4,
                distance: Infinity,
                previous: null
            });
        }
        
        this.nodes = [routerA, routerB, switchC, switchD, ...aps, ...clients];
        
        // Create links
        this.links = [];
        
        // Core mesh: R-A/B to S-C/D (ECMP paths)
        this.links.push({ source: routerA, target: switchC, type: 'core', status: 'normal', ecmp: true, weight: 1 });
        this.links.push({ source: routerA, target: switchD, type: 'core', status: 'normal', ecmp: true, weight: 1 });
        this.links.push({ source: routerB, target: switchC, type: 'core', status: 'normal', ecmp: true, weight: 1 });
        this.links.push({ source: routerB, target: switchD, type: 'core', status: 'normal', ecmp: true, weight: 1 });
        
        // S-C to S-D
        this.links.push({ source: switchC, target: switchD, type: 'core', status: 'normal', ecmp: false, weight: 1 });
        
        // APs connect to both switches (redundancy)
        aps.forEach(ap => {
            this.links.push({ source: ap, target: switchC, type: 'access', status: 'normal', ecmp: false, weight: 1 });
            this.links.push({ source: ap, target: switchD, type: 'access', status: 'normal', ecmp: false, weight: 1 });
        });
        
        // Clients connect to APs (approximately 3-4 clients per AP)
        clients.forEach((client, idx) => {
            const apIndex = Math.floor(idx / 3.33);
            if (apIndex < aps.length) {
                this.links.push({ 
                    source: client, 
                    target: aps[apIndex], 
                    type: 'client', 
                    status: 'normal', 
                    ecmp: false,
                    weight: 1
                });
            }
        });
        
        this.renderNetwork();
    }

    initializeMiniNetwork() {
        // Mini network topology: 2 Routers, 2 Switches, 6 APs, 12 Clients
        
        // Core routers - positioned at top
        const routerA = { id: 'R-A', type: 'router', x: 400, y: 200, fixed: true, status: 'normal', distance: Infinity, previous: null };
        const routerB = { id: 'R-B', type: 'router', x: 1200, y: 200, fixed: true, status: 'normal', distance: Infinity, previous: null };
        
        // Core switches - positioned in middle
        const switchC = { id: 'S-C', type: 'switch', x: 500, y: 500, fixed: true, status: 'normal', distance: Infinity, previous: null };
        const switchD = { id: 'S-D', type: 'switch', x: 1100, y: 500, fixed: true, status: 'normal', distance: Infinity, previous: null };
        
        // Access Points (6 APs) - positioned below switches
        const aps = [];
        const apStartX = 300;
        const apStartY = 750;
        const apSpacingX = 250;
        
        for (let i = 0; i < 6; i++) {
            aps.push({
                id: `AP-${i + 1}`,
                type: 'ap',
                x: apStartX + i * apSpacingX,
                y: apStartY,
                fixed: true,
                status: 'normal',
                distance: Infinity,
                previous: null
            });
        }
        
        // Clients (12 clients) - positioned at bottom, 2 per AP
        const clients = [];
        const clientStartX = 250;
        const clientStartY = 900;
        const clientSpacingX = 250;
        
        for (let i = 0; i < 12; i++) {
            clients.push({
                id: `C-${i + 1}`,
                type: 'client',
                x: clientStartX + (i % 6) * clientSpacingX + (Math.floor(i / 6) * 125),
                y: clientStartY + Math.floor(i / 6) * 30,
                fixed: true,
                status: 'normal',
                size: 5,
                distance: Infinity,
                previous: null
            });
        }
        
        this.nodes = [routerA, routerB, switchC, switchD, ...aps, ...clients];
        
        // Create links
        this.links = [];
        
        // Core mesh: R-A/B to S-C/D (ECMP paths)
        this.links.push({ source: routerA, target: switchC, type: 'core', status: 'normal', ecmp: true, weight: 1 });
        this.links.push({ source: routerA, target: switchD, type: 'core', status: 'normal', ecmp: true, weight: 1 });
        this.links.push({ source: routerB, target: switchC, type: 'core', status: 'normal', ecmp: true, weight: 1 });
        this.links.push({ source: routerB, target: switchD, type: 'core', status: 'normal', ecmp: true, weight: 1 });
        
        // S-C to S-D
        this.links.push({ source: switchC, target: switchD, type: 'core', status: 'normal', ecmp: false, weight: 1 });
        
        // APs connect to both switches (redundancy)
        aps.forEach(ap => {
            this.links.push({ source: ap, target: switchC, type: 'access', status: 'normal', ecmp: false, weight: 1 });
            this.links.push({ source: ap, target: switchD, type: 'access', status: 'normal', ecmp: false, weight: 1 });
        });
        
        // Clients connect to APs (2 clients per AP)
        clients.forEach((client, idx) => {
            const apIndex = Math.floor(idx / 2);
            if (apIndex < aps.length) {
                this.links.push({ 
                    source: client, 
                    target: aps[apIndex], 
                    type: 'client', 
                    status: 'normal', 
                    ecmp: false,
                    weight: 1
                });
            }
        });
        
        this.renderNetwork();
    }

    toggleView() {
        this.isMiniView = !this.isMiniView;
        
        // Reset zoom
        this.transform = d3.zoomIdentity;
        this.svg.call(this.zoom.transform, d3.zoomIdentity);
        
        // Reset state
        this.state = 'idle';
        this.failureTime = null;
        this.detectionTime = null;
        this.rerouteTime = null;
        this.packetLoss = 0;
        this.serviceDegradation = 0;
        this.visitedNodes.clear();
        this.currentPath = [];
        
        // Reset all nodes and links
        this.nodes.forEach(node => {
            node.status = 'normal';
            node.distance = Infinity;
            node.previous = null;
        });
        
        this.links.forEach(link => {
            link.status = 'normal';
        });
        
        // Initialize appropriate network
        if (this.isMiniView) {
            this.initializeMiniNetwork();
        } else {
            this.initializeNetwork();
        }
        
        // Update UI
        document.getElementById('viewModeText').textContent = this.isMiniView ? 'Full View' : 'Mini View';
        document.getElementById('startBtn').disabled = false;
        document.getElementById('triggerFailureBtn').disabled = true;
        this.updateStatus('Ready', '--', '--');
        document.getElementById('detectionTime').textContent = '--';
        document.getElementById('rerouteTime').textContent = '--';
        document.getElementById('packetLoss').textContent = '--';
        document.getElementById('degradation').textContent = '--';
    }

    renderNetwork() {
        console.log('Main renderNetwork: nodes=', this.nodes.length, 'links=', this.links.length);
        
        if (!this.svg || this.svg.empty()) {
            console.error('Main SVG is empty!');
            return;
        }
        
        // Preserve current zoom transform
        const currentTransform = this.transform;
        
        // Clear existing elements (but keep defs if they exist)
        this.svg.selectAll('g.network-container').remove();
        this.svg.selectAll('g.algorithm-visualization').remove();
        this.svg.selectAll('g.traffic-particles').remove();
        
        // Create container groups for transform
        this.container = this.svg.append('g').attr('class', 'network-container');
        
        // Reapply the zoom transform to maintain current view
        if (currentTransform && currentTransform.k !== undefined && 
            (currentTransform.k !== 1 || currentTransform.x !== 0 || currentTransform.y !== 0)) {
            this.container.attr('transform', currentTransform);
        }
        
        // Create defs for markers
        const defs = this.svg.append('defs');
        
        // Arrow marker
        defs.append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 15)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#666');
        
        // Draw links
        this.linkElements = this.container.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(this.links)
            .enter()
            .append('line')
            .attr('stroke-width', d => {
                if (d.status === 'healing') return 6;
                if (d.ecmp) return 4;
                if (d.type === 'core') return 3;
                return 2;
            })
            .attr('stroke', d => {
                if (d.status === 'failed') return '#e74c3c';
                if (d.status === 'healing') return '#27ae60';
                if (d.ecmp) return '#9b59b6';
                return '#3498db';
            })
            .attr('stroke-dasharray', d => {
                if (d.status === 'failed') return '5,5';
                return 'none';
            })
            .attr('opacity', d => d.status === 'failed' ? 0.3 : 0.8)
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        // Draw nodes
        this.nodeElements = this.container.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('r', d => {
                // Larger nodes in mini view for better visibility
                const multiplier = this.isMiniView ? 1.2 : 1;
                if (d.type === 'router') return 28 * multiplier;
                if (d.type === 'switch') return 22 * multiplier;
                if (d.type === 'ap') return 10 * multiplier;
                return (d.size || 4) * multiplier;
            })
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('fill', d => {
                if (d.status === 'failed') return '#f85149'; // Red for failed nodes
                if (d.type === 'router') return '#4a9eff';
                if (d.type === 'switch') return '#7b68ee';
                if (d.type === 'ap') return '#ff6b6b';
                return '#95a5a6';
            })
            .attr('stroke', d => {
                if (d.status === 'failed') return '#f85149'; // Red stroke for failed nodes
                return '#fff';
            })
            .attr('stroke-width', d => d.status === 'failed' ? 3 : 2.5)
            .attr('stroke-opacity', d => d.status === 'failed' ? 1 : 0.9)
            .attr('class', d => `node ${d.type} ${d.status}`)
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                if (this.state === 'normal' && d.status === 'normal') {
                    this.triggerFailure(d);
                }
            })
            .on('mouseover', function(event, d) {
                if (d.status === 'normal' && this.state === 'normal') {
                    d3.select(this)
                        .attr('stroke-width', 3.5)
                        .attr('opacity', 0.9);
                }
            })
            .on('mouseout', function(event, d) {
                if (d.status === 'normal') {
                    d3.select(this)
                        .attr('stroke-width', 2.5)
                        .attr('opacity', 1);
                }
            });
        
        // Draw labels
        this.labelElements = this.container.append('g')
            .attr('class', 'labels')
            .selectAll('text')
            .data(this.nodes.filter(n => n.type !== 'client'))
            .enter()
            .append('text')
            .attr('x', d => d.x)
            .attr('y', d => d.y - (d.type === 'router' ? 40 : d.type === 'switch' ? 35 : 18))
            .attr('text-anchor', 'middle')
            .attr('font-size', d => {
                if (d.type === 'router') return '16px';
                if (d.type === 'switch') return '14px';
                return '10px';
            })
            .attr('font-weight', 'bold')
            .attr('fill', d => d.status === 'failed' ? '#f85149' : '#fff')
            .attr('stroke', d => d.status === 'failed' ? '#f85149' : '#000')
            .attr('stroke-width', d => d.status === 'failed' ? '1px' : '0.5px')
            .text(d => d.id);
        
        // Create particle group for traffic flow
        this.particleGroup = this.container.append('g').attr('class', 'traffic-particles');
        
        // Create group for algorithm visualization
        this.pathCalculationGroup = this.container.append('g').attr('class', 'algorithm-visualization');
        
        // Ensure transform is applied after rendering
        this.updateTransform();
        
        // Add traffic flow visualization
        this.updateTrafficFlow();
    }

    createTrafficParticle(link, progress = 0) {
        const source = link.source;
        const target = link.target;
        
        // Add slight perpendicular offset for multi-path visualization (wider flow)
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / length;
        const perpY = dx / length;
        
        // Random offset perpendicular to link for wider path visualization
        const offset = (Math.random() - 0.5) * (link.ecmp ? 8 : (link.type === 'core' ? 5 : 3));
        
        const x = source.x + dx * progress + perpX * offset;
        const y = source.y + dy * progress + perpY * offset;
        
        // Determine particle color based on link status - use white/light colors like reference
        let color = '#ffffff'; // Normal traffic (white like the reference image)
        if (link.status === 'failed') {
            color = '#ff4757'; // Failed/error traffic (red)
        } else if (link.status === 'healing') {
            color = '#2ed573'; // Healing path traffic (green)
        } else if (link.ecmp) {
            color = '#a8e6cf'; // ECMP traffic (light green/cyan for multi-path)
        } else if (link.type === 'core') {
            color = '#e3f2fd'; // Core traffic (very light blue)
        }
        
        // Randomize particle size slightly for more natural look
        // Larger particles in mini view for better visibility
        const sizeMultiplier = this.isMiniView ? 1.3 : 1;
        const baseSize = (link.ecmp ? 3.5 : (link.type === 'core' ? 3 : (link.type === 'access' ? 2.5 : 2.5))) * sizeMultiplier;
        const size = baseSize + (Math.random() - 0.5) * 0.4;
        
        const particle = this.particleGroup.append('circle')
            .attr('r', size)
            .attr('cx', x)
            .attr('cy', y)
            .attr('fill', color)
            .attr('opacity', this.isMiniView ? 0.9 + Math.random() * 0.1 : 0.85 + Math.random() * 0.15) // More visible in mini view
            .attr('stroke', 'none');
        
        return {
            element: particle,
            link: link,
            progress: progress,
            speed: this.isMiniView ? 
                (link.ecmp ? 0.03 : (link.type === 'core' ? 0.025 : (link.type === 'access' ? 0.02 : 0.018))) : 
                (link.ecmp ? 0.025 : (link.type === 'core' ? 0.02 : 0.015)), // Faster in mini view for better visibility
            color: color,
            offset: offset,
            perpX: perpX,
            perpY: perpY
        };
    }

    updateTrafficFlow() {
        if (this.state === 'idle') {
            // Clear particles
            if (this.particleGroup) {
                this.particleGroup.selectAll('circle').remove();
            }
            this.trafficParticles = [];
            return;
        }
        
        // Clear old particles
        if (this.particleGroup) {
            this.particleGroup.selectAll('circle').remove();
        }
        this.trafficParticles = [];
        
        // Create particles for active links
        const activeLinks = this.links.filter(link => link.status !== 'failed');
        
        activeLinks.forEach(link => {
            // Create MANY particles per link for dense traffic flow visualization
            // In mini view, use even more particles for better visibility
            const densityMultiplier = this.isMiniView ? 2 : 1;
            
            let particleCount;
            if (link.ecmp) {
                particleCount = (this.isMiniView ? 60 : 40) * densityMultiplier; // Very dense flow on ECMP paths
            } else if (link.type === 'core') {
                particleCount = (this.isMiniView ? 40 : 25) * densityMultiplier; // Heavy core traffic
            } else if (link.type === 'access') {
                particleCount = (this.isMiniView ? 30 : 15) * densityMultiplier; // Access layer traffic
            } else {
                particleCount = (this.isMiniView ? 20 : 8) * densityMultiplier; // Client connections - much more visible
            }
            
            for (let i = 0; i < particleCount; i++) {
                // Stagger particles along the link with some randomization
                const baseProgress = (i / particleCount) * 0.95;
                const randomOffset = (Math.random() - 0.5) * 0.1; // Small random offset for natural flow
                const initialProgress = Math.max(0, Math.min(0.95, baseProgress + randomOffset));
                const particle = this.createTrafficParticle(link, initialProgress);
                this.trafficParticles.push(particle);
            }
        });
        
        // Animate particles
        this.animateParticles();
    }

    animateParticles() {
        if (this.state === 'idle') return;
        
        this.trafficParticles.forEach(particle => {
            const link = particle.link;
            
            // Skip if link is failed
            if (link.status === 'failed') {
                particle.element.remove();
                return;
            }
            
            // Update progress
            particle.progress += particle.speed;
            
            // Reset if reached end
            if (particle.progress >= 1) {
                particle.progress = 0;
            }
            
            // Calculate position with perpendicular offset for wide path visualization
            const source = link.source;
            const target = link.target;
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            
            // Maintain perpendicular offset for wide flow
            const x = source.x + dx * particle.progress + (particle.perpX || 0) * (particle.offset || 0);
            const y = source.y + dy * particle.progress + (particle.perpY || 0) * (particle.offset || 0);
            
            // Update particle position
            particle.element
                .attr('cx', x)
                .attr('cy', y);
            
            // Update color if link status changed
            let newColor = '#fff';
            if (link.status === 'healing') {
                newColor = '#27ae60';
            } else if (link.ecmp) {
                newColor = '#9b59b6';
            }
            
            if (particle.color !== newColor) {
                particle.color = newColor;
                particle.element.attr('fill', newColor);
            }
        });
        
        // Continue animation
        requestAnimationFrame(() => this.animateParticles());
    }

    async dijkstraShortestPathVisualized(startNode, endNode, excludeNode = null) {
        // Dijkstra's algorithm with step-by-step visualization
        this.state = 'calculating';
        this.visitedNodes.clear();
        this.currentPath = [];
        
        this.updateStatus('Calculating Path', `Finding shortest path: ${startNode.id} → ${endNode.id}`, 'Dijkstra Running');
        
        const distances = {};
        const previous = {};
        const unvisited = new Set();
        const visited = new Set();
        
        // Initialize distances (exclude failed nodes from unvisited set)
        this.nodes.forEach(node => {
            distances[node.id] = Infinity;
            previous[node.id] = null;
            node.distance = Infinity;
            node.previous = null;
            // Don't add failed nodes or excluded node to unvisited set
            if (node.status !== 'failed' && node.id !== excludeNode) {
                unvisited.add(node.id);
            }
        });
        // Only set start distance if start node is not failed
        if (startNode.status !== 'failed' && startNode.id !== excludeNode) {
            distances[startNode.id] = 0;
            startNode.distance = 0;
        }
        
        // Highlight start node (only if calculating)
        if (this.state === 'calculating') {
            this.highlightNode(startNode, 'start');
            await this.sleep(300);
        }
        
        while (unvisited.size > 0) {
            // Find node with minimum distance
            let current = null;
            let minDist = Infinity;
            unvisited.forEach(nodeId => {
                if (distances[nodeId] < minDist) {
                    minDist = distances[nodeId];
                    current = nodeId;
                }
            });
            
            if (current === null || distances[current] === Infinity) break;
            
            const currentNode = this.nodes.find(n => n.id === current);
            if (!currentNode) break;
            
            unvisited.delete(current);
            visited.add(current);
            this.visitedNodes.add(current);
            
            // Skip excluded node
            if (current === excludeNode) continue;
            
            // Visualize: mark current node as being processed (only if calculating)
            if (this.state === 'calculating') {
                this.highlightNode(currentNode, 'processing');
                await this.sleep(200);
            }
            
            // Find neighbors (exclude failed nodes and links)
            const neighbors = [];
            this.links
                .filter(link => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    return (sourceId === current || targetId === current) && link.status !== 'failed';
                })
                .forEach(link => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    const neighborId = sourceId === current ? targetId : sourceId;
                    const neighborNode = this.nodes.find(n => n.id === neighborId);
                    // Only include neighbors that are not failed and not visited
                    if (neighborNode && neighborNode.status !== 'failed' && !visited.has(neighborId)) {
                        neighbors.push({ node: neighborNode, link: link });
                    }
                });
            
            // Visualize: explore neighbors (only if calculating)
            for (const { node: neighborNode, link } of neighbors) {
                // Highlight link being explored (only during algorithm visualization)
                if (this.state === 'calculating') {
                    this.highlightLink(link, 'exploring');
                    await this.sleep(150); // Faster animation
                }
                
                const alt = distances[current] + link.weight;
                if (alt < distances[neighborNode.id]) {
                    distances[neighborNode.id] = alt;
                    previous[neighborNode.id] = current;
                    neighborNode.distance = alt;
                    neighborNode.previous = currentNode;
                    
                    // Visualize: update distance (only if calculating)
                    if (this.state === 'calculating') {
                        this.updateNodeDistance(neighborNode, alt);
                        this.highlightNode(neighborNode, 'updated');
                        await this.sleep(100);
                    }
                }
                
                // Remove link highlight
                if (this.state === 'calculating') {
                    this.unhighlightLink(link);
                }
            }
            
            // Mark node as visited (only if calculating)
            if (this.state === 'calculating') {
                this.highlightNode(currentNode, 'visited');
                await this.sleep(150);
            }
        }
        
        // Reconstruct and visualize path
        const path = [];
        let current = endNode.id;
        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }
        
        if (path.length > 1 && path[0] === startNode.id) {
            // Visualize final path
            await this.visualizePath(path);
            this.updateStatus('Path Found', `Shortest path: ${path.join(' → ')}`, 'Dijkstra Complete');
            await this.sleep(1000);
            return path;
        }
        
        this.updateStatus('Path Not Found', 'No path available', 'Dijkstra Complete');
        return null;
    }

    dijkstraShortestPath(startNode, endNode, excludeNode = null) {
        // Non-visualized version for quick calculations
        const distances = {};
        const previous = {};
        const unvisited = new Set();
        const visited = new Set();
        
        this.nodes.forEach(node => {
            distances[node.id] = Infinity;
            previous[node.id] = null;
            unvisited.add(node.id);
        });
        distances[startNode.id] = 0;
        
        while (unvisited.size > 0) {
            let current = null;
            let minDist = Infinity;
            unvisited.forEach(nodeId => {
                if (distances[nodeId] < minDist) {
                    minDist = distances[nodeId];
                    current = nodeId;
                }
            });
            
            if (current === null || distances[current] === Infinity) break;
            
            unvisited.delete(current);
            visited.add(current);
            
            if (current === excludeNode) continue;
            
            this.links
                .filter(link => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    return (sourceId === current || targetId === current) && link.status !== 'failed';
                })
                .forEach(link => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    const neighborId = sourceId === current ? targetId : sourceId;
                    
                    if (!visited.has(neighborId)) {
                        const alt = distances[current] + (link.weight || 1);
                        if (alt < distances[neighborId]) {
                            distances[neighborId] = alt;
                            previous[neighborId] = current;
                        }
                    }
                });
        }
        
        const path = [];
        let current = endNode.id;
        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }
        
        return path.length > 1 && path[0] === startNode.id ? path : null;
    }

    highlightNode(node, state) {
        const nodeElement = this.nodeElements.filter(d => d.id === node.id);
        
        // Only show algorithm highlights when calculating
        if (this.state !== 'calculating') {
            // Reset to normal appearance
            nodeElement
                .attr('stroke', '#fff')
                .attr('stroke-width', 2.5)
                .attr('opacity', 1);
            return;
        }
        
        if (state === 'start') {
            nodeElement
                .attr('stroke', '#ffd700')
                .attr('stroke-width', 4)
                .attr('opacity', 1);
        } else if (state === 'processing') {
            nodeElement
                .attr('stroke', '#ff6b6b')
                .attr('stroke-width', 4)
                .attr('opacity', 1);
        } else if (state === 'updated') {
            nodeElement
                .attr('stroke', '#4a9eff')
                .attr('stroke-width', 3)
                .attr('opacity', 1);
        } else if (state === 'visited') {
            nodeElement
                .attr('stroke', '#2ed573')
                .attr('stroke-width', 2)
                .attr('opacity', 0.7);
        }
        
        // Show distance label
        this.showNodeDistance(node);
    }

    showNodeDistance(node) {
        // Remove existing distance label
        this.pathCalculationGroup.selectAll(`.distance-${node.id}`).remove();
        
        if (node.distance !== Infinity) {
            const label = this.pathCalculationGroup.append('text')
                .attr('class', `distance-${node.id}`)
                .attr('x', node.x)
                .attr('y', node.y + (node.type === 'router' ? 50 : node.type === 'switch' ? 45 : 20))
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .attr('fill', '#fff')
                .attr('stroke', '#000')
                .attr('stroke-width', '0.5px')
                .text(`d:${node.distance}`);
        }
    }

    updateNodeDistance(node, distance) {
        node.distance = distance;
        this.showNodeDistance(node);
    }

    highlightLink(link, state) {
        // Only show algorithm visualization when explicitly calculating
        if (this.state !== 'calculating') return;
        
        const linkElement = this.linkElements.filter(d => {
            const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
            const targetId = typeof d.target === 'object' ? d.target.id : d.target;
            const linkSourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const linkTargetId = typeof link.target === 'object' ? link.target.id : link.target;
            return (sourceId === linkSourceId && targetId === linkTargetId) ||
                   (sourceId === linkTargetId && targetId === linkSourceId);
        });
        
        if (state === 'exploring') {
            linkElement
                .attr('stroke', '#ffd700') // Gold for algorithm exploration
                .attr('stroke-width', 5)
                .attr('opacity', 0.8)
                .attr('stroke-dasharray', '5,5'); // Dashed to indicate temporary
        }
    }

    unhighlightLink(link) {
        const linkElement = this.linkElements.filter(d => {
            const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
            const targetId = typeof d.target === 'object' ? d.target.id : d.target;
            const linkSourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const linkTargetId = typeof link.target === 'object' ? link.target.id : link.target;
            return (sourceId === linkSourceId && targetId === linkTargetId) ||
                   (sourceId === linkTargetId && targetId === linkSourceId);
        });
        
        linkElement
            .attr('stroke', d => {
                if (d.status === 'failed') return '#ff4757';
                if (d.status === 'healing') return '#2ed573';
                if (d.ecmp) return '#7b68ee';
                return '#4a9eff';
            })
            .attr('stroke-width', d => {
                // Thicker links in mini view for better visibility
                const multiplier = this.isMiniView ? 1.3 : 1;
                if (d.status === 'healing') return 5 * multiplier;
                if (d.ecmp) return 4 * multiplier;
                if (d.type === 'core') return 3 * multiplier;
                return 2 * multiplier;
            })
            .attr('stroke-opacity', d => {
                if (d.status === 'failed') return 0.3;
                if (d.status === 'healing') return 0.9;
                return d.ecmp ? 0.7 : 0.6;
            })
            .attr('stroke-dasharray', 'none'); // Remove any dashes
    }

    async visualizePath(path) {
        // Highlight the final shortest path
        for (let i = 0; i < path.length - 1; i++) {
            const sourceId = path[i];
            const targetId = path[i + 1];
            
            const link = this.links.find(l => {
                const source = typeof l.source === 'object' ? l.source.id : l.source;
                const target = typeof l.target === 'object' ? l.target.id : l.target;
                return (source === sourceId && target === targetId) ||
                       (source === targetId && target === sourceId);
            });
            
            if (link) {
                const linkElement = this.linkElements.filter(d => {
                    const dSourceId = typeof d.source === 'object' ? d.source.id : d.source;
                    const dTargetId = typeof d.target === 'object' ? d.target.id : d.target;
                    return (dSourceId === sourceId && dTargetId === targetId) ||
                           (dSourceId === targetId && dTargetId === sourceId);
                });
                
                linkElement
                    .attr('stroke', '#27ae60')
                    .attr('stroke-width', 6)
                    .attr('opacity', 1);
                
                await this.sleep(200);
            }
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    findECMPPaths(startNode, endNode) {
        // Find all equal-cost paths (ECMP)
        const paths = [];
        const shortestPath = this.dijkstraShortestPath(startNode, endNode);
        if (!shortestPath) return paths;
        
        const shortestLength = shortestPath.length - 1;
        
        // Find all paths with same length
        const findAllPaths = (current, target, visited, path) => {
            if (current === target.id) {
                if (path.length === shortestLength) {
                    paths.push([...path]);
                }
                return;
            }
            
            if (path.length >= shortestLength) return;
            
            const neighbors = this.links
                .filter(link => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    return (sourceId === current || targetId === current) && link.status !== 'failed';
                })
                .map(link => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    return sourceId === current ? targetId : sourceId;
                });
            
            neighbors.forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    path.push(neighbor);
                    findAllPaths(neighbor, target, visited, path);
                    path.pop();
                    visited.delete(neighbor);
                }
            });
        };
        
        findAllPaths(startNode.id, endNode, new Set([startNode.id]), [startNode.id]);
        return paths;
    }

    startSimulation() {
        this.state = 'normal';
        this.updateStatus('Normal Operation', 'Traffic load-balanced across R-A and R-B', 'ECMP Active');
        this.updateMetrics();
        this.updateTrafficFlow();
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('triggerFailureBtn').disabled = false;
    }

    triggerFailure(failedNode = null) {
        // If no node specified, use Router A as default (for button click)
        let nodeToFail = failedNode;
        if (!nodeToFail) {
            nodeToFail = this.nodes.find(n => n.id === 'R-A');
        }
        
        if (!nodeToFail || nodeToFail.status === 'failed') return;
        
        // Prevent failing both routers - network would be completely disconnected
        if (nodeToFail.type === 'router') {
            const routerA = this.nodes.find(n => n.id === 'R-A');
            const routerB = this.nodes.find(n => n.id === 'R-B');
            const otherRouter = nodeToFail.id === 'R-A' ? routerB : routerA;
            
            if (otherRouter && otherRouter.status === 'failed') {
                // Both routers would be failed - show warning
                this.updateStatus('Cannot Fail Router', 'Both routers cannot be failed simultaneously. Network requires at least one router for routing.', 'Warning');
                this.showNotification('Cannot fail both routers! At least one router is required for network connectivity.', 'warning');
                return;
            }
        }
        
        this.state = 'failure';
        this.failureTime = Date.now();
        nodeToFail.status = 'failed';
        
        // Mark affected links as failed
        this.links.forEach(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            if (sourceId === nodeToFail.id || targetId === nodeToFail.id) {
                link.status = 'failed';
            }
        });
        
        const nodeType = nodeToFail.type === 'router' ? 'Router' : 
                         nodeToFail.type === 'switch' ? 'Switch' :
                         nodeToFail.type === 'ap' ? 'Access Point' : 'Device';
        
        this.updateStatus('Failure Detected', `${nodeType} ${nodeToFail.id} has failed`, 'BFD Monitoring');
        this.renderNetwork();
        this.updateTrafficFlow();
        
        // BFD Fast Detection (0.100s)
        setTimeout(() => {
            this.detectionTime = Date.now();
            this.updateStatus('BFD Detection', 'Failure detected in 0.100s', 'Triggering Dijkstra');
            this.updateMetrics();
            
            // Start healing process
            setTimeout(() => {
                this.healNetwork(nodeToFail);
            }, 400); // Total 0.500s for reroute
        }, 100);
    }

    async healNetwork(failedNode) {
        this.state = 'healing';
        const failedNodeId = failedNode ? failedNode.id : 'R-A';
        
        // Find core devices
        const routerA = this.nodes.find(n => n.id === 'R-A');
        const routerB = this.nodes.find(n => n.id === 'R-B');
        const switchC = this.nodes.find(n => n.id === 'S-C');
        const switchD = this.nodes.find(n => n.id === 'S-D');
        
        // Determine which devices need to find alternative paths
        const devicesNeedingPaths = [];
        
        // If a router failed, switches need to find paths to the OTHER (healthy) router only
        if (failedNode.type === 'router') {
            // Only create paths to the router that is NOT failed
            if (failedNodeId === 'R-A' && routerB && routerB.status !== 'failed') {
                // R-A failed, route through R-B
                if (switchC && switchC.status !== 'failed') {
                    devicesNeedingPaths.push({ from: switchC, to: routerB });
                }
                if (switchD && switchD.status !== 'failed') {
                    devicesNeedingPaths.push({ from: switchD, to: routerB });
                }
            } else if (failedNodeId === 'R-B' && routerA && routerA.status !== 'failed') {
                // R-B failed, route through R-A
                if (switchC && switchC.status !== 'failed') {
                    devicesNeedingPaths.push({ from: switchC, to: routerA });
                }
                if (switchD && switchD.status !== 'failed') {
                    devicesNeedingPaths.push({ from: switchD, to: routerA });
                }
            }
        }
        // If a switch failed, find paths through the other switch
        else if (failedNode.type === 'switch') {
            if (switchC && switchD && routerA && routerB) {
                if (failedNodeId === 'S-C') {
                    // S-D needs paths to routers
                    if (routerA) devicesNeedingPaths.push({ from: switchD, to: routerA });
                    if (routerB) devicesNeedingPaths.push({ from: switchD, to: routerB });
                } else if (failedNodeId === 'S-D') {
                    // S-C needs paths to routers
                    if (routerA) devicesNeedingPaths.push({ from: switchC, to: routerA });
                    if (routerB) devicesNeedingPaths.push({ from: switchC, to: routerB });
                }
            }
        }
        
        // Visualize Dijkstra's algorithm finding new paths
        for (const { from, to } of devicesNeedingPaths) {
            if (from && to) {
                await this.dijkstraShortestPathVisualized(from, to, failedNodeId);
                await this.sleep(500);
            }
        }
        
        // Mark healing paths (paths that bypass the failed node)
        const healingPaths = [];
        this.links.forEach(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            
            // Mark as healing if it's a core link that doesn't involve the failed node
            // Also ensure neither source nor target nodes are failed
            const sourceNode = typeof link.source === 'object' ? link.source : this.nodes.find(n => n.id === sourceId);
            const targetNode = typeof link.target === 'object' ? link.target : this.nodes.find(n => n.id === targetId);
            
            if (link.status !== 'failed' && 
                (link.type === 'core' || link.ecmp) &&
                sourceId !== failedNodeId && targetId !== failedNodeId &&
                sourceNode && sourceNode.status !== 'failed' &&
                targetNode && targetNode.status !== 'failed') {
                // Check if this link is part of an alternative path
                const isAlternativePath = devicesNeedingPaths.some(({ from, to }) => {
                    const fromId = from ? from.id : null;
                    const toId = to ? to.id : null;
                    return (sourceId === fromId || targetId === fromId || 
                            sourceId === toId || targetId === toId);
                });
                
                if (isAlternativePath) {
                    link.status = 'healing';
                    healingPaths.push(link);
                }
            }
        });
        
        this.rerouteTime = Date.now();
        this.packetLoss = 5; // ~5% packet loss during transition
        this.serviceDegradation = 20; // 80% reduction means 20% degradation
        
        const nodeType = failedNode.type === 'router' ? 'Router' : 
                         failedNode.type === 'switch' ? 'Switch' : 'Device';
        this.updateStatus('Network Healing', `Traffic rerouted around ${nodeType} ${failedNodeId}`, 'ECMP Updated');
        this.renderNetwork();
        this.updateTrafficFlow();
        this.updateMetrics();
        
        // Animate healing paths
        this.animateHealingPaths(healingPaths);
    }

    animateHealingPaths(paths) {
        this.linkElements
            .filter(d => d.status === 'healing')
            .transition()
            .duration(500)
            .attr('stroke-width', 6)
            .attr('opacity', 1)
            .transition()
            .duration(500)
            .attr('stroke-width', 5)
            .on('end', () => {
                if (this.state === 'healing') {
                    this.animateHealingPaths(paths);
                }
            });
    }

    updateMetrics() {
        if (this.detectionTime && this.failureTime) {
            const detection = Math.max(0, ((this.detectionTime - this.failureTime))).toFixed(0);
            document.getElementById('detectionTime').textContent = detection;
        }
        
        if (this.rerouteTime && this.failureTime) {
            const reroute = Math.max(0, ((this.rerouteTime - this.failureTime))).toFixed(0);
            document.getElementById('rerouteTime').textContent = reroute;
        }
        
        if (this.packetLoss > 0) {
            document.getElementById('packetLoss').textContent = this.packetLoss.toFixed(1);
        }
        
        if (this.serviceDegradation > 0) {
            document.getElementById('degradation').textContent = this.serviceDegradation.toFixed(1);
        }
    }

    updateStatus(status, phase, algorithmStatus = '--') {
        const statusBadge = document.getElementById('status');
        statusBadge.textContent = status;
        
        // Update badge color based on status
        if (status === 'Ready') {
            statusBadge.className = 'status-badge';
            statusBadge.style.background = '#555';
        } else if (status === 'Normal Operation') {
            statusBadge.className = 'status-badge';
            statusBadge.style.background = '#27ae60';
        } else if (status.includes('Failure') || status.includes('Detected')) {
            statusBadge.className = 'status-badge';
            statusBadge.style.background = '#e74c3c';
        } else if (status.includes('Healing') || status.includes('Calculating')) {
            statusBadge.className = 'status-badge';
            statusBadge.style.background = '#f39c12';
        } else {
            statusBadge.className = 'status-badge';
            statusBadge.style.background = '#3498db';
        }
        
        document.getElementById('phase').textContent = phase;
        document.getElementById('algorithmStatus').textContent = algorithmStatus;
    }

    reset() {
        this.state = 'idle';
        this.failureTime = null;
        this.detectionTime = null;
        this.rerouteTime = null;
        this.packetLoss = 0;
        this.serviceDegradation = 0;
        this.visitedNodes.clear();
        this.currentPath = [];
        
        // Reset all nodes and links
        this.nodes.forEach(node => {
            node.status = 'normal';
            node.distance = Infinity;
            node.previous = null;
        });
        
        this.links.forEach(link => {
            link.status = 'normal';
        });
        
        // Clear algorithm visualization
        if (this.pathCalculationGroup) {
            this.pathCalculationGroup.selectAll('*').remove();
        }
        
        this.updateStatus('Ready', '--', '--');
        document.getElementById('detectionTime').textContent = '--';
        document.getElementById('rerouteTime').textContent = '--';
        document.getElementById('packetLoss').textContent = '--';
        document.getElementById('degradation').textContent = '--';
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('triggerFailureBtn').disabled = true;
        
        // Reinitialize network based on current view mode
        if (this.isMiniView) {
            this.initializeMiniNetwork();
        } else {
            this.initializeNetwork();
        }
        this.updateTrafficFlow();
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.startSimulation();
        });
        document.getElementById('triggerFailureBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.triggerFailure();
        });
        document.getElementById('resetBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.reset();
        });
        document.getElementById('toggleViewBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleView();
        });
        
        // Scenario modal handlers
        const scenarioBtn = document.getElementById('scenarioBtn');
        const scenarioModal = document.getElementById('scenarioModal');
        const closeScenarioModal = document.getElementById('closeScenarioModal');
        
        if (scenarioBtn && scenarioModal) {
            scenarioBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                scenarioModal.classList.add('show');
            });
        }
        
        if (closeScenarioModal && scenarioModal) {
            closeScenarioModal.addEventListener('click', (e) => {
                e.stopPropagation();
                scenarioModal.classList.remove('show');
            });
        }
        
        // Close modal when clicking outside
        if (scenarioModal) {
            scenarioModal.addEventListener('click', (e) => {
                if (e.target === scenarioModal) {
                    scenarioModal.classList.remove('show');
                }
            });
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && scenarioModal && scenarioModal.classList.contains('show')) {
                scenarioModal.classList.remove('show');
            }
        });
    }

    showNotification(message, type = 'info') {
        const toast = document.getElementById('notificationToast');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');
        
        if (!toast || !toastMessage || !toastIcon) return;
        
        // Set icon based on type
        const icons = {
            'warning': '⚠️',
            'error': '❌',
            'success': '✅',
            'info': 'ℹ️'
        };
        
        toastIcon.textContent = icons[type] || icons.info;
        toastMessage.textContent = message;
        
        // Remove any existing type classes
        toast.className = 'toast';
        // Add type class and show
        toast.classList.add(`toast-${type}`, 'show');
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    toggleView() {
        this.isMiniView = !this.isMiniView;
        
        // Reset zoom
        this.transform = d3.zoomIdentity;
        this.svg.call(this.zoom.transform, d3.zoomIdentity);
        
        // Reset state
        this.state = 'idle';
        this.failureTime = null;
        this.detectionTime = null;
        this.rerouteTime = null;
        this.packetLoss = 0;
        this.serviceDegradation = 0;
        this.visitedNodes.clear();
        this.currentPath = [];
        
        // Reset all nodes and links
        this.nodes.forEach(node => {
            node.status = 'normal';
            node.distance = Infinity;
            node.previous = null;
        });
        
        this.links.forEach(link => {
            link.status = 'normal';
        });
        
        // Initialize appropriate network
        if (this.isMiniView) {
            this.initializeMiniNetwork();
        } else {
            this.initializeNetwork();
        }
        
        // Update UI
        document.getElementById('viewModeText').textContent = this.isMiniView ? 'Switch to Full View' : 'Switch to Mini View';
        document.getElementById('startBtn').disabled = false;
        document.getElementById('triggerFailureBtn').disabled = true;
        this.updateStatus('Ready', '--', '--');
        document.getElementById('detectionTime').textContent = '--';
        document.getElementById('rerouteTime').textContent = '--';
        document.getElementById('packetLoss').textContent = '--';
        document.getElementById('degradation').textContent = '--';
    }
}


// Initialize simulation when page loads
let simulation;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    console.log('Main canvas exists:', !!document.getElementById('networkCanvas'));
    console.log('D3 available:', typeof d3 !== 'undefined');
    
    if (typeof d3 === 'undefined') {
        console.log('Loading D3.js...');
        const script = document.createElement('script');
        script.src = 'https://d3js.org/d3.v7.min.js';
        script.onload = () => {
            console.log('D3.js loaded, initializing simulation...');
            try {
                simulation = new NetworkSimulation();
                console.log('Simulation initialized successfully');
            } catch (error) {
                console.error('Error initializing simulation:', error);
            }
        };
        script.onerror = () => {
            console.error('Failed to load D3.js');
        };
        document.head.appendChild(script);
    } else {
        console.log('D3.js already available, initializing simulation...');
        try {
            simulation = new NetworkSimulation();
            console.log('Simulation initialized successfully');
        } catch (error) {
            console.error('Error initializing simulation:', error);
        }
    }
});
