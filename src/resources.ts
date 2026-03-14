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
    },
    // DeFi Resources
    {
      uri: 'defi://oracle-data',
      name: 'Oracle Data Feed',
      description: 'Latest oracle data from the network',
      mimeType: 'application/json'
    },
    {
      uri: 'defi://cross-chain-status',
      name: 'Cross-Chain Bridge Status',
      description: 'Status of cross-chain bridges and relays',
      mimeType: 'application/json'
    },
    {
      uri: 'defi://intents-active',
      name: 'Active DeFi Intents',
      description: 'Currently active DeFi intents for execution',
      mimeType: 'application/json'
    },
    {
      uri: 'defi://keepers-network',
      name: 'Keeper Network Status',
      description: 'Status of automated keepers and their capabilities',
      mimeType: 'application/json'
    },
    {
      uri: 'defi://da-data',
      name: 'Decentralized Data Availability',
      description: 'Available decentralized data and content',
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

    case 'defi://oracle-data': {
      const oracleMessages = state.messageHistory.get('defi-oracle-network') || []
      const oracleData = oracleMessages.slice(-50).map(msg => {
        try {
          return JSON.parse(msg.msg)
        } catch {
          return null
        }
      }).filter(Boolean)

      // Group by asset
      const assets: { [key: string]: any[] } = {}
      oracleData.forEach(data => {
        if (!assets[data.asset]) {
          assets[data.asset] = []
        }
        assets[data.asset].push(data)
      })

      return {
        assets,
        totalDataPoints: oracleData.length,
        timestamp: Date.now()
      }
    }

    case 'defi://cross-chain-status': {
      const bridgeMessages = state.messageHistory.get('defi-cross-chain-relay') || []
      const bridges: { [key: string]: any } = {}

      bridgeMessages.slice(-100).forEach(msg => {
        try {
          const data = JSON.parse(msg.msg)
          const key = `${data.sourceChain}-${data.targetChain}`
          if (!bridges[key]) {
            bridges[key] = {
              sourceChain: data.sourceChain,
              targetChain: data.targetChain,
              messages: 0,
              lastActivity: 0
            }
          }
          bridges[key].messages++
          bridges[key].lastActivity = Math.max(bridges[key].lastActivity, data.timestamp)
        } catch {}
      })

      return {
        bridges: Object.values(bridges),
        totalBridges: Object.keys(bridges).length,
        timestamp: Date.now()
      }
    }

    case 'defi://intents-active': {
      const intentMessages = state.messageHistory.get('defi-intent-coordination') || []
      const intents = intentMessages.slice(-50).map(msg => {
        try {
          return JSON.parse(msg.msg)
        } catch {
          return null
        }
      }).filter(intent => intent && intent.status === 'pending')

      return {
        intents,
        count: intents.length,
        timestamp: Date.now()
      }
    }

    case 'defi://keepers-network': {
      const keeperMessages = state.messageHistory.get('defi-keeper-network') || []
      const keepers: { [key: string]: any } = {}

      keeperMessages.slice(-100).forEach(msg => {
        try {
          const data = JSON.parse(msg.msg)
          if (data.peerId && data.type) {
            keepers[data.peerId] = {
              peerId: data.peerId,
              type: data.type,
              capabilities: data.capabilities || [],
              lastActive: data.lastActive || Date.now(),
              reputation: data.reputation || 1.0
            }
          }
        } catch {}
      })

      return {
        keepers: Object.values(keepers),
        totalKeepers: Object.keys(keepers).length,
        timestamp: Date.now()
      }
    }

    case 'defi://da-data': {
      const daMessages = state.messageHistory.get('defi-data-availability') || []
      const dataEntries = daMessages.slice(-50).map(msg => {
        try {
          return JSON.parse(msg.msg)
        } catch {
          return null
        }
      }).filter(Boolean)

      return {
        dataEntries,
        count: dataEntries.length,
        totalSize: dataEntries.reduce((sum, entry) => sum + (entry.size || 0), 0),
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