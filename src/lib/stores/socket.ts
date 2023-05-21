import { browser } from '$app/environment'
import { page as page$ } from '$app/stores'
import { derived, writable } from 'svelte/store'

const connected$ = writable(false)

let watcher

const registerStateSocket = (url: string) => {
  watcher = new WebSocket(url)
  watcher.onopen = () => connected$.set(true)
  watcher.onclose = () => connected$.set(false)
}

export const websocket = derived([connected$, page$], ([connected, page]) => {
  const url = page.url ? `ws://${page.url.host}` : ''

  // If in browser, register the socket connection state watcher
  if (url && browser) {
    registerStateSocket(url)
  }

  return {
    url,
    connected,
  }
})
