import { io } from 'socket.io-client'
import { derived, writable } from 'svelte/store'

// https://socket.io/docs/v3/emit-cheatsheet/#reserved-events
const reservedEvents = [
  'connect',
  'connect_error',
  'disconnect',
  'disconnecting',
  'newListener',
  'removeListener',
]

const client = io()

const connected = writable(false)

const socket = derived([connected], ([$connected]) => {
  return {
    connected: $connected,
    connect: () => client.connect(),
    disconnect: () => client.disconnect(),
    emit,
  }
})

/** Emit an event to the server */
const emit = (event: string, ...args: any[]) => {
  if (reservedEvents.includes(event)) {
    throw new Error(`Cannot emit reserved event ${event}`)
  }
  client.emit(event, ...args)
}

export { socket }

/**
 * We are forced to keep the event functions in a Map so they are accessible in
 * any components. The issue here is, with HMR or multiple listeners, it keeps
 * adding up.
 *
 * TODO: Find a way to remove the listeners when the component is destroyed
 */
let eventFunctions: Map<string, (...args: any) => void> = new Map()

export function onConnect(fn: () => void) {
  eventFunctions.set('connect', fn)
}

export function onConnectError(fn: () => void) {
  eventFunctions.set('connect_error', fn)
}

export function onDisconnecting(fn: () => void) {
  eventFunctions.set('disconnecting', fn)
}

export function onDisconnect(fn: () => void) {
  eventFunctions.set('disconnect', fn)
}

export function onEvent(event: string, fn: (...args: any[]) => void) {
  if (reservedEvents.includes(event)) {
    throw new Error(`Cannot listen to reserved event ${event}`)
  }
  eventFunctions.set(event, fn)
}

export function offEvent(event: string) {
  eventFunctions.delete(event)
}

/** Attach all the event listeners to the client */

client.onAny((event, ...args) => {
  if (eventFunctions.has(event)) {
    eventFunctions.get(event)?.(...args)
  }
})

client.on('connect', (...args) => {
  connected.set(true)
  eventFunctions.get('connect')?.(...args)
})

client.on('connect_error', (...args) => {
  eventFunctions.get('connect_error')?.(...args)
})

client.on('disconnecting', () => {
  eventFunctions.get('disconnecting')?.()
})

client.on('disconnect', () => {
  eventFunctions.get('disconnect')?.()
  connected.set(false)
})
