import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { StateManager } from '../state.js'
import { peerIdFromString } from '@libp2p/peer-id'
import { ORACLE_TOPIC, CROSS_CHAIN_TOPIC, INTENT_TOPIC, DA_TOPIC } from '../constants.js'

export function createDeFiTools(stateManager: StateManager): Tool[] {
  return [
    // Oracle Network Tools
    {
      name: 'submit_oracle_data',
      description: 'Submit price or data feed to oracle network',
      inputSchema: {
        type: 'object',
        properties: {
          asset: { type: 'string', description: 'Asset symbol (e.g., ETH, BTC)' },
          price: { type: 'number', description: 'Current price' },
          source: { type: 'string', description: 'Data source identifier' },
          timestamp: { type: 'number', description: 'Unix timestamp' }
        },
        required: ['asset', 'price', 'source']
      }
    },
    {
      name: 'query_oracle_data',
      description: 'Query latest oracle data for an asset',
      inputSchema: {
        type: 'object',
        properties: {
          asset: { type: 'string', description: 'Asset symbol to query' }
        },
        required: ['asset']
      }
    },

    // Cross-Chain Tools
    {
      name: 'relay_cross_chain_message',
      description: 'Relay a message between different blockchain networks',
      inputSchema: {
        type: 'object',
        properties: {
          sourceChain: { type: 'string', description: 'Source chain ID' },
          targetChain: { type: 'string', description: 'Target chain ID' },
          message: { type: 'string', description: 'Message payload' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' }
        },
        required: ['sourceChain', 'targetChain', 'message']
      }
    },
    {
      name: 'get_bridge_status',
      description: 'Check status of cross-chain bridges',
      inputSchema: {
        type: 'object',
        properties: {
          bridgeId: { type: 'string', description: 'Bridge identifier' }
        }
      }
    },

    // Intent-Based Tools
    {
      name: 'submit_intent',
      description: 'Submit a DeFi intent for solver coordination',
      inputSchema: {
        type: 'object',
        properties: {
          intentType: { type: 'string', enum: ['swap', 'liquidity', 'yield', 'arbitrage'] },
          parameters: { type: 'object', description: 'Intent-specific parameters' },
          deadline: { type: 'number', description: 'Intent deadline timestamp' },
          solverFee: { type: 'number', description: 'Maximum solver fee' }
        },
        required: ['intentType', 'parameters']
      }
    },
    {
      name: 'discover_intent_solvers',
      description: 'Discover available solvers for intent execution',
      inputSchema: {
        type: 'object',
        properties: {
          intentType: { type: 'string', description: 'Type of intent' },
          region: { type: 'string', description: 'Geographic region preference' }
        }
      }
    },

    // Decentralized Data Availability
    {
      name: 'publish_da_data',
      description: 'Publish data to decentralized availability network',
      inputSchema: {
        type: 'object',
        properties: {
          data: { type: 'string', description: 'Data to publish' },
          contentType: { type: 'string', description: 'MIME type of data' },
          retention: { type: 'number', description: 'Retention period in days' }
        },
        required: ['data']
      }
    },
    {
      name: 'retrieve_da_data',
      description: 'Retrieve data from decentralized availability network',
      inputSchema: {
        type: 'object',
        properties: {
          dataId: { type: 'string', description: 'Data identifier/CID' }
        },
        required: ['dataId']
      }
    },

    // Keeper Network Tools
    {
      name: 'register_keeper',
      description: 'Register as a keeper for automated DeFi operations',
      inputSchema: {
        type: 'object',
        properties: {
          keeperType: { type: 'string', enum: ['liquidation', 'rebalance', 'harvest', 'arbitrage'] },
          capabilities: { type: 'array', items: { type: 'string' }, description: 'Keeper capabilities' }
        },
        required: ['keeperType']
      }
    },
    {
      name: 'coordinate_keeper_action',
      description: 'Coordinate automated action with other keepers',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', description: 'Action to coordinate' },
          protocol: { type: 'string', description: 'DeFi protocol' },
          parameters: { type: 'object', description: 'Action parameters' }
        },
        required: ['action', 'protocol']
      }
    }
  ]
}