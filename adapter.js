import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import nodeAdapter from '@sveltejs/adapter-node'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { rollup } from 'rollup'

const files = fileURLToPath(new URL('../../files', import.meta.url).href)

/** @param {Parameters<typeof adapter>[0]} [opts] */
export default (opts = {}) => {
  const { out = 'build' } = opts

  const adapter = nodeAdapter(opts)
  adapter.name = '@ubermanu/sveltekit-websocket'

  adapter.adapt = wrap(adapter.adapt, async (proceed, builder) => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))

    // we bundle the Vite output so that deployments only need
    // their production dependencies. Anything in devDependencies
    // will get included in the bundled code
    const bundle = await rollup({
      input: 'src/hooks.websocket.js',
      external: [
        // dependencies could have deep exports, so we need a regex
        ...Object.keys(pkg.dependencies || {}).map(
          (d) => new RegExp(`^${d}(\\/.*)?$`)
        ),
      ],
      plugins: [
        nodeResolve({
          preferBuiltins: true,
          exportConditions: ['node'],
        }),
        // @ts-ignore https://github.com/rollup/plugins/issues/1329
        commonjs({ strictRequires: true }),
        // @ts-ignore https://github.com/rollup/plugins/issues/1329
        json(),
      ],
    })

    await proceed(builder)

    await bundle.write({
      file: `${out}/server/hooks.websocket.js`,
      format: 'esm',
      sourcemap: true,
      chunkFileNames: 'chunks/[name]-[hash].js',
    })

    builder.copy(files, out, {
      replace: {
        WEBSOCKET_HOOKS: './server/hooks.websocket.js',
      },
    })

    // Inject the websocket handler in production build
    const serverFilename = path.join(out, 'index.js')
    let server = readFileSync(serverFilename, 'utf8')

    server = `
      import handleWebsocket from './websocket-handler.js'
      ${server}
      handleWebsocket(server.server)
    `

    writeFileSync(serverFilename, server, 'utf8')
  })

  return adapter
}

/**
 * @template T
 * @param {T} fn
 * @param {(proceed: T, ...args: Parameters<T>) => ReturnType<T>} wrapper
 * @returns {(...args: Parameters<T>) => ReturnType<T>}
 */
function wrap(fn, wrapper) {
  return async function (...args) {
    return wrapper.call(this, fn.bind(this), ...args)
  }
}
