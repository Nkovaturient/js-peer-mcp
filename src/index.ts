#!/usr/bin/env node

import { Server } from '@mcp/sdk/server/index.js'
import { StdioServerTransport } from '@mcp/sdk/server/stdio.js'
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema } from '@mcp/sdk/types.js'

import { StateManager } from './state.js'
import { createResources, handleResourceRead } from './resources.js'
import { createNodeManagementTools, handleNodeManagement } from './tools/node-management.js'
import { createPeerManagementTools, handlePeerManagement } from './tools/peer-management.js'
import { createMessagingTools, handleMessaging } from './tools/messaging.js'
import { createFileSharingTools, handleFileSharing } from './tools/file-sharing.js'
import { createMonitoringTools, handleMonitoring } from './tools/monitoring.js'
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from './constants.js'

class UniversalConnectivityMCPServer {
  private server: Server
  private stateManager: StateManager

  constructor() {
    this.stateManager = new StateManager()
    
    this.server = new Server(
      {
        name: MCP_SERVER_NAME,
        version: MCP_SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    )

    this.setupHandlers()
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = [
        ...createNodeManagementTools(this.stateManager),
        ...createPeerManagementTools(this.stateManager),
        ...createMessagingTools(this.stateManager),
        ...createFileSharingTools(this.stateManager),
        ...createMonitoringTools(this.stateManager),
      ]

      return { tools }
    })

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        let result: any

        // Route to appropriate handler based on tool name
        if (['create_libp2p_node', 'start_libp2p_node', 'stop_libp2p_node', 'get_node_status'].includes(name)) {
          result = await handleNodeManagement(name, args, this.stateManager)
        } else if (['discover_peers', 'connect_to_peer', 'disconnect_from_peer', 'list_connections', 'get_peer_info', 'ping_peer'].includes(name)) {
          result = await handlePeerManagement(name, args, this.stateManager)
        } else if (['send_group_message', 'send_direct_message', 'subscribe_to_topic', 'unsubscribe_from_topic', 'get_message_history', 'get_topic_subscribers'].includes(name)) {
          result = await handleMessaging(name, args, this.stateManager)
        } else if (['share_file', 'request_file', 'list_shared_files', 'announce_file'].includes(name)) {
          result = await handleFileSharing(name, args, this.stateManager)
        } else if (['get_network_stats', 'get_protocol_handlers', 'enable_debug_logging', 'get_peer_store_info'].includes(name)) {
          result = await handleMonitoring(name, args, this.stateManager)
        } else {
          throw new Error(`Unknown tool: ${name}`)
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        }
      }
    })

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const resources = createResources(this.stateManager)
      return { resources }
    })

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params

      try {
        const content = await handleResourceRead(uri, this.stateManager)
        
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(content, null, 2),
            },
          ],
        }
      } catch (error) {
        throw new Error(`Failed to read resource ${uri}: ${error instanceof Error ? error.message : String(error)}`)
      }
    })
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      const state = this.stateManager.getState()
      if (state.libp2pNode) {
        await state.libp2pNode.stop()
      }
      process.exit(0)
    })
  }
}

// Start the server
const server = new UniversalConnectivityMCPServer()
server.run().catch((error) => {
  console.error('Failed to start MCP server:', error)
  process.exit(1)
})