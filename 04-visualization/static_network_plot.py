"""
LESSON 5: Visualizing Networks

Visualization helps understand network structure and debug issues.

This example teaches:
- Plotting graphs with matplotlib
- Custom layouts
- Node and edge styling
"""

import networkx as nx
import matplotlib.pyplot as plt
import random

# Create a sample mesh network
random.seed(42)
G = nx.Graph()

# Add nodes and random connections
nodes = [f"N{i}" for i in range(10)]
G.add_nodes_from(nodes)

# Create a connected mesh
for i in range(10):
    # Ensure connectivity
    if i > 0:
        G.add_edge(nodes[i], nodes[random.randint(0, i-1)], weight=random.randint(5, 30))
    
    # Add extra random edges
    for _ in range(random.randint(1, 2)):
        other = random.choice(nodes)
        if other != nodes[i]:
            G.add_edge(nodes[i], other, weight=random.randint(5, 30))

print("=" * 60)
print("NETWORK VISUALIZATION")
print("=" * 60)
print(f"Creating visualization with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges")

# Create figure with multiple subplots
fig, axes = plt.subplots(2, 2, figsize=(14, 12))
fig.suptitle('Mesh Network - Different Layouts', fontsize=16, fontweight='bold')

# 1. Spring layout (force-directed)
ax1 = axes[0, 0]
pos1 = nx.spring_layout(G, seed=42, k=0.5, iterations=50)
nx.draw_networkx_nodes(G, pos1, node_color='lightblue', node_size=700, ax=ax1)
nx.draw_networkx_labels(G, pos1, font_size=10, font_weight='bold', ax=ax1)
nx.draw_networkx_edges(G, pos1, edge_color='gray', width=2, ax=ax1)
ax1.set_title('Spring Layout (Force-Directed)')
ax1.axis('off')

# 2. Circular layout
ax2 = axes[0, 1]
pos2 = nx.circular_layout(G)
nx.draw_networkx_nodes(G, pos2, node_color='lightgreen', node_size=700, ax=ax2)
nx.draw_networkx_labels(G, pos2, font_size=10, font_weight='bold', ax=ax2)
nx.draw_networkx_edges(G, pos2, edge_color='gray', width=2, ax=ax2)
ax2.set_title('Circular Layout')
ax2.axis('off')

# 3. Color nodes by degree (number of connections)
ax3 = axes[1, 0]
pos3 = nx.spring_layout(G, seed=42, k=0.5, iterations=50)
node_degrees = dict(G.degree())
node_colors = [node_degrees[node] for node in G.nodes()]
nodes_drawn = nx.draw_networkx_nodes(G, pos3, node_color=node_colors, 
                                      node_size=700, cmap='YlOrRd', ax=ax3)
nx.draw_networkx_labels(G, pos3, font_size=10, font_weight='bold', ax=ax3)
nx.draw_networkx_edges(G, pos3, edge_color='gray', width=2, ax=ax3)
plt.colorbar(nodes_drawn, ax=ax3, label='Node Degree')
ax3.set_title('Colored by Degree (Connectivity)')
ax3.axis('off')

# 4. Show edge weights (latencies)
ax4 = axes[1, 1]
pos4 = nx.spring_layout(G, seed=42, k=0.5, iterations=50)
nx.draw_networkx_nodes(G, pos4, node_color='lightyellow', node_size=700, ax=ax4)
nx.draw_networkx_labels(G, pos4, font_size=10, font_weight='bold', ax=ax4)
nx.draw_networkx_edges(G, pos4, edge_color='gray', width=2, ax=ax4)

# Draw edge labels
edge_labels = nx.get_edge_attributes(G, 'weight')
nx.draw_networkx_edge_labels(G, pos4, edge_labels, font_size=8, ax=ax4)
ax4.set_title('With Edge Weights (Latency in ms)')
ax4.axis('off')

plt.tight_layout()

# Save to file
output_file = '/Users/dally/automesh-learning/04-visualization/network_plot.png'
plt.savefig(output_file, dpi=150, bbox_inches='tight')
print(f"\n✅ Visualization saved to: {output_file}")
print("\n💡 Opening plot window... (close it to continue)")

plt.show()

print("\n" + "=" * 60)
print("VISUALIZATION TIPS:")
print("=" * 60)
print("- Spring layout: Good for showing clusters")
print("- Circular layout: Good for seeing symmetry")
print("- Color coding: Reveals patterns (high/low degree nodes)")
print("- Edge labels: Show costs/latencies")

print("\n" + "=" * 60)
print("EXPERIMENTS:")
print("=" * 60)
print("- Try nx.kamada_kawai_layout() for another layout")
print("- Change node sizes based on betweenness centrality")
print("- Make edge thickness proportional to weight")
print("- Highlight the shortest path between two nodes")
