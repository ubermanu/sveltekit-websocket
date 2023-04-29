<script>
  import { socket, onConnect, onEvent } from '$lib'

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

<button on:click={() => $socket.emit('ping')}>Ping</button>
