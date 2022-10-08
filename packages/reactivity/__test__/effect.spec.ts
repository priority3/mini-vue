import { describe, expect, it, vi } from 'vitest'
import { effect, reactive } from '../src'

describe('reactivity/effect', () => {
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
})

