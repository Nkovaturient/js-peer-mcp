# Universal Connectivity Skill Guide

Welcome to the **Universal Connectivity MCP Server** skill for Claude Desktop! This guide will help you get started and make the most of all available features.

## 🚀 Quick Start

### Prerequisites
- ✅ MCP server running: `npm start`
- ✅ Claude Desktop configured with the MCP endpoint
- ✅ Skill imported into Claude Desktop

### First Time Setup (5 minutes)

```
User: "List all available tools"
→ Claude calls: list_available_tools
→ See friendly formatted list of all 35+ tools with parameters
```

This gives you an instant overview of what's available!

---

## 📚 Workflow Examples

### Workflow 1: Create Node & Join Network

**Goal**: Start a libp2p node and connect to the network

```
User: "Create a new libp2p node with default settings"
→ Creates node with WebRTC, WebSockets, WebTransport

User: "Start the node"
→ Node begins listening on configured addresses

User: "Discover peers on the network"
→ Initiates peer discovery with 10-second timeout

User: "Show node status"
→ Returns peer ID, addresses, connection count
```

**Try this combo prompt:**
> "Create a libp2p node with relay enabled, start it, and discover peers"

---

### Workflow 2: Send Group Messages

**Goal**: Broadcast messages to all peers in a topic

```
User: "Subscribe to universal-connectivity topic"
→ Joins the pubsub topic

User: "Send a message saying 'Hello Network'"
→ Message broadcasts to all subscribers

User: "Get message history for universal-connectivity"
→ See recent messages in the topic (limit: 50 last messages)

User: "Show subscribers to universal-connectivity"
→ Returns list of all peers listening to this topic
```

**Try this combo prompt:**
> "Subscribe to a topic, send a message, and show who received it"

---

### Workflow 3: Share & Retrieve Files

**Goal**: Share files with peers and request files from others

```
User: "Share a file at /path/to/file.txt and announce it"
→ File shared to network, availability announced to all peers

User: "List all shared files"
→ Shows local shared files with ID, size, sender

User: "Request file [fileId] from peer [peerId]"
→ Fetches file from peer using file exchange protocol

User: "Announce file availability for [fileId]"
→ Notifies network about a previously shared file
```

**Try this combo prompt:**
> "Share a file and broadcast its availability to the network"

---

### Workflow 4: Monitor Network Health

**Goal**: Get real-time insights into your node and network

```
User: "Get network statistics"
→ Returns bytes sent/received, messages, connections, protocol distribution

User: "List protocol handlers"
→ Shows all registered protocols (pubsub, ping, identify, etc.)

User: "Get peer store information"
→ Returns up to 50 peers with addresses and protocols

User: "Enable debug logging at info level"
→ Configure logging for troubleshooting
```

**Try this combo prompt:**
> "Show me a complete health check of the network: stats, protocols, and connected peers"

---

### Workflow 5: DeFi Oracle Data

**Goal**: Submit and query decentralized price feeds

```
User: "Submit ETH price of 3500.50 from Chainlink"
→ Oracle data published to defi-oracle-network topic

User: "Query the latest ETH price from the oracle"
→ Returns average price from recent submissions, all sources

User: "Submit BTC price of 75000 from CoinGecko"
→ Another data point added to the network

User: "Query BTC data"
→ Aggregates BTC prices across all sources
```

**Try this combo prompt:**
> "Submit ETH price data from multiple sources, then query the average price"

---

### Workflow 6: Cross-Chain Relay

**Goal**: Send messages between different blockchain networks

```
User: "Relay a message from Ethereum to Polygon"
→ Message published to defi-cross-chain-relay topic

User: "Check bridge status"
→ Returns active bridge connections and activity metrics

User: "Relay high priority message from Arbitrum to Optimism"
→ Message with priority flag sent to target chain
```

**Try this combo prompt:**
> "Relay a token swap message from Ethereum to Polygon and check bridge status"

---

### Workflow 7: DeFi Intent Coordination

**Goal**: Coordinate solver-based DeFi operations

```
User: "Submit a swap intent for 1 ETH to USDC"
→ Intent published to defi-intent-coordination topic with deadline

User: "Discover available solvers for swap intents"
→ Returns count of available solvers and their peer IDs

User: "Submit a liquidity provision intent"
→ Intent for providing LP tokens to a pool
```

**Try this combo prompt:**
> "Submit a swap intent and find available solvers to execute it"

---

### Workflow 8: Keeper Network Automation

**Goal**: Register and coordinate automated keepers

```
User: "Register as a liquidation keeper"
→ Register capability for automated liquidations

User: "Coordinate a liquidation action on Aave"
→ Broadcast coordination message to keeper network

User: "Register as a harvest keeper with rebalance capability"
→ Multi-capability keeper registration
```

**Try this combo prompt:**
> "Register different keeper types and coordinate an automated action"

---

## 💡 Pro Tips

### Tip 1: Always Start with list_available_tools
```
User: "Show me what tools are available"
→ Get formatted list with all parameters and descriptions
```

### Tip 2: Check Node Status Before Operations
```
User: "Get node status first, then discover peers"
→ Ensures node is running, then proceeds safely
```

### Tip 3: Chain Commands for Workflows
```
User: "Create node, start it, discover peers, connect to a peer, and send a message"
→ Claude sequences all steps with proper error handling
```

### Tip 4: Use Topic Descriptive Names
```
User: "Subscribe to 'ai-chat' topic instead of default"
→ Create custom topics for different conversations
```

### Tip 5: Monitor Before Making Changes
```
User: "Get network stats, then submit oracle data"
→ Gives baseline before changes, then submits
```

---

## 🔧 Common Tasks

### "I want to..." → "Try saying..."

| Goal | Prompt |
|------|--------|
| See all tools | "List available tools" |
| Set up a node | "Create and start a libp2p node" |
| Join the network | "Discover peers and connect to them" |
| Chat with peers | "Subscribe to universal-connectivity and send a message" |
| Share files | "Share a file and announce it to the network" |
| Check health | "Show network stats and protocol handlers" |
| Submit prices | "Submit ETH and BTC oracle data" |
| Relay messages | "Relay a message between Ethereum and Polygon" |
| Trade with intent | "Submit a swap intent and find solvers" |
| Automate DeFi | "Register a keeper and coordinate actions" |

---

## 📊 Tool Categories

### Node Management (4 tools)
- `create_libp2p_node` - Initialize node
- `start_libp2p_node` - Start listening
- `stop_libp2p_node` - Shut down gracefully
- `get_node_status` - Check status & peer ID

### Peer Management (6 tools)
- `discover_peers` - Find peers on network
- `connect_to_peer` - Establish connection
- `disconnect_from_peer` - Close connection
- `list_connections` - View all active connections
- `get_peer_info` - Detailed peer information
- `ping_peer` - Test connectivity

### Messaging (6 tools)
- `send_group_message` - Broadcast to topic
- `send_direct_message` - Private peer message
- `subscribe_to_topic` - Join pubsub topic
- `unsubscribe_from_topic` - Leave topic
- `get_message_history` - Retrieve messages
- `get_topic_subscribers` - List topic subscribers

### File Sharing (4 tools)
- `share_file` - Share with network
- `request_file` - Fetch from peer
- `list_shared_files` - View shared files
- `announce_file` - Announce availability

### Monitoring (5 tools)
- `list_available_tools` - All tools & parameters ⭐
- `get_network_stats` - Statistics & metrics
- `get_protocol_handlers` - Registered protocols
- `enable_debug_logging` - Configure logging
- `get_peer_store_info` - Peer database info

### DeFi & Oracle (10 tools)
- `submit_oracle_data` - Price feed submission
- `query_oracle_data` - Query aggregated prices
- `relay_cross_chain_message` - Cross-chain relay
- `get_bridge_status` - Bridge health check
- `submit_intent` - DeFi intent submission
- `discover_intent_solvers` - Find solvers
- `publish_da_data` - Data availability publish
- `retrieve_da_data` - Fetch available data
- `register_keeper` - Keeper registration
- `coordinate_keeper_action` - Keeper coordination

---

## ❓ FAQ

**Q: Do I need a running node to use every tool?**  
A: Most tools require a node, but `list_available_tools` works anytime without a node.

**Q: Can I use multiple tools in one prompt?**  
A: Yes! Claude chains commands: "Create node, start it, discover peers, connect to one"

**Q: What happens if a tool fails?**  
A: Claude displays the error and suggests next steps.

**Q: Where do my files get stored when I share them?**  
A: Files are held in memory in the node's state and shared via the file exchange protocol.

**Q: Can I create custom topics?**  
A: Yes! Any string is a valid topic: "my-app", "ai-chat", "trading", etc.

**Q: How many peers can I connect to?**  
A: Depends on libp2p configuration, typically dozens to hundreds.

---

## 🎯 Getting Help

**See all available commands:**
```
User: "List available tools"
```

**Check current state:**
```
User: "Get node status"
```

**Debug issues:**
```
User: "Enable debug logging at debug level and show protocol handlers"
```

---

## 📖 Complete Example Conversation

```
User: "Let's set up a peer node and send a message"

Claude: I'll help you set up a node and send a message. Let me do this step by step:

1. First, I'll create a new libp2p node with default settings
2. Start the node
3. Subscribe to the universal-connectivity topic
4. Send a test message

[Claude calls the tools in sequence]

Result: ✓ Node created and running
        ✓ Subscribed to topic
        ✓ Message sent to 5 peers
```

---

**Happy peer-to-peer computing! 🎉**
