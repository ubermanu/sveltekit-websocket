const uuid = () => Math.random().toString(16).slice(2)

/**
 * Handles the creation of a new websocket connection.
 *
 * @type {import('@ubermanu/sveltekit-websocket').Handle}
 */
export const handle = async ({ server, socket }) => {
  const id = uuid()

  console.log('WebSocket connection established', id)

  socket.on('message', (message) => {
    console.log(`Received message: ${message}`, id)

    if (message.toString() === 'ping') {
      socket.send('pong')
    }
  })

  socket.on('close', () => {
    console.log('WebSocket connection closed', id)
  })
}

/**
 * Handles errors that occur in the websocket connection.
 *
 * @type {import('@ubermanu/sveltekit-websocket').HandleError}
 */
export function handleError({ error }) {
  console.error(error.stack)
}
