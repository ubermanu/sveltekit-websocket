# @ubermanu/sveltekit-websocket

This is a small websocket plugin for SvelteKit. It uses [ws](https://github.com/websockets/ws) under the hood.

## Install

Install the package:

    pnpm install @ubermanu/sveltekit-websocket -D

## Usage

Use the patched `node-adapter` in `svelte.config.js`:

```js
import adapter from '@ubermanu/sveltekit-websocket/adapter-node'

const config = {
  kit: {
    adapter: adapter(),
  },
}

export default config
```

Set up the websocket server in `vite.config.js`:

```js
import { sveltekit } from '@sveltejs/kit/vite'
import { websocket } from '@ubermanu/sveltekit-websocket/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit(), websocket()],
})
```

Create your websocket handler in `src/hooks.websocket.js`:

```js
/** @type {import('@ubermanu/sveltekit-websocket').Handle} */
export function handle({ socket }) {
  socket.on('message', () => {
    socket.send('something')
  })
}
```

In your page, import the `websocket` store and connect to it using any websocket client:

```svelte
<script>
  import { websocket } from '@ubermanu/sveltekit-websocket'
  import io from 'socket.io-client'

  const socket = io($websocket.url)

  socket.on('connect', () => {
    socket.send('something')
  })
</script>
```
