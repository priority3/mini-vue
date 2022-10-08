type KeyToDepMap = Map<any, Set<any>>
const targetMap = new WeakMap<any, KeyToDepMap>()

let activeEffect

const effectStack: Array<{
  (): void
  deps: any[]
}> = []

export function effect<T = any>(fn: () => T) {
  const effectFn = () => {
    cleanupEffect(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }

  effectFn.deps = []
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

  dep.add(activeEffect)

  activeEffect.deps.push(dep)
}

// `set`: trigger value

export function trigger(target: object, key: unknown) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  const effectToRun = new Set(effects)
  effectToRun.forEach(effect => effect())
}

