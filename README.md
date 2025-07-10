# MCP Server for Universal Connectivity JS-Peer

A Model Context Protocol (MCP) server that provides programmatic access to libp2p universal-connectivity functionality, enabling AI assistants to interact with peer-to-peer networks, manage connections, send messages, and share files.

## Features

### 🔗 Node Management
- Create and configure libp2p nodes with custom transports
- Start/stop nodes with graceful shutdown
- Monitor node status and addresses
- Support for WebRTC, WebSockets, and WebTransport

### 👥 Peer Management  
- Discover peers using pubsub peer discovery
- Connect to peers via multiaddr or peer ID
- Manage active connections
- Ping peers to test connectivity
- Access peer store information

### 💬 Messaging
- Send messages to pubsub topics (group chat)
- Send direct messages to specific peers
- Subscribe/unsubscribe to topics
- Retrieve message history
- Get topic subscriber lists

### 📁 File Sharing
- Share files using the file exchange protocol
- Request files from peers
- Announce file availability to the network
- List shared files with metadata

### 📊 Network Monitoring
- Real-time network statistics
- Protocol handler information
- Debug logging configuration
- Peer store insights

## Installation

```bash
npm install
npm run build
```

## Usage

### Starting the MCP Server

- 1) Run the MCP Server in terminal 

```bash
npm start
```

- 2) Connect with Claude Desktop App via `Edit Config` in `File` Navbar --> `Settings` --> `Developer` Tab or press `Ctrl + ,` and edit the config file as below:

```bash
claude_desktop_config.json

{
  "mcpServers": {
    "universal-connectivity": {
      "command": "node",
      "args": ["path-to-file-location/js-peer-mcp-server/dist/index.js"], //  C:/js-peer-mcp-server/dist/index.js
      "env": {}
    }
  }
}

```

- 3) Reopen the Claude Desktop and a `New Chat`, you will now be able to view the `universal-connectivity` option in `search and tools` button of the input area.

> ALWAYS ENSURE YOUR MCP SERVER IS RUNNING VIA `npm start` TO ACCESS THE JS-LIBP2P CMDs



- 4) Go ahead and chat with Claude for any libp2p related commands and it will present you with relevant results seamlessly! incredible, right?

Try this commands to get started:-
> create libp2p node, 'start libp2p node', 'stop libp2p node', 'get node status'



### Basic Operations

#### 1. Create and Start a Node

```json
{
  "method": "create_libp2p_node",
  "params": {
    "transports": ["webrtc", "websockets", "webtransport"],
    "enableRelay": true
  }
}
```

#### 2. Connect to the Network

```json
{
  "method": "discover_peers",
  "params": {
    "timeout": 10000
  }
}
```

#### 3. Send a Group Message

```json
{
  "method": "send_group_message", 
  "params": {
    "topic": "universal-connectivity",
    "message": "Hello from MCP!"
  }
}
```

#### 4. Share a File

```json
{
  "method": "share_file",
  "params": {
    "filePath": "/path/to/file.txt",
    "announce": true
  }
}
```

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

## Available Resources

- `connections://active` - Current active connections
- `peers://discovered` - Recently discovered peers
- `network://stats` - Network statistics
- `node://info` - Node information and status
- `files://shared` - Shared files catalog
- `messages://topic/{topicName}` - Messages for specific topic
- `messages://peer/{peerId}` - Direct messages with specific peer

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