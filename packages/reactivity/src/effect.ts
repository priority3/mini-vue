import { TrackOpTypes, TriggerOpTypes } from './operations'

type KeyToDepMap = Map<any, Set<any>>
const targetMap = new WeakMap<any, KeyToDepMap>()

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

// `get`: track value
export function track(target: object, key: unknown) {
  if (!activeEffect)
    return

  let depsMap = targetMap.get(target)
  if (!depsMap)
    targetMap.set(target, (depsMap = new Map()))

  let deps = depsMap.get(key)
  if (!deps)
    depsMap.set(key, (deps = new Set()))

  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

// `set`: trigger value

export function trigger(target: object, type: TriggerOpTypes, key: unknown) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const effects = depsMap.get(key)

  const effectsToRun = new Set<effectFnType>([])
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

