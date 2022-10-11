import { describe, expect, it, vi } from 'vitest'
import { effect, reactive } from '../src'

describe('reactive test', () => {
  it('same value don\'t effect', () => {
    const obj = reactive({ foo: 1, bar: NaN })
    const fn = vi.fn(() => obj.foo)
    effect(fn)
    expect(fn).toHaveBeenCalledTimes(1)
    obj.foo = 1
    expect(fn).toHaveBeenCalledTimes(1)
    obj.bar = NaN
    expect(fn).toHaveBeenCalledTimes(1)
  })

  // it('chile prototype', () => {
  //   const child = reactive({})
  //   const parent = reactive({ bar: 2 })
  //   Object.setPrototypeOf(child, parent)
  //   const fn = vi.fn(() => child.bar)
  //   effect(fn)
  //   expect(fn).toHaveBeenCalledTimes(1)
  //   child.bar = 3
  //   expect(fn).toHaveBeenCalledTimes(2)
  // })
})
