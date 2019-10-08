import fs from 'fs'
import readline from 'readline'
import path from 'path'
import util from 'util'
import Formatter, { data } from '../src/formatReader'

const pathArray = [
  { ask: '/examples/test00/simple_ask.txt', res: '/examples/test00/simple_res.txt' },
]

test('formatter simple', () => {
  pathArray.forEach((element) => {
    const pathAsk = path.join(__dirname, element.ask)
    const pathRes = path.join(__dirname, element.res)
    let resData = ''
    fs.readFile(pathRes, 'utf8', (result) => {
      console.log('tag', '')
      resData = result
    })
    const lineReaderNew = readline.createInterface({
      input: fs.createReadStream(pathAsk),
    })
    lineReaderNew.on('line', (line) => {
      const formatter = new Formatter()
      const cleanLine = formatter.clearReadingLine(line)
      if (cleanLine) {
        try {
          formatter.formatterLineArray(cleanLine)
        } catch (error) {
          console.log(error)
          // process.exit()
        }
      }
    })
    // expect(3).toBe(3)
    console.log('resData', resData)
    console.log('resData', data)
    // expect(resData).toEqual(data)
  })
})
