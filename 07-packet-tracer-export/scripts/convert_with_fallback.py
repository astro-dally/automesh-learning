"""
Packet Tracer Converter with Fallback Options

This script tries multiple methods to create Packet Tracer compatible files.
If direct conversion fails, it provides alternative solutions.
"""

import json
import os
import sys

def try_ptexplorer(json_path: str, output_path: str) -> bool:
    """
    Try using ptexplorer if available.
    Install with: pip install ptexplorer
    """
    try:
        import ptexplorer
        print("✓ Found ptexplorer, using it for conversion...")
        
        # Load network data
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        # Convert using ptexplorer (this is a placeholder - actual usage may vary)
        # ptexplorer has its own API
        print("⚠️  ptexplorer integration needs to be implemented")
        return False
        
    except ImportError:
        return False
    except Exception as e:
        print(f"⚠️  ptexplorer error: {e}")
        return False


def create_manual_instructions(nodes: List[Dict], links: List[Dict], output_path: str):
    """Create a text file with manual instructions for Packet Tracer."""
    instructions_path = output_path.replace('.pkt', '_instructions.txt')
    
    instructions = f"""
CISCO PACKET TRACER - MANUAL NETWORK CREATION GUIDE
====================================================

Network Name: {len(nodes)} nodes, {len(links)} links

NODES TO CREATE:
"""
    for i, node in enumerate(nodes, 1):
        instructions += f"{i}. {node['name']} (Router)\n"
    
    instructions += "\n\nCONNECTIONS TO MAKE:\n"
    for i, link in enumerate(links, 1):
        instructions += f"{i}. {link['from']} ↔ {link['to']} "
        instructions += f"(Latency: {link.get('latency', 10)}ms, "
        instructions += f"Bandwidth: {link.get('bandwidth', 100)}Mbps)\n"
    
    instructions += """
\nSTEPS TO CREATE IN PACKET TRACER:
1. Open Cisco Packet Tracer
2. Add routers from the device palette (bottom)
3. Double-click each router and set hostname
4. Connect routers using copper straight-through cables
5. Configure IP addresses on interfaces
6. Set up routing protocol (OSPF recommended)

TIP: Use the "Logical" workspace view for easier placement.
"""
    
    with open(instructions_path, 'w') as f:
        f.write(instructions)
    
    print(f"✅ Created manual instructions: {instructions_path}")
    return instructions_path


def main():
    """Main conversion function with fallbacks."""
    if len(sys.argv) < 3:
        print("Usage: python convert_with_fallback.py <input.json> <output.pkt>")
        sys.exit(1)
    
    json_path = sys.argv[1]
    output_path = sys.argv[2]
    
    if not os.path.exists(json_path):
        print(f"❌ Error: {json_path} not found")
        sys.exit(1)
    
    # Load network data
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    nodes = data.get('nodes', [])
    links = data.get('links', [])
    
    print("=" * 70)
    print("PACKET TRACER CONVERSION")
    print("=" * 70)
    print(f"Network: {len(nodes)} nodes, {len(links)} links")
    print()
    
    # Try method 1: ptexplorer
    print("Method 1: Trying ptexplorer...")
    if try_ptexplorer(json_path, output_path):
        print("✅ Successfully converted using ptexplorer!")
        return
    
    # Try method 2: Our converter
    print("\nMethod 2: Trying built-in converter...")
    try:
        from pkt_converter import convert_from_json
        convert_from_json(json_path, output_path)
        print(f"✅ Created: {output_path}")
        print("\n⚠️  NOTE: If Packet Tracer shows an error opening this file,")
        print("   the file format may need adjustment for your Packet Tracer version.")
        print("   Try the manual instructions method below.")
    except Exception as e:
        print(f"❌ Converter error: {e}")
    
    # Method 3: Manual instructions
    print("\nMethod 3: Creating manual instructions...")
    create_manual_instructions(nodes, links, output_path)
    
    print("\n" + "=" * 70)
    print("RECOMMENDED APPROACH:")
    print("=" * 70)
    print("1. Try opening the generated .pkt file in Packet Tracer")
    print("2. If it doesn't work, use the _instructions.txt file")
    print("3. Or manually recreate the network in Packet Tracer")
    print("\nFor better compatibility, consider using ptexplorer:")
    print("  pip install ptexplorer")


if __name__ == "__main__":
    from typing import List, Dict
    main()

