import { WebSocketServer } from 'ws'

/** @param {import('http').Server} httpServer */
async function handle(httpServer) {
  const wss = new WebSocketServer({ server: httpServer })

  /**
   * @type {Partial<{
   *   handleWebsocket: import('../index.js').HandleWebsocket
   * }>}
   */
  const { handleWebsocket } = await import('SERVER_HOOKS')

  // TODO: Avoid unnecessary computations if no handle
  wss.on('connection', (ws, req) => {
    let url

    // TODO: Get protocol
    const address = httpServer.address()
    if (address && typeof address === 'object') {
      const host = address.address.startsWith('::') ? 'localhost' : address.address
      const port = address.port
      url = new URL(`ws://${host}:${port}`)
    }

    // Add request path to url
    if (url && req.url) {
      url.pathname = req.url
    }

    handleWebsocket?.({ socket: ws, server: wss, request: { url } })
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

export { handle as default }
