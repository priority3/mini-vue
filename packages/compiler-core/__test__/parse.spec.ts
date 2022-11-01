import { describe, expect, it } from 'vitest'
import { tokenize } from '../src'
describe('parse', () => {
  it('basic token ', () => {
    const tokens = tokenize('<div><p>Vue</p><p>Template</p></div>')
    expect(tokens).toEqual([
      { type: 'tag', name: 'div' },
      { type: 'tag', name: 'p' },
      { type: 'text', content: 'Vue' },
      { type: 'tagEnd', name: 'p' },
      { type: 'tag', name: 'p' },
      { type: 'text', content: 'Template' },
      { type: 'tagEnd', name: 'p' },
      { type: 'tagEnd', name: 'div' },
    ])
  })
})
