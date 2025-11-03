"""
LESSON 4: Dijkstra's Algorithm - Finding Shortest Paths

Dijkstra's algorithm finds the shortest path between nodes.
In networks: shortest = lowest latency route for data packets.

This example teaches:
- How routing works
- Finding optimal paths
- Path cost calculation
"""

import networkx as nx

# Create a sample mesh network
G = nx.Graph()

# Add nodes and edges with latencies
edges = [
    ("A", "B", 4),
    ("A", "C", 2),
    ("B", "C", 1),
    ("B", "D", 5),
    ("C", "D", 8),
    ("C", "E", 10),
    ("D", "E", 2),
    ("D", "F", 6),
    ("E", "F", 3),
]

for node1, node2, latency in edges:
    G.add_edge(node1, node2, weight=latency)

print("=" * 60)
print("NETWORK ROUTING WITH DIJKSTRA'S ALGORITHM")
print("=" * 60)

print("\n📡 Network topology:")
for node1, node2, data in G.edges(data=True):
    print(f"   {node1} ↔ {node2} (latency: {data['weight']}ms)")

# Find shortest path between two nodes
source = "A"
target = "F"

print(f"\n🎯 Finding shortest path from {source} to {target}...")

# Dijkstra's algorithm (NetworkX does this for us)
path = nx.shortest_path(G, source=source, target=target, weight='weight')
path_length = nx.shortest_path_length(G, source=source, target=target, weight='weight')

print(f"\n✅ Shortest path: {' → '.join(path)}")
print(f"   Total latency: {path_length}ms")

# Show the route hop by hop
print("\n📊 Hop-by-hop breakdown:")
for i in range(len(path) - 1):
    node1 = path[i]
    node2 = path[i + 1]
    latency = G[node1][node2]['weight']
    print(f"   Hop {i+1}: {node1} → {node2} ({latency}ms)")

# Find all shortest paths from source to every other node
print(f"\n🌐 All shortest paths from {source}:")
for target_node in G.nodes():
    if target_node != source:
        try:
            path = nx.shortest_path(G, source=source, target=target_node, weight='weight')
            length = nx.shortest_path_length(G, source=source, target=target_node, weight='weight')
            print(f"   To {target_node}: {' → '.join(path)} ({length}ms)")
        except nx.NetworkXNoPath:
            print(f"   To {target_node}: No path exists!")

# Check if multiple paths exist
print(f"\n🔀 Alternative paths from A to F:")
all_paths = list(nx.all_simple_paths(G, source="A", target="F"))
print(f"   Found {len(all_paths)} possible paths:")
for i, path in enumerate(all_paths, 1):
    # Calculate total cost manually
    cost = sum(G[path[j]][path[j+1]]['weight'] for j in range(len(path)-1))
    print(f"   Path {i}: {' → '.join(path)} (total: {cost}ms)")

print("\n" + "=" * 60)
print("WHY THIS MATTERS FOR AUTOMESH:")
print("=" * 60)
print("- When a link fails, we need alternate paths")
print("- Lower latency = better user experience")
print("- Multiple paths = redundancy and load balancing")

print("\n" + "=" * 60)
print("EXPERIMENTS:")
print("=" * 60)
print("- Remove edge (B,C) and recalculate shortest path")
print("- Add new edges and see if paths improve")
print("- Find paths with maximum latency constraint")
print("- Calculate average path length in the network")
