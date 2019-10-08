import fs from 'fs'
import readline from 'readline'
import { evaluate, toPolish, manageString } from './polish'
import Formatter, { data } from './formatReader'

const lineReaderNew = readline.createInterface({
  // if ( process.argv[2] ) {
  //   throw new Error(`Not A-b character in ${element}`)
  // }
  input: fs.createReadStream(process.argv[2]),
})

lineReaderNew.on('line', (line) => {
  const formatter = new Formatter()
  const cleanLine = formatter.clearReadingLine(line)

  if (cleanLine) {
    try {
      formatter.formatterLineArray(cleanLine)
    } catch (error) {
      console.log(error)
      process.exit()
    }
  }
})

lineReaderNew.on('close', () => {
  //console.log('data before', data)
  let len = data.input.length
  for (let i = 0; i < len; i += 1) {
    evaluate(toPolish(Array.from(data.input[i].left)),
      data.input[i].right, data.input[i].imp ? 2 : 3)
  }

  for (let i = 0; i < len; i += 1) {
    if (data.input[i].right.length > 1 && !data.input[i].imp) {
      evaluate(toPolish(Array.from(data.input[i].right)),
        data.input[i].left, 3)
    }
  }

  for (let i = 0; i < len; i += 1) {
    if (data.input[i].right.length > 1 && data.input[i].imp) {
      if (typeof data.vars[data.input[i].right] !== 'undefined') {
        manageString(data.input[i].right, data.vars[data.input[i].right].value)
      }
    }
  }

  for (let i = 0; i < len; i += 1) {
    if (!data.input[i].imp) {
      const left = evaluate(toPolish(Array.from(data.input[i].left)), data.input[i].right)
      const right = evaluate(toPolish(Array.from(data.input[i].right)), data.input[i].left)

      if (left !== right) {
        console.log(data.input[i], ' - error')
        process.exit()
      }
    }
  }

  len = data.output.length

  for (let i = 0; i < len; i += 1) {
    console.log(data.output[i], '  -  ', data.vars[data.output[i]] ? data.vars[data.output[i]].value : false)
  }
  //console.log(data)

})
