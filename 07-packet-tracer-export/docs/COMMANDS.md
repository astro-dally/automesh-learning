# Simple Terminal Commands

Quick reference for using the Packet Tracer export tools.

## Prerequisites

Make sure you're in the project directory and virtual environment is activated:

```bash
cd /Users/dally/automesh-learning
source venv/bin/activate
```

## Command 1: Create Manual Guide (Recommended)

This creates a step-by-step guide to manually recreate your network in Packet Tracer.

```bash
cd 07-packet-tracer-export
python scripts/create_manual_guide.py examples/my_network.json output/guide.txt
```

**Output**: Creates `output/guide.txt`

## Command 2: Convert to .pkt File

Try to create a .pkt file (may not work due to format compatibility):

```bash
cd 07-packet-tracer-export
python -c "from scripts.pkt_converter import convert_from_json; convert_from_json('examples/my_network.json', 'output/my_network.pkt')"
```

**Output**: Creates `output/my_network.pkt` and `output/my_network_manual_guide.txt`

## Command 3: View Your Network JSON

Check what's in your network file:

```bash
cd 07-packet-tracer-export
cat examples/my_network.json
```

## Command 4: View the Manual Guide

Read the guide that was created:

```bash
cd 07-packet-tracer-export
cat output/guide.txt
```

Or open it in your default text editor:

```bash
cd 07-packet-tracer-export
open output/guide.txt  # macOS
```

## Command 5: List All Generated Files

See what files were created:

```bash
cd 07-packet-tracer-export
ls -lh output/
```

## Complete Workflow Example

```bash
# 1. Navigate to project
cd /Users/dally/automesh-learning
source venv/bin/activate

# 2. Go to export directory
cd 07-packet-tracer-export

# 3. Create manual guide (recommended)
python scripts/create_manual_guide.py examples/my_network.json output/guide.txt

# 4. View the guide
open output/guide.txt

# 5. (Optional) Try .pkt conversion
python -c "from scripts.pkt_converter import convert_from_json; convert_from_json('examples/my_network.json', 'output/my_network.pkt')"
```

## Quick One-Liners

**Create guide only:**
```bash
cd 07-packet-tracer-export && python scripts/create_manual_guide.py examples/my_network.json output/guide.txt
```

**Create guide and view it:**
```bash
cd 07-packet-tracer-export && python scripts/create_manual_guide.py examples/my_network.json output/guide.txt && open output/guide.txt
```

**Convert and create guide:**
```bash
cd 07-packet-tracer-export && python -c "from scripts.pkt_converter import convert_from_json; convert_from_json('examples/my_network.json', 'output/my_network.pkt')"
```

## Troubleshooting

**If you get "No module named 'scripts'":**
```bash
cd /Users/dally/automesh-learning/07-packet-tracer-export
python -c "import sys; sys.path.insert(0, '.'); from scripts.pkt_converter import convert_from_json; convert_from_json('examples/my_network.json', 'output/my_network.pkt')"
```

**If file not found:**
```bash
# Check what JSON files exist
ls examples/*.json

# Use the correct filename
python scripts/create_manual_guide.py examples/<your-file>.json output/guide.txt
```

## Most Common Command

For most users, this is all you need:

```bash
cd /Users/dally/automesh-learning/07-packet-tracer-export
python scripts/create_manual_guide.py examples/my_network.json output/guide.txt
open output/guide.txt
```

This creates the guide and opens it for you to follow!
