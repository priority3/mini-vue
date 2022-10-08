import { effect, track, trigger } from './effect'

export type ComputedGetter<T> = (...args: any[]) => T
export function computed<T>(
  getter: ComputedGetter<T>,
) {
  let dirty = true
  let value
  let resObj
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true
      trigger(resObj, 'value')
    },

  })

  resObj = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      track(resObj, 'value')

      return value
    },
  }

  return resObj
}
