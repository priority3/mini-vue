// import { isIntegerKey } from '@mini-vue/shared'
import { extend, hasChanged, hasOwn, isArray, isIntegerKey, isObject } from '@mini-vue/shared'
import { pauseTracking, resetTracking, track, trigger } from './effect'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import { ReactiveFlags, reactive, reactiveMap, readonly, readonlyMap, shallowReactiveMap, shallowReadonlyMap, toRaw } from './reactive'

const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

const arrayInstrumentations = createArrayInstrumentations()

function createArrayInstrumentations() {
  const instrumentations: Record<string, Function> = {}
  // array find element
  ;(['includes', 'indexOf', 'lastIndexOf'] as const).forEach((key) => {
    instrumentations[key] = function (this: unknown[], ...args: unknown[]) {
      const arr = toRaw(this) as any
      // TODO why track in here?
      // maybe in methods like `includes` or `indexOf` or `lastIndexOf` , they will use arr[i]
      for (let i = 0, l = this.length; i < l; i++)
        track(arr, `${i}`)

      // we run the method using the original args first (which may be reactive)
      const res = arr[key](...args)
      if (res === -1 || res === false) {
        // if that didn't work, run it again using raw values.
        // use raw args
        return arr[key](...args.map(toRaw))
      }
      else {
        return res
      }
    }
  })
  ;(['push', 'pop', 'shift', 'unshift', 'splice'] as const).forEach((key) => {
    instrumentations[key] = function (this: unknown[], ...args: unknown[]) {
      pauseTracking()
      const res = (toRaw(this) as any)[key].apply(this, args)
      resetTracking()

      return res
    }
  })

  return instrumentations
}

function createGetter(isReadonly = false, shallow = false) {
  return function get(
    target: Object,
    key: string | symbol,
    receiver: object,
  ) {
    if (key === ReactiveFlags.IS_REACTIVE)
      return !isReadonly

    else if (key === ReactiveFlags.IS_READONLY)
      return isReadonly

    else if (key === ReactiveFlags.IS_SHALLOW)
      return shallow

    else if (
      key === ReactiveFlags.RAW
      && receiver
        === (isReadonly
          ? shallow
            ? shallowReadonlyMap
            : readonlyMap
          : shallow
            ? shallowReactiveMap
            : reactiveMap
        ).get(target)
    )
      return target

    const targetIsArray = isArray(target)
    if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key))
      return Reflect.get(arrayInstrumentations, key, receiver)

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

