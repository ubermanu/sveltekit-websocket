import type { Handle, HandleError } from './index.js'

declare module 'WEBSOCKET_HOOKS' {
  export const handle: Handle
  export const handleError: HandleError
}
