import nodeAdapter from '@sveltejs/adapter-node'
import type { Adapter } from '@sveltejs/kit'
import { WebSocket, WebSocketServer } from 'ws'

export type HandleWebsocket = (event: {
  socket: WebSocket
  server: WebSocketServer
  request: { url: Readonly<URL> }
}) => void

type AdapterOptions = Parameters<typeof nodeAdapter>[0]

declare function adapter(opts?: AdapterOptions): Adapter

export default adapter
