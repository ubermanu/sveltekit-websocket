import { WebSocket, WebSocketServer } from 'ws'

export type Handle = (event: {
  socket: WebSocket
  server: WebSocketServer
  request: { url: Readonly<URL> }
}) => void

export type HandleError = (event: { error: Error }) => void

declare function adapter(
  opts?: Parameters<typeof adapter>[0]
): import('@sveltejs/kit').Adapter

export default adapter
