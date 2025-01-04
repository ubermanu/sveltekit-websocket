import { WebSocket, WebSocketServer } from 'ws'

export type HandleWebsocket = (event: {
  socket: WebSocket
  server: WebSocketServer
  request: { url: Readonly<URL> }
}) => void
