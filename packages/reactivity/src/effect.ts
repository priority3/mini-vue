import { isArray, toRawType } from '@mini-vue/shared'
import { TrackOpTypes, TriggerOpTypes } from './operations'

type KeyToDepMap = Map<any, Set<any>>
const targetMap = new WeakMap<any, KeyToDepMap>()

// eslint-disable-next-line import/no-mutable-exports
export let shouldTrack = true
const trackStack: boolean[] = []

let activeEffect: effectFnType | undefined

const effectStack: Array<{
  (): void
  deps: any[]
  options: ReactiveEffectOptions | undefined
}> = []

export type EffectScheduler = (...args: any[]) => any
export interface ReactiveEffectOptions {
  lazy?: boolean
  scheduler?: EffectScheduler
}
export type effectFnType = ReturnType<typeof effect>

export function effect<T = any>(
  fn: () => T,
  options?: ReactiveEffectOptions,
) {
  const effectFn = () => {
    cleanupEffect(effectFn)
    activeEffect = effectFn
    // nested effect
    effectStack.push(effectFn)
    // to computed
    const res = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]

    return res
  }
  effectFn.options = options
  effectFn.deps = []
  if (!options?.lazy)
    effectFn()

  return effectFn
}

function cleanupEffect(effectFn: any) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

export function pauseTracking() {
  trackStack.push(shouldTrack)
  shouldTrack = false
}

export function enableTracking() {
  trackStack.push(shouldTrack)
  shouldTrack = true
}

export function resetTracking() {
  const last = trackStack.pop()
  shouldTrack = last === undefined ? true : last
}

// `get`: track value
export function track(target: object, key: unknown) {
  if (activeEffect && shouldTrack) {
    let depsMap = targetMap.get(target)
    if (!depsMap)
      targetMap.set(target, (depsMap = new Map()))

    let deps = depsMap.get(key)
    if (!deps)
      depsMap.set(key, (deps = new Set()))

    deps.add(activeEffect)
    activeEffect.deps.push(deps)
  }
}

// `set`: trigger value

export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  value?: unknown,
) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const effects = depsMap.get(key)

  const effectsToRun = new Set<effectFnType>([])
  effects && effects.forEach((effectFn) => {
    if (effectFn !== activeEffect)
      effectsToRun.add(effectFn)
  })

  if (type === TriggerOpTypes.ADD || type === TriggerOpTypes.DELETE) {
    const iterateEffects = depsMap.get(TrackOpTypes.ITERATE)
    iterateEffects && iterateEffects.forEach((effectFn) => {
      if (effectFn !== activeEffect)
        effectsToRun.add(effectFn)
    })
  }

  if (type === TriggerOpTypes.ADD && isArray(target)) {
    const lengthEffects = depsMap.get('length')
    lengthEffects && lengthEffects.forEach((effectFn) => {
      if (effectFn !== activeEffect)
        effectsToRun.add(effectFn)
    })
  }

  if (isArray(target) && key === 'length') {
    depsMap.forEach((effects, ind) => {
      // (toRawType(ind) !== 'Symbol' && ind >= (value as number))
      // TODO
      if (ind === 'length' || (toRawType(ind) !== 'Symbol' && ind >= (value as number))) {
        effects.forEach((effectFn) => {
          if (effectFn !== activeEffect)
            effectsToRun.add(effectFn)
        })
      }
    })
  }

  effectsToRun.forEach((effectFn) => {
    if (effectFn?.options?.scheduler)
      effectFn.options.scheduler(effectFn)
    else
      effectFn()
  })
}

