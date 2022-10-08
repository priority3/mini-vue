import { describe, expect, it, vi } from 'vitest'
import { computed, effect, reactive } from '../src'

describe('reactivity/computed', () => {
  it('basic computed', () => {
    const data = { foo: 1, bar: 2 }
    const obj = reactive(data)
    const fn = vi.fn(() => obj.foo + obj.bar)
    const sumRes = computed(fn)
    expect(sumRes.value).toBe(3)
    expect(fn).toHaveBeenCalledTimes(1)
    // storage
    sumRes.value
    expect(fn).toHaveBeenCalledTimes(1)

    obj.foo++
    expect(sumRes.value).toBe(4)
  })
  it('effect computed', () => {
    const data = { foo: 1, bar: 2 }
    const obj = reactive(data)
    const fn = vi.fn(() => obj.foo + obj.bar)
    const sumRes = computed(fn)
    let count = 0
    effect(() => {
      count = sumRes.value
    })
    expect(count).toBe(3)

    obj.foo++

    expect(count).toBe(4)
  })
})
