import type { WebSocket, WebSocketServer } from 'ws'

type WebsocketRequest = {
  url: string
  headers: Headers | any
  method?: string
}

export type Handle = (event: {
  server: WebSocketServer
  request: WebsocketRequest
  socket: WebSocket
  locals: any
}) => void

export type HandleError = (event: { error: Error }) => void

export * from './stores/websocket.js'
