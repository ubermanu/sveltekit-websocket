import { browser } from '$app/environment'
import { onDestroy } from 'svelte'
import { derived, writable } from 'svelte/store'

// TODO: Get the websocket server url from the server
const url = `ws://localhost:5173`

// This is a fake socket that is used when rendering the app in SSR mode
const fakeSocket = {
  onopen: () => {},
  onmessage: () => {},
  onerror: () => {},
  onclose: () => {},
  send: () => {},
  close: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,

  readyState: 0,
  protocol: '',
  extensions: '',
  bufferedAmount: 0,
  binaryType: 'blob',
  url: url,

  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as WebSocket

const client = browser ? new WebSocket(url) : fakeSocket
const connected$ = writable(false)

client.onopen = () => {
  connected$.set(true)
}

client.onclose = () => {
  connected$.set(false)
}

export const onConnect = (callback: () => void) => {
  client.addEventListener('open', callback)

  onDestroy(() => {
    client.removeEventListener('open', callback)
  })
}

export const onMessage = (callback: (data: any) => void) => {
  client.addEventListener('message', (event) => {
    callback(event.data)
  })

  onDestroy(() => {
    client.removeEventListener('message', callback)
  })
}

export const onDisconnect = (callback: () => void) => {
  client.addEventListener('close', callback)

  onDestroy(() => {
    client.removeEventListener('close', callback)
  })
}

export const onError = (callback: (error: any) => void) => {
  client.addEventListener('error', callback)

  onDestroy(() => {
    client.removeEventListener('error', callback)
  })
}

export const socket = derived(connected$, (connected) => ({
  send: client.send.bind(client),
  close: client.close.bind(client),
  addEventListener: client.addEventListener.bind(client),
  removeEventListener: client.removeEventListener.bind(client),
  dispatchEvent: client.dispatchEvent.bind(client),
  connected,
}))
