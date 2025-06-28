import type { Libp2p, PubSub, Connection, PeerId } from '@libp2p/interface'
import type { Identify } from '@libp2p/identify'
import type { DelegatedRoutingV1HttpApiClient } from '@helia/delegated-routing-v1-http-api-client'

export interface DirectMessage {
  send(peerId: PeerId, message: string): Promise<boolean>
  isDMPeer(peerId: PeerId): boolean
  addEventListener(event: string, handler: (evt: any) => void): void
  removeEventListener(event: string, handler: (evt: any) => void): void
}

export type Libp2pType = Libp2p<{
  pubsub: PubSub
  identify: Identify
  directMessage: DirectMessage
  delegatedRouting: DelegatedRoutingV1HttpApiClient
}>

export interface ChatMessage {
  msgId: string
  msg: string
  fileObjectUrl?: string
  peerId: string
  read: boolean
  receivedAt: number
}

export interface ChatFile {
  id: string
  body: Uint8Array
  sender: string
}

export interface DirectMessages {
  [peerId: string]: ChatMessage[]
}

export interface ServerState {
  libp2pNode: Libp2pType | null
  activeConnections: Map<string, Connection>
  messageHistory: Map<string, ChatMessage[]>
  directMessages: DirectMessages
  sharedFiles: Map<string, ChatFile>
  subscriptions: Set<string>
  nodeStatus: 'stopped' | 'starting' | 'running' | 'stopping'
}

export interface NodeConfig {
  transports?: string[]
  enableRelay?: boolean
  bootstrapPeers?: string[]
  listenAddresses?: string[]
}

export interface NetworkStats {
  totalConnections: number
  activeTopics: number
  messagesReceived: number
  messagesSent: number
  bytesReceived: number
  bytesSent: number
  uptime: number
}

export interface PeerInfo {
  peerId: string
  multiaddrs: string[]
  protocols: string[]
  connected: boolean
  lastSeen?: number
  connectionCount: number
}