import { Tool } from '@mcp/sdk/types.js'
import { StateManager } from '../state.js'
import { peerIdFromString } from '@libp2p/peer-id'
import { CHAT_TOPIC, CHAT_FILE_TOPIC, PUBSUB_PEER_DISCOVERY } from '../constants.js'
import type { ChatMessage } from '../types/index.js'
import { v4 as uuidv4 } from 'uuid'

export function createMessagingTools(stateManager: StateManager): Tool[] {
  return [
    {
      name: 'send_group_message',
      description: 'Send message to a pubsub topic (chat room)',
      inputSchema: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'Topic to send message to',
            default: CHAT_TOPIC
          },
          message: {
            type: 'string',
            description: 'Message content to send'
          }
        },
        required: ['message']
      }
    },
    {
      name: 'send_direct_message',
      description: 'Send private message directly to a peer',
      inputSchema: {
        type: 'object',
        properties: {
          peerId: {
            type: 'string',
            description: 'Peer ID to send message to'
          },
          message: {
            type: 'string',
            description: 'Message content to send'
          }
        },
        required: ['peerId', 'message']
      }
    },
    {
      name: 'subscribe_to_topic',
      description: 'Subscribe to a specific pubsub topic',
      inputSchema: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'Topic to subscribe to'
          }
        },
        required: ['topic']
      }
    },
    {
      name: 'unsubscribe_from_topic',
      description: 'Unsubscribe from a pubsub topic',
      inputSchema: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'Topic to unsubscribe from'
          }
        },
        required: ['topic']
      }
    },
    {
      name: 'get_message_history',
      description: 'Retrieve message history for a topic or peer',
      inputSchema: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'Topic to get message history for'
          },
          peerId: {
            type: 'string',
            description: 'Peer ID to get direct message history for'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of messages to return',
            default: 50
          }
        }
      }
    },
    {
      name: 'get_topic_subscribers',
      description: 'Get list of peers subscribed to a topic',
      inputSchema: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'Topic to get subscribers for',
            default: CHAT_TOPIC
          }
        }
      }
    }
  ]
}

export async function handleMessaging(
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
    case 'send_group_message': {
      const { topic = CHAT_TOPIC, message } = args

      try {
        const messageBytes = new TextEncoder().encode(message)
        const result = await libp2p.services.pubsub.publish(topic, messageBytes)

        // Add to local message history
        const chatMessage: ChatMessage = {
          msgId: uuidv4(),
          msg: message,
          peerId: libp2p.peerId.toString(),
          read: true,
          receivedAt: Date.now()
        }
        stateManager.addMessage(topic, chatMessage)
        stateManager.incrementMessagesSent()
        stateManager.addBytesSent(messageBytes.length)

        return {
          success: true,
          topic,
          message,
          recipients: result.recipients.map(peer => peer.toString()),
          recipientCount: result.recipients.length,
          timestamp: Date.now()
        }
      } catch (error) {
        throw new Error(`Failed to send group message: ${error}`)
      }
    }

    case 'send_direct_message': {
      const { peerId, message } = args

      try {
        const peer = peerIdFromString(peerId)
        const success = await libp2p.services.directMessage.send(peer, message)

        if (success) {
          // Add to local direct message history
          const chatMessage: ChatMessage = {
            msgId: uuidv4(),
            msg: message,
            peerId: libp2p.peerId.toString(),
            read: true,
            receivedAt: Date.now()
          }
          stateManager.addDirectMessage(peerId, chatMessage)
          stateManager.incrementMessagesSent()
          stateManager.addBytesSent(new TextEncoder().encode(message).length)
        }

        return {
          success,
          peerId,
          message,
          timestamp: Date.now()
        }
      } catch (error) {
        throw new Error(`Failed to send direct message: ${error}`)
      }
    }

    case 'subscribe_to_topic': {
      const { topic } = args

      try {
        libp2p.services.pubsub.subscribe(topic)
        stateManager.addSubscription(topic)

        // Set up message handler if not already set
        const handleMessage = (evt: any) => {
          const { topic: msgTopic, data, detail } = evt
          
          if (detail?.type === 'signed') {
            const message = new TextDecoder().decode(data)
            const chatMessage: ChatMessage = {
              msgId: uuidv4(),
              msg: message,
              peerId: detail.from.toString(),
              read: false,
              receivedAt: Date.now()
            }
            stateManager.addMessage(msgTopic, chatMessage)
            stateManager.addBytesReceived(data.length)
          }
        }

        libp2p.services.pubsub.addEventListener('message', handleMessage)

        return {
          success: true,
          topic,
          subscribers: libp2p.services.pubsub.getSubscribers(topic).map(peer => peer.toString())
        }
      } catch (error) {
        throw new Error(`Failed to subscribe to topic: ${error}`)
      }
    }

    case 'unsubscribe_from_topic': {
      const { topic } = args

      try {
        libp2p.services.pubsub.unsubscribe(topic)
        stateManager.removeSubscription(topic)

        return {
          success: true,
          topic,
          message: `Unsubscribed from topic: ${topic}`
        }
      } catch (error) {
        throw new Error(`Failed to unsubscribe from topic: ${error}`)
      }
    }

    case 'get_message_history': {
      const { topic, peerId, limit = 50 } = args

      if (topic) {
        const messages = stateManager.getMessages(topic).slice(-limit)
        return {
          success: true,
          topic,
          messages,
          count: messages.length
        }
      } else if (peerId) {
        const messages = stateManager.getDirectMessages(peerId).slice(-limit)
        return {
          success: true,
          peerId,
          messages,
          count: messages.length
        }
      } else {
        throw new Error('Either topic or peerId must be specified')
      }
    }

    case 'get_topic_subscribers': {
      const { topic = CHAT_TOPIC } = args

      try {
        const subscribers = libp2p.services.pubsub.getSubscribers(topic)
        
        return {
          success: true,
          topic,
          subscribers: subscribers.map(peer => peer.toString()),
          count: subscribers.length
        }
      } catch (error) {
        throw new Error(`Failed to get topic subscribers: ${error}`)
      }
    }

    default:
      throw new Error(`Unknown messaging tool: ${name}`)
  }
}