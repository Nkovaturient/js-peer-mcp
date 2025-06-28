import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { StateManager } from '../state.js'
import { peerIdFromString } from '@libp2p/peer-id'
import { CHAT_FILE_TOPIC, FILE_EXCHANGE_PROTOCOL } from '../constants.js'
import { pipe } from 'it-pipe'
import map from 'it-map'
import * as lp from 'it-length-prefixed'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { v4 as uuidv4 } from 'uuid'
import type { ChatFile } from '../types/index.js'
import * as fs from 'fs/promises'

export function createFileSharingTools(stateManager: StateManager): Tool[] {
  return [
    {
      name: 'share_file',
      description: 'Share a file with the network using file exchange protocol',
      inputSchema: {
        type: 'object',
        properties: {
          filePath: {
            type: 'string',
            description: 'Path to the file to share'
          },
          fileContent: {
            type: 'string',
            description: 'Base64 encoded file content (alternative to filePath)'
          },
          fileName: {
            type: 'string',
            description: 'Name of the file (required if using fileContent)'
          },
          announce: {
            type: 'boolean',
            description: 'Whether to announce the file to the network',
            default: true
          }
        }
      }
    },
    {
      name: 'request_file',
      description: 'Request a file from a specific peer',
      inputSchema: {
        type: 'object',
        properties: {
          peerId: {
            type: 'string',
            description: 'Peer ID to request file from'
          },
          fileId: {
            type: 'string',
            description: 'ID of the file to request'
          }
        },
        required: ['peerId', 'fileId']
      }
    },
    {
      name: 'list_shared_files',
      description: 'Get list of files available for sharing',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'announce_file',
      description: 'Announce file availability to the network',
      inputSchema: {
        type: 'object',
        properties: {
          fileId: {
            type: 'string',
            description: 'ID of the file to announce'
          }
        },
        required: ['fileId']
      }
    }
  ]
}

export async function handleFileSharing(
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
    case 'share_file': {
      const { filePath, fileContent, fileName, announce = true } = args

      try {
        let fileBody: Uint8Array
        let actualFileName: string

        if (filePath) {
          fileBody = await fs.readFile(filePath)
          actualFileName = filePath.split('/').pop() || 'unknown'
        } else if (fileContent && fileName) {
          fileBody = new Uint8Array(Buffer.from(fileContent, 'base64'))
          actualFileName = fileName
        } else {
          throw new Error('Either filePath or both fileContent and fileName must be provided')
        }

        const fileId = uuidv4()
        const file: ChatFile = {
          id: fileId,
          body: fileBody,
          sender: libp2p.peerId.toString()
        }

        stateManager.addSharedFile(file)

        // Set up file exchange protocol handler if not already set
        await libp2p.handle(FILE_EXCHANGE_PROTOCOL, ({ stream }) => {
          pipe(
            stream.source,
            (source) => lp.decode(source),
            (source) =>
              map(source, async (msg) => {
                const requestedFileId = uint8ArrayToString(msg.subarray())
                const requestedFile = stateManager.getSharedFile(requestedFileId)
                if (requestedFile) {
                  return requestedFile.body
                }
                throw new Error(`File not found: ${requestedFileId}`)
              }),
            (source) => lp.encode(source),
            stream.sink,
          )
        })

        let announcementResult = null
        if (announce) {
          const fileIdBytes = new TextEncoder().encode(fileId)
          announcementResult = await libp2p.services.pubsub.publish(CHAT_FILE_TOPIC, fileIdBytes)
        }

        return {
          success: true,
          fileId,
          fileName: actualFileName,
          fileSize: fileBody.length,
          announced: announce,
          recipients: announcementResult?.recipients.map((peer: any) => peer.toString()) || []
        }
      } catch (error) {
        throw new Error(`Failed to share file: ${error}`)
      }
    }

    case 'request_file': {
      const { peerId, fileId } = args

      try {
        const peer = peerIdFromString(peerId)
        const stream = await libp2p.dialProtocol(peer as any, FILE_EXCHANGE_PROTOCOL)

        let fileData: Uint8Array | null = null

        await pipe(
          [uint8ArrayFromString(fileId)],
          (source) => lp.encode(source),
          stream,
          (source) => lp.decode(source),
          async function (source) {
            for await (const data of source) {
              fileData = data.subarray()
              break // Only expect one response
            }
          },
        )

        if (!fileData) {
          throw new Error('No file data received')
        }

        // Store the received file
        const file: ChatFile = {
          id: fileId,
          body: fileData,
          sender: peerId
        }
        stateManager.addSharedFile(file)

        return {
          success: true,
          fileId,
          peerId,
          fileSize: fileData.length,
          timestamp: Date.now()
        }
      } catch (error) {
        throw new Error(`Failed to request file: ${error}`)
      }
    }

    case 'list_shared_files': {
      const state = stateManager.getState()
      const files = Array.from(state.sharedFiles.values()).map(file => ({
        id: file.id,
        sender: file.sender,
        size: file.body.length,
        isLocal: file.sender === libp2p.peerId.toString()
      }))

      return {
        success: true,
        files,
        count: files.length
      }
    }

    case 'announce_file': {
      const { fileId } = args

      try {
        const file = stateManager.getSharedFile(fileId)
        if (!file) {
          throw new Error(`File not found: ${fileId}`)
        }

        const fileIdBytes = new TextEncoder().encode(fileId)
        const result = await libp2p.services.pubsub.publish(CHAT_FILE_TOPIC, fileIdBytes)

        return {
          success: true,
          fileId,
          recipients: result.recipients.map((peer: any) => peer.toString()),
          recipientCount: result.recipients.length,
          timestamp: Date.now()
        }
      } catch (error) {
        throw new Error(`Failed to announce file: ${error}`)
      }
    }

    default:
      throw new Error(`Unknown file sharing tool: ${name}`)
  }
}