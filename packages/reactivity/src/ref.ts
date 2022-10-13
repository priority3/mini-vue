import { isReactive, reactive } from './reactive'

declare const RefSymbol: unique symbol

export interface Ref<T = any> {
  value: T
  /**
   * Type differentiator only.
   * We need this to be in public d.ts but don't want it to show up in IDE
   * autocomplete, so we use a private Symbol instead.
   */
  [RefSymbol]: true
}

export function isRef<T>(r: Ref<T> | unknown): r is Ref<T>
export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true)
}

export function ref(value?: unknown) {
  return createRef(value, false)
}

function createRef(value: unknown, shallow: boolean) {
  if (isRef(value))
    return value
  const wrapper = {
    value,
  }
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true,
  })

  return reactive(wrapper)
}

export function toRef<T extends object, K extends keyof T>(
  object: T,
  key: K,
  defaultValue?: T[K],
) {
  const wrapper = {
    get() {
      return object[key]
    },
    set(newVal: T[K]) {
      object[key] = newVal
    },

  }
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true,
  })

  return wrapper
}

export function toRefs<T extends object>(
  object: T,
): { [K in keyof T]: Ref<T[K]> } {
  const ret: any = {}
  for (const key in object)
    ret[key] = toRef(object, key)

  return ret
}

export function unref<T>(ref: T | Ref<T>): T {
  return isRef(ref) ? ref.value : ref
}

const shallowUnwrapHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    unref(Reflect.get(target, key, receiver))
  },
  set(target, key, value, receiver) {
    const oldValue = target[key]
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value

      return true
    }
    else {
      return Reflect.set(target, key, value, receiver)
    }
  },
}

export function proxyRefs<T extends object>(
  objectWithRefs: T,
) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers)
}
