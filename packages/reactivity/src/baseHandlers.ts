// import { isIntegerKey } from '@mini-vue/shared'
import { extend, hasChanged, hasOwn, isArray, isIntegerKey, isObject } from '@mini-vue/shared'
import { track, trigger } from './effect'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import { ReactiveFlags, reactive, readonly } from './reactive'

const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)
function createGetter(isReadonly = false, shallow = false) {
  return function get(
    target: Object,
    key: string | symbol,
    receiver: object,
  ) {
    if (key === ReactiveFlags.RAW)
      return target

    const res = Reflect.get(target, key, receiver)
    if (!isReadonly)
      track(target, key)

    if (shallow)
      return res

    if (isObject(res))
      return isReadonly ? readonly(res) : reactive(res)

    return res
  }
}
const set = createSetter()
const shallowSet = createSetter(false, true)
const readonlySet = createSetter(true)
const shallowReadonlySet = createSetter(true, true)
function createSetter(isReadonly = false, shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object,
  ) {
    if (isReadonly) {
      console.warn(`property${key as string} is readonly`)

      return true
    }

    const oldValue = target[key]
    const hadKey = isArray(target) && isIntegerKey(key)
      ? Number(key) < target.length
      : hasOwn(target, key)

    const result = Reflect.set(target, key, value, receiver)
    if (!hadKey)
      trigger(target, TriggerOpTypes.ADD, key, value)
    else if (hasChanged(value, oldValue))
      trigger(target, TriggerOpTypes.SET, key, value)

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
  const type = isArray(target) ? 'length' : TrackOpTypes.ITERATE
  track(target, type)

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

export const shallowReactiveHandlers = extend(
  {},
  mutableHandlers,
  {
    get: shallowGet,
    set: shallowSet,
  },
)

export const readonlyHandlers = extend(
  {},
  mutableHandlers,
  {
    get: readonlyGet,
    set: readonlySet,
  },
)
export const shallowReadonlyHandlers = extend(
  {},
  mutableHandlers,
  {
    get: shallowReadonlyGet,
    set: shallowReadonlySet,
  },
)
