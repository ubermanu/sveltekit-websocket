import type { WebSocket } from 'ws'

export type HandleOpen = (event: {
  request: { url: Readonly<URL> }
  socket: WebSocket
  locals: any
}) => void

export type HandleMessage = (event: {
  socket: WebSocket
  message: any
  locals: any
}) => void

export type HandleClose = (event: { socket: WebSocket; locals: any }) => void

// @deprecated
export type Handle = (event: {
  request: {
    url: Readonly<URL>
  }
  socket: WebSocket
}) => void

export type HandleError = (event: { error: Error }) => void
