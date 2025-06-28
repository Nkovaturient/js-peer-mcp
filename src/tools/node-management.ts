import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { StateManager } from '../state.js'
import { startLibp2p } from '../lib/libp2p.js'
import type { NodeConfig } from '../types/index.js'

export function createNodeManagementTools(stateManager: StateManager): Tool[] {
  return [
    {
      name: 'create_libp2p_node',
      description: 'Initialize a new libp2p node with configurable options',
      inputSchema: {
        type: 'object',
        properties: {
          transports: {
            type: 'array',
            items: { type: 'string', enum: ['webrtc', 'websockets', 'webtransport'] },
            description: 'List of transports to enable',
            default: ['webrtc', 'websockets', 'webtransport']
          },
          enableRelay: {
            type: 'boolean',
            description: 'Enable circuit relay transport',
            default: true
          },
          bootstrapPeers: {
            type: 'array',
            items: { type: 'string' },
            description: 'Custom bootstrap peer multiaddrs'
          },
          listenAddresses: {
            type: 'array',
            items: { type: 'string' },
            description: 'Custom listen addresses'
          }
        }
      }
    },
    {
      name: 'start_libp2p_node',
      description: 'Start the libp2p node and begin listening',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'stop_libp2p_node',
      description: 'Gracefully shutdown the libp2p node',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'get_node_status',
      description: 'Return current node status, peer ID, and addresses',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    }
  ]
}

export async function handleNodeManagement(
  name: string,
  args: any,
  stateManager: StateManager
): Promise<any> {
  const state = stateManager.getState()

  switch (name) {
    case 'create_libp2p_node': {
      if (state.libp2pNode) {
        throw new Error('Libp2p node already exists. Stop the current node first.')
      }

      stateManager.setNodeStatus('starting')
      
      try {
        const config: NodeConfig = {
          transports: args.transports,
          enableRelay: args.enableRelay,
          bootstrapPeers: args.bootstrapPeers,
          listenAddresses: args.listenAddresses
        }

        const libp2p = await startLibp2p(config)
        stateManager.setLibp2pNode(libp2p)
        stateManager.setNodeStatus('running')

        // Set up event listeners
        libp2p.addEventListener('connection:open', () => {
          stateManager.updateConnections(libp2p.getConnections())
        })

        libp2p.addEventListener('connection:close', () => {
          stateManager.updateConnections(libp2p.getConnections())
        })

        return {
          success: true,
          peerId: libp2p.peerId.toString(),
          addresses: libp2p.getMultiaddrs().map(ma => ma.toString()),
          status: 'running'
        }
      } catch (error) {
        stateManager.setNodeStatus('stopped')
        throw new Error(`Failed to create libp2p node: ${error}`)
      }
    }

    case 'start_libp2p_node': {
      if (!state.libp2pNode) {
        throw new Error('No libp2p node exists. Create a node first.')
      }

      if (state.nodeStatus === 'running') {
        return {
          success: true,
          message: 'Node is already running',
          peerId: state.libp2pNode.peerId.toString()
        }
      }

      try {
        await state.libp2pNode.start()
        stateManager.setNodeStatus('running')

        return {
          success: true,
          peerId: state.libp2pNode.peerId.toString(),
          addresses: state.libp2pNode.getMultiaddrs().map(ma => ma.toString()),
          status: 'running'
        }
      } catch (error) {
        throw new Error(`Failed to start libp2p node: ${error}`)
      }
    }

    case 'stop_libp2p_node': {
      if (!state.libp2pNode) {
        throw new Error('No libp2p node exists.')
      }

      stateManager.setNodeStatus('stopping')

      try {
        await state.libp2pNode.stop()
        stateManager.setNodeStatus('stopped')
        stateManager.setLibp2pNode(null)

        return {
          success: true,
          message: 'Node stopped successfully'
        }
      } catch (error) {
        throw new Error(`Failed to stop libp2p node: ${error}`)
      }
    }

    case 'get_node_status': {
      if (!state.libp2pNode) {
        return {
          status: 'stopped',
          peerId: null,
          addresses: [],
          connections: 0
        }
      }

      return {
        status: state.nodeStatus,
        peerId: state.libp2pNode.peerId.toString(),
        addresses: state.libp2pNode.getMultiaddrs().map(ma => ma.toString()),
        connections: state.activeConnections.size,
        subscriptions: Array.from(state.subscriptions)
      }
    }

    default:
      throw new Error(`Unknown node management tool: ${name}`)
  }
}