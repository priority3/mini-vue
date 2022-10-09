import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effect, reactive } from '../src'

describe('reactivity/effect', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('basic use)', () => {
    const ret = reactive({ num: 0 })
    let val
    effect(() => {
      val = ret.num
      ret.num++
    })
    expect(val).toBe(0)
    ret.num++
    expect(val).toBe(2)
    ret.num = 10
    expect(val).toBe(10)
  })
  it('branch change', () => {
    const data = { ok: true, text: 'hello' }
    const obj = reactive(data)
    let message = ''
    const fn = vi.fn(() => {
      message = obj.ok ? obj.text : 'no'
    })
    effect(fn)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(message).toBe('hello')
    obj.ok = false
    expect(fn).toHaveBeenCalledTimes(2)
    expect(message).toBe('no')
    obj.text = 'world'
    expect(fn).toHaveBeenCalledTimes(2)
  })
  it('nesting effect', () => {
    const data = { foo: 'foo', bar: 'bar' }
    const obj = reactive(data)
    // global variable
    let temp1, temp2
    const fn2 = vi.fn(() => {
      temp2 = obj.bar
    })
    const fn1 = vi.fn(() => {
      effect(fn2)
      temp1 = obj.foo
    })

    effect(fn1)

    expect(temp1).toBe('foo')
    expect(temp2).toBe('bar')

    obj.foo = 'foo2'

    expect(temp1).toBe('foo2')
    expect(temp2).toBe('bar')
  })
  it('dispatch custom', async () => {
    const data = { age: 1 }
    // 对原始数据的代理
    const obj = reactive(data)
    const arr1: Array<number | string> = []
    effect(() => {
      arr1.push(obj.age)
    })

    const arr: Array<number | string> = []
    effect(() => {
      arr.push(obj.age)
    }, {
      scheduler(fn) {
        setTimeout(fn) // 下一个任务循环
      },
    })
    obj.age = 2
    arr.push('end')
    arr1.push('end')
    // set
    await vi.runAllTimers()
    expect(arr.join(',')).toBe('1,end,2')
    expect(arr1.join(',')).toBe('1,2,end')
  })
  it('effect lazy mode', () => {
    const fn = vi.fn()
    const handleFn = effect(fn, { lazy: true })
    expect(fn).toHaveBeenCalledTimes(0)
    handleFn()
    expect(fn).toHaveBeenCalledTimes(1)
  })
  it('proxy receiver', () => {
    const data = {
      foo: 'foo',
      get bar() {
        return this.foo
      },
    }
    const obj = reactive(data)
    const arr: Array<never | number> = []
    effect(() => {
      arr.push(obj.bar)
    })
    expect(arr.join(',')).toBe('foo')
    obj.foo = 'foo2'
    expect(arr.join(',')).toBe('foo,foo2')
  })

  it('effect track \`in\`', () => {
    const data = { foo: 1 }
    const obj = reactive(data)
    const arr: Array<never | number> = []
    effect(() => {
      'foo' in obj
      arr.push(1)
    })
    obj.foo++
    expect(arr.join(',')).toBe('1,1')
  })
})

