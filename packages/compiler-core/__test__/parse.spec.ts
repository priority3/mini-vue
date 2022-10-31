import { describe, expect, it } from 'vitest'
import { tokenize } from '../src'
describe('parse', () => {
  it('basic token ', () => {
    const tokens = tokenize('<div>Vue</div>')
    expect(tokens).toEqual([
      {
        type: 'tag',
        name: 'div',
      },
      {
        type: 'text',
        content: 'Vue',
      },
      {
        type: 'tagEnd',
        name: 'div',
      },
    ])
  })
})
