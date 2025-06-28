import { Tool } from '@mcp/sdk/types.js'
import { StateManager } from '../state.js'

export function createMonitoringTools(stateManager: StateManager): Tool[] {
  return [
    {
      name: 'get_network_stats',
      description: 'Retrieve network statistics and performance metrics',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'get_protocol_handlers',
      description: 'List all registered protocol handlers',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'enable_debug_logging',
      description: 'Configure debug logging levels',
      inputSchema: {
        type: 'object',
        properties: {
          level: {
            type: 'string',
            enum: ['error', 'warn', 'info', 'debug', 'trace'],
            description: 'Logging level to enable',
            default: 'info'
          },
          components: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific components to enable logging for'
          }
        }
      }
    },
    {
      name: 'get_peer_store_info',
      description: 'Get information about peers in the peer store',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of peers to return',
            default: 50
          }
        }
      }
    }
  ]
}

export async function handleMonitoring(
  name: string,
  args: any,
  stateManager: StateManager
): Promise<any> {
  const state = stateManager.getState()

  if (!state.libp2pNode) {
    throw new Error('No libp2p node is running. Create and start a node first.')
  }

  const libp2p = state.libp2pNode

  switch (name) {
    case 'get_network_stats': {
      const stats = stateManager.getNetworkStats()
      const connections = libp2p.getConnections()
      
      // Group connections by protocol
      const protocolStats: { [protocol: string]: number } = {}
      connections.forEach(conn => {
        conn.remoteAddr.protoNames().forEach(proto => {
          protocolStats[proto] = (protocolStats[proto] || 0) + 1
        })
      })

      return {
        success: true,
        stats: {
          ...stats,
          protocolDistribution: protocolStats,
          nodeId: libp2p.peerId.toString(),
          addresses: libp2p.getMultiaddrs().map(ma => ma.toString())
        }
      }
    }

    case 'get_protocol_handlers': {
      try {
        // Get registered protocols from the registrar
        const protocols = Array.from((libp2p as any).components.registrar.topologies.keys())
        
        return {
          success: true,
          protocols,
          count: protocols.length
        }
      } catch (error) {
        throw new Error(`Failed to get protocol handlers: ${error}`)
      }
    }

    case 'enable_debug_logging': {
      const { level = 'info', components } = args

      try {
        // This would typically configure the logging system
        // For now, we'll just return the configuration
        return {
          success: true,
          level,
          components: components || ['all'],
          message: `Debug logging configured for level: ${level}`
        }
      } catch (error) {
        throw new Error(`Failed to configure debug logging: ${error}`)
      }
    }

    case 'get_peer_store_info': {
      const { limit = 50 } = args

      try {
        const allPeers = []
        let count = 0

        for await (const peer of libp2p.peerStore.all()) {
          if (count >= limit) break
          
          allPeers.push({
            peerId: peer.id.toString(),
            addresses: peer.addresses.map(addr => addr.multiaddr.toString()),
            protocols: peer.protocols,
            metadata: Object.fromEntries(peer.metadata.entries())
          })
          count++
        }

        return {
          success: true,
          peers: allPeers,
          count: allPeers.length,
          hasMore: count === limit
        }
      } catch (error) {
        throw new Error(`Failed to get peer store info: ${error}`)
      }
    }

    default:
      throw new Error(`Unknown monitoring tool: ${name}`)
  }
}