// import { isIntegerKey } from '@mini-vue/shared'
import { hasOwn } from '@mini-vue/shared'
import { track, trigger } from './effect'
import { TrackOpTypes, TriggerOpTypes } from './operations'

const get = createGetter()
function createGetter() {
  return function get(
    target: Object,
    key: string | symbol,
    receiver: object,
  ) {
    const res = Reflect.get(target, key, receiver)
    track(target, key)

    return res
  }
}
const set = createSetter()
function createSetter() {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object,
  ) {
    const hadKey = hasOwn(target, key)

    const result = Reflect.set(target, key, value, receiver)
    if (hadKey)
      trigger(target, TriggerOpTypes.SET, key)
    else
      trigger(target, TriggerOpTypes.ADD, key)

    return result
  }
}

function has(target: object, key: string | symbol) {
  const result = Reflect.has(target, key)

  track(target, key)

  return result
}
// - Object.getOwnPropertyNames()
// - Object.getOwnPropertySymbols()
// - Object.keys()
// - for…in
function ownKeys(target: object) {
  track(target, TrackOpTypes.ITERATE)

  return Reflect.ownKeys(target)
}

function deleteProperty(target: object, key: string | symbol) {
  const hadKey = hasOwn(target, key)

  const result = Reflect.deleteProperty(target, key)

  if (hadKey && result)
    trigger(target, TriggerOpTypes.DELETE, key)

  return result
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  // in
  has,
  // for in
  ownKeys,
  deleteProperty,
}

