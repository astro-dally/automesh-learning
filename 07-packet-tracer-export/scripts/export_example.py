"""
Example: Export Custom Network to Packet Tracer

This example shows how to export a network created in the HTML interface
to Cisco Packet Tracer format.
"""

import json
from pkt_converter import convert_from_json, PacketTracerConverter

def example_from_json():
    """Example: Convert from exported JSON file."""
    print("=" * 70)
    print("EXPORTING NETWORK TO PACKET TRACER")
    print("=" * 70)
    
    # Step 1: Export your network from the HTML interface as JSON
    # Step 2: Use the converter
    
    json_file = "network.json"  # Your exported JSON file
    pkt_file = "my_network.pkt"
    
    try:
        convert_from_json(json_file, pkt_file)
        print(f"\n✅ Successfully created: {pkt_file}")
        print(f"   Open this file in Cisco Packet Tracer to view your network!")
        
    except FileNotFoundError:
        print(f"\n⚠️  JSON file '{json_file}' not found.")
        print("   Steps to export:")
        print("   1. Open interactive_custom_network.html")
        print("   2. Build your network")
        print("   3. Click 'Export JSON'")
        print("   4. Save the file")
        print("   5. Run this script again with the JSON file path")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")


def example_direct_creation():
    """Example: Create network directly in Python."""
    print("\n" + "=" * 70)
    print("CREATING NETWORK DIRECTLY")
    print("=" * 70)
    
    converter = PacketTracerConverter()
    
    # Define your network
    nodes = [
        {"name": "HQ-Router"},
        {"name": "Branch1-Router"},
        {"name": "Branch2-Router"},
        {"name": "DataCenter-Router"}
    ]
    
    links = [
        {"from": "HQ-Router", "to": "Branch1-Router", "latency": 25, "bandwidth": 1000},
        {"from": "HQ-Router", "to": "Branch2-Router", "latency": 30, "bandwidth": 1000},
        {"from": "HQ-Router", "to": "DataCenter-Router", "latency": 5, "bandwidth": 10000},
        {"from": "Branch1-Router", "to": "Branch2-Router", "latency": 40, "bandwidth": 500}
    ]
    
    output_file = "corporate_network.pkt"
    
    try:
        converter.convert_network_to_pkt(
            nodes=nodes,
            links=links,
            output_path=output_file,
            network_name="Corporate Network"
        )
        print(f"\n✅ Created: {output_file}")
        print(f"   Open in Cisco Packet Tracer to configure routing!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")


def example_from_custom_builder():
    """Example: Convert from CustomNetworkBuilder."""
    print("\n" + "=" * 70)
    print("INTEGRATION WITH CUSTOM NETWORK BUILDER")
    print("=" * 70)
    
    import sys
    import os
    
    # Add parent directory to path to import custom_network_builder
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    try:
        from custom_network_builder import CustomNetworkBuilder
        from pkt_converter import PacketTracerConverter
        
        # Build network using CustomNetworkBuilder
        builder = CustomNetworkBuilder()
        builder.add_node("Router1")
        builder.add_node("Router2")
        builder.add_node("Router3")
        builder.add_link("Router1", "Router2", latency=10, bandwidth=1000)
        builder.add_link("Router2", "Router3", latency=15, bandwidth=1000)
        builder.add_link("Router1", "Router3", latency=25, bandwidth=500)
        
        # Convert to Packet Tracer format
        nodes = [{"name": name} for name in builder.G.nodes()]
        links = [
            {
                "from": u,
                "to": v,
                "latency": builder.G[u][v].get('weight', 10),
                "bandwidth": builder.G[u][v].get('bandwidth', 100)
            }
            for u, v in builder.G.edges()
        ]
        
        converter = PacketTracerConverter()
        output_file = "07-packet-tracer-export/builder_network.pkt"
        converter.convert_network_to_pkt(nodes, links, output_file, "Builder Network")
        
        print(f"\n✅ Created: {output_file}")
        print(f"   Network has {len(nodes)} nodes and {len(links)} links")
        
    except ImportError:
        print("\n⚠️  CustomNetworkBuilder not found. Skipping this example.")
    except Exception as e:
        print(f"\n❌ Error: {e}")


if __name__ == "__main__":
    print("\n📚 Packet Tracer Export Examples\n")
    
    # Example 1: From JSON (most common workflow)
    example_from_json()
    
    # Example 2: Direct creation
    example_direct_creation()
    
    # Example 3: From CustomNetworkBuilder
    example_from_custom_builder()
    
    print("\n" + "=" * 70)
    print("WORKFLOW SUMMARY:")
    print("=" * 70)
    print("1. Build network in HTML interface (interactive_custom_network.html)")
    print("2. Export as JSON")
    print("3. Run: python export_example.py (or use convert_from_json)")
    print("4. Open .pkt file in Cisco Packet Tracer")
    print("5. Configure IP addresses and routing protocols")
    print("6. Test connectivity!")

