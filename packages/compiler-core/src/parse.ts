const State = {
  INITIAL: 1,
  TAGOPEN: 2,
  TAGNAME: 3,
  TEXT: 4,
  TAGEND: 5,
  TAGENDNAME: 6,
}
function isAlpha(char: string) {
  return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')
}

export function tokenize(str: string) {
  let currentState = State.INITIAL
  const chars: Array<string | never> = []
  const tokens: object[] = []
  while (str) {
    const char = str[0]
    switch (currentState) {
      case State.INITIAL:
        if (char === '<') {
          currentState = State.TAGOPEN
          str = str.slice(1)
        }
        else if (isAlpha(char)) {
          currentState = State.TEXT
          chars.push(char)
          str = str.slice(1)
        }
        break
      case State.TAGOPEN:
        if (isAlpha(char)) {
          currentState = State.TAGNAME
          chars.push(char)
          str = str.slice(1)
        }
        else if (char === '/') {
          currentState = State.TAGEND
          str = str.slice(1)
        }
        break
      case State.TAGNAME:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        }
        else if (char === '>') {
          currentState = State.INITIAL
          tokens.push({
            type: 'tag',
            name: chars.join(''),
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
      case State.TEXT:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        }
        else if (char === '<') {
          currentState = State.TAGOPEN
          tokens.push({
            type: 'TEXT',
            content: chars.join(''),
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
      case State.TAGEND:
        if (isAlpha(char)) {
          currentState = State.TAGENDNAME
          chars.push(char)
          str = str.slice(1)
        }
        break
      case State.TAGENDNAME:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        }
        else if (char === '>') {
          currentState = State.INITIAL
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

