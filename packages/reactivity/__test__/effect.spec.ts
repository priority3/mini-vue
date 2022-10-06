import { describe, expect, it } from 'vitest'
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
})
