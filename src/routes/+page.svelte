<script>
  import { socket } from '$lib'

  const { connected, ...ws } = socket()

  ws.addEventListener('open', () => {
    console.log('connected')
  })

  ws.addEventListener('message', (event) => {
    console.log(event)
  })

  ws.addEventListener('close', () => {
    console.log('disconnected')
  })
</script>

<p>
  Socket is connected: <code>{$connected ? '🟢' : '🔴'}</code>
</p>

<button on:click={() => ws?.send('ping')}>PING</button>
