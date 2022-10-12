import { isObject } from '@mini-vue/shared'
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReactiveHandlers,
  shallowReadonlyHandlers,
} from './baseHandlers'

export const reactiveMap = new WeakMap<Target, any>()
export const shallowReactiveMap = new WeakMap<Target, any>()
export const readonlyMap = new WeakMap<Target, any>()
export const shallowReadonlyMap = new WeakMap<Target, any>()
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

function createReactiveObject(
  target: Target,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>,
) {
  if (!isObject(target))
    console.warn('target must be an object')

  const existProxy = proxyMap.get(target)
  if (existProxy)
    return existProxy
  const proxy = new Proxy(target, baseHandlers)

  proxyMap.set(target, proxy)

  return proxy
}

export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

export function shallowReactive(target: object) {
  return createReactiveObject(target, shallowReactiveHandlers, shallowReactiveMap)
}

export function readonly<T extends object>(target: T) {
  return createReactiveObject(target, readonlyHandlers, readonlyMap)
}

export function shallowReadonly<T extends object>(target: T) {
  return createReactiveObject(target, shallowReadonlyHandlers, shallowReadonlyMap)
}

// track
export function toRaw<T>(observed: T): T {
  const raw = observed && (observed as Target)[ReactiveFlags.RAW]

  return raw ? toRaw(raw) : observed
}

export function isReactive(value: unknown): boolean {
  if (isReadonly(value))
    return isReactive((value as Target)[ReactiveFlags.RAW])

  return !!(value && (value as Target)[ReactiveFlags.IS_REACTIVE])
}

export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_READONLY])
}

export function isShallow(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_SHALLOW])
}

export function isProxy(value: unknown): boolean {
  return isReactive(value) || isReadonly(value)
}
