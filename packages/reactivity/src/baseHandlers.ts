import { track, trigger } from './effect'

const get = createGetter()
function createGetter() {
  return function get(
    target: Object,
    key: string | symbol,
  ) {
    const res = Reflect.get(target, key)
    track(target, key)

    return res
  }
}
const set = createSetter()
function createSetter() {
  return function set(target: object, key: string | symbol, value: unknown) {
    const result = Reflect.set(target, key, value)
    trigger(target, key)

    return result
  }
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
}

