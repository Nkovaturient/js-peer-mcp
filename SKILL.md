---
name: js-peer-x-defi
description: 'Control and monitor a libp2p node (peer discovery, messaging, file sharing, network monitoring, and DeFi coordination) via Claude Desktop.'
---

{
  "name": "Js-Peer x DeFi",
  "description": "Control and monitor a libp2p node (peer discovery, messaging, file sharing, network monitoring, and DeFi coordination) via Claude Desktop.",
  "version": "1.0.0",
  "author": "Neha Kumari",
  "quick_start_guide": {
    "setup": [
      "1. Make sure the MCP server is running: npm start",
      "2. Configure Claude Desktop with the MCP endpoint in claude_desktop_config.json",
      "3. Restart Claude Desktop and import this skill",
      "4. Try one of the examples below!"
    ],
    "examples": [
      {
        "title": "Get Available Tools List",
        "description": "See all available tools and their parameters",
        "prompt": "Show me all available tools in the Universal Connectivity MCP server",
        "tool": "list_available_tools"
      },
      {
        "title": "Create and Start a Node",
        "description": "Set up a libp2p node with WebRTC, WebSockets, and WebTransport",
        "prompt": "Create a new libp2p node with relay enabled using default transports",
        "tools": ["create_libp2p_node", "start_libp2p_node"]
      },
      {
        "title": "Discover and Connect to Peers",
        "description": "Find peers on the network and establish connections",
        "prompt": "Discover peers on the network with a 15 second timeout",
        "tools": ["discover_peers", "get_node_status"]
      },
      {
        "title": "Send a Group Message",
        "description": "Broadcast a message to a pubsub topic",
        "prompt": "Subscribe to the universal-connectivity topic and send a message saying 'Hello Network!'",
        "tools": ["subscribe_to_topic", "send_group_message", "get_topic_subscribers"]
      },
      {
        "title": "Share and Retrieve Files",
        "description": "Share a file with the network and retrieve files from peers",
        "prompt": "Share a file with the network and announce its availability",
        "tools": ["share_file", "list_shared_files", "announce_file"]
      },
      {
        "title": "Monitor Network Health",
        "description": "Get statistics and protocol information about your node",
        "prompt": "Show me network statistics, protocol handlers, and peer store information",
        "tools": ["get_network_stats", "get_protocol_handlers", "get_peer_store_info"]
      },
      {
        "title": "DeFi Oracle Data",
        "description": "Submit and query price data from the oracle network",
        "prompt": "Submit ETH price of $3500 from Chainlink source to the oracle network, then query the latest ETH data",
        "tools": ["submit_oracle_data", "query_oracle_data"]
      },
      {
        "title": "Complete Workflow: Node to Message",
        "description": "Full workflow: create node → start → discover peers → subscribe → send message",
        "prompt": "Create a libp2p node with default settings, start it, discover peers, subscribe to universal-connectivity topic, and send a message",
        "tools": ["create_libp2p_node", "start_libp2p_node", "discover_peers", "subscribe_to_topic", "send_group_message"]
      }
    ]
  },
  "tools": [
    {
      "name": "list_available_tools",
      "description": "Get a friendly human-readable list of all available tools and their parameters",
      "parameters": {
        "type": "object",
        "properties": {}
      }
    },
    {
      "name": "create_libp2p_node",
      "description": "Initialize a new libp2p node with configurable options",
      "parameters": {
        "type": "object",
        "properties": {
          "transports": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": ["webrtc", "websockets", "webtransport"]
            },
            "description": "List of transports to enable",
            "default": ["webrtc", "websockets", "webtransport"]
          },
          "enableRelay": {
            "type": "boolean",
            "description": "Enable circuit relay transport",
            "default": true
          },
          "bootstrapPeers": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Custom bootstrap peer multiaddrs"
          },
          "listenAddresses": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Custom listen addresses"
          }
        }
      }
    },
    {
      "name": "start_libp2p_node",
      "description": "Start the libp2p node and begin listening",
      "parameters": {
        "type": "object",
        "properties": {}
      }
    },
    {
      "name": "stop_libp2p_node",
      "description": "Gracefully shutdown the libp2p node",
      "parameters": {
        "type": "object",
        "properties": {}
      }
    },
    {
      "name": "get_node_status",
      "description": "Return current node status, peer ID, and addresses",
      "parameters": {
        "type": "object",
        "properties": {}
      }
    },
    {
      "name": "discover_peers",
      "description": "Initiate peer discovery using pubsub peer discovery",
      "parameters": {
        "type": "object",
        "properties": {
          "timeout": {
            "type": "number",
            "description": "Discovery timeout in milliseconds",
            "default": 10000
          }
        }
      }
    },
    {
      "name": "connect_to_peer",
      "description": "Connect to a specific peer via multiaddr or peer ID",
      "parameters": {
        "type": "object",
        "properties": {
          "target": {
            "type": "string",
            "description": "Peer ID or multiaddr to connect to"
          }
        },
        "required": ["target"]
      }
    },
    {
      "name": "disconnect_from_peer",
      "description": "Close connection to a specific peer",
      "parameters": {
        "type": "object",
        "properties": {
          "peerId": {
            "type": "string",
            "description": "Peer ID to disconnect from"
          }
        },
        "required": ["peerId"]
      }
    },
    {
      "name": "list_connections",
      "description": "Get all active connections with metadata",
      "parameters": {
        "type": "object",
        "properties": {}
      }
    },
    {
      "name": "get_peer_info",
      "description": "Retrieve detailed information about a specific peer",
      "parameters": {
        "type": "object",
        "properties": {
          "peerId": {
            "type": "string",
            "description": "Peer ID to get information about"
          }
        },
        "required": ["peerId"]
      }
    },
    {
      "name": "ping_peer",
      "description": "Send ping to test connectivity with a peer",
      "parameters": {
        "type": "object",
        "properties": {
          "peerId": {
            "type": "string",
            "description": "Peer ID to ping"
          },
          "timeout": {
            "type": "number",
            "description": "Ping timeout in milliseconds",
            "default": 5000
          }
        },
        "required": ["peerId"]
      }
    },
    {
      "name": "send_group_message",
      "description": "Send message to a pubsub topic (chat room)",
      "parameters": {
        "type": "object",
        "properties": {
          "topic": {
            "type": "string",
            "description": "Topic to send message to",
            "default": "universal-connectivity"
          },
          "message": {
            "type": "string",
            "description": "Message content to send"
          }
        },
        "required": ["message"]
      }
    },
    {
      "name": "send_direct_message",
      "description": "Send private message directly to a peer",
      "parameters": {
        "type": "object",
        "properties": {
          "peerId": {
            "type": "string",
            "description": "Peer ID to send message to"
          },
          "message": {
            "type": "string",
            "description": "Message content to send"
          }
        },
        "required": ["peerId", "message"]
      }
    },
    {
      "name": "subscribe_to_topic",
      "description": "Subscribe to a specific pubsub topic",
      "parameters": {
        "type": "object",
        "properties": {
          "topic": {
            "type": "string",
            "description": "Topic to subscribe to"
          }
        },
        "required": ["topic"]
      }
    },
    {
      "name": "unsubscribe_from_topic",
      "description": "Unsubscribe from a pubsub topic",
      "parameters": {
        "type": "object",
        "properties": {
          "topic": {
            "type": "string",
            "description": "Topic to unsubscribe from"
          }
        },
        "required": ["topic"]
      }
    },
    {
      "name": "get_message_history",
      "description": "Retrieve message history for a topic or peer",
      "parameters": {
        "type": "object",
        "properties": {
          "topic": {
            "type": "string",
            "description": "Topic to get message history for"
          },
          "peerId": {
            "type": "string",
            "description": "Peer ID to get direct message history for"
          },
          "limit": {
            "type": "number",
            "description": "Maximum number of messages to return",
            "default": 50
          }
        }
      }
    },
    {
      "name": "get_topic_subscribers",
      "description": "Get list of peers subscribed to a topic",
      "parameters": {
        "type": "object",
        "properties": {
          "topic": {
            "type": "string",
            "description": "Topic to get subscribers for",
            "default": "universal-connectivity"
          }
        }
      }
    },
    {
      "name": "share_file",
      "description": "Share a file with the network using file exchange protocol",
      "parameters": {
        "type": "object",
        "properties": {
          "filePath": {
            "type": "string",
            "description": "Path to the file to share"
          },
          "fileContent": {
            "type": "string",
            "description": "Base64 encoded file content (alternative to filePath)"
          },
          "fileName": {
            "type": "string",
            "description": "Name of the file (required if using fileContent)"
          },
          "announce": {
            "type": "boolean",
            "description": "Whether to announce the file to the network",
            "default": true
          }
        }
      }
    },
    {
      "name": "request_file",
      "description": "Request a file from a specific peer",
      "parameters": {
        "type": "object",
        "properties": {
          "peerId": {
            "type": "string",
            "description": "Peer ID to request file from"
          },
          "fileId": {
            "type": "string",
            "description": "ID of the file to request"
          }
        },
        "required": ["peerId", "fileId"]
      }
    },
    {
      "name": "list_shared_files",
      "description": "Get list of files available for sharing",
      "parameters": {
        "type": "object",
        "properties": {}
      }
    },
    {
      "name": "announce_file",
      "description": "Announce file availability to the network",
      "parameters": {
        "type": "object",
        "properties": {
          "fileId": {
            "type": "string",
            "description": "ID of the file to announce"
          }
        },
        "required": ["fileId"]
      }
    },
    {
      "name": "get_network_stats",
      "description": "Retrieve network statistics and performance metrics",
      "parameters": {
        "type": "object",
        "properties": {}
      }
    },
    {
      "name": "get_protocol_handlers",
      "description": "List all registered protocol handlers",
      "parameters": {
        "type": "object",
        "properties": {}
      }
    },
    {
      "name": "enable_debug_logging",
      "description": "Configure debug logging levels",
      "parameters": {
        "type": "object",
        "properties": {
          "level": {
            "type": "string",
            "enum": ["error", "warn", "info", "debug", "trace"],
            "description": "Logging level to enable",
            "default": "info"
          },
          "components": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Specific components to enable logging for"
          }
        }
      }
    },
    {
      "name": "get_peer_store_info",
      "description": "Get information about peers in the peer store",
      "parameters": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "number",
            "description": "Maximum number of peers to return",
            "default": 50
          }
        }
      }
    },
    {
      "name": "submit_oracle_data",
      "description": "Submit price/data feed to a decentralized oracle network",
      "parameters": {
        "type": "object",
        "properties": {
          "asset": { "type": "string", "description": "Asset symbol (e.g., ETH, BTC)" },
          "price": { "type": "number", "description": "Price data to submit" },
          "source": { "type": "string", "description": "Data source identifier" },
          "timestamp": { "type": "number", "description": "Unix timestamp" }
        },
        "required": ["asset", "price", "source"]
      }
    },
    {
      "name": "query_oracle_data",
      "description": "Query latest oracle data for an asset",
      "parameters": {
        "type": "object",
        "properties": {
          "asset": { "type": "string", "description": "Asset symbol to query" }
        },
        "required": ["asset"]
      }
    },
    {
      "name": "relay_cross_chain_message",
      "description": "Relay a message between different blockchain networks",
      "parameters": {
        "type": "object",
        "properties": {
          "sourceChain": { "type": "string", "description": "Source chain ID" },
          "targetChain": { "type": "string", "description": "Target chain ID" },
          "message": { "type": "string", "description": "Message payload" },
          "priority": {
            "type": "string",
            "enum": ["low", "medium", "high"],
            "default": "medium"
          }
        },
        "required": ["sourceChain", "targetChain", "message"]
      }
    },
    {
      "name": "get_bridge_status",
      "description": "Check status of cross-chain bridges",
      "parameters": {
        "type": "object",
        "properties": {}
      }
    },
    {
      "name": "submit_intent",
      "description": "Submit a DeFi intent for solver coordination",
      "parameters": {
        "type": "object",
        "properties": {
          "intentType": {
            "type": "string",
            "enum": ["swap", "liquidity", "yield", "arbitrage"],
            "description": "Type of DeFi intent"
          },
          "parameters": { "type": "object", "description": "Intent-specific parameters" },
          "deadline": { "type": "number", "description": "Intent deadline (timestamp)" },
          "solverFee": { "type": "number", "description": "Maximum solver fee" }
        },
        "required": ["intentType", "parameters"]
      }
    },
    {
      "name": "discover_intent_solvers",
      "description": "Discover available solvers for intent execution",
      "parameters": {
        "type": "object",
        "properties": {
          "intentType": { "type": "string", "description": "Type of intent" },
          "region": { "type": "string", "description": "Geographic region preference" }
        }
      }
    },
    {
      "name": "publish_da_data",
      "description": "Publish data to decentralized availability network",
      "parameters": {
        "type": "object",
        "properties": {
          "data": { "type": "string", "description": "Data to publish" },
          "contentType": { "type": "string", "description": "MIME type of data" },
          "retention": { "type": "number", "description": "Retention period in days" }
        },
        "required": ["data"]
      }
    },
    {
      "name": "retrieve_da_data",
      "description": "Retrieve data from decentralized availability network",
      "parameters": {
        "type": "object",
        "properties": {
          "dataId": { "type": "string", "description": "Data identifier/CID" }
        },
        "required": ["dataId"]
      }
    },
    {
      "name": "register_keeper",
      "description": "Register as a keeper for automated DeFi operations",
      "parameters": {
        "type": "object",
        "properties": {
          "keeperType": {
            "type": "string",
            "enum": ["liquidation", "rebalance", "harvest", "arbitrage"],
            "description": "Type of keeper operation"
          },
          "capabilities": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Keeper capabilities"
          }
        },
        "required": ["keeperType"]
      }
    },
    {
      "name": "coordinate_keeper_action",
      "description": "Coordinate automated action with other keepers",
      "parameters": {
        "type": "object",
        "properties": {
          "action": { "type": "string", "description": "Action to coordinate" },
          "protocol": { "type": "string", "description": "DeFi protocol" },
          "parameters": { "type": "object", "description": "Action parameters" }
        },
        "required": ["action", "protocol"]
      }
    }
  ],
  "workflows": [
    {
      "name": "setup_and_join_network",
      "description": "Create a node, start it, discover peers, and join the network.",
      "steps": [
        "create_libp2p_node (transports, enableRelay, bootstrapPeers)",
        "start_libp2p_node",
        "discover_peers (timeout)",
        "connect_to_peer (target)"
      ]
    },
    {
      "name": "send_message",
      "description": "Start a node, subscribe to a topic, and send a group message.",
      "steps": [
        "start_libp2p_node",
        "subscribe_to_topic (topic)",
        "send_group_message (topic, message)",
        "get_message_history (topic, limit)"
      ]
    },
    {
      "name": "share_and_retrieve_file",
      "description": "Share a file, announce it, and fetch it from a peer.",
      "steps": [
        "share_file (filePath | fileContent, fileName)",
        "announce_file (fileId)",
        "request_file (peerId, fileId)",
        "list_shared_files"
      ]
    }
  ],
  "integrations": {
    "mcp_server": {
      "endpoint": "universal-connectivity",
      "tools_mapping": {
        "node_management": [
          "create_libp2p_node",
          "start_libp2p_node",
          "stop_libp2p_node",
          "get_node_status"
        ],
        "peer_management": [
          "discover_peers",
          "connect_to_peer",
          "disconnect_from_peer",
          "list_connections",
          "get_peer_info",
          "ping_peer"
        ],
        "messaging": [
          "send_group_message",
          "send_direct_message",
          "subscribe_to_topic",
          "unsubscribe_from_topic",
          "get_message_history",
          "get_topic_subscribers"
        ],
        "file_sharing": [
          "share_file",
          "request_file",
          "list_shared_files",
          "announce_file"
        ],
        "monitoring": [
          "get_network_stats",
          "get_protocol_handlers",
          "enable_debug_logging",
          "get_peer_store_info"
        ],
        "defi": [
          "submit_oracle_data",
          "query_oracle_data",
          "relay_cross_chain_message",
          "get_bridge_status",
          "submit_intent",
          "discover_intent_solvers",
          "publish_da_data",
          "retrieve_da_data",
          "register_keeper",
          "coordinate_keeper_action"
        ]
      }
    }
  },
  "capabilities": [
    "node_management",
    "peer_discovery",
    "messaging",
    "file_sharing",
    "network_monitoring",
    "defi_coordination"
  ],
  "use_cases": [
    "Run a libp2p node and connect to peers",
    "Send group and direct messages across the network",
    "Share files with peers using the file exchange protocol",
    "Monitor network stats and protocol handlers",
    "Submit and query DeFi oracle data",
    "Relay cross-chain messages",
    "Coordinate intent-based DeFi operations",
    "Manage keeper networks"
  ]
}
