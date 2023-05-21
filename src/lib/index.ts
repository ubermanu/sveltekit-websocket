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

export * from './stores/socket.js'

export interface WebsocketEvent {
  server: WebSocketServer
  request: WebsocketRequest
  socket: WebSocket
  locals: any
  data: any
}

// TODO: Should be named Events
export interface WebsocketEventMap {
  [key: string]: (event: WebsocketEvent) => void
}
