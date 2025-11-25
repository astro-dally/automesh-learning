"""
LESSON 7: Building Custom Mesh Networks - Full Control

Now that you understand the basics, let's build MESH NETWORKS YOUR way!
This tutorial teaches you how to:
- Create mesh network topologies (redundant, self-healing)
- Add nodes with custom names
- Add custom links between nodes (ensuring mesh connectivity)
- Set custom properties (latency, bandwidth, etc.)
- Verify mesh network properties (redundancy, connectivity)
- Visualize your custom mesh network
- Test routing on your custom topology

MESH NETWORK CHARACTERISTICS:
- Multiple paths between any two nodes (redundancy)
- High fault tolerance (self-healing capability)
- Each node connected to multiple neighbors
- No single point of failure

This is the foundation for building self-healing mesh networks!

💡 INTERACTIVE WEB INTERFACE:
   For a visual, interactive way to build mesh networks, open:
   interactive_custom_network.html in your web browser!
   It provides a user-friendly interface with drag-and-drop nodes,
   real-time visualization, and route testing.
"""

import networkx as nx
import matplotlib.pyplot as plt
from typing import List, Tuple, Optional, Dict

class CustomNetworkBuilder:
    """
    A tool for building custom MESH networks with full control.
    
    Mesh networks are characterized by:
    - Multiple redundant paths between nodes
    - High fault tolerance (self-healing)
    - Each node connected to multiple neighbors
    - No single point of failure
    
    Use this to:
    - Design mesh network topologies
    - Model real-world mesh network scenarios
    - Test self-healing capabilities
    - Test routing on custom mesh configurations
    """
    
    def __init__(self):
        """Initialize an empty mesh network."""
        self.G = nx.Graph()
        print("✅ Created new empty mesh network")
    
    def add_node(self, node_name: str, **attributes):
        """
        Add a single node to the network.
        
        Args:
            node_name: Unique name for the node (e.g., "Router1", "Server-A")
            **attributes: Optional properties like location, type, etc.
        
        Example:
            builder.add_node("Router1", location="Building-A", type="core")
            builder.add_node("Server1", location="DataCenter", cpu_cores=8)
        """
        if node_name in self.G.nodes():
            print(f"⚠️  Node '{node_name}' already exists. Updating attributes...")
        
        self.G.add_node(node_name, **attributes)
        print(f"✅ Added node: {node_name}")
    
    def add_nodes(self, node_names: List[str], **common_attributes):
        """
        Add multiple nodes at once.
        
        Args:
            node_names: List of node names to add
            **common_attributes: Attributes applied to all nodes
        
        Example:
            builder.add_nodes(["Router1", "Router2", "Router3"], type="router")
        """
        for name in node_names:
            attrs = common_attributes.copy()
            self.G.add_node(name, **attrs)
        print(f"✅ Added {len(node_names)} nodes: {', '.join(node_names)}")
    
    def add_link(self, node1: str, node2: str, latency: float = 10.0, 
                 bandwidth: Optional[float] = None, **attributes):
        """
        Add a link (edge) between two nodes.
        
        For mesh networks, ensure each node has at least 2 connections
        to maintain redundancy and self-healing capability.
        
        Args:
            node1: First node name
            node2: Second node name
            latency: Link latency in milliseconds (used for routing)
            bandwidth: Optional bandwidth in Mbps
            **attributes: Other link properties
        
        Example:
            builder.add_link("Router1", "Router2", latency=15.5, bandwidth=1000)
        """
        # Check if nodes exist
        if node1 not in self.G.nodes():
            print(f"⚠️  Node '{node1}' doesn't exist. Creating it...")
            self.G.add_node(node1)
        
        if node2 not in self.G.nodes():
            print(f"⚠️  Node '{node2}' doesn't exist. Creating it...")
            self.G.add_node(node2)
        
        # Check if link already exists
        if self.G.has_edge(node1, node2):
            print(f"⚠️  Link '{node1}' ↔ '{node2}' already exists. Updating...")
        
        # Add edge with attributes
        edge_attrs = {'weight': latency, **attributes}
        if bandwidth is not None:
            edge_attrs['bandwidth'] = bandwidth
        
        self.G.add_edge(node1, node2, **edge_attrs)
        print(f"✅ Added link: {node1} ↔ {node2} (latency: {latency}ms)")
        
        # Mesh network validation warning
        if self.G.number_of_nodes() > 1:
            degrees = dict(self.G.degree())
            if degrees.get(node1, 0) < 2 or degrees.get(node2, 0) < 2:
                print(f"   💡 Tip: For mesh networks, ensure nodes have at least 2 connections for redundancy")
    
    def add_links(self, links: List[Tuple[str, str, Dict]]):
        """
        Add multiple links at once.
        
        Args:
            links: List of tuples (node1, node2, attributes_dict)
        
        Example:
            links = [
                ("A", "B", {"latency": 10, "bandwidth": 1000}),
                ("B", "C", {"latency": 15, "bandwidth": 500}),
            ]
            builder.add_links(links)
        """
        for link in links:
            if len(link) == 2:
                node1, node2 = link
                self.add_link(node1, node2)
            elif len(link) == 3:
                node1, node2, attrs = link
                latency = attrs.pop('latency', 10.0)
                bandwidth = attrs.pop('bandwidth', None)
                self.add_link(node1, node2, latency=latency, bandwidth=bandwidth, **attrs)
    
    def remove_node(self, node_name: str):
        """Remove a node and all its connections."""
        if node_name in self.G.nodes():
            self.G.remove_node(node_name)
            print(f"✅ Removed node: {node_name}")
        else:
            print(f"⚠️  Node '{node_name}' doesn't exist")
    
    def remove_link(self, node1: str, node2: str):
        """
        Remove a link between two nodes.
        
        Warning: Removing links may reduce mesh redundancy and self-healing capability.
        """
        if self.G.has_edge(node1, node2):
            self.G.remove_edge(node1, node2)
            print(f"✅ Removed link: {node1} ↔ {node2}")
            
            # Check mesh integrity after removal
            degrees = dict(self.G.degree())
            if degrees.get(node1, 0) < 2 or degrees.get(node2, 0) < 2:
                print(f"⚠️  Warning: Node(s) now have < 2 connections. Mesh redundancy reduced!")
            if not nx.is_connected(self.G):
                print(f"⚠️  Warning: Network is now disconnected! Mesh network integrity lost!")
        else:
            print(f"⚠️  Link '{node1}' ↔ '{node2}' doesn't exist")
    
    def create_full_mesh(self, node_names: List[str], latency: float = 10.0, 
                        bandwidth: Optional[float] = None):
        """
        Create a full mesh network where every node connects to every other node.
        
        This provides maximum redundancy and self-healing capability.
        
        Args:
            node_names: List of node names
            latency: Default latency for all links
            bandwidth: Optional bandwidth for all links
        
        Example:
            builder.create_full_mesh(["A", "B", "C", "D"], latency=10.0, bandwidth=1000)
        """
        self.G.clear()
        
        # Add all nodes
        for name in node_names:
            self.G.add_node(name)
        
        # Connect every node to every other node
        for i, node1 in enumerate(node_names):
            for node2 in node_names[i+1:]:
                edge_attrs = {'weight': latency}
                if bandwidth is not None:
                    edge_attrs['bandwidth'] = bandwidth
                self.G.add_edge(node1, node2, **edge_attrs)
        
        print(f"✅ Created full mesh network with {len(node_names)} nodes")
        print(f"   Total links: {self.G.number_of_edges()}")
        print(f"   Each node has {len(node_names) - 1} connections")
    
    def create_partial_mesh(self, node_names: List[str], min_degree: int = 2,
                           latency: float = 10.0, bandwidth: Optional[float] = None):
        """
        Create a partial mesh network ensuring minimum degree for each node.
        
        This creates a mesh with controlled redundancy - each node has at least
        min_degree connections, providing self-healing capability.
        
        Args:
            node_names: List of node names
            min_degree: Minimum number of connections per node (default: 2)
            latency: Default latency for links
            bandwidth: Optional bandwidth for links
        
        Example:
            builder.create_partial_mesh(["A", "B", "C", "D", "E"], min_degree=3)
        """
        self.G.clear()
        
        if len(node_names) < min_degree + 1:
            print(f"⚠️  Need at least {min_degree + 1} nodes for min_degree={min_degree}")
            return
        
        # Add all nodes
        for name in node_names:
            self.G.add_node(name)
        
        # Create a ring first (ensures connectivity)
        for i in range(len(node_names)):
            node1 = node_names[i]
            node2 = node_names[(i + 1) % len(node_names)]
            edge_attrs = {'weight': latency}
            if bandwidth is not None:
                edge_attrs['bandwidth'] = bandwidth
            self.G.add_edge(node1, node2, **edge_attrs)
        
        # Add additional connections to meet min_degree requirement
        degrees = dict(self.G.degree())
        for i, node1 in enumerate(node_names):
            while degrees[node1] < min_degree:
                # Find a node that needs more connections and isn't already connected
                candidates = [n for n in node_names 
                             if n != node1 and not self.G.has_edge(node1, n) 
                             and degrees.get(n, 0) < min_degree]
                
                if not candidates:
                    # If no candidates, connect to any unconnected node
                    candidates = [n for n in node_names 
                                 if n != node1 and not self.G.has_edge(node1, n)]
                
                if candidates:
                    node2 = candidates[0]
                    edge_attrs = {'weight': latency}
                    if bandwidth is not None:
                        edge_attrs['bandwidth'] = bandwidth
                    self.G.add_edge(node1, node2, **edge_attrs)
                    degrees[node1] += 1
                    degrees[node2] += 1
                else:
                    break
        
        print(f"✅ Created partial mesh network with {len(node_names)} nodes")
        print(f"   Total links: {self.G.number_of_edges()}")
        print(f"   Minimum degree: {min(dict(self.G.degree()).values())}")
        print(f"   Average degree: {sum(dict(self.G.degree()).values()) / len(node_names):.2f}")
    
    def is_mesh_network(self, min_degree: int = 2) -> bool:
        """
        Check if the network is a proper mesh network.
        
        A mesh network requires:
        - All nodes have at least min_degree connections
        - Network is connected
        - Multiple paths exist between nodes (redundancy)
        
        Args:
            min_degree: Minimum number of connections per node (default: 2)
        
        Returns:
            True if it's a valid mesh network, False otherwise
        """
        if self.G.number_of_nodes() == 0:
            return False
        
        # Check connectivity
        if not nx.is_connected(self.G):
            return False
        
        # Check minimum degree
        degrees = dict(self.G.degree())
        if any(degree < min_degree for degree in degrees.values()):
            return False
        
        # Check redundancy: ensure multiple paths exist
        # For a mesh, we want at least 2 edge-disjoint paths between most nodes
        nodes_list = list(self.G.nodes())
        if len(nodes_list) < 3:
            return True  # Small networks are trivially mesh
        
        # Sample check: verify redundancy between several node pairs
        sample_pairs = []
        for i in range(min(5, len(nodes_list))):
            for j in range(i+1, min(i+3, len(nodes_list))):
                if j < len(nodes_list):
                    sample_pairs.append((nodes_list[i], nodes_list[j]))
        
        redundant_paths = 0
        for source, target in sample_pairs[:5]:  # Check up to 5 pairs
            try:
                # Count number of simple paths
                paths = list(nx.all_simple_paths(self.G, source, target, cutoff=len(nodes_list)))
                if len(paths) >= 2:  # At least 2 different paths
                    redundant_paths += 1
            except:
                pass
        
        # At least 60% of checked pairs should have redundancy
        return redundant_paths >= max(1, len(sample_pairs) * 0.6) if sample_pairs else True
    
    def get_mesh_metrics(self) -> Dict:
        """
        Calculate mesh network specific metrics.
        
        Returns:
            Dictionary with mesh network metrics
        """
        metrics = {
            'is_mesh': False,
            'is_connected': False,
            'min_degree': 0,
            'avg_degree': 0.0,
            'redundancy_ratio': 0.0,
            'diameter': 0,
            'average_path_length': 0.0,
            'node_fault_tolerance': 0
        }
        
        if self.G.number_of_nodes() == 0:
            return metrics
        
        metrics['is_connected'] = nx.is_connected(self.G)
        metrics['is_mesh'] = self.is_mesh_network()
        
        degrees = dict(self.G.degree())
        if degrees:
            metrics['min_degree'] = min(degrees.values())
            metrics['avg_degree'] = sum(degrees.values()) / len(degrees)
        
        if metrics['is_connected']:
            metrics['diameter'] = nx.diameter(self.G)
            metrics['average_path_length'] = nx.average_shortest_path_length(self.G)
            
            # Calculate redundancy ratio (average paths between nodes)
            nodes_list = list(self.G.nodes())
            total_paths = 0
            checked_pairs = 0
            
            for i in range(min(10, len(nodes_list))):
                for j in range(i+1, min(i+6, len(nodes_list))):
                    if j < len(nodes_list):
                        try:
                            paths = list(nx.all_simple_paths(
                                self.G, nodes_list[i], nodes_list[j], 
                                cutoff=metrics['diameter'] + 2
                            ))
                            total_paths += len(paths)
                            checked_pairs += 1
                        except:
                            pass
            
            if checked_pairs > 0:
                metrics['redundancy_ratio'] = total_paths / checked_pairs
            
            # Node fault tolerance: how many nodes can fail before disconnection
            # Simplified: minimum node cut size
            try:
                if len(nodes_list) > 2:
                    # Approximate: check if removing any single node keeps network connected
                    fault_tolerant = sum(
                        1 for node in nodes_list[:min(10, len(nodes_list))]
                        if nx.is_connected(self.G.subgraph([n for n in nodes_list if n != node]))
                    )
                    metrics['node_fault_tolerance'] = fault_tolerant
            except:
                pass
        
        return metrics
    
    def get_network_info(self):
        """Print comprehensive mesh network information."""
        print("\n" + "=" * 70)
        print("MESH NETWORK INFORMATION")
        print("=" * 70)
        print(f"Nodes: {self.G.number_of_nodes()}")
        print(f"Links: {self.G.number_of_edges()}")
        print(f"Connected: {nx.is_connected(self.G) if self.G.number_of_nodes() > 0 else False}")
        
        # Mesh-specific metrics
        mesh_metrics = self.get_mesh_metrics()
        print(f"\n🔷 Mesh Network Properties:")
        print(f"   Is Valid Mesh: {'✅ Yes' if mesh_metrics['is_mesh'] else '❌ No'}")
        print(f"   Minimum Node Degree: {mesh_metrics['min_degree']}")
        print(f"   Average Node Degree: {mesh_metrics['avg_degree']:.2f}")
        
        if mesh_metrics['is_connected']:
            print(f"   Network Diameter: {mesh_metrics['diameter']} hops")
            print(f"   Average Path Length: {mesh_metrics['average_path_length']:.2f} hops")
            print(f"   Redundancy Ratio: {mesh_metrics['redundancy_ratio']:.2f} paths/node-pair")
            
            if mesh_metrics['min_degree'] < 2:
                print(f"\n⚠️  WARNING: Some nodes have degree < 2. This reduces mesh redundancy!")
            if mesh_metrics['redundancy_ratio'] < 2.0:
                print(f"⚠️  WARNING: Low redundancy ratio. Consider adding more links for better self-healing.")
            if mesh_metrics['is_mesh']:
                print(f"\n✅ This is a proper mesh network with good redundancy and self-healing capability!")
        
        print("\n📊 Node Details:")
        for node in sorted(self.G.nodes()):
            degree = self.G.degree(node)
            attrs = self.G.nodes[node]
            attr_str = ", ".join([f"{k}={v}" for k, v in attrs.items() if k != 'pos'])
            mesh_status = "✅" if degree >= 2 else "⚠️"
            print(f"   {mesh_status} {node}: {degree} connections" + (f" ({attr_str})" if attr_str else ""))
        
        print("\n🔗 Link Details:")
        for node1, node2, data in sorted(self.G.edges(data=True)):
            latency = data.get('weight', 'N/A')
            bandwidth = data.get('bandwidth', 'N/A')
            print(f"   {node1} ↔ {node2}: latency={latency}ms" + 
                  (f", bandwidth={bandwidth}Mbps" if bandwidth != 'N/A' else ""))
    
    def find_route(self, source: str, target: str):
        """
        Find the shortest path between two nodes.
        
        Returns:
            Tuple of (path_list, total_latency) or (None, inf) if no path
        """
        try:
            path = nx.shortest_path(self.G, source=source, target=target, weight='weight')
            length = nx.shortest_path_length(self.G, source=source, target=target, weight='weight')
            return path, length
        except nx.NetworkXNoPath:
            return None, float('inf')
        except nx.NodeNotFound as e:
            print(f"❌ Error: {e}")
            return None, float('inf')
    
    def visualize(self, title: str = "Custom Network", save_path: Optional[str] = None,
                  highlight_path: Optional[List[str]] = None):
        """
        Visualize the network with matplotlib.
        
        Args:
            title: Plot title
            save_path: Optional path to save the image
            highlight_path: Optional list of nodes to highlight as a path
        """
        if self.G.number_of_nodes() == 0:
            print("⚠️  Cannot visualize: network is empty")
            return
        
        fig, axes = plt.subplots(1, 2, figsize=(16, 7))
        fig.suptitle(title, fontsize=16, fontweight='bold')
        
        # Use spring layout for both
        pos = nx.spring_layout(self.G, seed=42, k=1, iterations=50)
        
        # Left plot: Basic network
        ax1 = axes[0]
        node_colors = ['lightblue'] * self.G.number_of_nodes()
        node_sizes = [700] * self.G.number_of_nodes()
        
        # Highlight path if provided
        if highlight_path:
            path_set = set(highlight_path)
            node_colors = ['red' if node in path_set else 'lightblue' 
                          for node in self.G.nodes()]
            node_sizes = [1000 if node in path_set else 700 
                         for node in self.G.nodes()]
        
        nx.draw_networkx_nodes(self.G, pos, node_color=node_colors, 
                              node_size=node_sizes, ax=ax1)
        nx.draw_networkx_labels(self.G, pos, font_size=10, font_weight='bold', ax=ax1)
        
        # Highlight path edges
        edge_colors = ['gray'] * self.G.number_of_edges()
        edge_widths = [2] * self.G.number_of_edges()
        
        if highlight_path and len(highlight_path) > 1:
            path_edges = [(highlight_path[i], highlight_path[i+1]) 
                         for i in range(len(highlight_path)-1)]
            edge_colors = ['red' if (u, v) in path_edges or (v, u) in path_edges 
                          else 'gray' for u, v in self.G.edges()]
            edge_widths = [4 if (u, v) in path_edges or (v, u) in path_edges 
                          else 2 for u, v in self.G.edges()]
        
        nx.draw_networkx_edges(self.G, pos, edge_color=edge_colors, 
                              width=edge_widths, ax=ax1)
        ax1.set_title('Network Topology')
        ax1.axis('off')
        
        # Right plot: With edge weights
        ax2 = axes[1]
        nx.draw_networkx_nodes(self.G, pos, node_color='lightgreen', 
                              node_size=700, ax=ax2)
        nx.draw_networkx_labels(self.G, pos, font_size=10, font_weight='bold', ax=ax2)
        nx.draw_networkx_edges(self.G, pos, edge_color='gray', width=2, ax=ax2)
        
        # Add edge labels
        edge_labels = {}
        for u, v, data in self.G.edges(data=True):
            weight = data.get('weight', 'N/A')
            bandwidth = data.get('bandwidth', None)
            label = f"{weight}ms"
            if bandwidth:
                label += f"\n{bandwidth}Mbps"
            edge_labels[(u, v)] = label
        
        nx.draw_networkx_edge_labels(self.G, pos, edge_labels, font_size=8, ax=ax2)
        ax2.set_title('With Link Properties')
        ax2.axis('off')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=150, bbox_inches='tight')
            print(f"\n✅ Visualization saved to: {save_path}")
        
        print("\n💡 Opening plot window... (close it to continue)")
        plt.show()


# ============================================================================
# TUTORIAL EXAMPLES
# ============================================================================

def example_1_basic_usage():
    """Example 1: Building a simple custom mesh network."""
    print("\n" + "=" * 70)
    print("EXAMPLE 1: Basic Custom Mesh Network")
    print("=" * 70)
    
    builder = CustomNetworkBuilder()
    
    # Add nodes with custom names
    builder.add_node("Headquarters")
    builder.add_node("Branch-Office-A")
    builder.add_node("Branch-Office-B")
    builder.add_node("DataCenter")
    builder.add_node("Router-Core-1")
    builder.add_node("Router-Core-2")
    builder.add_node("Router-Edge-1")
    builder.add_node("Router-Edge-2")
    builder.add_node("Router-Edge-3")
    builder.add_node("Router-Edge-4")
    builder.add_node("Router-Edge-5")
    builder.add_node("Router-Edge-6")
    builder.add_node("Router-Edge-7")
    builder.add_node("Router-Edge-8")
    
    # Add links with custom latencies
    builder.add_link("Headquarters", "Branch-Office-A", latency=25.0)
    builder.add_link("Headquarters", "Branch-Office-B", latency=30.0)
    builder.add_link("Headquarters", "DataCenter", latency=5.0)
    builder.add_link("Branch-Office-A", "DataCenter", latency=35.0)
    builder.add_link("Branch-Office-B", "DataCenter", latency=40.0)
    builder.add_link("Router-Core-1", "Router-Edge-1", latency=10.0)
    builder.add_link("Router-Core-1", "Router-Edge-2", latency=10.0)
    builder.add_link("Router-Core-1", "Router-Edge-3", latency=10.0)
    builder.add_link("Router-Core-1", "Router-Edge-4", latency=10.0)
    builder.add_link("Router-Core-2", "Router-Edge-1", latency=10.0)
    builder.add_link("Router-Core-2", "Router-Edge-2", latency=10.0)
    builder.add_link("Router-Core-2", "Router-Edge-3", latency=10.0)
    builder.add_link("Router-Core-2", "Router-Edge-4", latency=10.0)

    
    # Get network info
    builder.get_network_info()
    
    # Find a route
    print("\n🎯 Finding route from Branch-Office-A to Branch-Office-B:")
    path, latency = builder.find_route("Branch-Office-A", "Branch-Office-B")
    if path:
        print(f"   Path: {' → '.join(path)}")
        print(f"   Total latency: {latency}ms")
    
    # Visualize
    builder.visualize(title="Example 1: Corporate Network", 
                     highlight_path=path,
                     save_path="06-customization/example1_network.png")
    
    return builder


def example_2_advanced_features():
    """Example 2: Using advanced mesh network features like attributes and bulk operations."""
    print("\n" + "=" * 70)
    print("EXAMPLE 2: Advanced Mesh Network Features")
    print("=" * 70)
    
    builder = CustomNetworkBuilder()
    
    # Add nodes with attributes
    builder.add_node("Router-Core-1", location="Building-A", type="core", priority="high")
    builder.add_node("Router-Core-2", location="Building-A", type="core", priority="high")
    builder.add_node("Router-Edge-1", location="Building-B", type="edge", priority="medium")
    builder.add_node("Router-Edge-2", location="Building-B", type="edge", priority="medium")
    builder.add_node("Router-Edge-3", location="Building-C", type="edge", priority="medium")
    
    # Add links with bandwidth information
    builder.add_link("Router-Core-1", "Router-Core-2", latency=2.0, bandwidth=10000)
    builder.add_link("Router-Core-1", "Router-Edge-1", latency=5.0, bandwidth=1000)
    builder.add_link("Router-Core-1", "Router-Edge-2", latency=5.5, bandwidth=1000)
    builder.add_link("Router-Core-2", "Router-Edge-2", latency=6.0, bandwidth=1000)
    builder.add_link("Router-Core-2", "Router-Edge-3", latency=7.0, bandwidth=1000)
    builder.add_link("Router-Edge-1", "Router-Edge-2", latency=3.0, bandwidth=500)
    builder.add_link("Router-Edge-2", "Router-Edge-3", latency=4.0, bandwidth=500)
    
    builder.get_network_info()
    
    # Test routing
    print("\n🎯 Testing multiple routes:")
    routes = [
        ("Router-Edge-1", "Router-Edge-3"),
        ("Router-Core-1", "Router-Core-2"),
    ]
    
    for source, target in routes:
        path, latency = builder.find_route(source, target)
        if path:
            print(f"   {source} → {target}: {' → '.join(path)} ({latency}ms)")
    
    builder.visualize(title="Example 2: Advanced Network with Attributes",
                     save_path="06-customization/example2_network.png")
    
    return builder


def example_3_bulk_operations():
    """Example 3: Using bulk operations to create mesh networks efficiently."""
    print("\n" + "=" * 70)
    print("EXAMPLE 3: Bulk Mesh Network Creation")
    print("=" * 70)
    
    builder = CustomNetworkBuilder()
    
    # Add multiple nodes at once
    builder.add_nodes(["Server-1", "Server-2", "Server-3", "Server-4", "Server-5"],
                     type="server", location="datacenter")
    
    # Add multiple links at once
    links = [
        ("Server-1", "Server-2", {"latency": 1.0, "bandwidth": 10000}),
        ("Server-2", "Server-3", {"latency": 1.0, "bandwidth": 10000}),
        ("Server-3", "Server-4", {"latency": 1.0, "bandwidth": 10000}),
        ("Server-4", "Server-5", {"latency": 1.0, "bandwidth": 10000}),
        ("Server-5", "Server-1", {"latency": 1.0, "bandwidth": 10000}),
        # Add some cross-connections for redundancy
        ("Server-1", "Server-3", {"latency": 1.5, "bandwidth": 5000}),
        ("Server-2", "Server-4", {"latency": 1.5, "bandwidth": 5000}),
    ]
    builder.add_links(links)
    
    builder.get_network_info()
    
    # Find all paths between two nodes
    source = "Server-1"
    target = "Server-4"
    print(f"\n🔀 All paths from {source} to {target}:")
    try:
        all_paths = list(nx.all_simple_paths(builder.G, source=source, target=target))
        for i, path in enumerate(all_paths[:5], 1):  # Show first 5
            cost = sum(builder.G[path[j]][path[j+1]]['weight'] 
                      for j in range(len(path)-1))
            print(f"   Path {i}: {' → '.join(path)} ({cost}ms)")
    except:
        print("   No paths found")
    
    builder.visualize(title="Example 3: Server Ring Network",
                     save_path="06-customization/example3_network.png")
    
    return builder


def example_4_mesh_creation_methods():
    """Example 4: Using built-in mesh creation methods."""
    print("\n" + "=" * 70)
    print("EXAMPLE 4: Built-in Mesh Network Creation Methods")
    print("=" * 70)
    
    # Full mesh example
    print("\n📌 Creating Full Mesh Network:")
    builder1 = CustomNetworkBuilder()
    builder1.create_full_mesh(["Router1", "Router2", "Router3", "Router4"], 
                              latency=10.0, bandwidth=1000)
    builder1.get_network_info()
    
    # Partial mesh example
    print("\n📌 Creating Partial Mesh Network (min_degree=3):")
    builder2 = CustomNetworkBuilder()
    builder2.create_partial_mesh(["A", "B", "C", "D", "E", "F"], 
                                 min_degree=3, latency=10.0, bandwidth=1000)
    builder2.get_network_info()
    
    # Test mesh properties
    print("\n🔷 Mesh Network Validation:")
    metrics1 = builder1.get_mesh_metrics()
    metrics2 = builder2.get_mesh_metrics()
    
    print(f"\nFull Mesh Metrics:")
    print(f"   Is Valid Mesh: {metrics1['is_mesh']}")
    print(f"   Redundancy Ratio: {metrics1['redundancy_ratio']:.2f}")
    
    print(f"\nPartial Mesh Metrics:")
    print(f"   Is Valid Mesh: {metrics2['is_mesh']}")
    print(f"   Redundancy Ratio: {metrics2['redundancy_ratio']:.2f}")
    
    return builder1, builder2


def interactive_builder_demo():
    """
    Interactive demonstration - modify this function to build YOUR mesh network!
    
    This is where you can experiment and build your own custom mesh networks.
    Remember: Mesh networks need redundancy - ensure each node has multiple connections!
    """
    print("\n" + "=" * 70)
    print("INTERACTIVE BUILDER - BUILD YOUR OWN MESH NETWORK!")
    print("=" * 70)
    print("\n💡 Modify the code below to create your custom mesh network:")
    print("   - Add your own node names")
    print("   - Connect them with custom latencies (ensure redundancy!)")
    print("   - Each node should have at least 2 connections for mesh topology")
    print("   - Add attributes like location, type, etc.")
    print("   - Visualize and test routing!")
    print("   - Use create_full_mesh() or create_partial_mesh() for quick setup\n")
    
    builder = CustomNetworkBuilder()
    
    # ========================================================================
    # YOUR CODE HERE - Customize this section!
    # ========================================================================
    
    # Example: Create a simple mesh network (triangle - each node has 2 connections)
    # Replace this with your own mesh network design!
    # Remember: For mesh networks, ensure redundancy (multiple paths between nodes)
    
    builder.add_node("My-Node-1")
    builder.add_node("My-Node-2")
    builder.add_node("My-Node-3")
    builder.add_node("My-Node-4")  # Add more nodes for better mesh
    
    # Create mesh topology - each node connected to multiple others
    builder.add_link("My-Node-1", "My-Node-2", latency=10.0)
    builder.add_link("My-Node-2", "My-Node-3", latency=15.0)
    builder.add_link("My-Node-3", "My-Node-4", latency=12.0)
    builder.add_link("My-Node-4", "My-Node-1", latency=20.0)
    # Add cross-connections for redundancy (mesh characteristic)
    builder.add_link("My-Node-1", "My-Node-3", latency=25.0)
    builder.add_link("My-Node-2", "My-Node-4", latency=18.0)
    
    # ========================================================================
    # End of customization section
    # ========================================================================
    
    builder.get_network_info()
    
    # Test routing
    if builder.G.number_of_nodes() >= 2:
        nodes_list = list(builder.G.nodes())
        source = nodes_list[0]
        target = nodes_list[-1]
        path, latency = builder.find_route(source, target)
        if path:
            print(f"\n🎯 Route from {source} to {target}:")
            print(f"   Path: {' → '.join(path)}")
            print(f"   Latency: {latency}ms")
    
    # Validate mesh network
    mesh_metrics = builder.get_mesh_metrics()
    if not mesh_metrics['is_mesh']:
        print(f"\n⚠️  WARNING: This may not be a proper mesh network!")
        print(f"   Consider adding more links to ensure redundancy and self-healing capability.")
    
    builder.visualize(title="My Custom Mesh Network",
                     highlight_path=path if 'path' in locals() and path else None,
                     save_path="06-customization/my_custom_mesh_network.png")
    
    return builder


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("CUSTOM MESH NETWORK BUILDER - TUTORIAL")
    print("=" * 70)
    print("\nThis tutorial teaches you how to build custom MESH NETWORKS")
    print("with full control over nodes, links, and properties.")
    print("\nMESH NETWORKS provide:")
    print("  • Redundancy (multiple paths between nodes)")
    print("  • Self-healing capability (fault tolerance)")
    print("  • No single point of failure")
    print("  • High reliability\n")
    
    # Run examples
    print("\n📚 Running tutorial examples...\n")
    
    # Example 1: Basic usage
    example_1_basic_usage()
    
    # Example 2: Advanced features
    example_2_advanced_features()
    
    # Example 3: Bulk operations
    example_3_bulk_operations()
    
    # Example 4: Mesh creation methods
    example_4_mesh_creation_methods()
    
    # Interactive demo
    print("\n" + "=" * 70)
    print("READY TO BUILD YOUR OWN MESH NETWORK?")
    print("=" * 70)
    print("\nTo create your custom mesh network:")
    print("1. Open this file in your editor")
    print("2. Find the 'interactive_builder_demo()' function")
    print("3. Modify the code in the 'YOUR CODE HERE' section")
    print("4. Ensure each node has at least 2 connections (mesh requirement)")
    print("5. Run: python 06-customization/custom_network_builder.py")
    print("\nOr use built-in methods:")
    print("  • builder.create_full_mesh(['A', 'B', 'C']) - Maximum redundancy")
    print("  • builder.create_partial_mesh(['A', 'B', 'C'], min_degree=2) - Controlled redundancy")
    print("\nOr call interactive_builder_demo() directly!")
    
    # Uncomment the line below to run the interactive demo:
    # interactive_builder_demo()
    
    print("\n" + "=" * 70)
    print("KEY TAKEAWAYS:")
    print("=" * 70)
    print("✓ Mesh networks require redundancy (multiple paths)")
    print("✓ Each node should have at least 2 connections")
    print("✓ Mesh networks provide self-healing capability")
    print("✓ Use get_mesh_metrics() to validate your mesh network")
    print("✓ Use create_full_mesh() or create_partial_mesh() for quick setup")
    print("✓ You control every link and its properties")
    print("✓ Visualize and test routing on your mesh designs")
    
    print("\n" + "=" * 70)
    print("NEXT STEPS:")
    print("=" * 70)
    print("- Build a mesh network model of your office/home network")
    print("- Design a mesh topology for a specific use case")
    print("- Test self-healing: remove links and see alternative paths")
    print("- Test how failures affect your mesh network")
    print("- Export your mesh network to use with other tools")
    print("- Combine with self-healing features from lesson 5!")

