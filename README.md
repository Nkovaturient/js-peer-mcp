# JS-Peer x DeFi MCP Server

A Model Context Protocol (MCP) server that provides programmatic access to **js-libp2p** universal-connectivity functionality + DeFi Toolings, enabling AI assistants to interact with peer-to-peer networks, send messages, facilitate oracle networks coordination and all such over Libp2p as coordination layer.

## Usage

### Starting the MCP Server

1. Install dependencies:

```bash
npm install
```

2. Build the project (optional; `npm start` will build automatically):

```bash
npm run build
```

3. Start the MCP server:

```bash
npm start
```

![Screenshot (622)](https://github.com/user-attachments/assets/c1c81509-62a5-463c-b15a-103545e962df)


- Connect with Claude Desktop App via `Edit Config` in `File` Navbar --> `Settings` --> `Developer` Tab or just press `Ctrl + ,` to open `settings menu` and edit the config file in any IDE as below:

```bash
# Example claude_desktop_config.json
{
  "mcpServers": {
    "universal-connectivity": {
      "command": "node",
      "args": ["/absolute/path/to/js-peer-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

## Skill definition (SKILL.md)

Claude Desktop loads skills from a `SKILL.md` file. This repo provides a ready-to-import skill definition:

- `SKILL.md` — skill definition that matches the tools exposed by this MCP server.
- `claude-universal-connectivity-skill.json` — same definition in pure JSON form.

To load the skill in Claude Desktop:
1. Open **Skills** in Claude Desktop.
2. Import or load `SKILL.md` from this repo.
3. After importing, you can call any of the listed tools from the skill.

![Screenshot (617)](https://github.com/user-attachments/assets/ae1e1cda-4fda-4354-8bc3-cc5f921c0836)


- Close and Reopen the Claude Desktop App and a `New Chat`, you will now be able to view the `universal-connectivity` option in `search and tools` button of the input area.

> ALWAYS ENSURE YOUR MCP SERVER IS RUNNING VIA `npm start` TO ACTIVATE THE JS-LIBP2P related operations

![Screenshot (618)](https://github.com/user-attachments/assets/72c14eaf-63b8-444d-ad18-db2f6822f8b0)

![Screenshot (619)](https://github.com/user-attachments/assets/cbcfa07d-4a21-4129-9e82-9501a413a409)



- Go ahead and chat with Claude for any libp2p related commands and it will present you with relevant results seamlessly! incredible, right?

Try this commands to get started:-
> create libp2p node, 'start libp2p node', 'stop libp2p node', 'get node status'

![Screenshot (620)](https://github.com/user-attachments/assets/17ee9612-30af-4a7f-8620-d4d15b4e4259)

![Screenshot (621)](https://github.com/user-attachments/assets/cb949e36-a7ee-4be8-abfb-24e7dee5e861)


- You can Further change permission access for this mcp-server through the left-bottom Your Account tab --> Settings --> Integrations --> `universal-connectivity`: tools and settings options:


![Screenshot (616)](https://github.com/user-attachments/assets/d0246d92-3f41-4af7-a755-c1b5c524da88)


## DeFi Enhancements

The MCP server now includes comprehensive DeFi capabilities that leverage libp2p's peer-to-peer networking for decentralized finance applications:

### DeFi Tools

#### Oracle Networks
- `submit_oracle_data` - Submit price/data feeds to decentralized oracle networks
- `query_oracle_data` - Query aggregated oracle data for assets
- Decentralized price feed aggregation without centralized providers

#### Cross-Chain Communication
- `relay_cross_chain_message` - Relay messages between different blockchain networks
- `get_bridge_status` - Monitor cross-chain bridge health and activity
- Fault-tolerant cross-chain communication infrastructure

#### Intent-Based DeFi
- `submit_intent` - Submit DeFi intents for solver coordination
- `discover_intent_solvers` - Find available solvers for intent execution
- Privacy-preserving intent propagation and MEV-resistant coordination

#### Decentralized Data Availability
- `publish_da_data` - Publish data to decentralized availability networks
- `retrieve_da_data` - Retrieve data with content addressing
- Trust-minimized data sharing for DeFi protocols

#### Keeper Networks
- `register_keeper` - Register automated keepers for DeFi operations
- `coordinate_keeper_action` - Coordinate liquidation, rebalancing, and harvest operations
- Decentralized automation without centralized coordination

### DeFi Resources

- `defi://oracle-data` - Real-time oracle data feeds and aggregation
- `defi://cross-chain-status` - Cross-chain bridge status and relay information
- `defi://intents-active` - Active DeFi intents awaiting execution
- `defi://keepers-network` - Keeper network status and capabilities
- `defi://da-data` - Decentralized data availability catalog

## Claude Skills Integration

This enhanced MCP server is designed to work seamlessly with Claude's skills system, providing AI-powered DeFi coordination capabilities.

### Setting up Claude Skills

1. **Load the DeFi Skill Configuration**:
   ```bash
   # The claude-defi-skill.json file contains the skill definition
   # Import this into Claude's skills system
   ```

2. **Skill Capabilities**:
   - **Oracle Network Management**: Automated price feed submission and aggregation
   - **Cross-Chain Coordination**: Intelligent bridge management and message routing
   - **Intent-Based Execution**: AI-assisted intent creation and solver matching
   - **Data Availability Management**: Decentralized data publishing and retrieval
   - **Keeper Network Orchestration**: Automated DeFi operation coordination

3. **Example Skill Usage**:
   ```
   "Help me set up a decentralized oracle network for ETH/USD price feeds"
   "Coordinate a cross-chain swap from Ethereum to Polygon"
   "Create an intent for yield farming optimization"
   "Monitor keeper network health and performance"
   ```

### Benefits for DeFi

- **Decentralization**: Replace centralized infrastructure with peer-to-peer networks
- **Censorship Resistance**: Operate without single points of failure
- **Cost Efficiency**: Reduce reliance on expensive centralized APIs
- **Privacy**: Enable private coordination channels for sensitive operations
- **Scalability**: Leverage libp2p's efficient P2P communication protocols
- **Interoperability**: Connect disparate DeFi protocols and blockchains

### Real-World DeFi Applications

1. **Decentralized Oracles**: Chainlink-style oracle networks without centralized nodes
2. **Cross-Chain Bridges**: Secure message passing between L1/L2 networks
3. **Intent-Based DEXs**: Privacy-preserving intent propagation (like CoW Swap)
4. **Keeper DAOs**: Decentralized automation networks for liquidations and rebalancing
5. **DeFi Data Availability**: Off-chain data sharing for rollups and Layer 2 solutions
6. **MEV Mitigation**: Private solver networks and coordination channels

## Available Tools

### Node Management
- `create_libp2p_node` - Initialize a new libp2p node
- `start_libp2p_node` - Start the libp2p node
- `stop_libp2p_node` - Stop the libp2p node
- `get_node_status` - Get current node status

### Peer Management
- `discover_peers` - Discover peers on the network
- `connect_to_peer` - Connect to a specific peer
- `disconnect_from_peer` - Disconnect from a peer
- `list_connections` - List active connections
- `get_peer_info` - Get detailed peer information
- `ping_peer` - Ping a peer to test connectivity

### Messaging
- `send_group_message` - Send message to a topic
- `send_direct_message` - Send private message to a peer
- `subscribe_to_topic` - Subscribe to a pubsub topic
- `unsubscribe_from_topic` - Unsubscribe from a topic
- `get_message_history` - Retrieve message history
- `get_topic_subscribers` - Get topic subscriber list

### File Sharing
- `share_file` - Share a file with the network
- `request_file` - Request a file from a peer
- `list_shared_files` - List available shared files
- `announce_file` - Announce file availability

### Monitoring
- `get_network_stats` - Get network statistics
- `get_protocol_handlers` - List protocol handlers
- `enable_debug_logging` - Configure debug logging
- `get_peer_store_info` - Get peer store information

### DeFi Tools

#### Oracle Networks
- `submit_oracle_data` - Submit price/data feeds to oracle networks
- `query_oracle_data` - Query aggregated oracle data for assets

#### Cross-Chain Communication
- `relay_cross_chain_message` - Relay messages between blockchain networks
- `get_bridge_status` - Monitor cross-chain bridge status

#### Intent-Based DeFi
- `submit_intent` - Submit DeFi intents for execution
- `discover_intent_solvers` - Find available intent solvers

#### Decentralized Data Availability
- `publish_da_data` - Publish data to DA networks
- `retrieve_da_data` - Retrieve data from DA networks

#### Keeper Networks
- `register_keeper` - Register automated keepers
- `coordinate_keeper_action` - Coordinate keeper operations

## Available Resources

- `connections://active` - Current active connections
- `peers://discovered` - Recently discovered peers
- `network://stats` - Network statistics
- `node://info` - Node information and status
- `files://shared` - Shared files catalog
- `messages://topic/{topicName}` - Messages for specific topic
- `messages://peer/{peerId}` - Direct messages with specific peer

### DeFi Resources
- `defi://oracle-data` - Oracle data feeds and aggregation
- `defi://cross-chain-status` - Cross-chain bridge status
- `defi://intents-active` - Active DeFi intents
- `defi://keepers-network` - Keeper network status
- `defi://da-data` - Decentralized data availability

## Configuration

The server supports various configuration options:

```typescript
interface NodeConfig {
  transports?: string[]           // ['webrtc', 'websockets', 'webtransport']
  enableRelay?: boolean          // Enable circuit relay (default: true)
  bootstrapPeers?: string[]      // Custom bootstrap peer multiaddrs
  listenAddresses?: string[]     // Custom listen addresses
}
```

## Protocol Support

- **WebRTC**: Browser-to-browser connections
- **WebSockets**: Traditional WebSocket connections  
- **WebTransport**: Modern QUIC-based transport
- **Circuit Relay**: NAT traversal and hole punching
- **Gossipsub**: Publish-subscribe messaging
- **Direct Messages**: Peer-to-peer messaging protocol
- **File Exchange**: Custom file sharing protocol

## Error Handling

The server provides comprehensive error handling with descriptive messages:

- Connection failures and timeouts
- Invalid peer IDs or multiaddrs  
- Network protocol errors
- File transfer interruptions
- Message delivery failures

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

## Architecture

The MCP server is built with a modular architecture:

- **State Manager**: Centralized state management
- **Tool Handlers**: Organized by functionality (node, peer, messaging, etc.)
- **Resource Providers**: Dynamic resource access
- **Protocol Integration**: Direct integration with libp2p protocols

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Related Projects

- [libp2p](https://github.com/libp2p/js-libp2p) - Modular peer-to-peer networking stack
- [universal-connectivity](https://github.com/libp2p/universal-connectivity) - Universal connectivity examples
- [Model Context Protocol](https://github.com/modelcontextprotocol/specification) - MCP specification
