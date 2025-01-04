import { WebSocket, WebSocketServer } from 'ws'

export type Handle = (event: {
  socket: WebSocket
  server: WebSocketServer
  request: { url: Readonly<URL> }
}) => void

export type HandleError = (event: { error: Error }) => void
