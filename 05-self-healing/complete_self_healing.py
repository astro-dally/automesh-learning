"""
LESSON 6: Self-Healing Networks - Putting It All Together

A self-healing network automatically reroutes traffic when failures occur.

This example teaches:
- Detecting failures
- Finding alternate paths
- Rerouting automatically
- Recovery metrics
"""

import networkx as nx
import random

class SelfHealingNetwork:
    """A mesh network that can heal itself when failures occur."""
    
    def __init__(self, num_nodes, target_degree=3):
        """Create a mesh network."""
        self.G = nx.Graph()
        self.failed_nodes = set()
        self.failed_edges = set()
        self.backup_G = None  # Store original for recovery
        
        # Generate random mesh
        random.seed(42)
        nodes = [f"Node{i}" for i in range(num_nodes)]
        self.G.add_nodes_from(nodes)
        
        # Build connected mesh
        for i in range(1, num_nodes):
            prev = random.randint(0, i-1)
            latency = random.randint(5, 30)
            self.G.add_edge(nodes[prev], nodes[i], weight=latency)
        
        # Add extra edges
        max_edges = (num_nodes * target_degree) // 2
        attempts = 0
        while self.G.number_of_edges() < max_edges and attempts < num_nodes * 10:
            n1 = random.choice(nodes)
            n2 = random.choice(nodes)
            if n1 != n2 and not self.G.has_edge(n1, n2):
                self.G.add_edge(n1, n2, weight=random.randint(5, 30))
            attempts += 1
        
        # Backup original topology
        self.backup_G = self.G.copy()
    
    def find_route(self, source, target):
        """Find a route between two nodes."""
        try:
            path = nx.shortest_path(self.G, source=source, target=target, weight='weight')
            length = nx.shortest_path_length(self.G, source=source, target=target, weight='weight')
            return path, length
        except nx.NetworkXNoPath:
            return None, float('inf')
    
    def simulate_node_failure(self, node):
        """Simulate a node going offline."""
        if node in self.G.nodes():
            self.failed_nodes.add(node)
            self.G.remove_node(node)
            return True
        return False
    
    def simulate_link_failure(self, node1, node2):
        """Simulate a link breaking."""
        if self.G.has_edge(node1, node2):
            self.failed_edges.add((node1, node2))
            self.G.remove_edge(node1, node2)
            return True
        return False
    
    def get_network_health(self):
        """Calculate network health metrics."""
        total_nodes = self.backup_G.number_of_nodes()
        active_nodes = self.G.number_of_nodes()
        
        # Check if network is still connected
        if active_nodes > 0:
            is_connected = nx.is_connected(self.G)
            # Number of isolated components
            num_components = nx.number_connected_components(self.G)
        else:
            is_connected = False
            num_components = 0
        
        return {
            'active_nodes': active_nodes,
            'total_nodes': total_nodes,
            'active_percentage': (active_nodes / total_nodes) * 100,
            'is_connected': is_connected,
            'num_components': num_components,
            'failed_nodes': len(self.failed_nodes),
            'failed_links': len(self.failed_edges)
        }

# Demo: Self-healing in action
print("=" * 70)
print("SELF-HEALING MESH NETWORK SIMULATION")
print("=" * 70)

# Create network
network = SelfHealingNetwork(num_nodes=12, target_degree=4)

print(f"\n📊 Initial Network State:")
health = network.get_network_health()
print(f"   Nodes: {health['active_nodes']}")
print(f"   Edges: {network.G.number_of_edges()}")
print(f"   Connected: {health['is_connected']}")
print(f"   Average degree: {sum(dict(network.G.degree()).values()) / health['active_nodes']:.2f}")

# Test routing before failures
source = "Node0"
target = "Node11"

print(f"\n🎯 Testing route: {source} → {target}")
path, latency = network.find_route(source, target)
print(f"   Path: {' → '.join(path)}")
print(f"   Total latency: {latency}ms")

# Simulate failures
print("\n" + "=" * 70)
print("⚠️  SIMULATING FAILURES")
print("=" * 70)

failures = [
    ("link", "Node2", "Node5"),
    ("node", "Node7", None),
    ("link", "Node1", "Node3"),
]

for failure_type, entity1, entity2 in failures:
    if failure_type == "node":
        success = network.simulate_node_failure(entity1)
        if success:
            print(f"\n❌ Node {entity1} failed!")
    else:
        success = network.simulate_link_failure(entity1, entity2)
        if success:
            print(f"\n❌ Link {entity1} ↔ {entity2} failed!")
    
    # Check health after each failure
    health = network.get_network_health()
    print(f"   Network status: {'✅ Still connected' if health['is_connected'] else '🔴 DISCONNECTED'}")
    print(f"   Active nodes: {health['active_nodes']}/{health['total_nodes']}")

# Test self-healing: Does routing still work?
print("\n" + "=" * 70)
print("🔄 SELF-HEALING: Finding alternate route")
print("=" * 70)

path, latency = network.find_route(source, target)
if path:
    print(f"✅ New route found: {' → '.join(path)}")
    print(f"   Total latency: {latency}ms")
    print(f"   Hops: {len(path) - 1}")
    print("\n   🎉 Network successfully healed itself!")
else:
    print(f"❌ No route available from {source} to {target}")
    print(f"   Network is fragmented into {health['num_components']} isolated components")

# Show all available paths for redundancy analysis
print("\n" + "=" * 70)
print("🔀 REDUNDANCY ANALYSIS")
print("=" * 70)

if path:
    try:
        all_paths = list(nx.all_simple_paths(network.G, source=source, target=target))
        print(f"✅ Found {len(all_paths)} alternate path(s):")
        for i, p in enumerate(all_paths[:3], 1):  # Show first 3
            cost = sum(network.G[p[j]][p[j+1]]['weight'] for j in range(len(p)-1))
            print(f"   Path {i}: {' → '.join(p)} ({cost}ms)")
    except:
        print("   Only one path available (no redundancy)")

print("\n" + "=" * 70)
print("KEY TAKEAWAYS:")
print("=" * 70)
print("✓ Mesh networks survive failures through redundancy")
print("✓ Multiple paths provide automatic failover")
print("✓ Routing algorithms find alternate paths dynamically")
print("✓ Network health metrics track resilience")

print("\n" + "=" * 70)
print("EXPERIMENTS:")
print("=" * 70)
print("- Fail more nodes until network disconnects")
print("- Compare latency before/after failures")
print("- Test with different target_degree values")
print("- Implement automatic node recovery")
