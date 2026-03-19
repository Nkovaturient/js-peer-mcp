import { StateManager } from '../state.js'

/**
 * Generate a friendly human-readable list of all available tools
 * with their parameters and descriptions.
 */
export function generateToolList(stateManager: StateManager): string {
  const tools = [
    {
      category: 'Node Management',
      tools: [
        {
          name: 'create_libp2p_node',
          description: 'Initialize a new libp2p node with configurable options',
          params: 'transports (array), enableRelay (boolean), bootstrapPeers (array), listenAddresses (array)'
        },
        {
          name: 'start_libp2p_node',
          description: 'Start the libp2p node and begin listening',
          params: 'none'
        },
        {
          name: 'stop_libp2p_node',
          description: 'Gracefully shutdown the libp2p node',
          params: 'none'
        },
        {
          name: 'get_node_status',
          description: 'Return current node status, peer ID, and addresses',
          params: 'none'
        }
      ]
    },
    {
      category: 'Peer Management',
      tools: [
        {
          name: 'discover_peers',
          description: 'Initiate peer discovery using pubsub peer discovery',
          params: 'timeout (number, default: 10000ms)'
        },
        {
          name: 'connect_to_peer',
          description: 'Connect to a specific peer via multiaddr or peer ID',
          params: 'target (string, required)'
        },
        {
          name: 'disconnect_from_peer',
          description: 'Close connection to a specific peer',
          params: 'peerId (string, required)'
        },
        {
          name: 'list_connections',
          description: 'Get all active connections with metadata',
          params: 'none'
        },
        {
          name: 'get_peer_info',
          description: 'Retrieve detailed information about a specific peer',
          params: 'peerId (string, required)'
        },
        {
          name: 'ping_peer',
          description: 'Send ping to test connectivity with a peer',
          params: 'peerId (string, required), timeout (number, default: 5000ms)'
        }
      ]
    },
    {
      category: 'Messaging',
      tools: [
        {
          name: 'send_group_message',
          description: 'Send message to a pubsub topic (chat room)',
          params: 'message (string, required), topic (string, default: "universal-connectivity")'
        },
        {
          name: 'send_direct_message',
          description: 'Send private message directly to a peer',
          params: 'peerId (string, required), message (string, required)'
        },
        {
          name: 'subscribe_to_topic',
          description: 'Subscribe to a specific pubsub topic',
          params: 'topic (string, required)'
        },
        {
          name: 'unsubscribe_from_topic',
          description: 'Unsubscribe from a pubsub topic',
          params: 'topic (string, required)'
        },
        {
          name: 'get_message_history',
          description: 'Retrieve message history for a topic or peer',
          params: 'topic (string) OR peerId (string), limit (number, default: 50)'
        },
        {
          name: 'get_topic_subscribers',
          description: 'Get list of peers subscribed to a topic',
          params: 'topic (string, default: "universal-connectivity")'
        }
      ]
    },
    {
      category: 'File Sharing',
      tools: [
        {
          name: 'share_file',
          description: 'Share a file with the network using file exchange protocol',
          params: 'filePath (string) OR fileContent (string) + fileName (string), announce (boolean, default: true)'
        },
        {
          name: 'request_file',
          description: 'Request a file from a specific peer',
          params: 'peerId (string, required), fileId (string, required)'
        },
        {
          name: 'list_shared_files',
          description: 'Get list of files available for sharing',
          params: 'none'
        },
        {
          name: 'announce_file',
          description: 'Announce file availability to the network',
          params: 'fileId (string, required)'
        }
      ]
    },
    {
      category: 'Network Monitoring',
      tools: [
        {
          name: 'get_network_stats',
          description: 'Retrieve network statistics and performance metrics',
          params: 'none'
        },
        {
          name: 'get_protocol_handlers',
          description: 'List all registered protocol handlers',
          params: 'none'
        },
        {
          name: 'enable_debug_logging',
          description: 'Configure debug logging levels',
          params: 'level (string: error|warn|info|debug|trace, default: info), components (array)'
        },
        {
          name: 'get_peer_store_info',
          description: 'Get information about peers in the peer store',
          params: 'limit (number, default: 50)'
        }
      ]
    },
    {
      category: 'DeFi & Oracle',
      tools: [
        {
          name: 'submit_oracle_data',
          description: 'Submit price/data feed to a decentralized oracle network',
          params: 'asset (string, required), price (number, required), source (string, required), timestamp (number)'
        },
        {
          name: 'query_oracle_data',
          description: 'Query latest oracle data for an asset',
          params: 'asset (string, required)'
        },
        {
          name: 'relay_cross_chain_message',
          description: 'Relay a message between different blockchain networks',
          params: 'sourceChain (string, required), targetChain (string, required), message (string, required), priority (string: low|medium|high)'
        },
        {
          name: 'get_bridge_status',
          description: 'Check status of cross-chain bridges',
          params: 'none'
        },
        {
          name: 'submit_intent',
          description: 'Submit a DeFi intent for solver coordination',
          params: 'intentType (string: swap|liquidity|yield|arbitrage, required), parameters (object, required), deadline (number), solverFee (number)'
        },
        {
          name: 'discover_intent_solvers',
          description: 'Discover available solvers for intent execution',
          params: 'intentType (string), region (string)'
        },
        {
          name: 'publish_da_data',
          description: 'Publish data to decentralized availability network',
          params: 'data (string, required), contentType (string), retention (number)'
        },
        {
          name: 'retrieve_da_data',
          description: 'Retrieve data from decentralized availability network',
          params: 'dataId (string, required)'
        },
        {
          name: 'register_keeper',
          description: 'Register as a keeper for automated DeFi operations',
          params: 'keeperType (string: liquidation|rebalance|harvest|arbitrage, required), capabilities (array)'
        },
        {
          name: 'coordinate_keeper_action',
          description: 'Coordinate automated action with other keepers',
          params: 'action (string, required), protocol (string, required), parameters (object)'
        }
      ]
    }
  ]

  let output = '═══════════════════════════════════════════════════════════════\n'
  output += '       UNIVERSAL CONNECTIVITY - AVAILABLE TOOLS\n'
  output += '═══════════════════════════════════════════════════════════════\n\n'

  tools.forEach(category => {
    output += `📁 ${category.category.toUpperCase()}\n`
    output += '─'.repeat(65) + '\n'
    
    category.tools.forEach(tool => {
      output += `\n  ✓ ${tool.name}\n`
      output += `    └─ Description: ${tool.description}\n`
      output += `    └─ Parameters: ${tool.params}\n`
    })
    
    output += '\n'
  })

  output += '═══════════════════════════════════════════════════════════════\n'
  output += `Total Tools: ${tools.reduce((sum, cat) => sum + cat.tools.length, 0)}\n`
  output += 'Usage: Call any tool by name with its required/optional parameters\n'
  output += '═══════════════════════════════════════════════════════════════\n'

  return output
}
