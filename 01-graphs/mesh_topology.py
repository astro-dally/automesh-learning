"""
LESSON 2: Creating Mesh Network Topologies

A mesh network ensures multiple paths between nodes for redundancy.
Key concept: Every node connects to several (but not all) neighbors.

This example teaches:
- Random mesh generation
- Controlling node degree (max connections per node)
- Ensuring network connectivity
"""

import networkx as nx
import random

def create_mesh_network(num_nodes, target_degree=3, seed=42):
    """
    Create a random mesh network with controlled connectivity.
    
    Args:
        num_nodes: Number of routers in the network
        target_degree: Desired connections per node (on average)
        seed: Random seed for reproducibility
    
    Returns:
        NetworkX graph representing the mesh
    """
    random.seed(seed)
    G = nx.Graph()
    
    # Add all nodes
    nodes = [f"Node{i}" for i in range(num_nodes)]
    G.add_nodes_from(nodes)
    
    # Start with a connected base (spanning tree)
    # This guarantees the network won't be disconnected
    for i in range(1, num_nodes):
        # Connect each node to a random previous node
        prev_node = random.randint(0, i-1)
        latency = random.randint(5, 30)  # Random latency 5-30ms
        G.add_edge(nodes[prev_node], nodes[i], weight=latency)
    
    # Add extra edges to reach target degree
    max_edges = (num_nodes * target_degree) // 2
    attempts = 0
    max_attempts = num_nodes * num_nodes
    
    while G.number_of_edges() < max_edges and attempts < max_attempts:
        # Pick two random nodes
        node1 = random.choice(nodes)
        node2 = random.choice(nodes)
        
        # Don't connect a node to itself or create duplicate edges
        if node1 != node2 and not G.has_edge(node1, node2):
            latency = random.randint(5, 30)
            G.add_edge(node1, node2, weight=latency)
        
        attempts += 1
    
    return G

# Create a mesh network
print("=" * 60)
print("MESH NETWORK GENERATION")
print("=" * 60)

mesh = create_mesh_network(num_nodes=8, target_degree=3)

print(f"\n📊 Network Statistics:")
print(f"   Nodes: {mesh.number_of_nodes()}")
print(f"   Edges: {mesh.number_of_edges()}")
print(f"   Average degree: {sum(dict(mesh.degree()).values()) / mesh.number_of_nodes():.2f}")
print(f"   Connected: {nx.is_connected(mesh)}")

print(f"\n🔗 Degree distribution:")
degree_dict = dict(mesh.degree())
for node, degree in sorted(degree_dict.items()):
    bar = "█" * degree
    print(f"   {node}: {bar} ({degree})")

print(f"\n🌐 Sample connections:")
for i, (node1, node2, data) in enumerate(list(mesh.edges(data=True))[:5]):
    print(f"   {node1} ↔ {node2} (latency: {data['weight']}ms)")
print(f"   ... and {mesh.number_of_edges() - 5} more")

# Calculate network diameter (longest shortest path)
diameter = nx.diameter(mesh)
print(f"\n📏 Network diameter: {diameter} hops")
print(f"   (Maximum distance between any two nodes)")

print("\n" + "=" * 60)
print("THINGS TO TRY:")
print("=" * 60)
print("1. Change num_nodes to 15 or 20")
print("2. Increase target_degree to 5 (more redundant)")
print("3. Decrease target_degree to 2 (less redundant)")
print("4. Remove random edges and check if still connected")
print("5. Calculate average path length between all node pairs")
