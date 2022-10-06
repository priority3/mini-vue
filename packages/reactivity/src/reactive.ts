import { mutableHandlers } from './baseHandlers'
const proxyMap = new WeakMap()
// proxyMap key type

function createReactiveObject(target: Object, baseHandlers: ProxyHandler<any>) {
  const existProxy = proxyMap.get(target)
  if (existProxy)
    return existProxy
  const proxy = new Proxy(target, baseHandlers)

  proxyMap.set(target, proxy)

  return proxy
}

export function reactive(target: Object) {
  if (typeof target !== 'object')
    console.warn('target must be an object')

  return createReactiveObject(target, mutableHandlers)
}
