const operators = {
  '+': (x, y) => x && y,
  '|': (x, y) => x || y,
  '^': (x, y) => x || y && x != y,
  '!': (x) => !x
};

let data = {
  'input': [{'left':'A|B+C', 'right': 'E'}],    //{'left':'A|B+C', 'right': 'E'},
  'vars': {'A': true, 'B': false, },     // ['A' => true, 'B' => false]
  'output': ['E'],   //['E'] - переменные котрые необходимо найти
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

//   for(let i = 0; i < len; i++) {
//     if (typeof prec[tokenList[i]] === 'undefined' && tokenList[i] != ')' && tokenList[i] != '('){
//       postfixList.push(tokenList[i]);
//     }
//     else if ( tokenList[i] == '(') {
//       opStack.push(tokenList[i]);
//     }
//     else if (tokenList[i] == ')') {
//       let topToken = opStack.pop();
//       while (topToken != '(') {
//         postfixList.push(topToken);
//         topToken = opStack.pop();
//       }
//     }
//     else {
//       while ((opStack.length > 0) && (prec[opStack[opStack.length - 1]] >= prec[tokenList[i]])) {
//         postfixList.push(opStack.pop());
//       }
//       opStack.push(tokenList[i]);
//     }
//   }

//   while (opStack.length > 0) {
//     postfixList.push(opStack.pop());
//   }

//   return /*" " + */postfixList;//.join('');
// };

// let evaluate = (expr) => {
//   let stack = [];
  
//   expr.forEach((token) => {
//     if (token in operators && token != "!") {
//       let [y, x] = [stack.pop(), stack.pop()];
//       stack.push(operators[token](x, y));
//     }
//     else if (token in operators && token == "!"){
//       let x = stack.pop();
//       stack.push(operators[token](x));
//     }
//     else {
//       stack.push(token);
//     }
//   });

//   return stack.pop();
// };

const evaluate = (expr) => {
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
          let value = evaluate(eval);
          data.vars[token] = value;
          stack.push(value);
        }
      }
    }
  });

  return stack.pop();
};

// const arr = ['!','A', '|', 'B', '+', 'C'];
// const arr2 = ['(', 'F', '|','G', ')','+', 'H'];
// const arr3 = [ true, false, '|', false, '+' ];

// console.log(toPolish(arr));
console.log(evaluate(toPolish(Array.from(data.input[0].left))));
console.log(data);
module.exports = {
  toPolish,
  evaluate,
}
