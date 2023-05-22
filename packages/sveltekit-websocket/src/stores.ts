import { page as page$ } from '$app/stores'
import { derived } from 'svelte/store'

/** Returns the websocket server data. */
export const websocket = derived([page$], ([page]) => {
  const url = page.url
    ? `${page.url.protocol === 'https:' ? 'wss:' : 'ws:'}//${page.url.host}`
    : ''

  return {
    url,
  }
})
