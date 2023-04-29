import fs from 'fs'
import path from 'path'
import { Server } from 'socket.io'
import type { Plugin } from 'vite'

const createWebSocketServer = (): Plugin => ({
  name: 'kitWebSocketServer',
  async configureServer(server) {
    if (!server.httpServer) {
      throw new Error('No http server instance found.')
    }

    const io = new Server(server.httpServer)

    const hookFilename = path.resolve(process.cwd(), './src/hooks.websocket.js')

    if (!fs.existsSync(hookFilename)) {
      console.warn('No websocket hook found.')
      return
    }

    const entrypoint = await import(hookFilename)
    const { handle } = entrypoint

    // TODO: Fetch all the +websocket.js files and handle channel events
    //  A channel name is the route.id from the page component
    //  So it should be possible to target events to specific routes (like form actions)

    // TODO: Implement middleware with next() function
    if (handle) {
      await handle({ server: io })
    }
  },
})

export { createWebSocketServer as websocket }
