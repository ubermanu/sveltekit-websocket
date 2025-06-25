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

 /** @type {import('vite').ViteDevServer | null} */
 let viteServer = null

 /**
  * Gets the hooks file path from SvelteKit configuration
  * @param {string} root - Root directory
  * @returns {string | null} - Hooks file path or null if not found
  */
 async function getHooksFilename(root) {
   try {
     const configPath = path.join(root, 'svelte.config.js')
     if (fs.existsSync(configPath)) {
       const config = await import(/* @vite-ignore */ `file://${configPath}?t=${Date.now()}`)
       const hooksPath = config.default?.kit?.files?.hooks?.server
       
       if (hooksPath && fs.existsSync(path.join(root, hooksPath))) {
         return hooksPath
       }
     }
   } catch (error) {
     // Fallback to automatic detection
   }

   // Fallback to default locations
   const tsHooks = 'src/hooks.server.ts'
   const jsHooks = 'src/hooks.server.js'
   
   if (fs.existsSync(path.join(root, tsHooks))) {
     return tsHooks
   }
   if (fs.existsSync(path.join(root, jsHooks))) {
     return jsHooks
   }
   return null
 }

 /**
  * Creates a new WebSocketServer and loads the hooks file if available
  * @param {import('vite').HttpServer} httpServer
  */
 async function createWebSocketServer(httpServer) {
   const wss = new WebSocketServer({ noServer: true })

   const hooksFilename = await getHooksFilename(root)

   if (!hooksFilename) {
     return wss
   }

   /**
    * @type {Partial<{
    *   handleWebsocket: import('./index.js').HandleWebsocket
    * }>}
    */
   const hooks = await (viteServer?.ssrLoadModule(hooksFilename) ?? 
     import(/* @vite-ignore */ `file://${path.resolve(root, hooksFilename)}?t=${Date.now()}`))

   wss.on('connection', (socket, req) => {
     let url

     // TODO: Get protocol
     const address = httpServer.address()
     if (address && typeof address === 'object') {
       const host = address.address.startsWith('::') ? 'localhost' : address.address
       const port = address.port
       url = new URL(`ws://${host}:${port}`)
     }

     if (url && req.url) {
       url.pathname = req.url
     }

     // TODO: A locals object could be passed through all the subroutes rooms?
     // TODO: Expose a limited API for socket and server
     hooks.handleWebsocket?.({
       server: wss,
       socket: socket,
       request: {
         url: Object.freeze(url),
       },
     })

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
     viteServer = server
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

   async handleHotUpdate({ file, server }) {
     const hooksFilename = await getHooksFilename(root)

     if (hooksFilename && path.relative(root, file) === hooksFilename) {
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
