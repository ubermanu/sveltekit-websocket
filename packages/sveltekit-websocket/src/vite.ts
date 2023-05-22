import path from 'node:path'
import type { Plugin } from 'vite'
import { WebSocketServer } from 'ws'
import type { Handle, HandleError } from './index.js'

const attachWebSocketServer = (): Plugin => {
  let wss: WebSocketServer

  return {
    name: 'kitWebSocketServer',

    async configureServer(server) {
      wss = await createWebSocketServer()

      server.httpServer?.on('upgrade', (req, socket, head) => {
        if (req.headers['sec-websocket-protocol'] === 'vite-hmr') {
          return
        }
        wss?.handleUpgrade(req, socket, head, (socket, req) => {
          wss.emit('connection', socket, req)
        })
      })
    },

    async configurePreviewServer(server) {
      wss = await createWebSocketServer()

      server.httpServer?.on('upgrade', (req, socket, head) => {
        wss?.handleUpgrade(req, socket, head, (socket, req) => {
          wss.emit('connection', socket, req)
        })
      })
    },

    // On HMR, close all the websocket connections and create a new server
    async handleHotUpdate({ file, server }) {
      // TODO: Get from kit.config.hooks.websocket
      // TODO: Handle TS files
      const hooksFilename = 'hooks.websocket.js'

      if (path.basename(file) === hooksFilename) {
        wss = await createWebSocketServer()
        // TODO: Add colors
        console.log(`${hooksFilename} updated, websocket server restarted`)
      }
    },
  }
}

const createWebSocketServer = async () => {
  const wss = new WebSocketServer({ noServer: true })

  // TODO: Get from kit.config.hooks.websocket
  // TODO: Handle TS files
  const hooksFilename = 'src/hooks.websocket.js'
  const hooks: { handle: Handle; handleError: HandleError } = await import(
    path.join(process.cwd(), hooksFilename)
  )

  wss.on('connection', (ws, req) => {
    const request = {
      url: req.url!,
      headers: req.headers,
      method: req.method,
    }

    // The locals object is used to store data that can be used during the whole websocket session
    let locals: any = {}

    hooks?.handle?.({
      server: wss,
      request,
      socket: ws,
      locals,
    })

    ws.on('error', (error) => {
      hooks?.handleError?.({ error })
    })

    // TODO: Get the route from the request so we can handle scoped events
    //  Fetch the +websocket.js file and handle route events
  })

  return wss
}

export { attachWebSocketServer as websocket }
