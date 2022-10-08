import { describe, expect, it, vi } from 'vitest'
import { computed, reactive } from '../src'

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
})
