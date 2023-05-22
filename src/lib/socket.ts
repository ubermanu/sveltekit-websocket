import { browser } from '$app/environment'
import { websocket as websocket$ } from '$lib/stores/websocket.js'
import { onDestroy } from 'svelte'
import { get, readonly, writable } from 'svelte/store'

/**
 * Creates an SSR compatible websocket client instance, that connects to a
 * websocket server.
 *
 * ```js
 * import { socket } from '@ubermanu/sveltekit-websocket'
 *
 * const { connected, ...ws } = socket()
 *
 * ws.addEventListener('open', () => {
 *   ws.send('Hello')
 * })
 * ```
 */
export const socket = (url?: string) => {
  const connected$ = writable(false)

  if (!browser) {
    return {
      connected: readonly(connected$),
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
      send: () => {},
      close: () => {},
    }
  }

  const socket = new WebSocket(url || get(websocket$).url)

  const onSocketOpen = () => connected$.set(true)
  const onSocketClose = () => connected$.set(false)

  socket.addEventListener('open', onSocketOpen)
  socket.addEventListener('close', onSocketClose)

  // TODO: Ensure that the socket is closed when the component is destroyed
  onDestroy(() => {
    socket.close()
    socket.removeEventListener('open', onSocketOpen)
    socket.removeEventListener('close', onSocketClose)
  })

  return {
    connected: readonly(connected$),
    addEventListener: socket.addEventListener.bind(socket),
    removeEventListener: socket.removeEventListener.bind(socket),
    dispatchEvent: socket.dispatchEvent.bind(socket),
    send: socket.send.bind(socket),
    close: socket.close.bind(socket),
  }
}
