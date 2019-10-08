const operators = {
  '+': (x, y) => x && y,
  '|': (x, y) => x || y,
  '^': (x, y) => x || y && x != y,
  '!': (x) => !x
};

// let data = {
//   'input': [{'left':'A|B+C', 'right': 'E'}],    //{'left':'A|B+C', 'right': 'E'},
//   'vars': {'A': true, 'B': false, },     // ['A' => true, 'B' => false]
//   'output': ['E'],   //['E'] - переменные котрые необходимо найти
// };

// let data = {
//   input: [
//     { left: 'A+Q', right: 'C' },
//     { left: 'A+D', right: 'Q' },
//     { left: 'D+E', right: 'F' },
//     { left: 'G+H', right: 'I' },
//     { left: 'J+K', right: 'L' },
//   ],
//   vars: { A: true, B: true, D: true, H: true },
//   output: [ 'C', 'F', 'I', 'L' ]
// };

let data = {
  input: [
    { left: 'C', right: 'E' },
    { left: 'A+B+C', right: 'D' },
    { left: '!A+B', right: 'C' },
    { left: 'A+!B', right: 'F' },
    { left: 'C|!G', right: '(H+!D)' },
    { left: 'B^!A', right: '!D' },
    { left: 'B^!(A+!C)', right: 'G' },
    { left: 'V^W', right: 'X' },
    { left: 'A+B', right: 'Y+Z' },
    { left: '!E+(F^G)+D|!(A)', right: '!V' },
    { left: 'B', right: 'E' },
    { left: 'C', right: 'E' },
    { left: 'L+M|N', right: 'K' },
    { left: 'A', right: '!(!B+C)' }
  ],
  vars: { A: true, B: true },
  output: [ 'G', 'V', 'X', 'H', 'D' ]
};

const getStringByLetter = (liter) => {
  const len = data.input.length;
  for(let i = 0; i < len; i++){
    if(data.input[i].right.includes(liter)) { /*console.log(Array.from(data.input[i].left));*/ return Array.from(data.input[i].left); }
  }
  return [];
}

const toPolish = (tokenList) => {
  const prec = {};
  prec["!"] = 3;
  prec["^"] = 2;
  prec["|"] = 2;
  prec["+"] = 2;
  prec["("] = 1;
  opStack = [];
  postfixList = [];

  //const len = tokenList.length;

  tokenList.forEach((token) => {
    if (typeof prec[token] === 'undefined' && token != ')' && token != '('){
      postfixList.push(token);
    }
    else if ( token == '(') {
      opStack.push(token);
    }
    else if (token == ')') {
      let topToken = opStack.pop();
      while (topToken != '(') {
        postfixList.push(topToken);
        topToken = opStack.pop();
      }
    }
    else {
      while ((opStack.length > 0) && (prec[opStack[opStack.length - 1]] >= prec[token])) {
        postfixList.push(opStack.pop());
      }
      opStack.push(token);
    }
  });

  while (opStack.length > 0) {
    postfixList.push(opStack.pop());
  }

  return postfixList;
};

const evaluate = (expr, liter) => {
  let stack = [];
  
  expr.forEach((token) => {
    if (token in operators && token != "!") {
      let [y, x] = [stack.pop(), stack.pop()];
      stack.push(operators[token](x, y));
    }
    else if (token in operators && token == "!"){
      let x = stack.pop();
      stack.push(operators[token](x));
    }
    else {
      if (typeof data.vars[token] !== 'undefined') { stack.push(data.vars[token]); }
      else {
        let ev = getStringByLetter(token);
        if(ev.length == 0) { 
          data.vars[token] = false;
          stack.push(false); 
        }
        else {
          let value = evaluate(toPolish(ev), token);
          data.vars[token] = value;
          stack.push(value);
        }
      }
    }
  });

  data.vars[liter] = stack.pop();

  //return data.vars[liter];
};

//console.log(evaluate(toPolish(Array.from(data.input[3].left)), data.input[3].right));

let len = data.input.length;

for(let i = 0; i < len; i++) {
  evaluate(toPolish(Array.from(data.input[i].left)), data.input[i].right)
}

len = data.output.length;

for(let i = 0; i < len; i++) {
  console.log(data.output[i], "  -  ", data.vars[data.output[i]]);
}


console.log(data);
module.exports = {
  toPolish,
  evaluate,
}
