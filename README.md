# @ubermanu/sveltekit-websocket

This is a small websocket plugin for SvelteKit. It uses [ws](https://github.com/websockets/ws) under the hood.

## Install

Install the package:

    pnpm install @ubermanu/sveltekit-websocket -D

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
