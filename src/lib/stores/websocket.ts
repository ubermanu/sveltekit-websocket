import { browser } from '$app/environment'
import { page as page$ } from '$app/stores'
import { onDestroy } from 'svelte'
import { derived, get, readonly, writable } from 'svelte/store'

/** Returns the websocket server data. */
export const websocket = derived([page$], ([page]) => {
  const url = page.url
    ? `${page.url.protocol === 'https:' ? 'wss:' : 'ws:'}//${page.url.host}`
    : ''

  return {
    url,
  }
})

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

  const socket = new WebSocket(url || get(websocket).url)

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
