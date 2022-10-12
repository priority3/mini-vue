import { reactive } from './reactive'

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
