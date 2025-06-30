import type { ServerState, ChatMessage, ChatFile, DirectMessages, NetworkStats } from './types/index.js'
import type { Connection } from '@libp2p/interface'

export class StateManager {
  private state: ServerState = {
    libp2pNode: null,
    activeConnections: new Map(),
    messageHistory: new Map(),
    directMessages: {},
    sharedFiles: new Map(),
    subscriptions: new Set(),
    nodeStatus: 'stopped'
  }

  private startTime: number = 0
  private stats = {
    messagesReceived: 0,
    messagesSent: 0,
    bytesReceived: 0,
    bytesSent: 0
  }

  getState(): ServerState {
    return { ...this.state }
  }

  setNodeStatus(status: ServerState['nodeStatus']): void {
    this.state.nodeStatus = status
    if (status === 'running' && this.startTime === 0) {
      this.startTime = Date.now()
    }
  }

  setLibp2pNode(node: ServerState['libp2pNode']): void {
    this.state.libp2pNode = node
  }

  updateConnections(connections: Connection[]): void {
    this.state.activeConnections.clear()
    connections.forEach(conn => {
      this.state.activeConnections.set(conn.id, conn)
    })
  }

  addMessage(topic: string, message: ChatMessage): void {
    if (!this.state.messageHistory.has(topic)) {
      this.state.messageHistory.set(topic, [])
    }
    this.state.messageHistory.get(topic)!.push(message)
    this.stats.messagesReceived++
  }

  addDirectMessage(peerId: string, message: ChatMessage): void {
    if (!this.state.directMessages[peerId]) {
      this.state.directMessages[peerId] = []
    }
    this.state.directMessages[peerId].push(message)
    this.stats.messagesReceived++
  }

  getMessages(topic: string): ChatMessage[] {
    return this.state.messageHistory.get(topic) || []
  }

  getDirectMessages(peerId: string): ChatMessage[] {
    return this.state.directMessages[peerId] || []
  }

  addSharedFile(file: ChatFile): void {
    this.state.sharedFiles.set(file.id, file)
  }

  getSharedFile(fileId: string): ChatFile | undefined {
    return this.state.sharedFiles.get(fileId)
  }

  addSubscription(topic: string): void {
    this.state.subscriptions.add(topic)
  }

  removeSubscription(topic: string): void {
    this.state.subscriptions.delete(topic)
  }

  incrementMessagesSent(): void {
    this.stats.messagesSent++
  }

  addBytesReceived(bytes: number): void {
    this.stats.bytesReceived += bytes
  }

  addBytesSent(bytes: number): void {
    this.stats.bytesSent += bytes
  }

  getNetworkStats(): NetworkStats {
    return {
      totalConnections: this.state.activeConnections.size,
      activeTopics: this.state.subscriptions.size,
      messagesReceived: this.stats.messagesReceived,
      messagesSent: this.stats.messagesSent,
      bytesReceived: this.stats.bytesReceived,
      bytesSent: this.stats.bytesSent,
      uptime: this.startTime > 0 ? Date.now() - this.startTime : 0
    }
  }

  reset(): void {
    this.state = {
      libp2pNode: null,
      activeConnections: new Map(),
      messageHistory: new Map(),
      directMessages: {},
      sharedFiles: new Map(),
      subscriptions: new Set(),
      nodeStatus: 'stopped'
    }
    this.startTime = 0
    this.stats = {
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0
    }
  }
}