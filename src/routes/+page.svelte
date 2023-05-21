<script>
  import { browser } from '$app/environment'
  import { websocket } from '$lib'
  import { writable } from 'svelte/store'
  import { onDestroy } from 'svelte'
  import Sockette from 'sockette'

  let socket
  const connected = writable(false)

  if (browser) {
    socket = new Sockette($websocket.url, {
      onopen: () => connected.set(true),
      onclose: () => connected.set(false),
      onmessage: (e) => console.log(e),
    })
  }

  onDestroy(() => {
    socket?.close()
    socket = null
  })
</script>

<p>
  Socket is connected: <code>{$connected ? '🟢' : '🔴'}</code>
</p>

<button on:click={() => socket?.send('ping')}>PING</button>
