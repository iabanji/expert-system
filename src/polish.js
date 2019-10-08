import { data } from './formatReader'

const operators = {
  '+': (x, y) => x && y,
  '|': (x, y) => x || y,
  '^': (x, y) => (x || y) && (x !== y),
  '!': x => !x,
}
const search = {}

const getStringByLetter = (liter) => {
  const len = data.input.length
  let j = 0
  for (let i = 0; i < len; i++) {
    if (data.input[i].right.includes(liter) /*&& !data.input[i].left.includes(liter)*/) {
      if (j === search[liter].iter) {
        return { ev: Array.from(data.input[i].left), type: data.input[i].imp ? 2 : 3 }
      }
      // if (j === search[liter].iter && !data.input[i].imp) {
      //   return { ev: Array.from(data.input[i].left), type: 3 }
      // }
      j += 1
    }
  }
  return { ev: [], type: 4 }
}

export const toPolish = (tokenList) => {
  const prec = {}
  prec['!'] = 3
  prec['^'] = 2
  prec['|'] = 2
  prec['+'] = 2
  prec['('] = 1
  const opStack = []
  const postfixList = []

  tokenList.forEach((token) => {
    if (typeof prec[token] === 'undefined' && token !== ')' && token !== '(') {
      postfixList.push(token)
    }
    else if (token === '(') {
      opStack.push(token)
    }
    else if (token === ')') {
      let topToken = opStack.pop()
      while (topToken !== '(') {
        postfixList.push(topToken)
        topToken = opStack.pop()
      }
    }
    else {
      while ((opStack.length > 0) && (prec[opStack[opStack.length - 1]] >= prec[token])) {
        postfixList.push(opStack.pop())
      }
      opStack.push(token)
    }
  })

  while (opStack.length > 0) {
    postfixList.push(opStack.pop())
  }

  return postfixList
}

export const evaluate = (expr, liter, foundType) => {
  const stack = []

  expr.forEach((token) => {
    if (typeof search[token] === 'undefined') { search[token] = { iter: 0 } }
    else { search[token].iter += 1 }

    if (token in operators && token !== '!') {
      const [y, x] = [stack.pop(), stack.pop()]
      stack.push(operators[token](x, y))
    }
    else if (token in operators && token === '!') {
      const x = stack.pop()
      stack.push(operators[token](x))
    }
    else if (typeof data.vars[token] !== 'undefined') { stack.push(data.vars[token].value) }
    else {
      if (typeof search[token] === 'undefined') { search[token] = { iter: 0 } }
      else { search[token].iter += 1 }
      const { ev, type } = getStringByLetter(token)
      if (ev.length === 0) {
        data.vars[token] = { value: false, type: type }
        stack.push(false)
      }
      else {
        const value = evaluate(toPolish(ev), token, type)
        if (typeof data.vars[token] === 'undefined') {
          if (liter.charAt(token) - 1 >= 0 && liter[liter.charAt(token) - 1] === '!') {
            data.vars[token] = { value: !value, type: foundType }
            stack.push(!value)
          }
          else {
            data.vars[token] = { value: value, type: foundType }
            stack.push(value)
          }
        }
        else if (data.vars[token].value === true) {
          stack.push(true)
        }
        else {
          stack.push(false)
        }
      }
      if (typeof data.vars[token] !== 'undefined') { delete search[token] }
    }
  })
  const val = stack.pop()
  if ((typeof data.vars[liter] === 'undefined') || (data.vars[liter].value === false)) {
    data.vars[liter] = { value: val, type: foundType }
  }
  return val
}

export const manageString = (string, value) => {
  const len = string.length
  for (let i = 0; i < len; i += 1) {
    if (string[i].charCodeAt(0) >= 65 && string[i].charCodeAt(0) <= 90) {
      if (typeof data.vars[string[i]] === 'undefined' || (data.vars[string[i]].value === false && data.vars[string[i]].type !== 3)) {
        data.vars[string[i]] = data.vars[string[i] - 1] === '!' ? { value: !value, type: 2 } : { value: value, type: 2 }
      }
      else if (typeof data.vars[string[i]] !== 'undefined' && data.vars[string[i]].type === 3 && value !== data.vars[string[i]].value) {
        console.log(string, ' - error')
        process.exit()
      }
    }
  }
}
