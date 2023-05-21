import type { Handle, HandleError } from '$lib/index.js'
import path from 'path'
import type { Plugin } from 'vite'
import { WebSocketServer } from 'ws'

const createWebSocketServer = (): Plugin => {
  let wss: WebSocketServer

  return {
    name: 'kitWebSocketServer',
    async configureServer(server) {
      wss = new WebSocketServer({ noServer: true })

      server.httpServer?.on('upgrade', (req, socket, head) => {
        if (req.headers['sec-websocket-protocol'] === 'vite-hmr') {
          return
        }
        wss.handleUpgrade(req, socket, head, (socket, req) => {
          wss.emit('connection', socket, req)
        })
      })

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
    },
  }
}

export { createWebSocketServer as websocket }
