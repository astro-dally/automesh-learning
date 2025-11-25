# Quick Start: Export to Cisco Packet Tracer

## 🚀 Simple 3-Step Process

### Step 1: Build Your Network
Open `06-customization/interactive_custom_network.html` in your browser and build your network:
- Add nodes (e.g., "Router1", "Router2")
- Connect them with links
- Set latencies and bandwidths

### Step 2: Export as JSON
Click the "Export JSON" button in the HTML interface and save the file to `examples/` directory (e.g., `examples/my_network.json`)

### Step 3: Convert to .pkt (or Create Manual Guide)

**Option A: Try .pkt conversion** (may not work due to format compatibility):

```bash
cd 07-packet-tracer-export
python -c "from scripts.pkt_converter import convert_from_json; convert_from_json('examples/my_network.json', 'output/my_network.pkt')"
```

**Option B: Create Manual Guide** (Recommended - more reliable):

```bash
cd 07-packet-tracer-export
python scripts/create_manual_guide.py examples/my_network.json output/guide.txt
```

### Step 4: Open in Packet Tracer

**If .pkt file works:**
1. Open Cisco Packet Tracer
2. File → Open → Select `output/my_network.pkt`
3. Your network topology will appear!

**If .pkt file doesn't work (most common):**
1. Open the `output/guide.txt` file
2. Follow the step-by-step instructions
3. Manually recreate your network (takes 5-10 minutes)
4. This method is more reliable and gives you full control!

## 📝 Example

```bash
# Navigate to the directory
cd 07-packet-tracer-export

# Create manual guide (recommended)
python scripts/create_manual_guide.py examples/my_network.json output/guide.txt

# View the guide
open output/guide.txt  # macOS
```

## ⚠️ Important Notes

- Make sure you have Cisco Packet Tracer installed
- The generated .pkt file contains basic device configurations
- You may need to configure IP addresses and routing protocols in Packet Tracer
- Device types are set as routers by default (can be customized in code)

## 🔧 Troubleshooting

**Problem**: "File not found" error
- **Solution**: Make sure the JSON file path is correct. Use paths relative to `07-packet-tracer-export/` directory.

**Problem**: .pkt file doesn't open in Packet Tracer
- **Solution**: Ensure you're using a compatible version of Packet Tracer. The file format may vary between versions. Use the manual guide instead.

**Problem**: Devices don't appear correctly
- **Solution**: The converter creates a basic structure. You may need to manually adjust device positions in Packet Tracer.

## 📚 Next Steps

After opening in Packet Tracer:
1. Configure IP addresses on router interfaces
2. Set up routing protocols (OSPF, EIGRP, etc.)
3. Add PCs or servers for testing
4. Test connectivity with ping and traceroute

---

**Need help?** Check the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) file or see [COMMANDS.md](COMMANDS.md) for quick command reference.
