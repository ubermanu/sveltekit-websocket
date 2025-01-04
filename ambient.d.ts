import type { HandleWebsocket } from './index.js'

declare module 'SERVER_HOOKS' {
  export const handleWebsocket: HandleWebsocket
}
