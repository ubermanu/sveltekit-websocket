# @ubermanu/sveltekit-websocket

This is a small websocket plugin for SvelteKit. It uses [socket.io](https://socket.io/) under the hood.

## Install

Install the package and its peer dependencies:

    pnpm install @ubermanu/sveltekit-websocket socket.io socket.io-client -D

## Usage

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
export function handle({ server }) {
  server.on('connection', (socket) => {
    socket.on('ping', () => {
      socket.send('pong')
    })
  })
}
```

Use the websocket client in your Svelte components:

```svelte
<script>
  import { socket, onConnect, onEvent } from '@ubermanu/sveltekit-websocket'

  onConnect(() => {
    $socket.emit('ping')
  })

  onEvent('pong', () => {
    console.log('pong')
  })
</script>

<p>
  Socket is connected: <code>{$socket.connected ? '🟢' : '🔴'}</code>
</p>
```
