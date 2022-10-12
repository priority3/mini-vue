import { hasChanged, hasOwn, isMap, isObject } from '@mini-vue/shared'
import { ITERATE_KEY, MAP_KEY_ITERATE_KEY, track, trigger } from './effect'
import { TriggerOpTypes } from './operations'
import { ReactiveFlags, reactive, toRaw, toReactive, toReadonly } from './reactive'

export type CollectionTypes = IterableCollections | WeakCollections

type IterableCollections = Map<any, any> | Set<any>
type WeakCollections = WeakMap<any, any> | WeakSet<any>
type MapTypes = Map<any, any> | WeakMap<any, any>
type SetTypes = Set<any> | WeakSet<any>

const toShallow = <T>(value: T): T => value

const getProto = <T extends CollectionTypes>(v: T): any =>
  Reflect.getPrototypeOf(v)

function get(
  target: MapTypes,
  key: unknown,
  isReadonly = false,
  isShallow = false,
) {
  target = (target as any)[ReactiveFlags.RAW]
  const rawObject = toRaw(target)
  const rawKey = toRaw(key)
  track(rawObject, rawKey)
  const { has } = getProto(rawObject)

  // deep level
  if (has.call(rawObject, key)) {
    const res = rawObject.get(key)
    isObject(res) && reactive(res)
  }
}

function size(
  target: IterableCollections,
  isReadonly = false,
) {
  target = (target as any)[ReactiveFlags.RAW]
  !isReadonly && track(toRaw(target), ITERATE_KEY)

  return Reflect.get(target, 'size', target)
}

function has(
  this: CollectionTypes,
  key: unknown,
  isReadonly = false,
) {
  const target = toRaw(this)
  const rawKey = toRaw(key)

  if (!isReadonly)
    track(target, rawKey === key ? rawKey : key)

  return key === rawKey
    ? target.has(key)
    : target.has(key) || target.has(rawKey)
}

// map
function set(
  this: MapTypes,
  key: unknown,
  value: unknown,
) {
  value = toRaw(value)
  const target = toRaw(this)
  const { has, get } = getProto(target)

  let hadKey = has.call(target, key)

  //  key rawKey
  if (!hadKey) {
    key = toRaw(key)
    hadKey = has.call(target, key)
  }

  const oldValue = get.call(target, key)
  target.set(key, oldValue)
  if (!hadKey)
    trigger(target, TriggerOpTypes.ADD, key, value)

  else if (hasChanged(value, oldValue))
    trigger(target, TriggerOpTypes.SET, key, value, oldValue)
}

// set
function add(
  this: SetTypes,
  value: unknown,
) {
  value = toRaw(value)
  const target = toRaw(this)
  const proto = getProto(target)
  const hadKey = proto.has.call(target, value)
  if (!hadKey) {
    target.add(value)
    trigger(target, TriggerOpTypes.ADD, value, value)
  }

  return this
}

function deleteEntry(
  this: CollectionTypes,
  key: unknown,
) {
  const target = toRaw(this)
  const { has, get } = getProto(target)
  const hadKey = has.call(target, key)

  const oldValue = get ? get.call(target, key) : undefined

  const result = target.delete(key)

  if (hadKey)
    trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue)

  return result
}

function createForEach(
  isReadonly: boolean,
  isShallow: boolean,
) {
  return function forEach(
    this: IterableCollections,
    callback: Function,
    thisArg?: unknown,
  ) {
    const observed = this as any
    const target = observed[ReactiveFlags.RAW]
    const rawTarget = toRaw(target)
    // console.log('🚀 ~ file: collectionHandlers.ts ~ line 137 ~ rawTarget', rawTarget === target) --> true
    !isReadonly && track(rawTarget, ITERATE_KEY)
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive

    // return target.forEach(callback)

    return target.forEach((value: unknown, key: unknown) => {
      // important: make sure the callback is
      // 1. invoked with the reactive map as `this` and 3rd arg
      // 2. the value received should be a corresponding reactive/readonly.
      // the key or value maybe reactive
      return callback.call(thisArg, wrap(value), wrap(key), observed)
    })
  }
}

function createIterableMethod(
  method: string | symbol,
  isReadonly: boolean,
  shallow: boolean,
) {
  return function (
    this: IterableCollections,
    ...args: unknown[]
  ) {
    const target = this[ReactiveFlags.RAW]
    const rawTarget = toRaw(target)
    const targetIsMap = isMap(rawTarget)
    const isPair
      = method === 'entries' || (method === Symbol.iterator && targetIsMap)
    // map keys
    const isKeyOnly = method === 'keys' && targetIsMap
    const innerIterator = target[method](...args)
    const wrap = isReadonly ? toReadonly : shallow ? toShallow : toReactive
    !isReadonly && track(rawTarget, isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY)

    return {
      next() {
        const { value, done } = innerIterator.next()

        return done
          ? { value, done }
          : {
              value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
              done,
            }
      },
      [Symbol.iterator]() {
        return this
      },
    }
  }
}

function createInstrumentations() {
  const mutableInstrumentations: Record<string, Function> = {
    get(this: MapTypes, key: unknown) {
      return get(this, key)
    },
    get size() {
      return size(this as unknown as IterableCollections)
    },
    has,
    set,
    add,
    delete: deleteEntry,
    forEach: createForEach(false, false),
  }
  const readonlyInstrumentations: Record<string, Function> = {

  }
  const shallowInstrumentations: Record<string, Function> = {

  }
  const shallowReadonlyInstrumentations: Record<string, Function> = {

  }

  const iteratorMethods = ['keys', 'values', 'entries', Symbol.iterator]
  iteratorMethods.forEach((method) => {
    mutableInstrumentations[method as string] = createIterableMethod(
      method,
      false,
      false,
    )
    readonlyInstrumentations[method as string] = createIterableMethod(
      method,
      true,
      false,
    )
    shallowInstrumentations[method as string] = createIterableMethod(
      method,
      false,
      true,
    )
    shallowReadonlyInstrumentations[method as string] = createIterableMethod(
      method,
      true,
      true,
    )
  })

  return [
    mutableInstrumentations,
    readonlyInstrumentations,
    shallowInstrumentations,
    shallowReadonlyInstrumentations,
  ]
}

const [
  mutableInstrumentations,
  readonlyInstrumentations,
  shallowInstrumentations,
  shallowReadonlyInstrumentations,
] = createInstrumentations()

function createInstrumentationGetter(isReadonly: boolean, shallow: boolean) {
  const instrumentations
  = shallow
    ? isReadonly ? shallowReadonlyInstrumentations : shallowInstrumentations
    : isReadonly ? readonlyInstrumentations : mutableInstrumentations

  return (
    target: CollectionTypes,
    key: string | symbol,
    receiver: CollectionTypes,
  ) => {
    if (key === ReactiveFlags.IS_REACTIVE)
      return !isReadonly

    else if (key === ReactiveFlags.IS_READONLY)
      return isReadonly

    else if (key === ReactiveFlags.RAW)
      return target

    return Reflect.get(
      hasOwn(instrumentations, key) && key in target
        ? instrumentations
        : target,
      key,
      receiver,
    )
  }
}

export const mutableCollectionHandlers: ProxyHandler<CollectionTypes> = {
  get: createInstrumentationGetter(false, false),
}

export const shallowCollectionHandlers: ProxyHandler<CollectionTypes> = {
  get: createInstrumentationGetter(false, true),
}

export const readonlyCollectionHandlers: ProxyHandler<CollectionTypes> = {
  get: createInstrumentationGetter(true, false),
}

export const shallowReadonlyCollectionHandlers: ProxyHandler<CollectionTypes> = {
  get: createInstrumentationGetter(true, true),

}
