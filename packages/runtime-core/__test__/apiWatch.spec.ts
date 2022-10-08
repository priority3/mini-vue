import { reactive } from '@mini-vue/reactivity'
import { describe, expect, it } from 'vitest'
import { watch } from '../src'

describe('api: watch', () => {
  it('watching single source: getter', async () => {
    const state = reactive({ count: 0 })
    let dummy
    watch(
      () => state.count,
      (count, prevCount) => {
        dummy = [count, prevCount]
      },
    )
    state.count++
    // await nextTick()
    expect(dummy).toMatchObject([1, 0])
  })
})
