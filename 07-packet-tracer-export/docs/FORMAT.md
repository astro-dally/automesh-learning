# JSON Format Specification

This document describes the exact JSON format expected by the Packet Tracer export tools.

## Required Format

```json
{
  "name": "Network Name",
  "nodes": [
    { "name": "Router1" },
    { "name": "Router2" }
  ],
  "links": [
    {
      "from": "Router1",
      "to": "Router2",
      "latency": 10,
      "bandwidth": 1000
    }
  ]
}
```

## Field Descriptions

### Root Level

- **`name`** (string, optional): Name of the network. Defaults to "AutoMesh Network" if not provided.
- **`nodes`** (array, required): List of network nodes/devices
- **`links`** (array, required): List of connections between nodes

### Node Object

- **`name`** (string, required): Unique name for the node (e.g., "Router1", "Server-A")

### Link Object

- **`from`** (string, required): Name of the source node
- **`to`** (string, required): Name of the destination node
- **`latency`** (number, optional): Link latency in milliseconds. Defaults to 10 if not provided.
- **`bandwidth`** (number, optional): Link bandwidth in Mbps. Can be omitted if not specified.

## Examples

### Minimal Example

```json
{
  "nodes": [
    { "name": "Router1" },
    { "name": "Router2" }
  ],
  "links": [
    {
      "from": "Router1",
      "to": "Router2"
    }
  ]
}
```

### Complete Example

```json
{
  "name": "Corporate Network",
  "nodes": [
    { "name": "HQ-Router" },
    { "name": "Branch-Router" },
    { "name": "DataCenter-Router" }
  ],
  "links": [
    {
      "from": "HQ-Router",
      "to": "Branch-Router",
      "latency": 25,
      "bandwidth": 1000
    },
    {
      "from": "HQ-Router",
      "to": "DataCenter-Router",
      "latency": 5,
      "bandwidth": 10000
    }
  ]
}
```

## Export from HTML Interface

The HTML interface (`06-customization/interactive_custom_network.html`) automatically exports in this format:

- ✅ Includes `name` field (auto-generated from node count)
- ✅ Includes all required fields
- ✅ Handles missing bandwidth gracefully (omits it if not set)
- ✅ Provides default latency if missing

## Validation

The converters will:
- ✅ Use default values for missing optional fields
- ✅ Handle `null` or `undefined` bandwidth values
- ✅ Generate network name if not provided
- ✅ Validate that nodes exist before creating links

## Common Issues

### Missing Network Name
**Problem**: JSON doesn't have `name` field
**Solution**: Converter uses default "AutoMesh Network"

### Missing Bandwidth
**Problem**: Link doesn't have `bandwidth` field
**Solution**: Converter uses default 100 Mbps, manual guide shows "not specified"

### Null Bandwidth
**Problem**: `bandwidth: null` in JSON
**Solution**: Converter treats as missing and uses default

### Invalid Node Names
**Problem**: Link references non-existent node
**Solution**: Converter skips invalid links with warning

---

**Note**: The HTML interface now exports in the correct format automatically!

