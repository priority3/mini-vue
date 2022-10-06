type KeyToDepMap = Map<any, Set<any>>
const targetMap = new WeakMap<any, KeyToDepMap>()

let activeEffect

export function effect<T = any>(fn: () => T) {
  activeEffect = fn
  fn()

  return effect
}

// `get`: track value
export function track(target: object, key: unknown) {
  let depsMap = targetMap.get(target)
  if (!depsMap)
    targetMap.set(target, (depsMap = new Map()))

  let dep = depsMap.get(key)
  if (!dep)
    depsMap.set(key, (dep = new Set()))

  dep.add(activeEffect)
}

// `set`: trigger value

export function trigger(target: object, key: unknown) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  effects && effects.forEach(effect => effect())
}

