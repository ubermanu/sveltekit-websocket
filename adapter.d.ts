import nodeAdapter from '@sveltejs/adapter-node'
import type { Adapter } from '@sveltejs/kit'

type AdapterOptions = Parameters<typeof nodeAdapter>[0]

declare function adapter(opts?: AdapterOptions): Adapter

export default adapter
