# @ubermanu/sveltekit-websocket

This is a small websocket plugin for SvelteKit. It uses [ws](https://github.com/websockets/ws) under the hood.

## Install

    pnpm i @ubermanu/sveltekit-websocket -D

## Config

Use the patched `node-adapter` in `svelte.config.js`:

```js
import adapter from '@ubermanu/sveltekit-websocket/adapter'

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

Create your websocket handler in `src/hooks.server.js`:

```js
/** @type {import('@ubermanu/sveltekit-websocket').HandleWebsocket} */
export function handleWebsocket({ socket }) {
  socket.on('message', () => {
    socket.send('something')
  })
}
```

Connect to the endpoint using any websocket client:

```svelte
<script>
  import { browser } from '$app/environment'
  import { page } from '$app/state'

  const socket = browser ? new WebSocket(`ws://${page.url.host}`) : null

  let connected = $state(false)

  socket?.addEventListener('open', () => (connected = true))
  socket?.addEventListener('close', () => (connected = false))
</script>

<p>
  Websocket connection status: {connected ? '🟢' : '🔴'}
</p>
```
