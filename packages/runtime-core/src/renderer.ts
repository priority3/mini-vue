import { isArray, isObject, isString, toRawType } from '@mini-vue/shared'

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
    // patch new
    if (oldVnode && oldVnode.type !== vnode.type) {
      unmount(oldVnode)
      oldVnode = null
    }
    //
    const { type } = vnode
    if (isString(type)) {
      if (!oldVnode)
        mountElement(vnode, container)
      // else
      // TODO patch update
    }
    else if (isObject(type)) {
      // components
    }
    else {
      // others

    }
  }
  function render(vnode: RendererNode | null, container: RendererElement) {
    //
    if (vnode) patch(container._vnode, vnode, container)
    // unmounted
    else if (container._vnode)
      unmount(container._vnode)

    container._vnode = vnode
  }
  function hydrate() {

  }

  return {
    render,
    hydrate,
  }

  function mountElement(vnode: RendererNode, container: RendererElement) {
    // current node
    // establish relationship between vnode and dom
    const el = vnode.el = createElement(vnode.type)

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
    if (/^on/.test(key)) {
      const eventName = key.slice(2).toLowerCase()
      // get prev event
      const invokers = el._vei || (el._vei = {})
      let invoker = invokers[key]
      if (nextValue) {
        if (!invoker) {
          invoker = el._vei[key] = (e) => {
            if (isArray(invoker.value))
              invoker.value.forEach(fn => fn())

            else
              invoker.value(e)
          }
          invoker.value = nextValue
          el.addEventListener(eventName, invoker)
        }
        else {
          // update
          invoker.value = nextValue
        }
      }
      else {
        // nextValue is null but preValue is exit,so remove the listener
        el.removeEventListener(eventName, invoker)
      }
    }
    // performance  className > classList  > setAttribute
    else if (key === 'class') {
      // className
      const value = normalizeClass(nextValue)
      el.className = value
    }
    else if (shouldSetAsProps(el, key, nextValue)) {
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

  return createRenderer({
    createElement,
    setElement,
    patchProps,
    insert,
  })

  function shouldSetAsProps(el: RendererElement, key: string, nextValue: string) {
    if (key === 'form' && el.tagName === 'INPUT')
      return false

    return key in el
  }

  function normalizeClass(nextValue: any) {
    if (isString(nextValue)) {
      return nextValue
    }
    else if (isArray(nextValue)) {
      return nextValue.map(item => normalizeClass(item)).join(' ')
    }
    else if (isObject(nextValue)) {
      // eslint-disable-next-line array-callback-return
      return Object.keys(nextValue).map((item) => {
        if (nextValue[item])
          return item
      }).filter(Boolean).join(' ')
    }
  }
}

function unmount(vnode: RendererNode) {
  const parent = vnode.el.parentNode
  parent && parent.removeChild(vnode.el)
}
