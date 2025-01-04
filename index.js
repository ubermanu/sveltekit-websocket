import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import nodeAdapter from '@sveltejs/adapter-node'
import { appendFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { rollup } from 'rollup'

const files = fileURLToPath(new URL('./files', import.meta.url).href)

/** @param {Parameters<typeof nodeAdapter>[0]} [opts] */
export default (opts = {}) => {
  const { out = 'build' } = opts

  const adapter = nodeAdapter(opts)
  adapter.name = '@ubermanu/sveltekit-websocket'

  // Extend the base adapter and inject a custom websocket handler on top of polka
  // The `handleWebsocket` method is extracted from the `hooks.server.js` file
  adapter.adapt = wrap(adapter.adapt, async (proceed, builder) => {
    await proceed(builder)

    const tmp = builder.getBuildDirectory('adapter-node')
    builder.rimraf(`${out}/server`)

    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))

    builder.copy(`${files}/websocket-handler.js`, `${tmp}/ws.js`, {
      replace: {
        SERVER_HOOKS: './chunks/hooks.server.js',
      },
    })

    // we bundle the Vite output so that deployments only need
    // their production dependencies. Anything in devDependencies
    // will get included in the bundled code
    const bundle = await rollup({
      input: {
        index: `${tmp}/index.js`,
        ws: `${tmp}/ws.js`,
        manifest: `${tmp}/manifest.js`,
      },
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

    await bundle.write({
      dir: `${out}/server`,
      format: 'esm',
      sourcemap: true,
      chunkFileNames: 'chunks/[name]-[hash].js',
    })

    // Inject the websocket handler in production build
    appendFileSync(
      `${out}/index.js`,
      `
       const { default: handleWebsocket} = await import('./server/ws.js')
       await handleWebsocket(server.server)
      `,
      'utf8'
    )
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
