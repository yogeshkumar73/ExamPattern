// 80 Unique Prediction Game Questions across 6 Difficulty Levels
module.exports = [
  // Beginner (18)
  {
    difficulty: 'beginner',
    title: 'String Coercion with Plus Operator',
    description: 'What is the output of the following JavaScript expression?\nconsole.log("5" + 3);',
    options: ['"53"', '8', 'NaN', 'Error'],
    correctAnswer: '"53"',
    boilerplate: 'console.log("5" + 3);',
    tags: ['javascript', 'type-coercion'],
    hint: 'The + operator with a string triggers string concatenation.'
  },
  {
    difficulty: 'beginner',
    title: 'Minus Operator Numeric Coercion',
    description: 'What is the output of the following expression?\nconsole.log("10" - 4);',
    options: ['6', '"104"', '"6"', 'NaN'],
    correctAnswer: '6',
    boilerplate: 'console.log("10" - 4);',
    tags: ['javascript', 'type-coercion'],
    hint: 'The - operator converts strings to numeric values.'
  },
  {
    difficulty: 'beginner',
    title: 'Array Push Return Value',
    description: 'What does array.push() return in JavaScript?\nlet arr = [1, 2];\nlet res = arr.push(3);\nconsole.log(res);',
    options: ['3', '[1, 2, 3]', 'undefined', '2'],
    correctAnswer: '3',
    boilerplate: 'let arr = [1, 2];\nlet res = arr.push(3);\nconsole.log(res);',
    tags: ['javascript', 'arrays'],
    hint: '.push() returns the new length of the array.'
  },
  {
    difficulty: 'beginner',
    title: 'Typeof Array in JavaScript',
    description: 'What does typeof [1, 2, 3] evaluate to?',
    options: ['"object"', '"array"', '"list"', '"undefined"'],
    correctAnswer: '"object"',
    boilerplate: 'console.log(typeof [1, 2, 3]);',
    tags: ['javascript', 'types'],
    hint: 'Arrays are objects in JavaScript.'
  },
  {
    difficulty: 'beginner',
    title: 'Boolean Equality Loose Check',
    description: 'What is the evaluation of: false == 0?',
    options: ['true', 'false', 'TypeError', 'undefined'],
    correctAnswer: 'true',
    boilerplate: 'console.log(false == 0);',
    tags: ['javascript', 'equality'],
    hint: 'Loose equality coerces false to 0.'
  },
  {
    difficulty: 'beginner',
    title: 'Strict Equality Check Type Mismatch',
    description: 'What is the evaluation of: "7" === 7?',
    options: ['false', 'true', 'TypeError', 'undefined'],
    correctAnswer: 'false',
    boilerplate: 'console.log("7" === 7);',
    tags: ['javascript', 'equality'],
    hint: 'Strict equality (===) checks both value and type without coercion.'
  },
  {
    difficulty: 'beginner',
    title: 'Empty Array Boolean Context',
    description: 'What is Boolean([]) in JavaScript?',
    options: ['true', 'false', 'TypeError', 'null'],
    correctAnswer: 'true',
    boilerplate: 'console.log(Boolean([]));',
    tags: ['javascript', 'truthy-falsy'],
    hint: 'All objects (including empty arrays) are truthy.'
  },
  {
    difficulty: 'beginner',
    title: 'NaN Equality Self Comparison',
    description: 'What is the output of: console.log(NaN === NaN);',
    options: ['false', 'true', 'TypeError', 'undefined'],
    correctAnswer: 'false',
    boilerplate: 'console.log(NaN === NaN);',
    tags: ['javascript', 'nan'],
    hint: 'IEEE 754 standard defines NaN as not equal to anything, including itself.'
  },
  {
    difficulty: 'beginner',
    title: 'Array Slice Non Destructive',
    description: 'What is the value of arr after this operation?\nconst arr = [10, 20, 30];\narr.slice(1, 2);\nconsole.log(arr.length);',
    options: ['3', '1', '2', '0'],
    correctAnswer: '3',
    boilerplate: 'const arr = [10, 20, 30];\narr.slice(1, 2);\nconsole.log(arr.length);',
    tags: ['javascript', 'arrays'],
    hint: 'slice() returns a shallow copy and does not mutate original array.'
  },
  {
    difficulty: 'beginner',
    title: 'Integer Division Floating Point',
    description: 'In JavaScript, what is 7 / 2?',
    options: ['3.5', '3', '3.0', '4'],
    correctAnswer: '3.5',
    boilerplate: 'console.log(7 / 2);',
    tags: ['javascript', 'math'],
    hint: 'Numbers in JS are 64-bit floating point numbers.'
  },
  {
    difficulty: 'beginner',
    title: 'Loop Increment Prefix vs Postfix',
    description: 'What is printed by: let i = 3; console.log(i++);',
    options: ['3', '4', '2', 'undefined'],
    correctAnswer: '3',
    boilerplate: 'let i = 3;\nconsole.log(i++);',
    tags: ['javascript', 'operators'],
    hint: 'Postfix i++ returns the current value before incrementing.'
  },
  {
    difficulty: 'beginner',
    title: 'String Substring Indices',
    description: 'What is output of: "Antigravity".substring(0, 4);',
    options: ['"Anti"', '"Antig"', '"ntig"', '"Ant"'],
    correctAnswer: '"Anti"',
    boilerplate: 'console.log("Antigravity".substring(0, 4));',
    tags: ['javascript', 'string'],
    hint: 'Extracts indices from 0 up to (not including) 4.'
  },
  {
    difficulty: 'beginner',
    title: 'Nullish Coalescing vs OR',
    description: 'What is printed: console.log(0 ?? 42);',
    options: ['0', '42', 'undefined', 'null'],
    correctAnswer: '0',
    boilerplate: 'console.log(0 ?? 42);',
    tags: ['javascript', 'operators'],
    hint: 'Nullish coalescing (??) only checks for null or undefined; 0 is defined.'
  },
  {
    difficulty: 'beginner',
    title: 'Array Pop Return Value',
    description: 'What is the output?\nconst fruits = ["apple", "banana", "orange"];\nconsole.log(fruits.pop());',
    options: ['"orange"', '"apple"', '2', '["apple", "banana"]'],
    correctAnswer: '"orange"',
    boilerplate: 'const fruits = ["apple", "banana", "orange"];\nconsole.log(fruits.pop());',
    tags: ['javascript', 'arrays'],
    hint: 'pop() removes and returns the last element.'
  },
  {
    difficulty: 'beginner',
    title: 'Math Floor Negative Number',
    description: 'What is Math.floor(-3.14)?',
    options: ['-4', '-3', '-3.14', '-3.0'],
    correctAnswer: '-4',
    boilerplate: 'console.log(Math.floor(-3.14));',
    tags: ['javascript', 'math'],
    hint: 'floor rounds DOWN towards negative infinity.'
  },
  {
    difficulty: 'beginner',
    title: 'ParseInt Radix Omission',
    description: 'What does parseInt("010") evaluate to in modern ECMAScript?',
    options: ['10', '8', '0', 'NaN'],
    correctAnswer: '10',
    boilerplate: 'console.log(parseInt("010"));',
    tags: ['javascript', 'parsing'],
    hint: 'ES5+ treats leading zeros as base 10 unless prefixed with 0o or 0x.'
  },
  {
    difficulty: 'beginner',
    title: 'Default Function Parameter Undefined',
    description: 'What does fn() log?\nfunction fn(x = 10) { console.log(x); }\nfn(undefined);',
    options: ['10', 'undefined', 'null', 'NaN'],
    correctAnswer: '10',
    boilerplate: 'function fn(x = 10) { console.log(x); }\nfn(undefined);',
    tags: ['javascript', 'functions'],
    hint: 'Passing undefined triggers default parameter assignment.'
  },
  {
    difficulty: 'beginner',
    title: 'Array Index Out of Bounds',
    description: 'What is logged?\nconst arr = [1, 2];\nconsole.log(arr[5]);',
    options: ['undefined', 'null', 'IndexError', '0'],
    correctAnswer: 'undefined',
    boilerplate: 'const arr = [1, 2];\nconsole.log(arr[5]);',
    tags: ['javascript', 'arrays'],
    hint: 'Accessing out of bounds indices returns undefined in JS.'
  },

  // Intermediate (18)
  {
    difficulty: 'intermediate',
    title: 'Closure Var Loop Async Output',
    description: 'What is printed?\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
    options: ['3 3 3', '0 1 2', 'undefined undefined undefined', '0 0 0'],
    correctAnswer: '3 3 3',
    boilerplate: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
    tags: ['javascript', 'event-loop', 'closures'],
    hint: 'var is function-scoped; by the time timeouts execute, i is 3.'
  },
  {
    difficulty: 'intermediate',
    title: 'Closure Let Loop Block Scoping',
    description: 'What is printed?\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
    options: ['0 1 2', '3 3 3', 'undefined undefined undefined', '2 2 2'],
    correctAnswer: '0 1 2',
    boilerplate: 'for (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
    tags: ['javascript', 'closures'],
    hint: 'let creates a fresh binding for each loop iteration.'
  },
  {
    difficulty: 'intermediate',
    title: 'Arrow Function This Binding Context',
    description: 'What is logged?\nconst obj = {\n  val: 42,\n  getVal: () => this.val\n};\nconsole.log(obj.getVal());',
    options: ['undefined', '42', 'TypeError', 'window'],
    correctAnswer: 'undefined',
    boilerplate: 'const obj = {\n  val: 42,\n  getVal: () => this.val\n};\nconsole.log(obj.getVal());',
    tags: ['javascript', 'this'],
    hint: 'Arrow functions do not bind their own this; they inherit lexical scope (global/module).'
  },
  {
    difficulty: 'intermediate',
    title: 'Array Map Returns Undefined Without Return',
    description: 'What is output?\nconst r = [1, 2, 3].map(x => { x * 2; });\nconsole.log(r);',
    options: ['[undefined, undefined, undefined]', '[2, 4, 6]', '[1, 2, 3]', '[]'],
    correctAnswer: '[undefined, undefined, undefined]',
    boilerplate: 'const r = [1, 2, 3].map(x => { x * 2; });\nconsole.log(r);',
    tags: ['javascript', 'functional'],
    hint: 'Curly braces define a block body requiring an explicit return statement.'
  },
  {
    difficulty: 'intermediate',
    title: 'Object Key Stringification',
    description: 'What is logged?\nconst a = {}, b = { key: "b" }, c = { key: "c" };\na[b] = 123;\na[c] = 456;\nconsole.log(a[b]);',
    options: ['456', '123', 'undefined', 'TypeError'],
    correctAnswer: '456',
    boilerplate: 'const a = {}, b = { key: "b" }, c = { key: "c" };\na[b] = 123;\na[c] = 456;\nconsole.log(a[b]);',
    tags: ['javascript', 'objects'],
    hint: 'Both b and c stringify to "[object Object]" as dictionary keys.'
  },
  {
    difficulty: 'intermediate',
    title: 'Hoisting Function vs Var Priority',
    description: 'What is logged?\nconsole.log(typeof myFunc);\nfunction myFunc() {}\nvar myFunc = 5;',
    options: ['"function"', '"undefined"', '"number"', 'TypeError'],
    correctAnswer: '"function"',
    boilerplate: 'console.log(typeof myFunc);\nfunction myFunc() {}\nvar myFunc = 5;',
    tags: ['javascript', 'hoisting'],
    hint: 'Function declarations are hoisted above variable declarations.'
  },
  {
    difficulty: 'intermediate',
    title: 'Array Sort Alphabetical Default',
    description: 'What is the output of:\n[1, 5, 20, 100].sort();',
    options: ['[1, 100, 20, 5]', '[1, 5, 20, 100]', '[100, 20, 5, 1]', '[1, 20, 100, 5]'],
    correctAnswer: '[1, 100, 20, 5]',
    boilerplate: 'console.log([1, 5, 20, 100].sort());',
    tags: ['javascript', 'sorting'],
    hint: 'Default sort converts elements to strings and compares UTF-16 code units.'
  },
  {
    difficulty: 'intermediate',
    title: 'Temporal Dead Zone Let',
    description: 'What happens when executing:\nconsole.log(a);\nlet a = 10;',
    options: ['ReferenceError', 'undefined', '10', 'null'],
    correctAnswer: 'ReferenceError',
    boilerplate: 'console.log(a);\nlet a = 10;',
    tags: ['javascript', 'scoping'],
    hint: 'Accessing let before declaration triggers ReferenceError (Temporal Dead Zone).'
  },
  {
    difficulty: 'intermediate',
    title: 'Array Reduce Initial Value Absence',
    description: 'What is logged?\nconst arr = [1, 2, 3];\nconst res = arr.reduce((acc, cur) => acc - cur);\nconsole.log(res);',
    options: ['-4', '-6', '0', 'NaN'],
    correctAnswer: '-4',
    boilerplate: 'const arr = [1, 2, 3];\nconst res = arr.reduce((acc, cur) => acc - cur);\nconsole.log(res);',
    tags: ['javascript', 'reduce'],
    hint: 'Without initial value, acc starts as arr[0]=1: (1 - 2) - 3 = -4.'
  },
  {
    difficulty: 'intermediate',
    title: 'JSON Stringify Undefined Property',
    description: 'What is logged?\nconst obj = { a: 1, b: undefined };\nconsole.log(JSON.stringify(obj));',
    options: ['"{\\"a\\":1}"', '"{\\"a\\":1,\\"b\\":null}"', '"{\\"a\\":1,\\"b\\":undefined}"', 'TypeError'],
    correctAnswer: '"{\\"a\\":1}"',
    boilerplate: 'const obj = { a: 1, b: undefined };\nconsole.log(JSON.stringify(obj));',
    tags: ['javascript', 'json'],
    hint: 'JSON.stringify omits undefined properties from objects.'
  },
  {
    difficulty: 'intermediate',
    title: 'Python Slicing Negative Stride',
    description: 'What is output of Python expression:\n"python"[::-1]',
    options: ['"nohtyp"', '"python"', '"nohty"', 'IndexError'],
    correctAnswer: '"nohtyp"',
    boilerplate: '# Python\nprint("python"[::-1])',
    tags: ['python', 'slicing'],
    hint: 'Step -1 reverses the sequence.'
  },
  {
    difficulty: 'intermediate',
    title: 'Python Default Mutable Argument Trap',
    description: 'What is output of calling f() twice in Python?\ndef f(val, l=[]):\n    l.append(val)\n    return l\nf(1)\nprint(f(2))',
    options: ['[1, 2]', '[2]', '[1]', 'TypeError'],
    correctAnswer: '[1, 2]',
    boilerplate: 'def f(val, l=[]):\n    l.append(val)\n    return l\nf(1)\nprint(f(2))',
    tags: ['python', 'gotchas'],
    hint: 'Default mutable arguments are evaluated once at function definition time.'
  },
  {
    difficulty: 'intermediate',
    title: 'Promise Microtask Order Single',
    description: 'What is printed first?\nPromise.resolve().then(() => console.log("A"));\nconsole.log("B");',
    options: ['B then A', 'A then B', 'A only', 'B only'],
    correctAnswer: 'B then A',
    boilerplate: 'Promise.resolve().then(() => console.log("A"));\nconsole.log("B");',
    tags: ['javascript', 'event-loop'],
    hint: 'Synchronous console.log("B") executes before microtask "A".'
  },
  {
    difficulty: 'intermediate',
    title: 'Object Destructuring Default Fallback',
    description: 'What is logged?\nconst { x = 5 } = { x: null };\nconsole.log(x);',
    options: ['null', '5', 'undefined', 'ReferenceError'],
    correctAnswer: 'null',
    boilerplate: 'const { x = 5 } = { x: null };\nconsole.log(x);',
    tags: ['javascript', 'destructuring'],
    hint: 'Default value 5 only triggers when value is undefined, not null.'
  },
  {
    difficulty: 'intermediate',
    title: 'Spread Operator Shallow Copy Reference',
    description: 'What is logged?\nconst a = [{ n: 1 }];\nconst b = [...a];\nb[0].n = 99;\nconsole.log(a[0].n);',
    options: ['99', '1', 'undefined', 'TypeError'],
    correctAnswer: '99',
    boilerplate: 'const a = [{ n: 1 }];\nconst b = [...a];\nb[0].n = 99;\nconsole.log(a[0].n);',
    tags: ['javascript', 'mutability'],
    hint: 'Spread operator shallow copies; object references inside are shared.'
  },
  {
    difficulty: 'intermediate',
    title: 'Function Length Property Meaning',
    description: 'What is logged?\nfunction test(a, b = 2, c) {}\nconsole.log(test.length);',
    options: ['1', '3', '2', '0'],
    correctAnswer: '1',
    boilerplate: 'function test(a, b = 2, c) {}\nconsole.log(test.length);',
    tags: ['javascript', 'functions'],
    hint: 'Function .length is number of parameters before the first default parameter.'
  },
  {
    difficulty: 'intermediate',
    title: 'Math Max With Empty Array',
    description: 'What does Math.max(...[]) evaluate to?',
    options: ['-Infinity', '0', 'Infinity', 'NaN'],
    correctAnswer: '-Infinity',
    boilerplate: 'console.log(Math.max(...[]));',
    tags: ['javascript', 'math'],
    hint: 'Math.max() with no arguments returns -Infinity.'
  },
  {
    difficulty: 'intermediate',
    title: 'Python List Multiplication Reference Copy',
    description: 'In Python: a = [[0]] * 3; a[0][0] = 7; print(a)',
    options: ['[[7], [7], [7]]', '[[7], [0], [0]]', '[[0], [0], [7]]', 'TypeError'],
    correctAnswer: '[[7], [7], [7]]',
    boilerplate: '# Python\na = [[0]] * 3\na[0][0] = 7\nprint(a)',
    tags: ['python', 'references'],
    hint: 'List multiplication repeats references to the same inner list object.'
  },

  // Advanced (15)
  {
    difficulty: 'advanced',
    title: 'Event Loop Microtask vs Macrotask Interleaving',
    description: 'What is the exact execution log order?\nsetTimeout(() => console.log(1), 0);\nPromise.resolve().then(() => console.log(2));\nPromise.resolve().then(() => setTimeout(() => console.log(3), 0));\nconsole.log(4);',
    options: ['4, 2, 1, 3', '4, 1, 2, 3', '2, 4, 1, 3', '4, 2, 3, 1'],
    correctAnswer: '4, 2, 1, 3',
    boilerplate: 'setTimeout(() => console.log(1), 0);\nPromise.resolve().then(() => console.log(2));\nPromise.resolve().then(() => setTimeout(() => console.log(3), 0));\nconsole.log(4);',
    tags: ['javascript', 'event-loop'],
    hint: 'Sync (4) → Microtasks (2, schedules timer 3) → Macrotask queue in order (1, then 3).'
  },
  {
    difficulty: 'advanced',
    title: 'Async Await Microtask Suspension',
    description: 'What is logged?\nasync function async1() {\n  console.log("A");\n  await async2();\n  console.log("B");\n}\nasync function async2() {\n  console.log("C");\n}\nasync1();\nconsole.log("D");',
    options: ['A, C, D, B', 'A, B, C, D', 'A, C, B, D', 'D, A, C, B'],
    correctAnswer: 'A, C, D, B',
    boilerplate: 'async function async1() {\n  console.log("A");\n  await async2();\n  console.log("B");\n}\nasync function async2() {\n  console.log("C");\n}\nasync1();\nconsole.log("D");',
    tags: ['javascript', 'async'],
    hint: 'await suspends async1, allowing sync console.log("D") to execute before "B".'
  },
  {
    difficulty: 'advanced',
    title: 'Prototype Chain Property Shadowing',
    description: 'What is logged?\nfunction Parent() { this.x = 10; }\nParent.prototype.x = 20;\nconst child = new Parent();\ndelete child.x;\nconsole.log(child.x);',
    options: ['20', 'undefined', '10', 'null'],
    correctAnswer: '20',
    boilerplate: 'function Parent() { this.x = 10; }\nParent.prototype.x = 20;\nconst child = new Parent();\ndelete child.x;\nconsole.log(child.x);',
    tags: ['javascript', 'prototypes'],
    hint: 'Deleting instance property reveals prototype property x = 20.'
  },
  {
    difficulty: 'advanced',
    title: 'NumPy Broadcasting Output Shape',
    description: 'Given NumPy array A with shape (3, 1) and B with shape (1, 4), what is shape of (A + B)?',
    options: ['(3, 4)', '(1, 1)', '(3, 1, 4)', 'ValueError'],
    correctAnswer: '(3, 4)',
    boilerplate: '# Python NumPy\n# A.shape = (3, 1), B.shape = (1, 4)\n# (A + B).shape = ?',
    tags: ['numpy', 'broadcasting'],
    hint: 'Dimensions are stretched where size is 1.'
  },
  {
    difficulty: 'advanced',
    title: 'JavaScript Proxy Get Trap Interception',
    description: 'What is logged?\nconst p = new Proxy({}, {\n  get: (target, prop) => prop in target ? target[prop] : 42\n});\np.a = 10;\nconsole.log(p.a, p.b);',
    options: ['10 42', '10 undefined', '42 42', 'TypeError'],
    correctAnswer: '10 42',
    boilerplate: 'const p = new Proxy({}, {\n  get: (target, prop) => prop in target ? target[prop] : 42\n});\np.a = 10;\nconsole.log(p.a, p.b);',
    tags: ['javascript', 'proxies'],
    hint: 'Trap intercepts property read and returns 42 for non-existent key.'
  },
  {
    difficulty: 'advanced',
    title: 'Generator Two-Way Communication Yield',
    description: 'What is logged?\nfunction* gen() {\n  const x = yield 1;\n  yield x * 10;\n}\nconst g = gen();\ng.next();\nconsole.log(g.next(5).value);',
    options: ['50', '10', '5', 'NaN'],
    correctAnswer: '50',
    boilerplate: 'function* gen() {\n  const x = yield 1;\n  yield x * 10;\n}\nconst g = gen();\ng.next();\nconsole.log(g.next(5).value);',
    tags: ['javascript', 'generators'],
    hint: 'Value passed to g.next(5) becomes the return value of yield 1.'
  },
  {
    difficulty: 'advanced',
    title: 'JavaScript Symbol Registry Identity',
    description: 'What is logged?\nconsole.log(Symbol.for("app") === Symbol.for("app"));\nconsole.log(Symbol("app") === Symbol("app"));',
    options: ['true false', 'true true', 'false false', 'false true'],
    correctAnswer: 'true false',
    boilerplate: 'console.log(Symbol.for("app") === Symbol.for("app"));\nconsole.log(Symbol("app") === Symbol("app"));',
    tags: ['javascript', 'symbols'],
    hint: 'Symbol.for shares registry; Symbol() always creates unique instances.'
  },
  {
    difficulty: 'advanced',
    title: 'Regex Positive Lookahead Match Extraction',
    description: 'What is returned by: "price $100 price $250".match(/\\d+(?=\\s|$)/g)?',
    options: ['["100", "250"]', '["$100", "$250"]', '["100"]', 'null'],
    correctAnswer: '["100", "250"]',
    boilerplate: 'console.log("price $100 price $250".match(/\\d+(?=\\s|$)/g));',
    tags: ['regex'],
    hint: 'Matches numbers immediately followed by whitespace or string end without consuming.'
  },
  {
    difficulty: 'advanced',
    title: 'WeakMap Key Garbage Collection Behavior',
    description: 'Why do WeakMap keys not prevent garbage collection?',
    options: [
      'WeakMap holds weak references to its object keys',
      'WeakMap runs on a background Web Worker',
      'Keys are copied by value to heap snapshot',
      'WeakMap is destroyed after function exits'
    ],
    correctAnswer: 'WeakMap holds weak references to its object keys',
    tags: ['javascript', 'memory'],
    hint: 'Allows object keys to be GC’d if no other strong references exist.'
  },
  {
    difficulty: 'advanced',
    title: 'Python Walrus Operator Evaluation',
    description: 'What does this print in Python 3.8+?\nif (n := len("code")) > 3:\n    print(n * 2)',
    options: ['8', '4', '6', 'SyntaxError'],
    correctAnswer: '8',
    boilerplate: '# Python 3.8+\nif (n := len("code")) > 3:\n    print(n * 2)',
    tags: ['python', 'syntax'],
    hint: 'Walrus operator := assigns n = 4 and returns 4; 4 * 2 = 8.'
  },
  {
    difficulty: 'advanced',
    title: 'Array FlatMap Empty Filter Trick',
    description: 'What is output?\nconst res = [1, 2, 3, 4].flatMap(x => x % 2 === 0 ? [x * 2] : []);\nconsole.log(res);',
    options: ['[4, 8]', '[2, 4, 6, 8]', '[undefined, 4, undefined, 8]', '[]'],
    correctAnswer: '[4, 8]',
    boilerplate: 'console.log([1, 2, 3, 4].flatMap(x => x % 2 === 0 ? [x * 2] : []));',
    tags: ['javascript', 'functional'],
    hint: 'Returning empty array in flatMap filters out odd numbers.'
  },
  {
    difficulty: 'advanced',
    title: 'Promise All vs AllSettled Rejection',
    description: 'What does Promise.allSettled() do when one promise rejects?',
    options: [
      'Waits for all promises and returns array of status objects including rejected reason',
      'Rejects immediately with first error',
      'Ignores the rejected promise completely',
      'Throws an uncaught exception'
    ],
    correctAnswer: 'Waits for all promises and returns array of status objects including rejected reason',
    tags: ['javascript', 'promises'],
    hint: 'Never short-circuits on rejection, unlike Promise.all().'
  },
  {
    difficulty: 'advanced',
    title: 'Object Freeze vs Object Seal Modification',
    description: 'What is allowed on an Object.seal() object that is forbidden on Object.freeze()?',
    options: [
      'Modifying existing property values',
      'Adding new properties',
      'Deleting properties',
      'Changing prototype'
    ],
    correctAnswer: 'Modifying existing property values',
    tags: ['javascript', 'objects'],
    hint: 'seal prevents adding/deleting properties but allows updating existing values.'
  },
  {
    difficulty: 'advanced',
    title: 'Pandas DataFrame Loc vs Iloc Indexing',
    description: 'In Pandas, if index is integer-based [2, 1, 0], what does df.loc[0] select?',
    options: [
      'The row with index label 0 (the 3rd row)',
      'The first row of the DataFrame',
      'Column 0',
      'KeyError'
    ],
    correctAnswer: 'The row with index label 0 (the 3rd row)',
    tags: ['pandas'],
    hint: '.loc accesses by index label, whereas .iloc accesses by integer position.'
  },
  {
    difficulty: 'advanced',
    title: 'CSS Specificity ID vs Ten Classes',
    description: 'In CSS specificity cascade, which rule overrides the other?',
    options: [
      'A single ID selector #header beats 10 chained class selectors .c1.c2...c10',
      '10 class selectors beat 1 ID selector',
      'Whichever is written later in stylesheet always wins',
      'They have identical specificity'
    ],
    correctAnswer: 'A single ID selector #header beats 10 chained class selectors .c1.c2...c10',
    tags: ['css'],
    hint: 'Specificity base: (0, 1, 0, 0) for ID beats (0, 0, 10, 0) for classes.'
  },

  // Expert (13)
  {
    difficulty: 'expert',
    title: 'V8 Hidden Class Transitions Inline Cache',
    description: 'How does dynamically assigning properties in different order (obj.a then obj.b vs obj.b then obj.a) affect V8 performance?',
    options: [
      'Creates two separate hidden class transitions, causing megamorphic inline cache misses',
      'No effect because V8 uses hash tables for all objects',
      'Improves garbage collection speed',
      'Triggers immediate recompilation of all functions'
    ],
    correctAnswer: 'Creates two separate hidden class transitions, causing megamorphic inline cache misses',
    tags: ['v8', 'performance'],
    hint: 'Hidden classes (Maps/Shapes) depend on property addition transition trees.'
  },
  {
    difficulty: 'expert',
    title: 'Microtask Starvation While Loop',
    description: 'What happens when recursively queueing microtasks via queueMicrotask()?',
    options: [
      'Event loop starves: UI rendering, user inputs, and setTimeout timers never execute',
      'JavaScript engine throws "Maximum call stack exceeded"',
      'Engine drops microtasks after 1000 iterations',
      'Browser schedules them on worker threads'
    ],
    correctAnswer: 'Event loop starves: UI rendering, user inputs, and setTimeout timers never execute',
    tags: ['javascript', 'event-loop'],
    hint: 'Microtask queue must completely drain before moving to next event loop phase.'
  },
  {
    difficulty: 'expert',
    title: 'Tail Call Optimization Recursion Stack',
    description: 'Under ES6 strict mode Tail Call Optimization (TCO), what is maximum call stack depth of properly written tail-recursive function?',
    options: ['O(1) constant stack frames', 'O(N) stack frames', 'Maximum 10,000 frames', 'Memory allocation fails'],
    correctAnswer: 'O(1) constant stack frames',
    tags: ['javascript', 'compiler-optimization'],
    hint: 'Reuses caller’s stack frame without growing call stack.'
  },
  {
    difficulty: 'expert',
    title: 'Python GIL Threading Bound Performance',
    description: 'Why does running two CPU-bound threads in standard CPython on a multi-core CPU often run SLOWER than a single thread?',
    options: [
      'GIL lock contention and OS thread context switching overhead',
      'Python compiler inserts sleep instructions',
      'Memory bus hardware saturation',
      'Python disable CPU caching for threads'
    ],
    correctAnswer: 'GIL lock contention and OS thread context switching overhead',
    tags: ['python', 'concurrency'],
    hint: 'CPython’s Global Interpreter Lock allows only one native thread to execute bytecode at once.'
  },
  {
    difficulty: 'expert',
    title: 'JavaScript BigInt Strict Equality to Number',
    description: 'What is logged?\nconsole.log(10n == 10);\nconsole.log(10n === 10);',
    options: ['true false', 'true true', 'false false', 'TypeError'],
    correctAnswer: 'true false',
    boilerplate: 'console.log(10n == 10);\nconsole.log(10n === 10);',
    tags: ['javascript', 'bigint'],
    hint: 'Loose equality allows numeric comparison; strict equality checks distinct types (bigint vs number).'
  },
  {
    difficulty: 'expert',
    title: 'Concurrent Go Channels Deadlock',
    description: 'What happens when sending to an unbuffered Go channel with no concurrent receiver?\nch := make(chan int)\nch <- 42',
    options: [
      'Runtime panic: "all goroutines are asleep - deadlock!"',
      'Channel stores 42 silently',
      'Message is dropped',
      'Program terminates with exit code 0'
    ],
    correctAnswer: 'Runtime panic: "all goroutines are asleep - deadlock!"',
    tags: ['golang', 'concurrency'],
    hint: 'Unbuffered channel sends block until a receiver is ready.'
  },
  {
    difficulty: 'expert',
    title: 'JavaScript Prototype Pollution Exploit',
    description: 'What vulnerability occurs when an unsanitized recursive merge modifies Object.prototype?',
    options: [
      'Prototype Pollution affecting all existing and newly created objects globally',
      'SQL injection in IndexedDB',
      'Cross-site request forgery',
      'CSS expression injection'
    ],
    correctAnswer: 'Prototype Pollution affecting all existing and newly created objects globally',
    tags: ['security', 'javascript'],
    hint: '__proto__ injection injects properties into base Object prototype.'
  },
  {
    difficulty: 'expert',
    title: 'Async Generator Yield Await Sequence',
    description: 'What is logged?\nasync function* ag() {\n  yield await Promise.resolve(1);\n  yield 2;\n}\n(async () => {\n  for await (const v of ag()) console.log(v);\n})();',
    options: ['1 then 2', '2 then 1', 'Promise Promise', 'undefined'],
    correctAnswer: '1 then 2',
    boilerplate: 'async function* ag() {\n  yield await Promise.resolve(1);\n  yield 2;\n}\n(async () => {\n  for await (const v of ag()) console.log(v);\n})();',
    tags: ['javascript', 'async-iterators'],
    hint: 'for await iterates asynchronously over yielded values.'
  },
  {
    difficulty: 'expert',
    title: 'Rust Borrow Checker Lifetime Scope',
    description: 'What does the Rust compiler report when attempting to mutate a vector while holding an immutable reference to one of its elements?',
    options: [
      'Compile error: cannot borrow vec as mutable because it is also borrowed as immutable',
      'Silent reallocation and invalid pointer',
      'Runtime segmentation fault',
      'Warning: slow memory access'
    ],
    correctAnswer: 'Compile error: cannot borrow vec as mutable because it is also borrowed as immutable',
    tags: ['rust', 'borrow-checker'],
    hint: 'Aliasing XOR Mutability guarantee at compile time.'
  },
  {
    difficulty: 'expert',
    title: 'SQL Isolation Non-Repeatable Read vs Phantom Read',
    description: 'What defines a "Phantom Read" that distinguishes it from a Non-Repeatable Read?',
    options: [
      'A transaction re-executes a range query and finds new rows inserted by another committed transaction',
      'A single updated row changes value mid-transaction',
      'Data is read from rolled-back uncommitted transaction',
      'Locks are escalated to exclusive table lock'
    ],
    correctAnswer: 'A transaction re-executes a range query and finds new rows inserted by another committed transaction',
    tags: ['databases', 'acid'],
    hint: 'Phantom reads involve new rows appearing in a search condition range.'
  },
  {
    difficulty: 'expert',
    title: 'C Pointer Arithmetic Type Sizing',
    description: 'In C on 64-bit system, if int *ptr = 1000; what is value of ptr + 2?',
    options: ['1008 (assuming sizeof(int) == 4)', '1002', '1016', '1004'],
    correctAnswer: '1008 (assuming sizeof(int) == 4)',
    tags: ['c', 'memory'],
    hint: 'Pointer arithmetic scales by size of pointed type: 1000 + 2 × 4 = 1008.'
  },
  {
    difficulty: 'expert',
    title: 'JavaScript Reflect Construct Target',
    description: 'What does Reflect.construct(Target, args, NewTarget) allow you to customize?',
    options: [
      'Invoke constructor Target with new.target set to NewTarget',
      'Bypass all constructor logic',
      'Construct objects without memory allocation',
      'Convert class to regular function'
    ],
    correctAnswer: 'Invoke constructor Target with new.target set to NewTarget',
    tags: ['javascript', 'reflect'],
    hint: 'Allows subclassing built-ins and custom prototype assignments.'
  },
  {
    difficulty: 'expert',
    title: 'Linux Epoll Edge-Triggered vs Level-Triggered',
    description: 'In Linux epoll edge-triggered (EPOLLET) mode, what happens if an application does not read all available bytes in socket buffer?',
    options: [
      'epoll_wait will NOT trigger another notification until new data arrives on socket',
      'epoll_wait fires immediately again in next loop',
      'Socket buffer is automatically flushed and data is lost',
      'Kernel terminates the process with SIGPIPE'
    ],
    correctAnswer: 'epoll_wait will NOT trigger another notification until new data arrives on socket',
    tags: ['linux', 'networking'],
    hint: 'Edge-triggered mode notifies only on state transitions, requiring non-blocking read until EAGAIN.'
  },

  // Master (8)
  {
    difficulty: 'master',
    title: 'C++ Move Semantics Rvalue State',
    description: 'In modern C++, what is guaranteed about the state of std::string s after calling auto s2 = std::move(s);?',
    options: [
      's is left in a valid but unspecified state',
      's is guaranteed to be empty ""',
      's is deleted from memory and pointer is null',
      'Accessing s causes immediate undefined behavior'
    ],
    correctAnswer: 's is left in a valid but unspecified state',
    tags: ['cpp', 'memory'],
    hint: 'Standard library guarantees moved-from objects satisfy class invariants and destructibility.'
  },
  {
    difficulty: 'master',
    title: 'Java Memory Model Happens-Before Volatile',
    description: 'Under the Java Memory Model (JMM), what memory barrier guarantee is provided by writing to a volatile variable?',
    options: [
      'Write to volatile happens-before every subsequent read of the same volatile variable across threads',
      'All variables in JVM are locked with mutual exclusion',
      'Prevents garbage collection of thread stack',
      'Forces write directly to NVMe SSD'
    ],
    correctAnswer: 'Write to volatile happens-before every subsequent read of the same volatile variable across threads',
    tags: ['jvm', 'concurrency'],
    hint: 'Establishes memory synchronization and prevents instruction reordering across the barrier.'
  },
  {
    difficulty: 'master',
    title: 'Lock-Free CAS ABA Problem Solution',
    description: 'How is the classic ABA problem prevented in lock-free Compare-And-Swap (CAS) data structures?',
    options: [
      'Tagging pointers with a monotonically increasing version/counter (Tagged Pointers)',
      'Acquiring a global mutex lock before CAS',
      'Using 32-bit pointers instead of 64-bit',
      'Disabling multi-core CPU cache'
    ],
    correctAnswer: 'Tagging pointers with a monotonically increasing version/counter (Tagged Pointers)',
    tags: ['concurrency', 'lock-free'],
    hint: 'Double-word CAS checks both pointer address and generation counter.'
  },
  {
    difficulty: 'master',
    title: 'False Sharing CPU Cache Line Contention',
    description: 'In multi-threaded programming, what causes "False Sharing" when threads operate on independent variables?',
    options: [
      'Independent variables reside on the same 64-byte CPU cache line, triggering constant invalidation',
      'Threads read from different RAM banks',
      'OS schedules threads on the same core',
      'Variables have duplicate memory addresses'
    ],
    correctAnswer: 'Independent variables reside on the same 64-byte CPU cache line, triggering constant invalidation',
    tags: ['hardware', 'performance'],
    hint: 'Prevented by padding data structures to cache line boundaries.'
  },
  {
    difficulty: 'master',
    title: 'SIMD Vectorization Auto-Vectorization Barrier',
    description: 'Which loop condition strictly prevents a C/C++ compiler from generating AVX2 SIMD vectorized instructions?',
    options: [
      'Loop-carried cross-iteration data dependency (pointer aliasing / write after read)',
      'Loop index incrementing by 1',
      'Loop upper bound known at compile time',
      'Array allocated on stack'
    ],
    correctAnswer: 'Loop-carried cross-iteration data dependency (pointer aliasing / write after read)',
    tags: ['compilers', 'simd'],
    hint: 'Restricting pointer aliasing with restrict keyword enables auto-vectorization.'
  },
  {
    difficulty: 'master',
    title: 'PostgreSQL Heap Only Tuples Optimization',
    description: 'What requirement must be met for PostgreSQL to perform a Heap-Only Tuple (HOT) update without modifying index pages?',
    options: [
      'Updated row fits on the same data page and none of the updated columns are indexed',
      'Table has no primary key',
      'Transaction is read-only',
      'All indexes are disabled'
    ],
    correctAnswer: 'Updated row fits on the same data page and none of the updated columns are indexed',
    tags: ['databases', 'postgresql'],
    hint: 'Eliminates index bloat and saves disk writes.'
  },
  {
    difficulty: 'master',
    title: 'Reactor vs Proactor Network Pattern',
    description: 'What is the architectural difference between the Reactor pattern (Node.js/libuv) and Proactor pattern (Windows IOCP)?',
    options: [
      'Reactor notifies when socket is READY to perform I/O; Proactor initiates async operation and notifies on COMPLETION',
      'Reactor is synchronous multi-threaded; Proactor is single-threaded',
      'Proactor cannot handle TCP connections',
      'Reactor requires hardware GPU offloading'
    ],
    correctAnswer: 'Reactor notifies when socket is READY to perform I/O; Proactor initiates async operation and notifies on COMPLETION',
    tags: ['systems-architecture'],
    hint: 'Reactor = Readiness-based; Proactor = Completion-based.'
  },
  {
    difficulty: 'master',
    title: 'JavaScript SharedArrayBuffer Data Race',
    description: 'What tool must be used to perform thread-safe mutations on a SharedArrayBuffer across multiple Web Workers?',
    options: ['Atomics API (e.g. Atomics.add, Atomics.compareExchange)', 'Object.freeze()', 'Promise.all()', 'postMessage cloning'],
    correctAnswer: 'Atomics API (e.g. Atomics.add, Atomics.compareExchange)',
    tags: ['javascript', 'concurrency'],
    hint: 'Provides atomic memory operations and futex wait/notify.'
  },

  // Grandmaster (8)
  {
    difficulty: 'grandmaster',
    title: 'Spectre v1 Bounds Check Bypass Speculation',
    description: 'In Spectre Variant 1 (CVE-2017-5753), what CPU prediction allows unauthorized out-of-bounds reading?',
    options: [
      'Branch Direction Predictor predicts array boundary check condition is true and speculatively loads from target address',
      'Return Stack Buffer overflow',
      'Hardware TLB fault handler crash',
      'Microcode instruction decoding bypass'
    ],
    correctAnswer: 'Branch Direction Predictor predicts array boundary check condition is true and speculatively loads from target address',
    tags: ['security', 'hardware'],
    hint: 'Mitigated by lfence instruction serializing speculative execution.'
  },
  {
    difficulty: 'grandmaster',
    title: 'Linearizability Verification NP-Completeness',
    description: 'Gibbons and Korach proved that verifying whether a concurrent execution trace is Linearizable is:',
    options: ['NP-complete in general case', 'Solvable in O(N log N)', 'Decidable in constant O(1) time', 'Equivalent to 2-SAT'],
    correctAnswer: 'NP-complete in general case',
    tags: ['distributed-theory'],
    hint: 'Combinatorial explosion of valid sequential interleavings.'
  },
  {
    difficulty: 'grandmaster',
    title: 'Memory Consistency Total Store Order (x86)',
    description: 'Under x86-64 Total Store Order (TSO) hardware memory model, which reordering can the CPU perform?',
    options: [
      'Store-Load reordering (earlier store delayed past a later load from different address due to write buffer)',
      'Load-Load reordering',
      'Store-Store reordering',
      'Dependent Load-Store reordering'
    ],
    correctAnswer: 'Store-Load reordering (earlier store delayed past a later load from different address due to write buffer)',
    tags: ['hardware', 'memory-models'],
    hint: 'x86 allows Store-Load reordering; mfenced prevents this.'
  },
  {
    difficulty: 'grandmaster',
    title: 'Garbage Collection ZGC Pauseless Color Pointers',
    description: 'How does modern JVM ZGC achieve sub-millisecond pauses on terabyte heaps during concurrent marking and relocation?',
    options: [
      'Load Barriers with Colored Pointers using high-order bits of 64-bit reference',
      'Freezing all application threads (Stop-The-World)',
      'Writing heap to SSD cache',
      'Translating bytecode to WebAssembly'
    ],
    correctAnswer: 'Load Barriers with Colored Pointers using high-order bits of 64-bit reference',
    tags: ['jvm', 'garbage-collection'],
    hint: 'Marked0, Marked1, Remapped metadata bits embedded directly in pointer.'
  },
  {
    difficulty: 'grandmaster',
    title: 'Clock Synchronization Spanner TrueTime Bound',
    description: 'Google Spanner achieves serializable transactions globally without two-phase commit locks across datacenters by waiting out:',
    options: [
      'Uncertainty bound [earliest, latest] of TrueTime API atomic/GPS clock drift (2ε wait)',
      'Round-trip ping time to origin datacenter',
      'Quantum entanglement decoherence time',
      'Disk rotational latency'
    ],
    correctAnswer: 'Uncertainty bound [earliest, latest] of TrueTime API atomic/GPS clock drift (2ε wait)',
    tags: ['distributed-systems'],
    hint: 'Commit wait guarantees that commit timestamp is definitively in the past before returning.'
  },
  {
    difficulty: 'grandmaster',
    title: 'eBPF Kernel Bytecode Verifier Invariant',
    description: 'What does the Linux kernel eBPF verifier mathematically enforce before allowing bytecode to execute in ring 0?',
    options: [
      'Program is guaranteed to terminate (no unbounded loops) and never access uninitialized or out-of-bounds memory',
      'Program runs exclusively on GPU',
      'Bytecode is digitally signed with RSA 4096',
      'Memory writes are routed to swap'
    ],
    correctAnswer: 'Program is guaranteed to terminate (no unbounded loops) and never access uninitialized or out-of-bounds memory',
    tags: ['linux-kernel', 'ebpf'],
    hint: 'Uses abstract interpretation over directed acyclic execution graphs.'
  },
  {
    difficulty: 'grandmaster',
    title: 'Consensus Viewstamped Replication vs Paxos',
    description: 'In Oki and Liskov’s Viewstamped Replication (VR) and Raft, how does log replication differ fundamentally from Multi-Paxos?',
    options: [
      'VR and Raft elect a leader with complete up-to-date log, preventing holes and out-of-order commits',
      'Multi-Paxos cannot tolerate node failures',
      'VR requires hardware clock synchronization',
      'Raft allows multiple concurrent leaders in one term'
    ],
    correctAnswer: 'VR and Raft elect a leader with complete up-to-date log, preventing holes and out-of-order commits',
    tags: ['distributed-systems'],
    hint: 'Leader log invariance simplifies replication and catch-up.'
  },
  {
    difficulty: 'grandmaster',
    title: 'CRDT Operation-based vs State-based Equivalence',
    description: 'Conflict-Free Replicated Data Types (CRDTs) guarantee Strong Eventual Consistency because state transitions form a:',
    options: [
      'Bounded Join-Semilattice with associative, commutative, and idempotent merge operations',
      'Linear order without forks',
      'Strict topological sorting on DAGs',
      'Finite automaton with single terminal state'
    ],
    correctAnswer: 'Bounded Join-Semilattice with associative, commutative, and idempotent merge operations',
    tags: ['crdt', 'distributed-systems'],
    hint: 'Merge operation a ⊔ b is idempotent (a ⊔ a = a), commutative (a ⊔ b = b ⊔ a), associative.'
  }
];
