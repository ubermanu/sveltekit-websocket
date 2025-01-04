import type { Plugin } from 'vite'

declare function plugin(): Plugin

export { plugin as websocket }
