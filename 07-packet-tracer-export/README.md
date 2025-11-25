# Cisco Packet Tracer Export

Export your custom network topologies to Cisco Packet Tracer format for network simulation and testing.

## 📁 Directory Structure

```
07-packet-tracer-export/
├── README.md              # This file - main documentation
├── scripts/               # Python conversion scripts
│   ├── pkt_converter.py           # Main converter (creates .pkt files)
│   ├── create_manual_guide.py     # Creates step-by-step manual guide
│   ├── convert_with_fallback.py   # Converter with fallback options
│   └── export_example.py          # Usage examples
├── docs/                  # Documentation files
│   ├── COMMANDS.md        # Quick command reference
│   ├── QUICKSTART.md      # Getting started guide
│   └── TROUBLESHOOTING.md # Troubleshooting help
├── examples/              # Example files and outputs
│   ├── my_network.json    # Example network JSON
│   ├── my_network.pkt     # Generated .pkt file
│   └── *_guide.txt        # Generated manual guides
└── output/                # Your generated files (created when you run scripts)
```

## 🚀 Quick Start

### Option 1: Create Manual Guide (Recommended)

```bash
cd scripts
python create_manual_guide.py ../examples/my_network.json ../output/guide.txt
```

### Option 2: Try .pkt Conversion

```bash
cd scripts
python -c "from pkt_converter import convert_from_json; convert_from_json('../examples/my_network.json', '../output/network.pkt')"
```

## 📚 Documentation

- **[QUICKSTART.md](docs/QUICKSTART.md)** - Step-by-step getting started guide
- **[COMMANDS.md](docs/COMMANDS.md)** - Simple terminal commands reference
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🎯 What This Module Does

1. **Converts Networks**: Transform your custom network JSON to Packet Tracer format
2. **Creates Manual Guides**: Generates step-by-step instructions for manual network creation
3. **Exports Topologies**: Export network designs for simulation in Packet Tracer

## 📋 Usage Examples

### Example 1: Create Manual Guide

```python
from scripts.create_manual_guide import create_packet_tracer_guide

create_packet_tracer_guide(
    json_path="examples/my_network.json",
    output_path="output/guide.txt"
)
```

### Example 2: Convert to .pkt

```python
from scripts.pkt_converter import convert_from_json

convert_from_json(
    json_path="examples/my_network.json",
    output_path="output/network.pkt"
)
```

## ⚠️ Important Notes

- **Packet Tracer Format**: The .pkt format is proprietary and may not work with all Packet Tracer versions
- **Recommended Approach**: Use the manual guide method - it's more reliable and takes only 5-10 minutes
- **File Locations**: Generated files go to the `output/` directory

## 🔧 Requirements

- Python 3.7+
- Network JSON file (exported from custom network builder)

## 📖 Workflow

1. **Design** your network in `06-customization/interactive_custom_network.html`
2. **Export** as JSON
3. **Convert** using scripts in this directory
4. **Open** in Cisco Packet Tracer or follow manual guide

## 🤝 Need Help?

- Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common issues
- See [COMMANDS.md](docs/COMMANDS.md) for quick command reference
- Read [QUICKSTART.md](docs/QUICKSTART.md) for detailed instructions

---

**Remember**: The manual guide approach is often faster and more reliable than trying to create perfect .pkt files!
