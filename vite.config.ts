import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { websocket } from './src/lib/vite.js'

export default defineConfig({
  plugins: [sveltekit(), websocket()],
})
