import { describe, expect, it, vi } from 'vitest'
import { effect, reactive, shallowReactive } from '../src'

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

  it('shallow \'or not\' reactive', () => {
    const obj = reactive({ foo: { bar: 1 } })
    const obj2 = shallowReactive({ foo: { bar: 1 } })

    const fn = vi.fn(() => obj.foo.bar)
    const fn2 = vi.fn(() => obj2.foo.bar)

    effect(fn)
    expect(fn).toHaveBeenCalledTimes(1)
    obj.foo.bar = 2
    expect(fn).toHaveBeenCalledTimes(2)

    effect(fn2)
    expect(fn2).toHaveBeenCalledTimes(1)
    obj2.foo.bar = 2
    expect(fn2).toHaveBeenCalledTimes(1)
  })
})
