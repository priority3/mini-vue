import { effect, ref } from '@mini-vue/reactivity'
import { createApp } from '@mini-vue/runtime-core'

const bol = ref(false)
const renderer = createApp()

effect(() => {
  const vnode = {
    type: 'div',
    props: bol.value
      ? {
          onClick: () => {
            console.log('parent clicked')
          },
        }
      : {},
    children: [
      {
        type: 'p',
        props: {
          onClick: () => {
            bol.value = true
          },
        },
        children: 'text',
      },
    ],
  }
  renderer.render(vnode, document.querySelector('#app') as HTMLElement)
})
