"""
Create Detailed Manual Guide for Packet Tracer

Since .pkt file format is proprietary and complex, this creates
a comprehensive guide to manually recreate your network in Packet Tracer.
This is often faster and more reliable than trying to reverse-engineer the format.
"""

import json
import os
from datetime import datetime

def create_packet_tracer_guide(json_path: str, output_path: str = None):
    """
    Create a detailed step-by-step guide for recreating the network in Packet Tracer.
    
    Args:
        json_path: Path to network JSON file
        output_path: Optional output path for the guide (defaults to guide.txt)
    """
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    nodes = data.get('nodes', [])
    links = data.get('links', [])
    network_name = data.get('name', 'Network')
    
    if output_path is None:
        output_path = json_path.replace('.json', '_packet_tracer_guide.txt')
    
    guide = f"""
{'='*80}
CISCO PACKET TRACER - MANUAL NETWORK CREATION GUIDE
{'='*80}

Network: {network_name}
Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

This guide will help you recreate your network topology in Cisco Packet Tracer.
Follow the steps below - it should take about 5-10 minutes.

{'='*80}
STEP 1: ADD ROUTERS
{'='*80}

Add {len(nodes)} router(s) to your workspace:

"""
    
    for i, node in enumerate(nodes, 1):
        guide += f"{i}. Router: {node['name']}\n"
        guide += f"   - Drag a router from the device palette (bottom of screen)\n"
        guide += f"   - Place it on the workspace\n"
        guide += f"   - Double-click the router\n"
        guide += f"   - Go to 'Config' tab\n"
        guide += f"   - Set Display Name: {node['name']}\n"
        guide += f"   - Set Hostname: {node['name']}\n"
        guide += f"   - Click 'X' to close\n\n"
    
    guide += f"""
{'='*80}
STEP 2: CONNECT ROUTERS
{'='*80}

Connect the routers using Copper Straight-Through cables:

"""
    
    for i, link in enumerate(links, 1):
        from_node = link['from']
        to_node = link['to']
        latency = link.get('latency', 10)
        bandwidth = link.get('bandwidth')
        
        guide += f"{i}. Connect: {from_node} ↔ {to_node}\n"
        guide += f"   - Click 'Connections' category (lightning bolt icon)\n"
        guide += f"   - Select 'Copper Straight-Through' cable\n"
        guide += f"   - Click on {from_node}\n"
        guide += f"   - Select 'FastEthernet0/0' (or next available port)\n"
        guide += f"   - Click on {to_node}\n"
        guide += f"   - Select 'FastEthernet0/0' (or next available port)\n"
        if bandwidth is not None and bandwidth is not False:
            guide += f"   - Link properties: Latency={latency}ms, Bandwidth={bandwidth}Mbps\n\n"
        else:
            guide += f"   - Link properties: Latency={latency}ms (bandwidth not specified)\n\n"
    
    guide += f"""
{'='*80}
STEP 3: CONFIGURE IP ADDRESSES
{'='*80}

Assign IP addresses to each router interface. Use this scheme:

"""
    
    # Generate IP addressing scheme
    base_ip = "192.168"
    for i, link in enumerate(links, 1):
        from_node = link['from']
        to_node = link['to']
        subnet = i
        
        guide += f"Link {i}: {from_node} ↔ {to_node}\n"
        guide += f"  - {from_node} FastEthernet0/0: {base_ip}.{subnet}.1 / 255.255.255.0\n"
        guide += f"  - {to_node} FastEthernet0/0: {base_ip}.{subnet}.2 / 255.255.255.0\n\n"
        guide += f"  To configure:\n"
        guide += f"    1. Double-click {from_node} → Config tab → Interface → FastEthernet0/0\n"
        guide += f"    2. Set IP: {base_ip}.{subnet}.1\n"
        guide += f"    3. Set Subnet Mask: 255.255.255.0\n"
        guide += f"    4. Repeat for {to_node} with IP {base_ip}.{subnet}.2\n\n"
    
    guide += f"""
{'='*80}
STEP 4: ENABLE ROUTING
{'='*80}

Enable IP routing on all routers:

"""
    
    for i, node in enumerate(nodes, 1):
        guide += f"{i}. {node['name']}:\n"
        guide += f"   - Double-click router → CLI tab\n"
        guide += f"   - Type: enable\n"
        guide += f"   - Type: configure terminal\n"
        guide += f"   - Type: ip routing\n"
        guide += f"   - Type: end\n\n"
    
    guide += f"""
{'='*80}
STEP 5: CONFIGURE ROUTING PROTOCOL (OPTIONAL)
{'='*80}

For dynamic routing, configure OSPF on all routers:

"""
    
    for i, node in enumerate(nodes, 1):
        guide += f"{i}. {node['name']}:\n"
        guide += f"   - CLI tab → enable → configure terminal\n"
        guide += f"   - Type: router ospf 1\n"
        guide += f"   - Type: network 192.168.0.0 0.0.255.255 area 0\n"
        guide += f"   - Type: end\n\n"
    
    guide += f"""
{'='*80}
STEP 6: TEST CONNECTIVITY
{'='*80}

Test your network:

1. Add a PC to test connectivity:
   - Drag a PC from End Devices
   - Connect it to any router
   - Configure IP on PC (same subnet as router)

2. Use ping:
   - Click PC → Desktop tab → Command Prompt
   - Type: ping <router-ip>
   - Example: ping 192.168.1.1

3. Use traceroute:
   - Type: tracert <destination-ip>
   - This shows the path packets take

{'='*80}
NETWORK TOPOLOGY SUMMARY
{'='*80}

Nodes ({len(nodes)}):
"""
    
    for node in nodes:
        guide += f"  - {node['name']}\n"
    
    guide += f"\nConnections ({len(links)}):\n"
    for link in links:
        latency = link.get('latency', 10)
        bandwidth = link.get('bandwidth')
        guide += f"  - {link['from']} ↔ {link['to']} "
        guide += f"(Latency: {latency}ms"
        if bandwidth is not None and bandwidth is not False:
            guide += f", Bandwidth: {bandwidth}Mbps"
        guide += ")\n"
    
    guide += f"""
{'='*80}
QUICK REFERENCE
{'='*80}

Device Palette Location: Bottom of Packet Tracer window
Cable Type: Copper Straight-Through (for router-to-router)
Interface: FastEthernet0/0, FastEthernet0/1, etc.
IP Scheme: 192.168.X.1 and 192.168.X.2 for each link

TIPS:
- Use 'Logical' workspace view (tab at top)
- Right-click devices to access configuration quickly
- Use 'Inspect' tool to view device details
- Save your work frequently (Ctrl+S / Cmd+S)

{'='*80}
END OF GUIDE
{'='*80}
"""
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(guide)
    
    print(f"✅ Created detailed guide: {output_path}")
    print(f"   Follow the steps to recreate your network in Packet Tracer")
    return output_path


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python create_manual_guide.py <network.json> [output.txt]")
        print("\nExample:")
        print("  python create_manual_guide.py my_network.json")
        sys.exit(1)
    
    json_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not os.path.exists(json_path):
        print(f"❌ Error: {json_path} not found")
        sys.exit(1)
    
    create_packet_tracer_guide(json_path, output_path)

