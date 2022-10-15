import { createApp } from '@mini-vue/runtime-core'

const renderer = createApp()

renderer.render({
  type: 'button',
  props: {
    id: 'foo',
    disabled: false,
  },
  children: [{
    type: 'p',
    children: 'hello world',
  }],
}, document.getElementById('app') as HTMLElement)
