import { describe, expect, it, vi } from 'vitest'
import {
  effect,
  reactive,
  // readonly,
  shallowReactive,
  // shallowReadonly,
} from '../src'

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

  // it('readonly \'or not\' reactive', () => {
  //   const obj = readonly({ foo: { bar: 1 } })
  //   const obj2 = shallowReadonly({ foo: { bar: 1 } })
  //   obj.foo.bar = 2
  // })

  it('array basic reactive', () => {
    const arr = reactive([1, 2, 3])
    const fn = vi.fn(() => arr[0])
    effect(fn)
    expect(fn).toHaveBeenCalledTimes(1)
    arr[0] = 2
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('array set value to length transboundary reactive', () => {
    const arr = reactive([1, 2, 3])
    const fn = vi.fn(() => arr.length)
    effect(fn)
    expect(fn).toHaveBeenCalledTimes(1)
    arr[3] = 4
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('array change length to value reactive', () => {
    const arr = reactive([1, 2, 3])
    const fn0 = vi.fn(() => arr[0])
    const fn1 = vi.fn(() => arr[1])

    effect(fn0)
    effect(fn1)

    expect(fn0).toHaveBeenCalledTimes(1)
    expect(fn1).toHaveBeenCalledTimes(1)
    arr.length = 1
    expect(fn0).toHaveBeenCalledTimes(1)
    expect(fn1).toHaveBeenCalledTimes(2)
  })

  /**
   * array iterate
   * arr[Symbol.iterator] = function () {
   *  const tartget = this
   *  const len = arr.length
   *  const index = 0
   *  return {
   *    next(){
   *      return {
   *        value: index < len ? tartget[index] : undefined,
   *        done: index++ >= len
   *      }
   *    }
   *  }
   * }
   *
   *
   * arr.values === arr[Symbol.iterator] ---> true
   */

  it('array for in', () => {
    const arr = reactive([1, 2, 3])
    const fn = vi.fn(() => {
      // avoid
      for (const i in arr)
        i
    })
    const fn2 = vi.fn(() => {
      for (const i of arr)
        i
    })
    effect(fn)
    effect(fn2)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)

    arr.length = 0
    expect(fn2).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('array includes', () => {
    // includes will create arr[0]
    // visit arr[0] will create arr[0] too
    const arr = reactive([{}])
    expect(arr.includes(arr[0])).toBe(true)

    const obj = { a: 1 }
    const arr2 = reactive([obj])
    expect(arr2.includes(obj)).toBe(true)
  })

  it('array Implicitly modify the length', () => {
    const arr = reactive([1, 2, 3])
    const fn = vi.fn(() => arr.push(1))
    effect(fn)
    effect(fn)
  })

  it('map reactive', () => {
    const map = reactive(new Map([['key', 1], ['foo', 2]]))
    // get set
    const getFn = vi.fn(() => map.get('key'))
    effect(getFn)
    expect(getFn).toHaveBeenCalledTimes(1)
    map.set('key', 2)
    expect(getFn).toHaveBeenCalledTimes(2)

    // delete
    const sizeFn = vi.fn(() => map.size)
    effect(sizeFn)
    expect(sizeFn).toHaveBeenCalledTimes(1)
    map.delete('key')
    expect(sizeFn).toHaveBeenCalledTimes(2)

    // set
    map.set('foo', 2)
    expect(sizeFn).toHaveBeenCalledTimes(2)

    map.set('bar', 3)
    expect(sizeFn).toHaveBeenCalledTimes(3)
  })
  // TODO
  // it('map reactive data pollution', () => {
  //   const foo = reactive(new Map())
  //   const m = new Map([['foo', foo]])
  //   const p1 = reactive(m)
  //   const fn = vi.fn(() => m.get('foo').size)

  //   effect(fn)

  //   expect(fn).toHaveBeenCalledTimes(1)
  //   m.get('foo').set('bar', 1)
  //   expect(fn).toHaveBeenCalledTimes(1)
  // })

  it('map for each', () => {
    const obj = reactive(new Map([['foo', 1]]))
    const fn = vi.fn(() => obj.forEach((v, k) => {
      k
      v
    }))
    effect(fn)
    expect(fn).toHaveBeenCalledTimes(1)
    obj.set('bar', 2)
    expect(fn).toHaveBeenCalledTimes(2)
    obj.set('foo', 3)
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('map iterator', () => {
    const obj = reactive(new Map([['foo', 1]]))
    const fn = vi.fn(() => {
      for (const [k, v] of obj) {
        k
        v
      }
    })
    effect(fn)
    expect(fn).toHaveBeenCalledTimes(1)
    obj.set('bar', 2)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
