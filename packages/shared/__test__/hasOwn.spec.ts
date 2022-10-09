import { describe, expect, it } from 'vitest'
import { hasOwn } from '../src'

describe('method test', () => {
  it('hasOwn', () => {
    const obj = { foo: 1 }
    expect(hasOwn(obj, 'bar')).toBe(false)
  })
})
