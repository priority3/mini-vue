import { effect } from '@mini-vue/reactivity'

export type WatchEffect = (onCleanup: () => void) => void
export type WatchSource<T = any> = () => T
export type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV,
  // onCleanup: () => void
) => any

export function watch(source: WatchSource | object, cb: WatchCallback | null) {
  let getter
  if (typeof source === 'function')
    getter = source

  else
    getter = traverse(source)

  let oldValue, newValue

  const effectFn = effect(getter, {
    lazy: true,
    scheduler(effect) {
      newValue = effect()
      cb && cb(newValue, oldValue)
      oldValue = newValue
    },
  })

  oldValue = effectFn()

  function traverse(value: object, seen = new Set()) {
    if (typeof value !== 'object' || value === null
    || seen.has(value))
      return

    seen.add(value)
    for (const k in value as any)
      traverse(value[k], seen)

    return value
  }
}
