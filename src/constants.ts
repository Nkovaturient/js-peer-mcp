// Protocol and topic constants from the original codebase
export const CHAT_TOPIC = 'universal-connectivity'
export const CHAT_FILE_TOPIC = 'universal-connectivity-file'
export const PUBSUB_PEER_DISCOVERY = 'universal-connectivity-browser-peer-discovery'
export const FILE_EXCHANGE_PROTOCOL = '/universal-connectivity-file/1'
export const DIRECT_MESSAGE_PROTOCOL = '/universal-connectivity/dm/1.0.0'

// DeFi-specific topics
export const ORACLE_TOPIC = 'defi-oracle-network'
export const CROSS_CHAIN_TOPIC = 'defi-cross-chain-relay'
export const INTENT_TOPIC = 'defi-intent-coordination'
export const DA_TOPIC = 'defi-data-availability'
export const KEEPER_TOPIC = 'defi-keeper-network'

export const CIRCUIT_RELAY_CODE = 290
export const MIME_TEXT_PLAIN = 'text/plain'

// Bootstrap peer IDs from the original codebase
export const WEBTRANSPORT_BOOTSTRAP_PEER_ID = '12D3KooWFhXabKDwALpzqMbto94sB7rvmZ6M28hs9Y9xSopDKwQr'
export const BOOTSTRAP_PEER_IDS = [WEBTRANSPORT_BOOTSTRAP_PEER_ID]

// Default configuration
export const DEFAULT_DELEGATED_ROUTING_ENDPOINT = 'https://delegated-ipfs.dev'

// MCP server metadata
export const MCP_SERVER_NAME = 'universal-connectivity-js-peer'
export const MCP_SERVER_VERSION = '1.0.0'