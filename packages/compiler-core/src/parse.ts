const state = {
  initial: 1,
  tagOpen: 2,
  tagName: 3,
  text: 4,
  tagEnd: 5,
  tagEndName: 6,
}

function isAlpha(char: string) {
  return (char > 'a' && char < 'z') || (char > 'A' && char < 'Z')
}

export function tokenize(str: string): object[] {
  let currentState = state.initial
  // store
  const chars: Array<string | never> = []
  // token
  const tokens: Array<object> = []

  while (str) {
    const char = str[0]
    switch (currentState) {
      case state.initial:
        if (char === '<') {
          currentState = state.tagOpen
          str = str.slice(1)
        }
        else if (isAlpha(char)) {
          currentState = state.text
          chars.push(char)
          str = str.slice(1)
        }
        break
      case state.tagOpen:
        if (isAlpha(char)) {
          currentState = state.tagName
          chars.push(char)
          str = str.slice(1)
        }
        else if (char === '/') {
          currentState = state.tagEnd
          str = str.slice(1)
        }
        break
      case state.tagName:
        if (char === '>') {
          currentState = state.initial
          tokens.push({
            type: 'tag',
            name: chars.join(''),
          })
          chars.length = 0
          str = str.slice(1)
        }
        else if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        }
        break
      case state.text:
        if (char === '<') {
          currentState = state.tagOpen
          tokens.push({
            type: 'text',
            content: chars.join(''),
          })
          chars.length = 0
          str = str.slice(1)
        }
        else if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        }
        break
      case state.tagEnd:
        if (isAlpha(char)) {
          currentState = state.tagEndName
          chars.push(char)
          str = str.slice(1)
        }
        break
      case state.tagEndName:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        }
        else if (char === '>') {
          currentState = state.initial
          tokens.push({
            type: 'tagEnd',
            name: chars.join(''),
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
    }
  }

  return tokens
}
