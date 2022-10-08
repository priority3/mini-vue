const currentFlushPromise: Promise<void> | null = null
const resolvedPromise = Promise.resolve() as Promise<any>

export function nextTick<T>(
  this: T,
  fn?: (this: T) => void,
): Promise<void> {
  const p = currentFlushPromise || resolvedPromise

  return fn ? p.then(this ? fn.bind(this) : fn) : p
}
