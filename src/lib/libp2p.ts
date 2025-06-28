import {
  createDelegatedRoutingV1HttpApiClient,
  DelegatedRoutingV1HttpApiClient,
} from '@helia/delegated-routing-v1-http-api-client'
import { createLibp2p } from 'libp2p'
import { identify } from '@libp2p/identify'
import { peerIdFromString } from '@libp2p/peer-id'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { Multiaddr } from '@multiformats/multiaddr'
import { sha256 } from 'multiformats/hashes/sha2'
import type { Connection, Message, SignedMessage, PeerId, Libp2p } from '@libp2p/interface'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { webSockets } from '@libp2p/websockets'
import { webTransport } from '@libp2p/webtransport'
import { webRTC, webRTCDirect } from '@libp2p/webrtc'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { ping } from '@libp2p/ping'
import { bootstrap } from '@libp2p/bootstrap'
import { 
  BOOTSTRAP_PEER_IDS, 
  CHAT_FILE_TOPIC, 
  CHAT_TOPIC, 
  PUBSUB_PEER_DISCOVERY,
  DEFAULT_DELEGATED_ROUTING_ENDPOINT 
} from '../constants.js'
import first from 'it-first'
import { directMessage } from './direct-message.js'
import type { Libp2pType, NodeConfig } from '../types/index.js'

export async function startLibp2p(config: NodeConfig = {}): Promise<Libp2pType> {
  const delegatedClient = createDelegatedRoutingV1HttpApiClient(DEFAULT_DELEGATED_ROUTING_ENDPOINT)

  const { bootstrapAddrs, relayListenAddrs } = await getBootstrapMultiaddrs(delegatedClient)

  const transports = []
  const enabledTransports = config.transports || ['webrtc', 'websockets', 'webtransport']

  if (enabledTransports.includes('webtransport')) {
    transports.push(webTransport())
  }
  if (enabledTransports.includes('websockets')) {
    transports.push(webSockets())
  }
  if (enabledTransports.includes('webrtc')) {
    transports.push(webRTC())
    transports.push(webRTCDirect())
  }
  if (config.enableRelay !== false) {
    transports.push(circuitRelayTransport())
  }

  const listenAddresses = config.listenAddresses || ['/webrtc', ...relayListenAddrs]

  const libp2p = await createLibp2p({
    addresses: {
      listen: listenAddresses,
    },
    transports,
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    connectionGater: {
      denyDialMultiaddr: async () => false,
    },
    peerDiscovery: [
      pubsubPeerDiscovery({
        interval: 10_000,
        topics: [PUBSUB_PEER_DISCOVERY],
        listenOnly: false,
      }),
      bootstrap({
        list: config.bootstrapPeers || [
          `${bootstrapAddrs}`,
          '/ip6/2604:1380:4642:6600::3/udp/9095/quic-v1/webtransport/certhash/uEiAFmismVS4uGGz9zF8yLRC10wtqPciwcBD1BuAch4sX3A/certhash/uEiBEvL3ao0UqfMSkj2JCOvjG_4BEiiEnjFr7qmDPALgG5Q',
          '/ip6/2604:1380:4642:6600::3/udp/9095/quic-v1',
          '/ip4/147.28.186.157/udp/9095/webrtc-direct/certhash/uEiC6yY8kGKhTw9gr74_eDLWf08PNyAiSKgs22JHc_rD8qw',
          '/ip4/147.28.186.157/udp/9095/quic-v1',
          '/ip4/147.28.186.157/udp/9095/quic-v1/webtransport/certhash/uEiAFmismVS4uGGz9zF8yLRC10wtqPciwcBD1BuAch4sX3A/certhash/uEiBEvL3ao0UqfMSkj2JCOvjG_4BEiiEnjFr7qmDPALgG5Q',
        ],
      }),
    ],
    services: {
      pubsub: gossipsub({
        allowPublishToZeroTopicPeers: true,
        msgIdFn: msgIdFnStrictNoSign as any,
        ignoreDuplicatePublishError: true,
      }),
      delegatedRouting: () => delegatedClient,
      identify: identify(),
      directMessage: directMessage(),
      ping: ping(),
    },
  }) as any

  if (!libp2p) {
    throw new Error('Failed to create libp2p node')
  }

  // Subscribe to default topics
  libp2p.services.pubsub.subscribe(CHAT_TOPIC)
  libp2p.services.pubsub.subscribe(CHAT_FILE_TOPIC)

  // Set up event listeners
  libp2p.addEventListener('peer:discovery', (event: any) => {
    const { multiaddrs, id } = event.detail

    if (libp2p.getConnections(id)?.length > 0) {
      return
    }

    dialWebRTCMaddrs(libp2p, multiaddrs)
  })

  return libp2p as Libp2pType
}

export async function msgIdFnStrictNoSign(msg: Message): Promise<Uint8Array> {
  const enc = new TextEncoder()
  const signedMessage = msg as SignedMessage
  const encodedSeqNum = enc.encode(signedMessage.sequenceNumber.toString())
  return await sha256.encode(encodedSeqNum)
}

async function dialWebRTCMaddrs(libp2p: Libp2p, multiaddrs: Multiaddr[]): Promise<void> {
  const webRTCMadrs = multiaddrs.filter((maddr) => maddr.protoNames().includes('webrtc'))

  for (const addr of webRTCMadrs) {
    try {
      await libp2p.dial(addr)
      return
    } catch (error) {
      // Continue to next address
    }
  }
}

export const connectToMultiaddr = (libp2p: Libp2p) => async (multiaddr: Multiaddr) => {
  try {
    const conn = await libp2p.dial(multiaddr)
    return conn
  } catch (e) {
    throw e
  }
}

interface BootstrapsMultiaddrs {
  bootstrapAddrs: string[]
  relayListenAddrs: string[]
}

async function getBootstrapMultiaddrs(client: DelegatedRoutingV1HttpApiClient): Promise<BootstrapsMultiaddrs> {
  const peers = await Promise.all(BOOTSTRAP_PEER_IDS.map((peerId) => first(client.getPeers(peerIdFromString(peerId)))))
  const bootstrapAddrs = []
  const relayListenAddrs = []
  
  for (const p of peers) {
    if (p && p.Addrs.length > 0) {
      for (const maddr of p.Addrs) {
        const protos = maddr.protoNames()
        if ((protos.includes('webtransport') || protos.includes('webrtc-direct')) && protos.includes('certhash')) {
          if (maddr.nodeAddress().address === '127.0.0.1') continue
          bootstrapAddrs.push(maddr.toString())
          relayListenAddrs.push(getRelayListenAddr(maddr, p.ID as any))
        }
      }
    }
  }
  return { bootstrapAddrs, relayListenAddrs }
}

const getRelayListenAddr = (maddr: Multiaddr, peer: PeerId): string =>
  `${maddr.toString()}/p2p/${peer.toString()}/p2p-circuit`

export const getFormattedConnections = (connections: Connection[]) =>
  connections.map((conn) => ({
    peerId: conn.remotePeer,
    protocols: [...new Set(conn.remoteAddr.protoNames())],
  }))