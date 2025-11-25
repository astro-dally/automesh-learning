"""
Improved Packet Tracer Converter - Using Minimal Valid Structure

This version creates a minimal valid Packet Tracer file structure.
Note: Packet Tracer file format is proprietary and complex. This creates
a basic structure that should work with most versions.
"""

import zipfile
import json
import os
from datetime import datetime
import math

class PacketTracerConverterV2:
    """
    Creates minimal valid Packet Tracer .pkt files.
    Uses a template-based approach for better compatibility.
    """
    
    def convert_network_to_pkt(self, nodes: List[Dict], links: List[Dict], 
                               output_path: str, network_name: str = "AutoMesh Network"):
        """
        Convert network to .pkt format using minimal valid structure.
        """
        if not nodes:
            raise ValueError("Network must have at least one node")
        
        # Create temporary directory
        temp_dir = os.path.join(os.path.dirname(output_path), f"temp_pkt_{datetime.now().timestamp()}")
        os.makedirs(temp_dir, exist_ok=True)
        
        try:
            # Generate minimal project.xml
            project_xml = self._create_minimal_xml(nodes, links, network_name)
            project_path = os.path.join(temp_dir, "project.xml")
            with open(project_path, 'wb') as f:
                f.write(project_xml)
            
            # Create project_files directory
            project_files_dir = os.path.join(temp_dir, "project_files")
            os.makedirs(project_files_dir, exist_ok=True)
            
            # Create device configs
            self._create_device_configs(nodes, project_files_dir)
            
            # Create ZIP with STORED compression (Packet Tracer uses this)
            with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_STORED) as zipf:
                zipf.write(project_path, "project.xml")
                for root, dirs, files in os.walk(project_files_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arc_name = os.path.relpath(file_path, temp_dir)
                        zipf.write(file_path, arc_name)
            
            return output_path
            
        finally:
            import shutil
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
    
    def _create_minimal_xml(self, nodes: List[Dict], links: List[Dict], 
                            network_name: str) -> bytes:
        """Create minimal valid XML structure."""
        
        # Calculate positions
        positions = self._calculate_positions(nodes)
        
        # Build XML string manually for better control
        xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>']
        xml_parts.append(f'<project version="1.0" name="{network_name}">')
        xml_parts.append('  <workspace width="1920" height="1080" gridSize="25" snapToGrid="true"/>')
        xml_parts.append('  <devices>')
        
        # Add devices
        for i, node in enumerate(nodes):
            pos = positions[i]
            xml_parts.append(f'    <device id="device_{i}" type="router" name="{node["name"]}" x="{pos["x"]}" y="{pos["y"]}" z="0">')
            xml_parts.append('      <properties>')
            xml_parts.append(f'        <property name="hostname" value="{node["name"]}"/>')
            xml_parts.append('        <property name="model" value="1841"/>')
            xml_parts.append('        <property name="state" value="on"/>')
            xml_parts.append('      </properties>')
            xml_parts.append('    </device>')
        
        xml_parts.append('  </devices>')
        xml_parts.append('  <connections>')
        
        # Add connections
        port_counters = {i: 0 for i in range(len(nodes))}
        for i, link in enumerate(links):
            try:
                from_idx = next(j for j, n in enumerate(nodes) if n['name'] == link['from'])
                to_idx = next(j for j, n in enumerate(nodes) if n['name'] == link['to'])
            except StopIteration:
                continue
            
            from_port = port_counters[from_idx]
            to_port = port_counters[to_idx]
            
            xml_parts.append(f'    <connection id="conn_{i}" fromDevice="device_{from_idx}" toDevice="device_{to_idx}" fromPort="FastEthernet0/{from_port}" toPort="FastEthernet0/{to_port}">')
            xml_parts.append('      <properties>')
            xml_parts.append(f'        <property name="bandwidth" value="{link.get("bandwidth", 100)}"/>')
            xml_parts.append(f'        <property name="delay" value="{link.get("latency", 10)}"/>')
            xml_parts.append('        <property name="type" value="copper"/>')
            xml_parts.append('      </properties>')
            xml_parts.append('    </connection>')
            
            port_counters[from_idx] += 1
            port_counters[to_idx] += 1
        
        xml_parts.append('  </connections>')
        xml_parts.append('</project>')
        
        return '\n'.join(xml_parts).encode('utf-8')
    
    def _calculate_positions(self, nodes: List[Dict]) -> List[Dict]:
        """Calculate device positions."""
        positions = []
        num_nodes = len(nodes)
        
        if num_nodes == 1:
            return [{'x': 960, 'y': 540}]
        
        if num_nodes <= 4:
            cols = 2
            rows = math.ceil(num_nodes / cols)
            spacing_x, spacing_y = 400, 300
            start_x = 960 - (cols - 1) * spacing_x / 2
            start_y = 540 - (rows - 1) * spacing_y / 2
            
            for i in range(num_nodes):
                col, row = i % cols, i // cols
                positions.append({
                    'x': int(start_x + col * spacing_x),
                    'y': int(start_y + row * spacing_y)
                })
        else:
            radius = min(400, 200 + num_nodes * 20)
            center_x, center_y = 960, 540
            for i in range(num_nodes):
                angle = 2 * math.pi * i / num_nodes
                positions.append({
                    'x': int(center_x + radius * math.cos(angle)),
                    'y': int(center_y + radius * math.sin(angle))
                })
        
        return positions
    
    def _create_device_configs(self, nodes: List[Dict], project_files_dir: str):
        """Create device configuration files."""
        for i, node in enumerate(nodes):
            config_file = os.path.join(project_files_dir, f"device_{i}.cfg")
            config = f"""hostname {node['name']}
!
interface FastEthernet0/0
 no shutdown
!
interface FastEthernet0/1
 no shutdown
!
ip routing
!
end
"""
            with open(config_file, 'w', encoding='utf-8') as f:
                f.write(config)


# Import List and Dict for type hints
from typing import List, Dict

# Update the main converter to use V2
def convert_from_json(json_path: str, output_path: str):
    """Convert JSON to .pkt using improved converter."""
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    converter = PacketTracerConverterV2()
    return converter.convert_network_to_pkt(
        data['nodes'],
        data['links'],
        output_path,
        data.get('name', 'AutoMesh Network')
    )

