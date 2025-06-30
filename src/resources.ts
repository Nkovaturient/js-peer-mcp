import { Resource } from '@modelcontextprotocol/sdk/types.js'
import { StateManager } from './state.js'

export function createResources(stateManager: StateManager): Resource[] {
  return [
    {
      uri: 'connections://active',
      name: 'Active Connections',
      description: 'Current active libp2p connections',
      mimeType: 'application/json'
    },
    {
      uri: 'peers://discovered',
      name: 'Discovered Peers',
      description: 'Recently discovered peers',
      mimeType: 'application/json'
    },
    {
      uri: 'network://stats',
      name: 'Network Statistics',
      description: 'Network performance and usage statistics',
      mimeType: 'application/json'
    },
    {
      uri: 'node://info',
      name: 'Node Information',
      description: 'Current node status and configuration',
      mimeType: 'application/json'
    },
    {
      uri: 'files://shared',
      name: 'Shared Files',
      description: 'Files available for sharing',
      mimeType: 'application/json'
    }
  ]
}

export async function handleResourceRead(uri: string, stateManager: StateManager): Promise<any> {
  const state = stateManager.getState()

  switch (uri) {
    case 'connections://active': {
      if (!state.libp2pNode) {
        return { connections: [], count: 0 }
      }

      const connections = state.libp2pNode.getConnections()
      return {
        connections: connections.map(conn => ({
          id: conn.id,
          peerId: conn.remotePeer.toString(),
          remoteAddr: conn.remoteAddr.toString(),
          protocols: conn.remoteAddr.protoNames(),
          status: conn.status,
          direction: conn.direction,
          timeline: conn.timeline
        })),
        count: connections.length,
        timestamp: Date.now()
      }
    }

    case 'peers://discovered': {
      // This would typically maintain a list of recently discovered peers
      // For now, return peers from connections
      if (!state.libp2pNode) {
        return { peers: [], count: 0 }
      }

      const connections = state.libp2pNode.getConnections()
      const peers = connections.map(conn => ({
        peerId: conn.remotePeer.toString(),
        multiaddrs: [conn.remoteAddr.toString()],
        protocols: conn.remoteAddr.protoNames(),
        connected: true,
        lastSeen: Date.now()
      }))

      return {
        peers,
        count: peers.length,
        timestamp: Date.now()
      }
    }

    case 'network://stats': {
      const stats = stateManager.getNetworkStats()
      return {
        ...stats,
        timestamp: Date.now()
      }
    }

    case 'node://info': {
      if (!state.libp2pNode) {
        return {
          status: 'stopped',
          peerId: null,
          addresses: [],
          protocols: []
        }
      }

      return {
        status: state.nodeStatus,
        peerId: state.libp2pNode.peerId.toString(),
        addresses: state.libp2pNode.getMultiaddrs().map(ma => ma.toString()),
        protocols: Array.from((state.libp2pNode as any).components.registrar.topologies.keys()),
        subscriptions: Array.from(state.subscriptions),
        timestamp: Date.now()
      }
    }

    case 'files://shared': {
      const files = Array.from(state.sharedFiles.values()).map(file => ({
        id: file.id,
        sender: file.sender,
        size: file.body.length,
        isLocal: state.libp2pNode ? file.sender === state.libp2pNode.peerId.toString() : false
      }))

      return {
        files,
        count: files.length,
        timestamp: Date.now()
      }
    }

    default:
      // Handle dynamic URIs like messages://topic/{topicName} or messages://peer/{peerId}
      if (uri.startsWith('messages://topic/')) {
        const topic = uri.replace('messages://topic/', '')
        const messages = stateManager.getMessages(topic)
        return {
          topic,
          messages,
          count: messages.length,
          timestamp: Date.now()
        }
      }

      if (uri.startsWith('messages://peer/')) {
        const peerId = uri.replace('messages://peer/', '')
        const messages = stateManager.getDirectMessages(peerId)
        return {
          peerId,
          messages,
          count: messages.length,
          timestamp: Date.now()
        }
      }

      throw new Error(`Unknown resource URI: ${uri}`)
  }
}