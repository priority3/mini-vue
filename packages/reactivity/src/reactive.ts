import { isObject } from '@mini-vue/shared'
import { mutableHandlers } from './baseHandlers'
const proxyMap = new WeakMap()
// proxyMap key type

export const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  IS_SHALLOW = '__v_isShallow',
  RAW = '__v_raw',
}

export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_SHALLOW]?: boolean
  [ReactiveFlags.RAW]?: any
}

function createReactiveObject(target: Target, baseHandlers: ProxyHandler<any>) {
  const existProxy = proxyMap.get(target)
  if (existProxy)
    return existProxy
  const proxy = new Proxy(target, baseHandlers)

  proxyMap.set(target, proxy)

  return proxy
}

export function reactive(target: Object) {
  if (!isObject(target))
    console.warn('target must be an object')

  return createReactiveObject(target, mutableHandlers)
}
