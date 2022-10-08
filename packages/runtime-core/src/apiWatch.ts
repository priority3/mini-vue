import { effect } from '@mini-vue/reactivity'

export type WatchEffect = (onCleanup: () => void) => void
export type WatchSource<T = any> = () => T
export type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV,
  onCleanup: (fn: () => void) => void
) => any
export interface WatchOptions<Immediate = boolean> {
  immediate?: Immediate
  deep?: boolean
  flush?: 'pre' | 'post'
}

export function watch(
  source: WatchSource | object,
  cb: WatchCallback | null,
  { immediate, flush = 'pre' }: WatchOptions = {},
) {
  let getter
  if (typeof source === 'function')
    getter = source

  else
    getter = () => traverse(source)

  let oldValue, newValue

  let cleanUp
  function onInvalidate(fn: () => void) {
    cleanUp = fn
  }

  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (flush === 'post') {
        const p = Promise.resolve()
        p.then(schedulerJob)
      }
      else {
        schedulerJob()
      }
    },
  })

  if (immediate)
    schedulerJob()
  else
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

  function schedulerJob() {
    if (cleanUp)
      cleanUp()
    newValue = effectFn()
    cb && cb(newValue, oldValue, onInvalidate)
    oldValue = newValue
  }
}
