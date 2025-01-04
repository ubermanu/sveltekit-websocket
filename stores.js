import { page as page$ } from '$app/stores'
import { derived } from 'svelte/store'

/**
 * A readable store with information about the websocket connection.
 *
 * @deprecated
 */
export const websocket = derived([page$], ([page]) => {
  const url = page.url
    ? `${page.url.protocol === 'https:' ? 'wss:' : 'ws:'}//${page.url.host}`
    : ''

  return {
    url,
  }
})
