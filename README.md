# @ubermanu/sveltekit-websocket

This is a small websocket plugin for SvelteKit. It uses [ws](https://github.com/websockets/ws) under the hood.

## Install

    pnpm i @ubermanu/sveltekit-websocket -D

## Config

Use the patched `node-adapter` in `svelte.config.js`:

```js
import adapter from '@ubermanu/sveltekit-websocket'

const config = {
  kit: {
    adapter: adapter(),
  },
}

export default config
```

Use the websocket dev server in `vite.config.js`:

```js
import { sveltekit } from '@sveltejs/kit/vite'
import { websocket } from '@ubermanu/sveltekit-websocket/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit(), websocket()],
})
```

## Usage

Create your websocket handler in `src/hooks.websocket.js`:

```js
/** @type {import('@ubermanu/sveltekit-websocket').Handle} */
export function handle({ socket }) {
  socket.on('message', () => {
    socket.send('something')
  })
}
```

In your page, import the `websocket` store and connect to its url using any websocket client:

```svelte
<script>
  import { browser } from '$app/environment'
  import { websocket } from '@ubermanu/sveltekit-websocket/stores'
  import { writable } from 'svelte/store'

  const socket = browser ? new WebSocket($websocket.url) : null

  const connected = writable(false)

  socket?.addEventListener('open', () => connected.set(true))
  socket?.addEventListener('close', () => connected.set(false))
</script>

<p>
  Websocket connection status: {$connected ? '🟢' : '🔴'}
</p>
```
