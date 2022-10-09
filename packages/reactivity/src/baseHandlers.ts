import { track, trigger } from './effect'

const get = createGetter()
function createGetter() {
  return function get(
    target: Object,
    key: string | symbol,
    receiver: object,
  ) {
    const res = Reflect.get(target, key, receiver)
    track(target, key)

    return res
  }
}
const set = createSetter()
function createSetter() {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object,
  ) {
    const result = Reflect.set(target, key, value, receiver)
    trigger(target, key)

    return result
  }
}

function has(target: object, key: string | symbol) {
  const result = Reflect.has(target, key)
  track(target, key)

  return result
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  has,
}

