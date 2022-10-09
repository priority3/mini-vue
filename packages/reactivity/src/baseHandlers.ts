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
    const result = Reflect.set(target, key, value, receiver)

    const hadKey = hasOwn(target, key)

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

function ownKeys(target: object) {
  track(target, TrackOpTypes.ITERATE)

  return Reflect.ownKeys(target)
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  // in
  has,
  // for in
  ownKeys,
}

