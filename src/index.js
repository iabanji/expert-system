import fs from 'fs'
import readline from 'readline'
import { evaluate, toPolish, manageString, validateInput } from './polish'
import Formatter, { data } from './formatReader'

const argumentError = (arg) => {
  if (arg.length != 3) {
    console.log('should be 3 arguments' + "\n# npm start path_to_file")
    process.exit()
  }
  if (typeof arg[2] !== 'undefined') {
    try {
      if (fs.existsSync(arg[2]) && fs.lstatSync(arg[2]).isFile()) {
        return fs.createReadStream(arg[2])
      }
      console.log('bad file ' + arg[2])
      process.exit()
    } catch (error) {
      console.log('bad file ' + arg[2])
      process.exit()
    }
  } else {
    console.log('no arguments')
    process.exit()
  }
}

const lineReaderNew = readline.createInterface({
  input: argumentError(process.argv)  //fs.createReadStream(process.argv[2]),
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
  if (data.output.length < 1) {
    throw new Error("Have not variables to find");
  }
  let len = data.input.length
  for (let i = 0; i < len; i += 1) {
    if (data.input[i].left == '' || data.input[i].right == '') {
      throw new Error('Not valid line ' + i);
    }
    if (data.input[i].right.split("(").length - 1 != data.input[i].right.split(")").length - 1) {
      throw new Error("Logical error on line " + i);
    }
    if (data.input[i].left.split("(").length - 1 != data.input[i].left.split(")").length - 1) {
      throw new Error("Logical error on line " + i);
    }
    if (!validateInput(data.input[i])) {
      throw new Error("Logical error on line " + i);
    }
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
