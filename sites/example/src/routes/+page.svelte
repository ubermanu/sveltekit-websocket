<script>
  import { browser } from '$app/environment'
  import { websocket } from '@ubermanu/sveltekit-websocket/stores'
  import { writable } from 'svelte/store'

  const socket = browser ? new WebSocket($websocket.url) : null

  const connected = writable(false)

  socket?.addEventListener('open', () => connected.set(true))
  socket?.addEventListener('close', () => connected.set(false))
  socket?.addEventListener('message', (event) => console.log(event.data))
</script>

<h1>SvelteKit + WebSocket</h1>

<p>
  Websocket connection status: {$connected ? '🟢' : '🔴'}
</p>

<button on:click={() => socket?.send('ping')}>PING</button>
