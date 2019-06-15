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

let data = {
  input: [
    { left: 'A+B', right: 'C' },
    { left: 'D+E', right: 'F' },
    { left: 'G+H', right: 'I' },
    { left: 'J+K', right: 'L' },
  ],
  vars: { A: true, B: true, D: true, H: true },
  output: [ 'C', 'F', 'I', 'L' ]
};

const getStringByLetter = (liter) => {
  const len = data.input.length;
  for(let i = 0; i < len; i++){
    if(data.input[i].right.includes(liter)) { console.log(Array.from(data.input[i].left)); return Array.from(data.input[i].left); }
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
        let eval = getStringByLetter(token);
        if(eval.length == 0) { 
          data.vars[token] = false;
          stack.push(false); 
        }
        else {
          let value = evaluate(eval, token);
          data.vars[token] = value;
          stack.push(value);
        }
      }
    }
  });

  data.vars[liter] = stack.pop();

  return data.vars[liter];
};

console.log(evaluate(toPolish(Array.from(data.input[0].left)), data.input[0].right));
console.log(data);
module.exports = {
  toPolish,
  evaluate,
}
