import { isObject, toRawType } from '@mini-vue/shared'
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReactiveHandlers,
  shallowReadonlyHandlers,

} from './baseHandlers'

import {
  mutableCollectionHandlers,
  readonlyCollectionHandlers,
  shallowCollectionHandlers,
  shallowReadonlyCollectionHandlers,
} from './collectionHandlers'

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

const enum TargetType {
  INVALID = 0,
  COMMON = 1,
  COLLECTION = 2,
}

function targetTypeMap(rawType: string) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION
    default:
      return TargetType.INVALID
  }
}

function createReactiveObject(
  target: Target,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>,
) {
  if (!isObject(target))
    console.warn('target must be an object')

  const existProxy = proxyMap.get(target)
  if (existProxy)
    return existProxy

  const handlers = targetTypeMap(toRawType(target)) === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  const proxy = new Proxy(target, handlers)

  proxyMap.set(target, proxy)

  return proxy
}

export function reactive(target: object) {
  return createReactiveObject(
    target,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap,
  )
}

export function shallowReactive(target: object) {
  return createReactiveObject(
    target,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap,
  )
}

export function readonly<T extends object>(target: T) {
  return createReactiveObject(
    target,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap,
  )
}

export function shallowReadonly<T extends object>(target: T) {
  return createReactiveObject(
    target,
    shallowReadonlyHandlers,
    shallowReadonlyCollectionHandlers,
    shallowReadonlyMap,
  )
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

export const toReactive = <T>(value: T): T =>
  isObject(value) ? reactive(value) : value

export const toReadonly = <T>(value: T): T =>
  isObject(value) ? readonly(value as Record<any, any>) : value
