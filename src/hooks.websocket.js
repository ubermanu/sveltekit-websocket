/** @type {import('$lib/index.js').Handle} */
export const handle = async ({ server }) => {
  server.on('connection', (socket) => {
    socket.on('ping', () => {
      socket.emit('pong')
    })
  })
}
