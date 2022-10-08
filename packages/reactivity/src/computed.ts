import { effect } from './effect'

export type ComputedGetter<T> = (...args: any[]) => T
export function computed<T>(
  getter: ComputedGetter<T>,
) {
  let dirty = true
  let value
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true
    },

  })

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }

      return value
    },
  }

  return obj
}
