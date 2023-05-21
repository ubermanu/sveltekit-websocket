import adapter from '@sveltejs/adapter-node'
import { readFileSync, writeFileSync } from 'node:fs'

type AdapterOptions = Parameters<typeof adapter>[0]

export default (opts?: AdapterOptions) => {
  const adapterNode = adapter(opts)
  const adaptOrig = adapterNode.adapt

  adapterNode.adapt = async function (builder) {
    const result = await adaptOrig.call(this, builder)

    const buildDir = opts?.out || 'build'
    const indexJsPath = `./${buildDir}/index.js`

    let indexJs = readFileSync(indexJsPath, 'utf8')

    // Add websocket server import
    indexJs = `
    import { WebSocketServer } from 'ws';
    ${indexJs}
    `

    // Attach websocket server to polka
    // TODO: Export handlers from hooks.websockets.js and use them
    indexJs = indexJs.replace(
      `const server = polka().use(handler);`,
      `const httpServer = http.createServer();
const server = polka({ server: httpServer }).use(handler);

const wss = new WebSocketServer({ server: httpServer })
wss.on('connection', (ws, req) => {
console.log('> Websocket connection')
})`
    )

    writeFileSync(indexJsPath, indexJs, 'utf8')

    return result
  }

  return adapterNode
}
