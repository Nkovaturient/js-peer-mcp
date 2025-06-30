import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { StateManager } from '../state.js'
import { multiaddr } from '@multiformats/multiaddr'
import { peerIdFromString } from '@libp2p/peer-id'
import type { PeerInfo } from '../types/index.js'

export function createPeerManagementTools(stateManager: StateManager): Tool[] {
  return [
    {
      name: 'discover_peers',
      description: 'Initiate peer discovery using pubsub peer discovery',
      inputSchema: {
        type: 'object',
        properties: {
          timeout: {
            type: 'number',
            description: 'Discovery timeout in milliseconds',
            default: 10000
          }
        }
      }
    },
    {
      name: 'connect_to_peer',
      description: 'Connect to a specific peer via multiaddr or peer ID',
      inputSchema: {
        type: 'object',
        properties: {
          target: {
            type: 'string',
            description: 'Peer ID or multiaddr to connect to'
          }
        },
        required: ['target']
      }
    },
    {
      name: 'disconnect_from_peer',
      description: 'Close connection to a specific peer',
      inputSchema: {
        type: 'object',
        properties: {
          peerId: {
            type: 'string',
            description: 'Peer ID to disconnect from'
          }
        },
        required: ['peerId']
      }
    },
    {
      name: 'list_connections',
      description: 'Get all active connections with metadata',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'get_peer_info',
      description: 'Retrieve detailed information about a specific peer',
      inputSchema: {
        type: 'object',
        properties: {
          peerId: {
            type: 'string',
            description: 'Peer ID to get information about'
          }
        },
        required: ['peerId']
      }
    },
    {
      name: 'ping_peer',
      description: 'Send ping to test connectivity with a peer',
      inputSchema: {
        type: 'object',
        properties: {
          peerId: {
            type: 'string',
            description: 'Peer ID to ping'
          },
          timeout: {
            type: 'number',
            description: 'Ping timeout in milliseconds',
            default: 5000
          }
        },
        required: ['peerId']
      }
    }
  ]
}

export async function handlePeerManagement(
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
    case 'discover_peers': {
      const timeout = args.timeout || 10000
      const discoveredPeers: any[] = []

      return new Promise((resolve) => {
        const handlePeerDiscovery = (event: any) => {
          const { id, multiaddrs } = event.detail
          discoveredPeers.push({
            peerId: id.toString(),
            multiaddrs: multiaddrs.map((ma: any) => ma.toString())
          })
        }

        libp2p.addEventListener('peer:discovery', handlePeerDiscovery)

        setTimeout(() => {
          libp2p.removeEventListener('peer:discovery', handlePeerDiscovery)
          resolve({
            success: true,
            discoveredPeers,
            count: discoveredPeers.length
          })
        }, timeout)
      })
    }

    case 'connect_to_peer': {
      const { target } = args

      try {
        let connection
        
        // Try to parse as multiaddr first
        try {
          const ma = multiaddr(target)
          connection = await libp2p.dial(ma)
        } catch {
          // If not a multiaddr, try as peer ID
          const peerId = peerIdFromString(target)
          connection = await libp2p.dial(peerId as any)
        }

        stateManager.updateConnections(libp2p.getConnections())

        return {
          success: true,
          peerId: connection.remotePeer.toString(),
          remoteAddr: connection.remoteAddr.toString(),
          protocols: connection.remoteAddr.protoNames()
        }
      } catch (error) {
        throw new Error(`Failed to connect to peer: ${error}`)
      }
    }

    case 'disconnect_from_peer': {
      const { peerId } = args

      try {
        const peer = peerIdFromString(peerId)
        await libp2p.hangUp(peer as any)
        stateManager.updateConnections(libp2p.getConnections())

        return {
          success: true,
          message: `Disconnected from peer ${peerId}`
        }
      } catch (error) {
        throw new Error(`Failed to disconnect from peer: ${error}`)
      }
    }

    case 'list_connections': {
      const connections = libp2p.getConnections()
      
      return {
        success: true,
        connections: connections.map(conn => ({
          id: conn.id,
          peerId: conn.remotePeer.toString(),
          remoteAddr: conn.remoteAddr.toString(),
          protocols: conn.remoteAddr.protoNames(),
          status: conn.status,
          direction: conn.direction,
          timeline: conn.timeline
        })),
        count: connections.length
      }
    }

    case 'get_peer_info': {
      const { peerId } = args

      try {
        const peer = peerIdFromString(peerId)
        const connections = libp2p.getConnections(peer as any)
        
        let peerInfo: PeerInfo = {
          peerId,
          multiaddrs: [],
          protocols: [],
          connected: connections.length > 0,
          connectionCount: connections.length
        }

        // Try to get peer info from peer store
        try {
          if (await libp2p.peerStore.has(peer as any)) {
            const storedPeer = await libp2p.peerStore.get(peer as any)
            peerInfo.multiaddrs = storedPeer.addresses.map((addr: any) => addr.multiaddr.toString())
            peerInfo.protocols = storedPeer.protocols
          }
        } catch {
          // Peer not in store
        }

        // Add connection info if connected
        if (connections.length > 0) {
          peerInfo.multiaddrs = [...new Set([
            ...peerInfo.multiaddrs,
            ...connections.map(conn => conn.remoteAddr.toString())
          ])]
        }

        return {
          success: true,
          peerInfo
        }
      } catch (error) {
        throw new Error(`Failed to get peer info: ${error}`)
      }
    }

    case 'ping_peer': {
      const { peerId, timeout = 5000 } = args

      try {
        const peer = peerIdFromString(peerId)
        const startTime = Date.now()
        
        // Check if ping service exists
        if (!libp2p.services.ping) {
          throw new Error('Ping service not available')
        }
        
        await (libp2p.services.ping as any).ping(peer, { signal: AbortSignal.timeout(timeout) })
        
        const latency = Date.now() - startTime

        return {
          success: true,
          peerId,
          latency,
          timestamp: Date.now()
        }
      } catch (error) {
        throw new Error(`Failed to ping peer: ${error}`)
      }
    }

    default:
      throw new Error(`Unknown peer management tool: ${name}`)
  }
}