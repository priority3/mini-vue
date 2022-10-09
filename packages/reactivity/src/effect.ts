import { TrackOpTypes, TriggerOpTypes } from './operations'

type KeyToDepMap = Map<any, Set<any>>
const targetMap = new WeakMap<any, KeyToDepMap>()

let activeEffect

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

export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions) {
  const effectFn = () => {
    cleanupEffect(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
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

// `get`: track value
export function track(target: object, key: unknown) {
  let depsMap = targetMap.get(target)
  if (!depsMap)
    targetMap.set(target, (depsMap = new Map()))

  let dep = depsMap.get(key)
  if (!dep)
    depsMap.set(key, (dep = new Set()))

  if (activeEffect) {
    dep.add(activeEffect)

    activeEffect.deps.push(dep)
  }
}

// `set`: trigger value

export function trigger(target: object, type: TriggerOpTypes, key: unknown) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  const effectsToRun = new Set<any>()
  effects && effects.forEach((effectFn) => {
    if (effectFn !== activeEffect)
      effectsToRun.add(effectFn)
  })

  if (type === TriggerOpTypes.ADD) {
    const iterateEffects = depsMap.get(TrackOpTypes.ITERATE)
    iterateEffects && iterateEffects.forEach((effectFn) => {
      if (effectFn !== activeEffect)
        effectsToRun.add(effectFn)
    })
  }

  effectsToRun.forEach((effectFn) => {
    if (effectFn?.options?.scheduler)
      effectFn.options.scheduler(effectFn)
    else
      effectFn()
  })
}

