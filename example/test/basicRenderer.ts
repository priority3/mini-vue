import { createApp } from '@mini-vue/runtime-core'

const renderer = createApp()

renderer.render({
  type: 'button',
  props: {
    id: 'foo',
    disabled: false,
    onClick: () => {
      console.log('click')
    },
    onContextmenu: () => {
      console.log('contextmenu')
    },
  },
  children: [{
    type: 'p',
    props: {
      id: 'content',
      class: ['p-content', 'bar', { 'p-c': true }],
    },
    children: 'hello world',
  }, {
    type: 'div',
    children: 'hello world',
  }],
}, document.querySelector('#app') as HTMLElement)

// setTimeout(() => {
//   renderer.render({
//     type: 'div',
//     children: 'hello world',
//   }, document.querySelector('#app') as HTMLElement)
// }, 2000)
