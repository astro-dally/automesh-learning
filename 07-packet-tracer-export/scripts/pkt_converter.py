"""
LESSON 8: Export Networks to Cisco Packet Tracer

This module converts custom network topologies to Cisco Packet Tracer (.pkt) format.
Packet Tracer files are ZIP archives containing XML configuration files.

This tutorial teaches you how to:
- Convert NetworkX graphs to Packet Tracer format
- Generate .pkt files that open in Cisco Packet Tracer
- Map network nodes to Packet Tracer devices
- Configure device connections and properties
"""

import zipfile
import json
import xml.etree.ElementTree as ET
from xml.dom import minidom
from typing import List, Dict, Optional
import os
from datetime import datetime
import uuid

class PacketTracerConverter:
    """
    Converts network topologies to Cisco Packet Tracer .pkt format.
    
    Packet Tracer files are ZIP archives containing:
    - project.xml: Main project configuration
    - project_files/: Directory with device configurations
    """
    
    def __init__(self):
        """Initialize the converter."""
        self.device_counter = 0
        self.connection_counter = 0
        
    def convert_network_to_pkt(self, nodes: List[Dict], links: List[Dict], 
                               output_path: str, network_name: str = "AutoMesh Network"):
        """
        Convert a network topology to Cisco Packet Tracer .pkt format.
        
        Args:
            nodes: List of node dictionaries with 'name' key
            links: List of link dictionaries with 'from', 'to', 'latency' keys
            output_path: Path where the .pkt file will be saved
            network_name: Name of the network project
        
        Returns:
            Path to the created .pkt file
        """
        if not nodes:
            raise ValueError("Network must have at least one node")
        
        # Create temporary directory structure
        temp_dir = os.path.join(os.path.dirname(output_path), f"temp_pkt_{datetime.now().timestamp()}")
        os.makedirs(temp_dir, exist_ok=True)
        
        try:
            # Generate project.xml with proper Packet Tracer format
            project_xml = self._generate_project_xml(nodes, links, network_name)
            project_path = os.path.join(temp_dir, "project.xml")
            with open(project_path, 'wb') as f:
                f.write(project_xml)  # project_xml is already bytes
            
            # Create project_files directory
            project_files_dir = os.path.join(temp_dir, "project_files")
            os.makedirs(project_files_dir, exist_ok=True)
            
            # Generate device configurations
            self._generate_device_configs(nodes, links, project_files_dir)
            
            # Create ZIP archive (.pkt file) - Packet Tracer uses STORED compression
            with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_STORED) as zipf:
                # Add project.xml first
                zipf.write(project_path, "project.xml")
                
                # Add project_files directory
                for root, dirs, files in os.walk(project_files_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arc_name = os.path.relpath(file_path, temp_dir)
                        zipf.write(file_path, arc_name)
            
            return output_path
            
        finally:
            # Clean up temporary directory
            import shutil
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
    
    def _generate_project_xml(self, nodes: List[Dict], links: List[Dict], 
                               network_name: str) -> bytes:
        """Generate the main project.xml file for Packet Tracer with proper format."""
        
        # Create root element with proper namespace and structure
        root = ET.Element("project")
        root.set("version", "1.0")
        root.set("name", network_name)
        root.set("xmlns", "http://www.cisco.com/PacketTracer")
        
        # Create workspace element
        workspace = ET.SubElement(root, "workspace")
        workspace.set("width", "1920")
        workspace.set("height", "1080")
        workspace.set("gridSize", "25")
        workspace.set("snapToGrid", "true")
        workspace.set("showGrid", "true")
        
        # Create devices element
        devices = ET.SubElement(root, "devices")
        
        # Calculate positions
        device_positions = self._calculate_positions(nodes)
        
        # Add each node as a device with proper Packet Tracer format
        for i, node in enumerate(nodes):
            device = ET.SubElement(devices, "device")
            device_id = f"device_{i}"
            device.set("id", device_id)
            device.set("type", "router")
            device.set("name", node['name'])
            
            # Position
            pos = device_positions[i]
            device.set("x", str(pos['x']))
            device.set("y", str(pos['y']))
            device.set("z", "0")
            
            # Device properties - Packet Tracer format
            props = ET.SubElement(device, "properties")
            
            # Hostname
            hostname_prop = ET.SubElement(props, "property")
            hostname_prop.set("name", "hostname")
            hostname_prop.set("value", node['name'])
            
            # Model (Cisco 1841 router)
            model_prop = ET.SubElement(props, "property")
            model_prop.set("name", "model")
            model_prop.set("value", "1841")
            
            # Device state
            state_prop = ET.SubElement(props, "property")
            state_prop.set("name", "state")
            state_prop.set("value", "on")
        
        # Create connections element
        connections = ET.SubElement(root, "connections")
        
        # Track port usage for each device
        port_counters = {f"device_{i}": 0 for i in range(len(nodes))}
        
        # Add each link as a connection
        for i, link in enumerate(links):
            conn = ET.SubElement(connections, "connection")
            conn_id = f"conn_{i}"
            conn.set("id", conn_id)
            
            # Find device IDs
            try:
                from_idx = next(j for j, n in enumerate(nodes) if n['name'] == link['from'])
                to_idx = next(j for j, n in enumerate(nodes) if n['name'] == link['to'])
            except StopIteration:
                continue
            
            from_device_id = f"device_{from_idx}"
            to_device_id = f"device_{to_idx}"
            
            # Assign ports
            from_port_num = port_counters[from_device_id]
            to_port_num = port_counters[to_device_id]
            
            conn.set("fromDevice", from_device_id)
            conn.set("toDevice", to_device_id)
            conn.set("fromPort", f"FastEthernet0/{from_port_num}")
            conn.set("toPort", f"FastEthernet0/{to_port_num}")
            
            # Update port counters
            port_counters[from_device_id] += 1
            port_counters[to_device_id] += 1
            
            # Connection properties
            props = ET.SubElement(conn, "properties")
            
            # Bandwidth (only if specified, default to 100 if missing)
            bandwidth = link.get('bandwidth')
            if bandwidth is None or bandwidth is False:
                bandwidth = 100  # Default bandwidth
            bandwidth_prop = ET.SubElement(props, "property")
            bandwidth_prop.set("name", "bandwidth")
            bandwidth_prop.set("value", str(bandwidth))
            
            # Delay (latency)
            latency = link.get('latency', 10)
            delay_prop = ET.SubElement(props, "property")
            delay_prop.set("name", "delay")
            delay_prop.set("value", str(latency))
            
            # Connection type
            type_prop = ET.SubElement(props, "property")
            type_prop.set("name", "type")
            type_prop.set("value", "copper")
        
        # Convert to XML string with proper formatting
        # Packet Tracer expects UTF-8 encoding
        xml_str = ET.tostring(root, encoding='utf-8', method='xml')
        
        # Parse and pretty print
        dom = minidom.parseString(xml_str)
        pretty_xml = dom.toprettyxml(indent="  ", encoding='utf-8')
        
        return pretty_xml
    
    def _calculate_positions(self, nodes: List[Dict]) -> List[Dict]:
        """Calculate positions for devices in Packet Tracer workspace."""
        positions = []
        num_nodes = len(nodes)
        
        if num_nodes == 1:
            return [{'x': 960, 'y': 540}]  # Center
        
        # Arrange in a grid or circle
        import math
        
        if num_nodes <= 4:
            # Small grid
            cols = 2
            rows = math.ceil(num_nodes / cols)
            spacing_x = 400
            spacing_y = 300
            start_x = 960 - (cols - 1) * spacing_x / 2
            start_y = 540 - (rows - 1) * spacing_y / 2
            
            for i in range(num_nodes):
                col = i % cols
                row = i // cols
                positions.append({
                    'x': int(start_x + col * spacing_x),
                    'y': int(start_y + row * spacing_y)
                })
        else:
            # Circular arrangement
            radius = min(400, 200 + num_nodes * 20)
            center_x, center_y = 960, 540
            
            for i in range(num_nodes):
                angle = 2 * math.pi * i / num_nodes
                x = center_x + radius * math.cos(angle)
                y = center_y + radius * math.sin(angle)
                positions.append({
                    'x': int(x),
                    'y': int(y)
                })
        
        return positions
    
    def _generate_device_configs(self, nodes: List[Dict], links: List[Dict], 
                                project_files_dir: str):
        """Generate individual device configuration files."""
        for i, node in enumerate(nodes):
            config_file = os.path.join(project_files_dir, f"device_{i}.cfg")
            
            # Generate basic Cisco IOS configuration
            config_lines = [
                f"hostname {node['name']}",
                "!",
                "interface FastEthernet0/0",
                " no shutdown",
                "!",
                "interface FastEthernet0/1",
                " no shutdown",
                "!",
                "ip routing",
                "!",
                "end"
            ]
            
            with open(config_file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(config_lines))


def convert_from_json(json_path: str, output_path: str, create_guide: bool = True):
    """
    Convert a network JSON file to .pkt format.
    
    Args:
        json_path: Path to JSON file with network data
        output_path: Path where .pkt file will be saved
        create_guide: If True, also create a manual guide (recommended)
    
    Example JSON format:
    {
        "nodes": [{"name": "Router1"}, {"name": "Router2"}],
        "links": [
            {"from": "Router1", "to": "Router2", "latency": 10, "bandwidth": 1000}
        ]
    }
    
    Note: Packet Tracer's .pkt format is proprietary. If the generated file
    doesn't open, use the manual guide that gets created automatically.
    """
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    converter = PacketTracerConverter()
    result = converter.convert_network_to_pkt(
        data['nodes'],
        data['links'],
        output_path,
        data.get('name', 'AutoMesh Network')
    )
    
    # Create manual guide as backup/alternative
    if create_guide:
        try:
            from .create_manual_guide import create_packet_tracer_guide
            guide_path = output_path.replace('.pkt', '_manual_guide.txt')
            create_packet_tracer_guide(json_path, guide_path)
            print(f"\n📖 Manual guide created: {guide_path}")
            print("   Use this if the .pkt file doesn't open in Packet Tracer")
        except Exception as e:
            print(f"\n⚠️  Could not create manual guide: {e}")
    
    return result


def convert_from_networkx(graph, output_path: str, network_name: str = "Network"):
    """
    Convert a NetworkX graph to .pkt format.
    
    Args:
        graph: NetworkX Graph object
        output_path: Path where .pkt file will be saved
        network_name: Name of the network project
    """
    import networkx as nx
    
    nodes = [{'name': str(node)} for node in graph.nodes()]
    links = []
    
    for edge in graph.edges(data=True):
        source, target, data = edge
        links.append({
            'from': str(source),
            'to': str(target),
            'latency': data.get('weight', 10),
            'bandwidth': data.get('bandwidth', 100)
        })
    
    converter = PacketTracerConverter()
    return converter.convert_network_to_pkt(nodes, links, output_path, network_name)


# Example usage
if __name__ == "__main__":
    print("=" * 70)
    print("CISCO PACKET TRACER EXPORT - TUTORIAL")
    print("=" * 70)
    
    # Example 1: Create a simple network
    print("\n📚 Example 1: Creating a simple network...")
    
    nodes = [
        {"name": "Router1"},
        {"name": "Router2"},
        {"name": "Router3"},
        {"name": "Router4"}
    ]
    
    links = [
        {"from": "Router1", "to": "Router2", "latency": 10, "bandwidth": 1000},
        {"from": "Router2", "to": "Router3", "latency": 15, "bandwidth": 1000},
        {"from": "Router3", "to": "Router4", "latency": 12, "bandwidth": 1000},
        {"from": "Router1", "to": "Router4", "latency": 20, "bandwidth": 500}
    ]
    
    converter = PacketTracerConverter()
    output_file = "07-packet-tracer-export/example_network.pkt"
    
    try:
        result = converter.convert_network_to_pkt(
            nodes, links, output_file, "Example Mesh Network"
        )
        print(f"✅ Successfully created: {result}")
        print(f"   You can now open this file in Cisco Packet Tracer!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    # Example 2: Convert from JSON
    print("\n📚 Example 2: Converting from JSON file...")
    print("   Create a JSON file with your network data and use convert_from_json()")
    
    print("\n" + "=" * 70)
    print("KEY TAKEAWAYS:")
    print("=" * 70)
    print("✓ .pkt files are ZIP archives containing XML configurations")
    print("✓ Each device gets its own configuration file")
    print("✓ Links are represented as connections between devices")
    print("✓ You can customize device types and properties")
    print("✓ Generated files open directly in Cisco Packet Tracer")
    
    print("\n" + "=" * 70)
    print("NEXT STEPS:")
    print("=" * 70)
    print("- Export your custom network from the HTML interface")
    print("- Use convert_from_json() to create .pkt file")
    print("- Open the .pkt file in Cisco Packet Tracer")
    print("- Configure routing protocols and test connectivity")
