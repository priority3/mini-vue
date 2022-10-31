## HTML Attribute & DOM Property
there is some difference between HTML attribute and DOM property. They are mapping releationships.

exp:
```html
<input type="text" value="hello">
```
```js
const el = document.querySelector('input')
```

we can get HTML Attribute is `value = "hello"` and DOM Property is `el.value = "hello"`

when I change the input value is `bar`, the HTML Attribute has not same as DOM Property.

```js
el.getAttribute('value') // "hello"

el.value // "bar"
```

TIP: there are not mapping of some Attributes('Properties') ,
exp:
```html
<div aria-valuenow="75"></div>
```

if the HTML Attribute starts with `aria-*`, it is not mapping to DOM Property. 

In the opposite sense of, the DOM Property `el.textContent`, it is not mapping to HTML Attribute.


## multiple html node
```js
const Fragment = Symbol('Fragment')
const vnode = {
  tag: Fragment,
  children: [
    { tag: 'li', children: ['item 1'] },
    { tag: 'li', children: ['item 2'] },
    { tag: 'li', children: ['item 3'] }
  ]
}
```


## diff
[diff-blog for me](https://priority-me.netlify.app/blogs/diff)
