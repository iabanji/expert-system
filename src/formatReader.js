/* eslint-disable class-methods-use-this */

export const data = {
  DEFAULT: 1,
  IMP: 2,
  EQUAL: 3,
  NOT_FOUND: 4,
  input: [], // {'left':'A|B+C', 'right': 'E'},
  vars: {}, // rules object
  output: [], // ['E'] - переменные котрые необходимо найти
}


class Formatter {
  killSpaceRegex = /([' ', '\t', '\n'])/g

  testAlphabet(element) {
    if (!/^[A-Z]*$/.test(element)) {
      throw new Error(`File contain NOT only A-Z in ${element}`)
    }
    return [...element]
  }

  testRules(element, type, imp) {
    /*
      Validate and modify rules line
        - A...Z
        - +|^!()=>
        - if line contain '()' and imp is true

      @params element - parsed rule
      @params type - type of side
      @params imp - // imp = true if got => elif imp = false if got <=>

    */
    if (!/^[A-Z+|^!()=>]*$/.test(element)) {
      throw new Error(`File contain NOT only A-Z or operator: |^!() in ${element}`)
    }
    if (type === 'right' && /[()]/g.test(element) && imp) {
      throw new Error(`Got brackets in right side by rule in ${element}`)
    }
    return element
  }


  clearReadingLine(line) {
    const lineWtComment = line.split('#')[0]
    const lineWtWhitespace = lineWtComment.replace(this.killSpaceRegex, '')
    if (line) return lineWtWhitespace
    return null
  }

  rulesFormatter(element, operator) {
    const elementArray = element.split(operator)
    const imp = operator === '=>'
    const leftRule = this.testRules(elementArray[0], 'left', imp)
    const rightRule = this.testRules(elementArray[1], 'right', imp)
    const obj = {
      left: leftRule,
      right: rightRule,
      imp: imp,
    }
    data.input.push(obj)
  }

  formatterLineArray(element) {
    // handler if a Fact
    if (element.startsWith('=')) {
      const elementClean = element.replace(/[=]/g, '')
      this.testAlphabet(elementClean).forEach((fact) => {
        const obj = {
          value: true,
          type: data.DEFAULT,
        }
        data.vars[fact] = obj
      })
    }
    // handle if a condition
    else if (element.indexOf('?') !== -1) {
      const elementClean = element.replace(/[?]/g, '')
      data.output = this.testAlphabet(elementClean)
    }
    // handle if a rules and <=>
    else if (element.indexOf('<=>') !== -1) {
      this.rulesFormatter(element, '<=>')
    }
    // handle if a rules and =>
    else if (element.indexOf('=>') !== -1) {
      this.rulesFormatter(element, '=>')
    }
  }
}


export default Formatter
