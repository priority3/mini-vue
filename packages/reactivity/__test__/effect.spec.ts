import { describe, expect, it, vi } from 'vitest'
import { effect, reactive } from '../src'

describe('reactivity/effect', () => {
  it('basic use)', () => {
    const ret = reactive({ num: 0 })
    let val
    effect(() => {
      val = ret.num
    })
    expect(val).toBe(0)
    ret.num++
    expect(val).toBe(1)
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
})

