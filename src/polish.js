import { data } from './formatReader'

const isAllVarFound = (input) => {
  for (let i = 0; i < input.length; i += 1) {
    if (typeof data.vars[input[i]] === 'undefined') {
      return false
    }
  }
  return true
}

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
    if (data.input[i].right.includes(liter)) {
      return { ev: Array.from(data.input[i].left), type: data.input[i].imp ? 2 : 3 }
      j += 1
    }
  }
  return { ev: [], type: 4 }
}

export const toPolish = (tokenList) => {
  const prec = {}
  prec['!'] = 5
  prec['^'] = 3
  prec['|'] = 2
  prec['+'] = 4
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
          if (liter.indexOf(token) - 1 >= 0 && liter[liter.indexOf(token) - 1] === '!') {
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
  return val
}

export const manageString = (string, value) => {
  const len = string.length
  for (let i = 0; i < len; i += 1) {
    if (string[i].charCodeAt(0) >= 65 && string[i].charCodeAt(0) <= 90) {
      if (typeof data.vars[string[i]] === 'undefined' || (data.vars[string[i]].value === false && data.vars[string[i]].type !== 3)) {
        data.vars[string[i]] = data.vars[string[i] - 1] === '!' ? { value: !value, type: 2 } : { value: value, type: 2 }
      }
    }
  }
}

export const validateInput = (input) => {
  const opers = ['!', '|', '+', '^']
  let isPrevSymLiter = null

  if (opers.includes(input.left.charAt(0)) && input.left.charAt(0) != '!') {
    return false
  }
  if (opers.includes(input.right.charAt(0)) && input.right.charAt(0) != '!') {
    return false
  }
  if (opers.includes(input.left.charAt(input.left.length - 1)) || opers.includes(input.right.charAt(input.right.length - 1))) {
    return false
  }

  if (opers.includes(input.left[0]) || input.left[0] == '(' || input.right[0] == ')') {
    isPrevSymLiter = false
  } else {
    isPrevSymLiter = true
  }
  if (!opers.includes(input.left[0]) && input.left[0] != '(' && input.left[0] != ')') {
    if (input.right.indexOf(input.left[0]) >= 0) {
      return false
    }
  }
  for (let i = 1; i < input.left.length; i += 1) {
    if (!opers.includes(input.left[i]) && input.left[i] != '(' && input.left[i] != ')') {
      if (input.right.indexOf(input.left[i]) >= 0) {
        return false
      }
    }
    if (input.left[i] == '(' || input.left[i] == ')') {
      continue
    }
    if (isPrevSymLiter && !opers.includes(input.left[i])) {
      return false
    }
    if (!isPrevSymLiter && opers.includes(input.left[i]) && input.left[i] != '!') {
      return false
    }
    if (opers.includes(input.left[i])) {
      isPrevSymLiter = false
    } else if (input.left[i] != '(' && input.left[i] != ')') {
      isPrevSymLiter = true
    }
  }

  if (opers.includes(input.right[0]) || input.right[0] == '(' || input.right[0] == ')') {
    isPrevSymLiter = false
  } else {
    isPrevSymLiter = true
  }
  for (let i = 1; i < input.right.length; i += 1) {
    if (input.right[i] == '(' || input.right[i] == ')') {
      continue
    }
    if (isPrevSymLiter && !opers.includes(input.right[i])) {
      return false
    }
    if (!isPrevSymLiter && opers.includes(input.right[i]) && input.right[i] != '!') {
      return false
    }
    if (opers.includes(input.right[i])) {
      isPrevSymLiter = false
    } else if (input.right[i] != '(' && input.right[i] != ')') {
      isPrevSymLiter = true
    }
  }

  return true;
}
