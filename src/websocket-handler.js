import * as hooks from 'WEBSOCKET_HOOKS'
import { WebSocketServer } from 'ws'

/** @param {import('http').Server} server */
function handleWebsocket(server) {
  const wss = new WebSocketServer({ server })

  // TODO: Get the hooks from the generated file
  // TODO; Pass url from req
  wss.on('connection', (ws, req) => {
    // TODO: Add missing event data
    hooks?.handle({ socket: ws, server: wss })
  })

  // Disconnects all the clients on shutdown
  function shutdown() {
    wss.close()
    for (const ws of wss.clients) {
      ws.terminate()
    }
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

export default handleWebsocket
