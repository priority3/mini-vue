import { createRenderer } from '@mini-vue/runtime-core'

const renderer = createRenderer()

renderer.render({
  type: 'div',
  children: 'hello world',
}, document.getElementById('app') as HTMLElement)
