import { isArray, toRawType } from '@mini-vue/shared'

export interface RendererNode {
  [key: string]: any
}
export interface RendererElement extends RendererNode {}

export interface RenderProps {
  createElement: (tag: string) => RendererElement
  setElement: (el: RendererElement, text: string) => void
  insert: (el: RendererElement, parent: RendererElement, anchor?: any) => void
  patchProps: (el: RendererElement, key: string, prevValue: any, nextValue: any) => void
}

export function createRenderer(options: RenderProps) {
  const {
    createElement,
    setElement,
    insert,
    patchProps,

  } = options
  function patch(oldVnode: RendererNode | null, vnode: RendererNode, container: RendererElement) {
    // new
    if (!oldVnode)
      mountElement(vnode, container)
    // else
    // TODO
  }
  function render(vnode: RendererNode, container: RendererElement) {
    //
    if (vnode)
      patch(container._vnode, vnode, container)
    // unmounted
    else if (container._vnode)
      container.innerHTML = ''
  }
  function hydrate() {

  }

  return {
    render,
    hydrate,
  }

  function mountElement(vnode: RendererNode, container: RendererElement) {
    // current node
    const el = createElement(vnode.type)

    if (toRawType(vnode.children) === 'String') {
      setElement(el, vnode.children)
    }
    else if (isArray(vnode.children)) {
      vnode.children.forEach((child) => {
        patch(null, child, el)
      })
    }

    // props
    if (vnode.props) {
      for (const key in vnode.props) {
        const nextValue = vnode.props[key]

        patchProps(el, key, null, nextValue)
      }
    }

    insert(el, container)
  }
}

// TODO
export function createApp() {
  function createElement(tag: string) {
    return document.createElement(tag)
  }
  function setElement(el: RendererElement, text: string) {
    el.textContent = text
  }
  function insert(el: RendererElement, container: RendererElement) {
    container.appendChild(el)
  }
  function patchProps(el: RendererElement, key: string, prevValue: any, nextValue: any) {
    if (shouldSetAsProps(el, key, nextValue)) {
      // el[key](DOM Property) !== props[key](HTML Attribute)

      const type = toRawType(el[key])
      if (type === 'Boolean' && nextValue === '')
        el[key] = true

      else
        el[key] = nextValue
    }
    else {
      el.setAttribute(key, nextValue)
    }
  }
  function shouldSetAsProps(el: RendererElement, key: string, nextValue: string) {
    if (key === 'form' && el.tagName === 'INPUT')
      return false

    return key in el
  }

  return createRenderer({
    createElement,
    setElement,
    patchProps,
    insert,
  })
}
