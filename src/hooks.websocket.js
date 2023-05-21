/**
 * Handles the creation of a new websocket connection.
 *
 * @type {import('$lib/index.js').Handle}
 */
export const handle = async ({ socket }) => {
  socket.on('message', (message) => {
    console.log(`Received message: ${message}`)

    if (message.toString() === 'ping') {
      console.log('Sending pong')
      socket.send('pong')
    }
  })

  socket.on('close', () => {
    console.log('WebSocket connection closed')
  })
}

/**
 * Handles errors that occur in the websocket connection.
 *
 * @type {import('$lib/index.js').HandleError}
 */
export function handleError({ error }) {
  console.error(error.stack)
}
