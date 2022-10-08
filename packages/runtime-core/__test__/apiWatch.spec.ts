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

  it('watch immediate', () => {
    const state = reactive({ count: 0 })
    let dummy
    watch(state, () => {
      dummy = state.count + 1
    }, {
      immediate: true,
    })
    expect(dummy).toBe(1)
  })

  // it('watch post', async () => {
  //   const state = reactive({ count: 0 })
  //   const arr: Array<never | number> = []
  //   watch(state, () => {
  //     arr.push(1)
  //   }, {
  //     flush: 'post',
  //   })
  //   expect(arr).toMatchObject([])
  // })

  it('watch clean up', () => {
    const state = reactive({ count: 0 })
    let dummy
    watch(state, (oldValue, newValue, onInvalidate) => {
      onInvalidate(() => {
        dummy = newValue.count
      })
      dummy = oldValue.count
    })
    state.count++
    expect(dummy).toBe(1)
  })
})
