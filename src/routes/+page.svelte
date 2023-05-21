<script>
  import { onConnect, onDisconnect, onError, onMessage, socket } from '$lib'

  onConnect(() => {
    console.log('Socket connected 🎉')
  })

  onMessage((message) => {
    console.log('Socket message received 📨', message)
  })

  onError((error) => {
    console.log('Socket error 😱', error)
  })

  onDisconnect(() => {
    console.log('Socket disconnected 😢')
  })
</script>

<p>
  Socket is connected: <code>{$socket.connected ? '🟢' : '🔴'}</code>
</p>

<button on:click={() => $socket.send('ping')}>Ping</button>
