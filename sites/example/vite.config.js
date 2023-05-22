import { sveltekit } from '@sveltejs/kit/vite'
import { websocket } from '@ubermanu/sveltekit-websocket/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit(), websocket()],
})
