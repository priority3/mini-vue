import { toRawType } from '@mini-vue/shared'

export interface RendererNode {
  [key: string]: any
}

export interface RendererElement extends RendererNode {}
export function createRenderer() {
  function patch(oldVnode: RendererNode, vnode: RendererNode, container: RendererElement) {
    if (!oldVnode)
      mountElement(vnode, container)
  }
  function render(vnode: RendererNode, container: RendererElement) {
    if (vnode)
      patch(container._vnode, vnode, container)
    else if (container._vnode)
      container.innerHTML = ''
  }
  function hydrate() {

  }

  return {
    render,
    hydrate,
  }
}

function mountElement(vnode: RendererNode, container: RendererElement) {
  const el = (vnode.el = document.createElement(vnode.type))
  if (toRawType(vnode.children) === 'String')
    el.textContent = vnode.children

  container.appendChild(el)
}
