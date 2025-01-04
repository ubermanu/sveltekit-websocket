import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { builtinModules } from 'node:module'

function prefixBuiltinModules() {
  return {
    resolveId(source) {
      if (builtinModules.includes(source)) {
        return { id: 'node:' + source, external: true }
      }
    },
  }
}

export default [
  {
    input: 'src/websocket-handler.js',
    output: {
      file: 'files/websocket-handler.js',
      format: 'esm',
    },
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      json(),
      prefixBuiltinModules(),
    ],
    external: ['WEBSOCKET_HOOKS'],
  },
]
