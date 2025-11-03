"""
LESSON 1: Understanding Graphs - The Foundation of Networks

A graph is a collection of nodes (vertices) connected by edges (links).
In our mesh network:
- Nodes = routers/devices
- Edges = connections between them

This example teaches:
- Creating graphs
- Adding nodes and edges
- Basic graph properties
"""

import networkx as nx

# Create an empty graph
G = nx.Graph()

print("=" * 50)
print("BASIC GRAPH OPERATIONS")
print("=" * 50)

# Add individual nodes
G.add_node("Router1")
G.add_node("Router2")
G.add_node("Router3")

# Or add multiple nodes at once
G.add_nodes_from(["Router4", "Router5"])

print(f"\n1. Nodes in network: {list(G.nodes())}")
print(f"   Total nodes: {G.number_of_nodes()}")

# Add edges (connections between routers)
# Format: (node1, node2, optional_attributes)
G.add_edge("Router1", "Router2", weight=10)  # weight = latency in ms
G.add_edge("Router2", "Router3", weight=15)
G.add_edge("Router3", "Router4", weight=20)
G.add_edge("Router1", "Router5", weight=12)

print(f"\n2. Edges (connections): {list(G.edges())}")
print(f"   Total edges: {G.number_of_edges()}")

# Check if specific connection exists
print(f"\n3. Is Router1 connected to Router2? {G.has_edge('Router1', 'Router2')}")
print(f"   Is Router1 connected to Router3? {G.has_edge('Router1', 'Router3')}")

# Get neighbors (directly connected nodes)
neighbors = list(G.neighbors("Router1"))
print(f"\n4. Router1's direct neighbors: {neighbors}")

# Node degree = number of connections
print(f"\n5. Connection count per router:")
for node in G.nodes():
    degree = G.degree(node)
    print(f"   {node}: {degree} connections")

# Get edge attributes (like latency)
latency = G.edges["Router1", "Router2"]["weight"]
print(f"\n6. Latency between Router1 and Router2: {latency}ms")

# Check if graph is connected (all nodes reachable)
is_connected = nx.is_connected(G)
print(f"\n7. Is the entire network connected? {is_connected}")

print("\n" + "=" * 50)
print("EXPERIMENT IDEAS:")
print("=" * 50)
print("- Try adding more routers and connections")
print("- Remove an edge with G.remove_edge() and check connectivity")
print("- Add different attributes like 'bandwidth' or 'cost'")
print("- Create a disconnected network and observe the difference")
