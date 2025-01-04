import fs from 'node:fs'
import path from 'node:path'
import { URL } from 'node:url'
import colors from 'picocolors'
import { WebSocketServer } from 'ws'

/** @returns {import('vite').Plugin} */
const attachWebSocketServer = () => {
  /** @type {WebSocketServer} */
  let wss

  /** @type {string} */
  let root

  /** @type {import('vite').Logger} */
  let logger

  // TODO: Get from kit.config.hooks.websocket
  // TODO: Handle TS files
  const hooksFilename = 'src/hooks.websocket.js'

  /**
   * Creates a new WebSocketServer and loads the hooks file if available.
   *
   * @param {import('vite').HttpServer} httpServer
   */
  async function createWebSocketServer(httpServer) {
    const wss = new WebSocketServer({ noServer: true })

    // Skip connection handling if the file does not exists
    if (!fs.existsSync(path.join(root, hooksFilename))) {
      return wss
    }

    /**
     * @type {Partial<{
     *   handle: import('./index.js').Handle
     *   handleError: import('./index.js').HandleError
     * }>}
     */
    const hooks = await import(
      /* @vite-ignore */ path.join(root, hooksFilename) + `?t=${Date.now()}`
    )

    wss.on('connection', (socket, req) => {
      let url

      // TODO: Get protocol
      const address = httpServer.address()
      if (address && typeof address === 'object') {
        const host = address.address === '::' ? 'localhost' : address.address
        const port = address.port
        url = new URL(`ws://${host}:${port}`)
      }

      // Add request path to url
      if (url && req.url) {
        url.pathname = req.url
      }

      // TODO: A locals object could be passed through all the subroutes rooms?
      // TODO: Expose a limited API for socket and server
      hooks.handle?.({
        server: wss,
        socket: socket,
        request: {
          url: Object.freeze(url),
        },
      })

      if (hooks.handleError) {
        socket.on('error', (error) => {
          hooks.handleError({ error })
        })
      }

      // TODO: Get the route from the request so we can handle scoped events
      //  Fetch the +websocket.js file and handle route events
    })

    return wss
  }

  return {
    name: '@ubermanu/sveltekit-websocket',

    configResolved(config) {
      root = config.root
      logger = config.logger
    },

    async configureServer(server) {
      wss = await createWebSocketServer(server.httpServer)

      server.httpServer?.on('upgrade', (req, socket, head) => {
        if (req.headers['sec-websocket-protocol'] === 'vite-hmr') {
          return
        }
        wss?.handleUpgrade(req, socket, head, (socket, req) => {
          wss.emit('connection', socket, req)
        })
      })

      server.httpServer?.on('close', () => wss?.close())
    },

    async configurePreviewServer(server) {
      wss = await createWebSocketServer(server.httpServer)

      server.httpServer?.on('upgrade', (req, socket, head) => {
        wss?.handleUpgrade(req, socket, head, (socket, req) => {
          wss.emit('connection', socket, req)
        })
      })

      server.httpServer?.on('close', () => wss?.close())
    },

    // On HMR, close all the websocket connections and create a new server
    async handleHotUpdate({ file, server }) {
      if (path.relative(root, file) === hooksFilename) {
        logger.info(
          colors.green(`${hooksFilename} changed, restarting server...`),
          {
            timestamp: true,
            clear: true,
          }
        )

        wss?.close()
        wss = await createWebSocketServer(server.httpServer)
      }
    },
  }
}

export { attachWebSocketServer as websocket }
