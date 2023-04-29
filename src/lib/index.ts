import type { Server } from 'socket.io'

export type Handle = (event: { server: Server }) => void
export * from './stores/socket.js'
