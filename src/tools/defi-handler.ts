import { StateManager } from '../state.js'
import { ORACLE_TOPIC, CROSS_CHAIN_TOPIC, INTENT_TOPIC, DA_TOPIC, KEEPER_TOPIC } from '../constants.js'
import { v4 as uuidv4 } from 'uuid'

interface OracleData {
  asset: string
  price: number
  source: string
  timestamp: number
  peerId: string
}

interface CrossChainMessage {
  id: string
  sourceChain: string
  targetChain: string
  message: string
  priority: string
  timestamp: number
  relayed: boolean
}

interface Intent {
  id: string
  type: string
  parameters: any
  deadline: number
  solverFee: number
  status: 'pending' | 'matched' | 'executed' | 'expired'
  submitter: string
}

interface DAData {
  id: string
  data: string
  contentType: string
  retention: number
  publishedAt: number
  publisher: string
}

interface Keeper {
  peerId: string
  type: string
  capabilities: string[]
  lastActive: number
  reputation: number
}

export async function handleDeFi(
  name: string,
  args: any,
  stateManager: StateManager
): Promise<any> {
  const state = stateManager.getState()
  const libp2p = state.libp2pNode

  if (!libp2p) {
    throw new Error('Libp2p node not initialized')
  }

  switch (name) {
    case 'submit_oracle_data': {
      const oracleData: OracleData = {
        asset: args.asset,
        price: args.price,
        source: args.source,
        timestamp: args.timestamp || Date.now(),
        peerId: libp2p.peerId.toString()
      }

      // Publish to oracle topic
      await libp2p.services.pubsub.publish(ORACLE_TOPIC, new TextEncoder().encode(JSON.stringify(oracleData)))

      return {
        success: true,
        dataId: uuidv4(),
        message: `Oracle data for ${args.asset} submitted to network`
      }
    }

    case 'query_oracle_data': {
      // Get recent messages from oracle topic
      const history = state.messageHistory.get(ORACLE_TOPIC) || []
      const relevantData = history
        .filter(msg => {
          try {
            const data: OracleData = JSON.parse(msg.msg)
            return data.asset === args.asset
          } catch {
            return false
          }
        })
        .slice(-10) // Last 10 entries
        .map(msg => JSON.parse(msg.msg))

      // Aggregate prices
      const prices = relevantData.map(d => d.price)
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length

      return {
        asset: args.asset,
        averagePrice: avgPrice,
        dataPoints: relevantData.length,
        latestData: relevantData[relevantData.length - 1],
        sources: [...new Set(relevantData.map(d => d.source))]
      }
    }

    case 'relay_cross_chain_message': {
      const message: CrossChainMessage = {
        id: uuidv4(),
        sourceChain: args.sourceChain,
        targetChain: args.targetChain,
        message: args.message,
        priority: args.priority || 'medium',
        timestamp: Date.now(),
        relayed: false
      }

      // Publish to cross-chain topic
      await libp2p.services.pubsub.publish(CROSS_CHAIN_TOPIC, new TextEncoder().encode(JSON.stringify(message)))

      return {
        success: true,
        messageId: message.id,
        status: 'relayed'
      }
    }

    case 'get_bridge_status': {
      // Query bridge status from network
      const history = state.messageHistory.get(CROSS_CHAIN_TOPIC) || []
      const bridgeMessages = history.filter(msg => {
        try {
          const data: CrossChainMessage = JSON.parse(msg.msg)
          return data.sourceChain && data.targetChain
        } catch {
          return false
        }
      })

      const activeBridges = new Map()
      bridgeMessages.forEach(msg => {
        const data: CrossChainMessage = JSON.parse(msg.msg)
        const key = `${data.sourceChain}-${data.targetChain}`
        activeBridges.set(key, {
          sourceChain: data.sourceChain,
          targetChain: data.targetChain,
          lastActivity: data.timestamp,
          messageCount: (activeBridges.get(key)?.messageCount || 0) + 1
        })
      })

      return {
        bridges: Array.from(activeBridges.values()),
        totalActive: activeBridges.size
      }
    }

    case 'submit_intent': {
      const intent: Intent = {
        id: uuidv4(),
        type: args.intentType,
        parameters: args.parameters,
        deadline: args.deadline || (Date.now() + 3600000), // 1 hour default
        solverFee: args.solverFee || 0,
        status: 'pending',
        submitter: libp2p.peerId.toString()
      }

      // Publish intent to network
      await libp2p.services.pubsub.publish(INTENT_TOPIC, new TextEncoder().encode(JSON.stringify(intent)))

      return {
        success: true,
        intentId: intent.id,
        status: 'submitted'
      }
    }

    case 'discover_intent_solvers': {
      // Get peers subscribed to intent topic
      const subscribers = await libp2p.services.pubsub.getSubscribers(INTENT_TOPIC)

      return {
        intentType: args.intentType,
        availableSolvers: subscribers.length,
        solverPeers: subscribers.map(peer => peer.toString()),
        region: args.region || 'global'
      }
    }

    case 'publish_da_data': {
      const daData: DAData = {
        id: uuidv4(),
        data: args.data,
        contentType: args.contentType || 'application/json',
        retention: args.retention || 30,
        publishedAt: Date.now(),
        publisher: libp2p.peerId.toString()
      }

      // Store in shared files for persistence
      state.sharedFiles.set(daData.id, {
        id: daData.id,
        body: new TextEncoder().encode(args.data),
        sender: daData.publisher
      })

      // Announce to DA topic
      await libp2p.services.pubsub.publish(DA_TOPIC, new TextEncoder().encode(JSON.stringify({
        id: daData.id,
        contentType: daData.contentType,
        size: args.data.length,
        publisher: daData.publisher
      })))

      return {
        success: true,
        dataId: daData.id,
        cid: daData.id, // Simplified CID
        status: 'published'
      }
    }

    case 'retrieve_da_data': {
      const file = state.sharedFiles.get(args.dataId)
      if (!file) {
        throw new Error('Data not found')
      }

      return {
        dataId: args.dataId,
        data: new TextDecoder().decode(file.body),
        publisher: file.sender,
        retrievedAt: Date.now()
      }
    }

    case 'register_keeper': {
      const keeper: Keeper = {
        peerId: libp2p.peerId.toString(),
        type: args.keeperType,
        capabilities: args.capabilities || [],
        lastActive: Date.now(),
        reputation: 1.0
      }

      // Publish keeper registration
      await libp2p.services.pubsub.publish(KEEPER_TOPIC, new TextEncoder().encode(JSON.stringify(keeper)))

      return {
        success: true,
        keeperId: keeper.peerId,
        type: keeper.type,
        status: 'registered'
      }
    }

    case 'coordinate_keeper_action': {
      const action = {
        id: uuidv4(),
        action: args.action,
        protocol: args.protocol,
        parameters: args.parameters,
        coordinator: libp2p.peerId.toString(),
        timestamp: Date.now()
      }

      // Publish to keeper coordination topic
      await libp2p.services.pubsub.publish(KEEPER_TOPIC, new TextEncoder().encode(JSON.stringify(action)))

      return {
        success: true,
        actionId: action.id,
        status: 'coordinated'
      }
    }

    default:
      throw new Error(`Unknown DeFi tool: ${name}`)
  }
}