<script>
  import { websocket } from '$lib'

  $: console.log($websocket)
</script>

<p>
  Socket is connected: <code>{$websocket.connected ? '🟢' : '🔴'}</code>
</p>
