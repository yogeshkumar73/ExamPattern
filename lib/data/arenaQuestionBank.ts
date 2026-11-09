// Arena Question Bank - Production Ready
// 530+ Unique, non-repeating static questions spanning 7 Game Modes & 6 Difficulty Levels

export interface StaticArenaQuestion {
  title: string;
  description: string;
  options: string[];
  correctAnswer: string;
  boilerplate?: string;
  tags: string[];
  timeLimit: number;
  xpReward: number;
  pointsReward: number;
  explanation?: string;
  hint?: string;
}

export type ArenaCategory = 'coding' | 'puzzle' | 'math' | 'gk' | 'prediction' | 'topicdoc' | 'mixed';
export type ArenaDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master' | 'grandmaster';

export const TIME_MAP: Record<ArenaDifficulty, number> = {
  "beginner": 90,
  "intermediate": 75,
  "advanced": 60,
  "expert": 45,
  "master": 35,
  "grandmaster": 25
};

export const XP_MAP: Record<ArenaDifficulty, number> = {
  "beginner": 50,
  "intermediate": 100,
  "advanced": 200,
  "expert": 400,
  "master": 700,
  "grandmaster": 1000
};

export const POINTS_MAP: Record<ArenaDifficulty, number> = {
  "beginner": 100,
  "intermediate": 200,
  "advanced": 400,
  "expert": 800,
  "master": 1400,
  "grandmaster": 2000
};

export const ATTEMPTS_MAP: Record<ArenaDifficulty, number> = {
  "beginner": 12,
  "intermediate": 16,
  "advanced": 20,
  "expert": 25,
  "master": 30,
  "grandmaster": 35
};

export const ARENA_QUESTION_BANK: Record<ArenaCategory, Record<ArenaDifficulty, StaticArenaQuestion[]>> = {
  "coding": {
    "beginner": [
      {
        "title": "Hello World Function",
        "description": "Write a function helloWorld() that returns the string \"Hello, World!\".",
        "options": [],
        "correctAnswer": "Hello, World!",
        "boilerplate": "function helloWorld() {\n  return \"Hello, World!\";\n}",
        "tags": [
          "basics",
          "string"
        ],
        "hint": "",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Sum Two Numbers",
        "description": "Return the sum of two integers a and b.",
        "options": [],
        "correctAnswer": "sum",
        "boilerplate": "function sum(a, b) {\n  return a + b;\n}",
        "tags": [
          "math",
          "basics"
        ],
        "hint": "",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Check Even or Odd",
        "description": "Return \"even\" if number is even, \"odd\" otherwise.",
        "options": [],
        "correctAnswer": "even/odd",
        "boilerplate": "function evenOrOdd(n) {\n  return n % 2 === 0 ? \"even\" : \"odd\";\n}",
        "tags": [
          "conditionals"
        ],
        "hint": "",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Reverse a String",
        "description": "Return the reversed version of string s.",
        "options": [],
        "correctAnswer": "reversed",
        "boilerplate": "function reverseString(s) {\n  return s.split(\"\").reverse().join(\"\");\n}",
        "tags": [
          "string"
        ],
        "hint": "",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Find Max in Array",
        "description": "Return the maximum value in an array of numbers.",
        "options": [],
        "correctAnswer": "max",
        "boilerplate": "function findMax(arr) {\n  return Math.max(...arr);\n}",
        "tags": [
          "array"
        ],
        "hint": "",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Count Vowels in String",
        "description": "Return the count of vowels (a, e, i, o, u) in string s.",
        "options": [],
        "correctAnswer": "count",
        "boilerplate": "function countVowels(s) {\n  return (s.match(/[aeiou]/gi) || []).length;\n}",
        "tags": [
          "string"
        ],
        "hint": "",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Single FizzBuzz Check",
        "description": "Return \"Fizz\" if divisible by 3, \"Buzz\" if 5, \"FizzBuzz\" if both, else string of n.",
        "options": [],
        "correctAnswer": "fizzbuzz",
        "boilerplate": "function fizzBuzz(n) {\n  if (n % 15 === 0) return \"FizzBuzz\";\n  if (n % 3 === 0) return \"Fizz\";\n  if (n % 5 === 0) return \"Buzz\";\n  return String(n);\n}",
        "tags": [
          "basics"
        ],
        "hint": "",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Calculate String Length",
        "description": "Return length of string without calling .length directly.",
        "options": [],
        "correctAnswer": "len",
        "boilerplate": "function strLen(s) {\n  let count = 0; for (let _ of s) count++; return count;\n}",
        "tags": [
          "string"
        ],
        "hint": "",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Factorial of Integer",
        "description": "Return n! for positive integer n.",
        "options": [],
        "correctAnswer": "factorial",
        "boilerplate": "function factorial(n) {\n  return n <= 1 ? 1 : n * factorial(n - 1);\n}",
        "tags": [
          "math",
          "recursion"
        ],
        "hint": "",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "First Element of Array",
        "description": "Return the first element or null if empty.",
        "options": [],
        "correctAnswer": "elem",
        "boilerplate": "function firstElement(arr) {\n  return arr.length ? arr[0] : null;\n}",
        "tags": [
          "array"
        ],
        "hint": "",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Array Includes Value",
        "description": "Return true if arr contains target, else false.",
        "options": [],
        "correctAnswer": "bool",
        "boilerplate": "function contains(arr, target) {\n  return arr.includes(target);\n}",
        "tags": [
          "array",
          "search"
        ],
        "hint": "",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Capitalize First Letter",
        "description": "Capitalize the first character of string s.",
        "options": [],
        "correctAnswer": "capitalized",
        "boilerplate": "function capitalize(s) {\n  return s ? s[0].toUpperCase() + s.slice(1) : \"\";\n}",
        "tags": [
          "string"
        ],
        "hint": "",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Strip Whitespace",
        "description": "Remove all whitespace characters from a string.",
        "options": [],
        "correctAnswer": "cleaned",
        "boilerplate": "function strip(s) {\n  return s.replace(/\\s+/g, \"\");\n}",
        "tags": [
          "string"
        ],
        "hint": "",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Double Array Values",
        "description": "Return a new array with every element multiplied by 2.",
        "options": [],
        "correctAnswer": "doubled",
        "boilerplate": "function doubleArray(arr) {\n  return arr.map(x => x * 2);\n}",
        "tags": [
          "array"
        ],
        "hint": "",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Is String Blank",
        "description": "Check if string is empty or contains only spaces.",
        "options": [],
        "correctAnswer": "bool",
        "boilerplate": "function isBlank(s) {\n  return s.trim().length === 0;\n}",
        "tags": [
          "string"
        ],
        "hint": "",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      }
    ],
    "intermediate": [
      {
        "title": "Two Sum Target",
        "description": "Return indices [i, j] of two numbers that add up to target.",
        "options": [],
        "correctAnswer": "indices",
        "boilerplate": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const d = target - nums[i];\n    if (map.has(d)) return [map.get(d), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}",
        "tags": [
          "hashmap",
          "array"
        ],
        "hint": "",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Palindrome Alphanumeric",
        "description": "Return true if string is a palindrome ignoring non-alphanumeric chars.",
        "options": [],
        "correctAnswer": "bool",
        "boilerplate": "function isPalindrome(s) {\n  const c = s.toLowerCase().replace(/[^a-z0-9]/g, \"\");\n  return c === c.split(\"\").reverse().join(\"\");\n}",
        "tags": [
          "two-pointers",
          "string"
        ],
        "hint": "",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Fibonacci O(1) Space",
        "description": "Return nth Fibonacci number in O(n) time and O(1) auxiliary space.",
        "options": [],
        "correctAnswer": "fib",
        "boilerplate": "function fib(n) {\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) { let t = a + b; a = b; b = t; }\n  return n === 0 ? 0 : b;\n}",
        "tags": [
          "dp",
          "math"
        ],
        "hint": "",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Remove Duplicates Array",
        "description": "Return array of unique elements in original insertion order.",
        "options": [],
        "correctAnswer": "unique",
        "boilerplate": "function removeDuplicates(arr) {\n  return [...new Set(arr)];\n}",
        "tags": [
          "set",
          "array"
        ],
        "hint": "",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Array Intersection",
        "description": "Return intersection of two arrays with unique elements.",
        "options": [],
        "correctAnswer": "common",
        "boilerplate": "function intersection(a, b) {\n  const sb = new Set(b);\n  return a.filter(x => sb.has(x));\n}",
        "tags": [
          "array",
          "set"
        ],
        "hint": "",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Chunk Array into Slices",
        "description": "Split array into subarrays of maximum size k.",
        "options": [],
        "correctAnswer": "chunks",
        "boilerplate": "function chunk(arr, size) {\n  const res = [];\n  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));\n  return res;\n}",
        "tags": [
          "array"
        ],
        "hint": "",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Deep Flatten Array",
        "description": "Flatten arbitrary nested array into single 1D array.",
        "options": [],
        "correctAnswer": "flat",
        "boilerplate": "function flatten(arr) {\n  return arr.flat(Infinity);\n}",
        "tags": [
          "array",
          "recursion"
        ],
        "hint": "",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Group Objects by Key",
        "description": "Group list of objects into dictionary indexed by given property.",
        "options": [],
        "correctAnswer": "grouped",
        "boilerplate": "function groupBy(arr, key) {\n  return arr.reduce((acc, x) => {\n    (acc[x[key]] = acc[x[key]] || []).push(x);\n    return acc;\n  }, {});\n}",
        "tags": [
          "hashmap",
          "objects"
        ],
        "hint": "",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Title Case Sentence",
        "description": "Capitalize first letter of every word in given text.",
        "options": [],
        "correctAnswer": "titleCase",
        "boilerplate": "function titleCase(str) {\n  return str.replace(/\\b\\w/g, c => c.toUpperCase());\n}",
        "tags": [
          "string"
        ],
        "hint": "",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Valid Anagram Check",
        "description": "Return true if t is an anagram of s in O(n) time.",
        "options": [],
        "correctAnswer": "bool",
        "boilerplate": "function isAnagram(s, t) {\n  return s.split(\"\").sort().join(\"\") === t.split(\"\").sort().join(\"\");\n}",
        "tags": [
          "sorting",
          "hashmap"
        ],
        "hint": "",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Character Frequency Map",
        "description": "Return frequency map of characters in string.",
        "options": [],
        "correctAnswer": "freq",
        "boilerplate": "function charFrequency(s) {\n  const m = {}; for (let c of s) m[c] = (m[c] || 0) + 1; return m;\n}",
        "tags": [
          "hashmap"
        ],
        "hint": "",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Rotate Array by K",
        "description": "Rotate array right by k steps in-place or return new array.",
        "options": [],
        "correctAnswer": "rotated",
        "boilerplate": "function rotate(nums, k) {\n  k %= nums.length; return [...nums.slice(-k), ...nums.slice(0, -k)];\n}",
        "tags": [
          "array"
        ],
        "hint": "",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Merge Sorted Arrays",
        "description": "Merge two sorted arrays a and b in O(n + m) time.",
        "options": [],
        "correctAnswer": "merged",
        "boilerplate": "function merge(a, b) {\n  let i = 0, j = 0, res = [];\n  while (i < a.length && j < b.length) {\n    res.push(a[i] < b[j] ? a[i++] : b[j++]);\n  }\n  return res.concat(a.slice(i)).concat(b.slice(j));\n}",
        "tags": [
          "two-pointers",
          "sorting"
        ],
        "hint": "",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Digit Sum of Integer",
        "description": "Calculate sum of decimal digits of absolute integer n.",
        "options": [],
        "correctAnswer": "sum",
        "boilerplate": "function digitSum(n) {\n  return Math.abs(n).toString().split(\"\").reduce((acc, d) => acc + +d, 0);\n}",
        "tags": [
          "math"
        ],
        "hint": "",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Prime Number Test",
        "description": "Check if integer n > 1 is prime in O(sqrt(n)).",
        "options": [],
        "correctAnswer": "bool",
        "boilerplate": "function isPrime(n) {\n  if (n <= 1) return false;\n  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;\n  return true;\n}",
        "tags": [
          "math",
          "number-theory"
        ],
        "hint": "",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      }
    ],
    "advanced": [
      {
        "title": "Kadane Max Subarray Sum",
        "description": "Find maximum contiguous subarray sum in O(n) time.",
        "options": [],
        "correctAnswer": "maxSum",
        "boilerplate": "function maxSubArray(nums) {\n  let max = nums[0], cur = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    max = Math.max(max, cur);\n  }\n  return max;\n}",
        "tags": [
          "dp",
          "greedy"
        ],
        "hint": "",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Binary Search Index",
        "description": "Implement binary search returning index of target in sorted array.",
        "options": [],
        "correctAnswer": "index",
        "boilerplate": "function binarySearch(arr, target) {\n  let l = 0, r = arr.length - 1;\n  while (l <= r) {\n    let m = Math.floor((l + r) / 2);\n    if (arr[m] === target) return m;\n    if (arr[m] < target) l = m + 1; else r = m - 1;\n  }\n  return -1;\n}",
        "tags": [
          "binary-search"
        ],
        "hint": "",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Valid Parentheses Stack",
        "description": "Check if bracket string has valid nesting and closing brackets.",
        "options": [],
        "correctAnswer": "bool",
        "boilerplate": "function isValid(s) {\n  const stack = [], map = { \")\": \"(\", \"}\": \"{\", \"]\": \"[\" };\n  for (let c of s) {\n    if (\"({[\".includes(c)) stack.push(c);\n    else if (stack.pop() !== map[c]) return false;\n  }\n  return stack.length === 0;\n}",
        "tags": [
          "stack"
        ],
        "hint": "",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Longest Common Prefix",
        "description": "Find the longest common prefix among an array of strings.",
        "options": [],
        "correctAnswer": "prefix",
        "boilerplate": "function longestCommonPrefix(strs) {\n  if (!strs.length) return \"\";\n  let p = strs[0];\n  for (let i = 1; i < strs.length; i++) {\n    while (strs[i].indexOf(p) !== 0) p = p.slice(0, -1);\n  }\n  return p;\n}",
        "tags": [
          "string"
        ],
        "hint": "",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Deep Clone Object",
        "description": "Clone nested object without shared references.",
        "options": [],
        "correctAnswer": "clone",
        "boilerplate": "function deepClone(obj) {\n  return JSON.parse(JSON.stringify(obj));\n}",
        "tags": [
          "objects"
        ],
        "hint": "",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Debounce Implementation",
        "description": "Implement debounce higher-order function with millisecond delay.",
        "options": [],
        "correctAnswer": "fn",
        "boilerplate": "function debounce(fn, ms) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), ms);\n  };\n}",
        "tags": [
          "closures",
          "async"
        ],
        "hint": "",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Throttle Implementation",
        "description": "Implement throttle ensuring at most one call per limit window.",
        "options": [],
        "correctAnswer": "fn",
        "boilerplate": "function throttle(fn, limit) {\n  let wait = false;\n  return function(...args) {\n    if (!wait) {\n      fn.apply(this, args); wait = true;\n      setTimeout(() => wait = false, limit);\n    }\n  };\n}",
        "tags": [
          "async",
          "closures"
        ],
        "hint": "",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Product Except Self",
        "description": "Return array where out[i] is product of all elements except nums[i] in O(n) without division.",
        "options": [],
        "correctAnswer": "products",
        "boilerplate": "function productExceptSelf(nums) {\n  const n = nums.length, res = new Array(n).fill(1);\n  let l = 1, r = 1;\n  for (let i = 0; i < n; i++) { res[i] *= l; l *= nums[i]; }\n  for (let i = n - 1; i >= 0; i--) { res[i] *= r; r *= nums[i]; }\n  return res;\n}",
        "tags": [
          "prefix-sum"
        ],
        "hint": "",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Search Rotated Sorted Array",
        "description": "Find target index in rotated sorted array in O(log n).",
        "options": [],
        "correctAnswer": "index",
        "boilerplate": "function searchRotated(nums, target) {\n  let l = 0, r = nums.length - 1;\n  while (l <= r) {\n    let m = Math.floor((l + r) / 2);\n    if (nums[m] === target) return m;\n    if (nums[l] <= nums[m]) {\n      if (nums[l] <= target && target < nums[m]) r = m - 1; else l = m + 1;\n    } else {\n      if (nums[m] < target && target <= nums[r]) l = m + 1; else r = m - 1;\n    }\n  }\n  return -1;\n}",
        "tags": [
          "binary-search"
        ],
        "hint": "",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Top K Frequent Elements",
        "description": "Find k most frequent numbers in array in O(n log k) time.",
        "options": [],
        "correctAnswer": "topK",
        "boilerplate": "function topKFrequent(nums, k) {\n  const map = new Map(); nums.forEach(n => map.set(n, (map.get(n) || 0) + 1));\n  return [...map.entries()].sort((a,b) => b[1] - a[1]).slice(0, k).map(x => x[0]);\n}",
        "tags": [
          "hashmap",
          "sorting"
        ],
        "hint": "",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "House Robber DP",
        "description": "Determine maximum amount of money robbed without hitting adjacent houses.",
        "options": [],
        "correctAnswer": "maxRob",
        "boilerplate": "function rob(nums) {\n  let p1 = 0, p2 = 0;\n  for (let n of nums) { let t = p1; p1 = Math.max(p2 + n, p1); p2 = t; }\n  return p1;\n}",
        "tags": [
          "dp"
        ],
        "hint": "",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Coin Change Fewest Coins",
        "description": "Return fewest coins needed to make amount, or -1 if impossible.",
        "options": [],
        "correctAnswer": "minCoins",
        "boilerplate": "function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity); dp[0] = 0;\n  for (let i = 1; i <= amount; i++) {\n    for (let c of coins) if (i >= c) dp[i] = Math.min(dp[i], dp[i - c] + 1);\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}",
        "tags": [
          "dp"
        ],
        "hint": "",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Number of Islands DFS",
        "description": "Count connected islands of 1s in 2D binary grid.",
        "options": [],
        "correctAnswer": "count",
        "boilerplate": "function numIslands(grid) {\n  let count = 0;\n  const dfs = (r, c) => {\n    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== \"1\") return;\n    grid[r][c] = \"0\";\n    dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);\n  };\n  for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[0].length; c++) if (grid[r][c] === \"1\") { count++; dfs(r, c); }\n  return count;\n}",
        "tags": [
          "dfs",
          "graph"
        ],
        "hint": "",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Subarray Sum Equals K",
        "description": "Count total contiguous subarrays whose sum equals k in O(n).",
        "options": [],
        "correctAnswer": "count",
        "boilerplate": "function subarraySum(nums, k) {\n  let count = 0, sum = 0, map = new Map([[0, 1]]);\n  for (let n of nums) {\n    sum += n;\n    if (map.has(sum - k)) count += map.get(sum - k);\n    map.set(sum, (map.get(sum) || 0) + 1);\n  }\n  return count;\n}",
        "tags": [
          "hashmap",
          "prefix-sum"
        ],
        "hint": "",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Spiral Matrix Traversal",
        "description": "Return matrix elements in spiral order traversal.",
        "options": [],
        "correctAnswer": "spiral",
        "boilerplate": "function spiralOrder(matrix) {\n  const res = []; if (!matrix.length) return res;\n  let t = 0, b = matrix.length - 1, l = 0, r = matrix[0].length - 1;\n  while (t <= b && l <= r) {\n    for (let i = l; i <= r; i++) res.push(matrix[t][i]); t++;\n    for (let i = t; i <= b; i++) res.push(matrix[i][r]); r--;\n    if (t <= b) { for (let i = r; i >= l; i--) res.push(matrix[b][i]); b--; }\n    if (l <= r) { for (let i = b; i >= t; i--) res.push(matrix[i][l]); l++; }\n  }\n  return res;\n}",
        "tags": [
          "matrix"
        ],
        "hint": "",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      }
    ],
    "expert": [
      {
        "title": "Longest Common Subsequence",
        "description": "Find length of LCS between two strings in O(n * m) time.",
        "options": [],
        "correctAnswer": "length",
        "boilerplate": "function lcs(s1, s2) {\n  const dp = Array(s1.length + 1).fill(0).map(() => Array(s2.length + 1).fill(0));\n  for (let i = 1; i <= s1.length; i++) {\n    for (let j = 1; j <= s2.length; j++) {\n      dp[i][j] = s1[i-1] === s2[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);\n    }\n  }\n  return dp[s1.length][s2.length];\n}",
        "tags": [
          "dp",
          "string"
        ],
        "hint": "",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Graph BFS Traversal",
        "description": "Return nodes visited in BFS queue order starting from source node.",
        "options": [],
        "correctAnswer": "order",
        "boilerplate": "function bfs(graph, start) {\n  const visited = new Set([start]), queue = [start], order = [];\n  while (queue.length) {\n    const u = queue.shift(); order.push(u);\n    for (let v of graph[u] || []) if (!visited.has(v)) { visited.add(v); queue.push(v); }\n  }\n  return order;\n}",
        "tags": [
          "graph",
          "bfs"
        ],
        "hint": "",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Kahn Topological Sort",
        "description": "Find topological ordering of vertices in Directed Acyclic Graph.",
        "options": [],
        "correctAnswer": "order",
        "boilerplate": "function topoSort(n, prereqs) {\n  const inDeg = Array(n).fill(0), adj = Array(n).fill(0).map(() => []);\n  prereqs.forEach(([v, u]) => { adj[u].push(v); inDeg[v]++; });\n  const q = [], res = [];\n  for (let i = 0; i < n; i++) if (inDeg[i] === 0) q.push(i);\n  while (q.length) {\n    const u = q.shift(); res.push(u);\n    adj[u].forEach(v => { if (--inDeg[v] === 0) q.push(v); });\n  }\n  return res.length === n ? res : [];\n}",
        "tags": [
          "graph",
          "dag"
        ],
        "hint": "",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Trie Prefix Tree",
        "description": "Implement Trie with insert, search, and startsWith.",
        "options": [],
        "correctAnswer": "trie",
        "boilerplate": "class Trie {\n  constructor() { this.root = {}; }\n  insert(w) { let n = this.root; for (let c of w) n = n[c] = n[c] || {}; n.isEnd = true; }\n  search(w) { let n = this.root; for (let c of w) if (!n[c]) return false; else n = n[c]; return !!n.isEnd; }\n  startsWith(p) { let n = this.root; for (let c of p) if (!n[c]) return false; else n = n[c]; return true; }\n}",
        "tags": [
          "tree",
          "trie"
        ],
        "hint": "",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Clone Graph Deep Copy",
        "description": "Return deep copy of connected undirected graph node.",
        "options": [],
        "correctAnswer": "clone",
        "boilerplate": "function cloneGraph(node) {\n  if (!node) return null; const map = new Map();\n  const dfs = (curr) => {\n    if (map.has(curr)) return map.get(curr);\n    const copy = { val: curr.val, neighbors: [] }; map.set(curr, copy);\n    curr.neighbors.forEach(n => copy.neighbors.push(dfs(n))); return copy;\n  };\n  return dfs(node);\n}",
        "tags": [
          "graph",
          "dfs"
        ],
        "hint": "",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Word Break Problem DP",
        "description": "Determine if string can be segmented into words from dictionary.",
        "options": [],
        "correctAnswer": "bool",
        "boilerplate": "function wordBreak(s, dict) {\n  const set = new Set(dict), dp = Array(s.length + 1).fill(false);\n  dp[0] = true;\n  for (let i = 1; i <= s.length; i++) {\n    for (let j = 0; j < i; j++) if (dp[j] && set.has(s.slice(j, i))) { dp[i] = true; break; }\n  }\n  return dp[s.length];\n}",
        "tags": [
          "dp",
          "string"
        ],
        "hint": "",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Course Schedule Cycle Detection",
        "description": "Detect cycles in course prerequisites graph.",
        "options": [],
        "correctAnswer": "bool",
        "boilerplate": "function canFinish(n, edges) {\n  const inDeg = Array(n).fill(0), adj = Array(n).fill(0).map(() => []);\n  edges.forEach(([v, u]) => { adj[u].push(v); inDeg[v]++; });\n  const q = []; for (let i = 0; i < n; i++) if (inDeg[i] === 0) q.push(i);\n  let seen = 0;\n  while (q.length) { const u = q.shift(); seen++; adj[u].forEach(v => { if (--inDeg[v] === 0) q.push(v); }); }\n  return seen === n;\n}",
        "tags": [
          "graph",
          "cycle"
        ],
        "hint": "",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "LRU Cache Design",
        "description": "Design LRU Cache with get and put in O(1) time.",
        "options": [],
        "correctAnswer": "lru",
        "boilerplate": "class LRUCache {\n  constructor(cap) { this.cap = cap; this.m = new Map(); }\n  get(k) { if (!this.m.has(k)) return -1; const v = this.m.get(k); this.m.delete(k); this.m.set(k, v); return v; }\n  put(k, v) { if (this.m.has(k)) this.m.delete(k); this.m.set(k, v); if (this.m.size > this.cap) this.m.delete(this.m.keys().next().value); }\n}",
        "tags": [
          "cache",
          "hashmap"
        ],
        "hint": "",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Minimum Window Substring",
        "description": "Find minimum substring containing all characters of pattern t in O(n).",
        "options": [],
        "correctAnswer": "window",
        "boilerplate": "function minWindow(s, t) {\n  const need = {}; for (let c of t) need[c] = (need[c] || 0) + 1;\n  let l = 0, count = Object.keys(need).length, min = \"\", len = Infinity;\n  for (let r = 0; r < s.length; r++) {\n    if (need[s[r]] !== undefined && --need[s[r]] === 0) count--;\n    while (count === 0) {\n      if (r - l + 1 < len) { len = r - l + 1; min = s.slice(l, r + 1); }\n      if (need[s[l]] !== undefined && ++need[s[l]] > 0) count++;\n      l++;\n    }\n  }\n  return min;\n}",
        "tags": [
          "sliding-window"
        ],
        "hint": "",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Median of Two Sorted Arrays",
        "description": "Find median of two sorted arrays in O(log(min(m, n))).",
        "options": [],
        "correctAnswer": "median",
        "boilerplate": "function findMedianSortedArrays(a, b) {\n  const m = a.concat(b).sort((x, y) => x - y), mid = Math.floor(m.length / 2);\n  return m.length % 2 ? m[mid] : (m[mid - 1] + m[mid]) / 2;\n}",
        "tags": [
          "binary-search"
        ],
        "hint": "",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Serialize Binary Tree",
        "description": "Serialize binary tree to preorder string and deserialize back.",
        "options": [],
        "correctAnswer": "codec",
        "boilerplate": "function serialize(r) { return !r ? \"X\" : `${r.val},${serialize(r.left)},${serialize(r.right)}`; }",
        "tags": [
          "tree",
          "recursion"
        ],
        "hint": "",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Word Ladder Shortest BFS",
        "description": "Find minimum words in transformation sequence from start to end.",
        "options": [],
        "correctAnswer": "steps",
        "boilerplate": "function ladderLength(b, e, words) {\n  const set = new Set(words); if (!set.has(e)) return 0; const q = [[b, 1]];\n  while (q.length) {\n    let [w, step] = q.shift(); if (w === e) return step;\n    for (let i = 0; i < w.length; i++) {\n      for (let c = 97; c <= 122; c++) {\n        let n = w.slice(0, i) + String.fromCharCode(c) + w.slice(i + 1);\n        if (set.has(n)) { set.delete(n); q.push([n, step + 1]); }\n      }\n    }\n  }\n  return 0;\n}",
        "tags": [
          "bfs",
          "graph"
        ],
        "hint": "",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Merge K Sorted Lists",
        "description": "Merge k sorted linked lists in O(N log k).",
        "options": [],
        "correctAnswer": "merged",
        "boilerplate": "function mergeKLists(lists) {\n  const vals = []; lists.forEach(l => { while (l) { vals.push(l.val); l = l.next; } });\n  vals.sort((a,b) => a - b); let d = { next: null }, c = d;\n  vals.forEach(v => { c.next = { val: v, next: null }; c = c.next; }); return d.next;\n}",
        "tags": [
          "linked-list",
          "heap"
        ],
        "hint": "",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      }
    ],
    "master": [
      {
        "title": "Dijkstra Shortest Path",
        "description": "Find shortest paths from single source node in weighted graph with non-negative edges.",
        "options": [],
        "correctAnswer": "dist",
        "boilerplate": "function dijkstra(graph, start) {\n  const dist = {}, vis = new Set(); for (let k in graph) dist[k] = Infinity; dist[start] = 0;\n  while (true) {\n    let u = null, min = Infinity;\n    for (let k in dist) if (!vis.has(k) && dist[k] < min) { min = dist[k]; u = k; }\n    if (!u) break; vis.add(u);\n    for (let v in graph[u]) if (dist[u] + graph[u][v] < dist[v]) dist[v] = dist[u] + graph[u][v];\n  }\n  return dist;\n}",
        "tags": [
          "graph",
          "dijkstra"
        ],
        "hint": "",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "LIS Patience Sorting O(N log N)",
        "description": "Find length of Longest Increasing Subsequence using binary search tails in O(n log n).",
        "options": [],
        "correctAnswer": "length",
        "boilerplate": "function lengthOfLIS(nums) {\n  const tails = [];\n  for (let x of nums) {\n    let l = 0, r = tails.length;\n    while (l < r) { let m = Math.floor((l + r)/2); if (tails[m] < x) l = m + 1; else r = m; }\n    tails[l] = x;\n  }\n  return tails.length;\n}",
        "tags": [
          "dp",
          "binary-search"
        ],
        "hint": "",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Trapping Rain Water O(N)",
        "description": "Calculate water trapped after rain in elevation map in O(n) time and O(1) space.",
        "options": [],
        "correctAnswer": "water",
        "boilerplate": "function trap(h) {\n  let l = 0, r = h.length - 1, lm = 0, rm = 0, ans = 0;\n  while (l < r) {\n    if (h[l] < h[r]) { h[l] >= lm ? lm = h[l] : ans += lm - h[l]; l++; }\n    else { h[r] >= rm ? rm = h[r] : ans += rm - h[r]; r--; }\n  }\n  return ans;\n}",
        "tags": [
          "two-pointers"
        ],
        "hint": "",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Levenshtein Edit Distance DP",
        "description": "Find minimum operations to convert word1 to word2.",
        "options": [],
        "correctAnswer": "distance",
        "boilerplate": "function minDistance(w1, w2) {\n  const m = w1.length, n = w2.length, dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));\n  for (let i = 0; i <= m; i++) dp[i][0] = i;\n  for (let j = 0; j <= n; j++) dp[0][j] = j;\n  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {\n    dp[i][j] = w1[i-1] === w2[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);\n  }\n  return dp[m][n];\n}",
        "tags": [
          "dp",
          "string"
        ],
        "hint": "",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Sliding Window Maximum Deque",
        "description": "Find maximum of each sliding window of size k in O(n) time.",
        "options": [],
        "correctAnswer": "maxes",
        "boilerplate": "function maxSlidingWindow(nums, k) {\n  const q = [], res = [];\n  for (let i = 0; i < nums.length; i++) {\n    while (q.length && q[0] <= i - k) q.shift();\n    while (q.length && nums[q[q.length - 1]] <= nums[i]) q.pop();\n    q.push(i);\n    if (i >= k - 1) res.push(nums[q[0]]);\n  }\n  return res;\n}",
        "tags": [
          "deque",
          "sliding-window"
        ],
        "hint": "",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Regex Parser Wildcard",
        "description": "Support regular expression matching with \".\" and \"*\".",
        "options": [],
        "correctAnswer": "bool",
        "boilerplate": "function isMatch(s, p) {\n  const dp = Array(s.length + 1).fill(false).map(() => Array(p.length + 1).fill(false));\n  dp[0][0] = true;\n  for (let j = 1; j <= p.length; j++) if (p[j-1] === \"*\") dp[0][j] = dp[0][j-2];\n  for (let i = 1; i <= s.length; i++) for (let j = 1; j <= p.length; j++) {\n    if (p[j-1] === \".\" || p[j-1] === s[i-1]) dp[i][j] = dp[i-1][j-1];\n    else if (p[j-1] === \"*\") dp[i][j] = dp[i][j-2] || ((p[j-2] === \".\" || p[j-2] === s[i-1]) && dp[i-1][j]);\n  }\n  return dp[s.length][p.length];\n}",
        "tags": [
          "dp",
          "regex"
        ],
        "hint": "",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Alien Dictionary DAG",
        "description": "Derive alphabet character order from sorted alien words dictionary.",
        "options": [],
        "correctAnswer": "order",
        "boilerplate": "function alienOrder(words) {\n  const adj = {}, inDeg = {};\n  words.forEach(w => w.split(\"\").forEach(c => { adj[c] = new Set(); inDeg[c] = 0; }));\n  for (let i = 0; i < words.length - 1; i++) {\n    const [w1, w2] = [words[i], words[i+1]];\n    if (w1.length > w2.length && w1.startsWith(w2)) return \"\";\n    for (let j = 0; j < Math.min(w1.length, w2.length); j++) {\n      if (w1[j] !== w2[j]) { if (!adj[w1[j]].has(w2[j])) { adj[w1[j]].add(w2[j]); inDeg[w2[j]]++; } break; }\n    }\n  }\n  const q = Object.keys(inDeg).filter(c => inDeg[c] === 0); let res = \"\";\n  while (q.length) { let c = q.shift(); res += c; adj[c].forEach(n => { if (--inDeg[n] === 0) q.push(n); }); }\n  return res.length === Object.keys(inDeg).length ? res : \"\";\n}",
        "tags": [
          "graph",
          "topological-sort"
        ],
        "hint": "",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Max Profit Job Scheduling",
        "description": "Find max profit scheduling non-overlapping intervals in O(n log n).",
        "options": [],
        "correctAnswer": "profit",
        "boilerplate": "function jobScheduling(s, e, p) {\n  const jobs = s.map((start, i) => [start, e[i], p[i]]).sort((a,b) => a[1] - b[1]);\n  const dp = [[0, 0]];\n  for (let [st, ed, prof] of jobs) {\n    let l = 0, r = dp.length - 1, prev = 0;\n    while (l <= r) { let m = Math.floor((l+r)/2); if (dp[m][0] <= st) { prev = dp[m][1]; l = m + 1; } else r = m - 1; }\n    if (prev + prof > dp[dp.length - 1][1]) dp.push([ed, prev + prof]);\n  }\n  return dp[dp.length - 1][1];\n}",
        "tags": [
          "dp",
          "binary-search"
        ],
        "hint": "",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Word Search II Trie Search",
        "description": "Find all dictionary words in 2D character matrix using Trie and backtracking.",
        "options": [],
        "correctAnswer": "words",
        "boilerplate": "function findWords(board, words) {\n  const root = {}; words.forEach(w => { let n = root; for (let c of w) n = n[c] = n[c] || {}; n.word = w; });\n  const res = [];\n  const dfs = (r, c, n) => {\n    if (n.word) { res.push(n.word); n.word = null; }\n    if (r < 0 || c < 0 || r >= board.length || c >= board[0].length || !n[board[r][c]]) return;\n    const ch = board[r][c]; board[r][c] = \"#\";\n    dfs(r+1,c,n[ch]); dfs(r-1,c,n[ch]); dfs(r,c+1,n[ch]); dfs(r,c-1,n[ch]);\n    board[r][c] = ch;\n  };\n  for (let r = 0; r < board.length; r++) for (let c = 0; c < board[0].length; c++) dfs(r, c, root);\n  return res;\n}",
        "tags": [
          "trie",
          "backtracking"
        ],
        "hint": "",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      }
    ],
    "grandmaster": [
      {
        "title": "Traveling Salesperson Bitmask DP",
        "description": "Find minimum Hamiltonian cycle visiting all cities using bitmask DP.",
        "options": [],
        "correctAnswer": "cost",
        "boilerplate": "function tsp(dist) {\n  const n = dist.length, memo = {};\n  function solve(mask, u) {\n    if (mask === (1 << n) - 1) return dist[u][0];\n    const k = `${mask},${u}`; if (memo[k] !== undefined) return memo[k];\n    let ans = Infinity;\n    for (let v = 0; v < n; v++) if (!(mask & (1 << v))) ans = Math.min(ans, dist[u][v] + solve(mask | (1 << v), v));\n    return memo[k] = ans;\n  }\n  return solve(1, 0);\n}",
        "tags": [
          "dp",
          "bitmask"
        ],
        "hint": "",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Tarjan SCC Graph Decomposition",
        "description": "Partition directed graph into Strongly Connected Components in O(V + E).",
        "options": [],
        "correctAnswer": "scc",
        "boilerplate": "function tarjanSCC(n, edges) {\n  const adj = Array(n).fill(0).map(() => []), disc = Array(n).fill(-1), low = Array(n).fill(-1), inStack = Array(n).fill(false), stack = [], res = [];\n  edges.forEach(([u, v]) => adj[u].push(v)); let time = 0;\n  function dfs(u) {\n    disc[u] = low[u] = ++time; stack.push(u); inStack[u] = true;\n    for (let v of adj[u]) {\n      if (disc[v] === -1) { dfs(v); low[u] = Math.min(low[u], low[v]); }\n      else if (inStack[v]) low[u] = Math.min(low[u], disc[v]);\n    }\n    if (low[u] === disc[u]) {\n      const scc = []; let w; do { w = stack.pop(); inStack[w] = false; scc.push(w); } while (w !== u);\n      res.push(scc);\n    }\n  }\n  for (let i = 0; i < n; i++) if (disc[i] === -1) dfs(i);\n  return res;\n}",
        "tags": [
          "graph",
          "tarjan"
        ],
        "hint": "",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Segment Tree Lazy Propagation",
        "description": "Support O(log n) range sum updates and queries with lazy propagation.",
        "options": [],
        "correctAnswer": "tree",
        "boilerplate": "class SegmentTree {\n  constructor(n) { this.n = n; this.tree = Array(4*n).fill(0); this.lazy = Array(4*n).fill(0); }\n  update(node, l, r, ql, qr, val) {\n    if (this.lazy[node]) { this.tree[node] += (r - l + 1)*this.lazy[node]; if (l !== r) { this.lazy[2*node] += this.lazy[node]; this.lazy[2*node+1] += this.lazy[node]; } this.lazy[node] = 0; }\n    if (ql > r || qr < l) return;\n    if (ql <= l && r <= qr) { this.tree[node] += (r - l + 1)*val; if (l !== r) { this.lazy[2*node] += val; this.lazy[2*node+1] += val; } return; }\n    const mid = Math.floor((l + r)/2); this.update(2*node, l, mid, ql, qr, val); this.update(2*node+1, mid+1, r, ql, qr, val);\n    this.tree[node] = this.tree[2*node] + this.tree[2*node+1];\n  }\n}",
        "tags": [
          "segment-tree"
        ],
        "hint": "",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Push-Relabel Max Network Flow",
        "description": "Find max flow in directed network using push-relabel method.",
        "options": [],
        "correctAnswer": "flow",
        "boilerplate": "function pushRelabel(cap, s, t) {\n  const n = cap.length, flow = Array(n).fill(0).map(() => Array(n).fill(0)), excess = Array(n).fill(0);\n  for (let v = 0; v < n; v++) if (cap[s][v] > 0) { flow[s][v] = cap[s][v]; flow[v][s] = -cap[s][v]; excess[v] = cap[s][v]; excess[s] -= cap[s][v]; }\n  return Math.abs(excess[s]);\n}",
        "tags": [
          "graph",
          "flow"
        ],
        "hint": "",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Aho-Corasick Multi-Pattern Matcher",
        "description": "Construct automaton for simultaneous multi-keyword matching in O(N + sum(M)).",
        "options": [],
        "correctAnswer": "matcher",
        "boilerplate": "function ahoCorasick(text, patterns) {\n  const root = { next: {}, fail: null, out: [] };\n  patterns.forEach(p => { let n = root; for (let c of p) n = n.next[c] = n.next[c] || { next: {}, fail: null, out: [] }; n.out.push(p); });\n  return patterns.map(p => text.indexOf(p));\n}",
        "tags": [
          "string",
          "automata"
        ],
        "hint": "",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Treap Balanced Binary Search Tree",
        "description": "Implement randomized balanced search tree with O(log n) expected height.",
        "options": [],
        "correctAnswer": "treap",
        "boilerplate": "class Treap {\n  constructor(key) { this.key = key; this.priority = Math.random(); this.left = null; this.right = null; }\n}",
        "tags": [
          "tree",
          "randomized"
        ],
        "hint": "",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Suffix Automaton Linear String State",
        "description": "Build minimal deterministic finite automaton recognizing all substrings in O(N).",
        "options": [],
        "correctAnswer": "sam",
        "boilerplate": "function buildSAM(s) { return { states: s.length * 2, totalTransitions: s.length * 3 }; }",
        "tags": [
          "string",
          "automata"
        ],
        "hint": "",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Heavy-Light Decomposition",
        "description": "Decompose tree into disjoint paths to support O(log^2 N) path queries.",
        "options": [],
        "correctAnswer": "hld",
        "boilerplate": "function hld(tree, root) { return { heavyPaths: [], chainHead: {} }; }",
        "tags": [
          "tree",
          "hld"
        ],
        "hint": "",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      }
    ]
  },
  "math": {
    "beginner": [
      {
        "title": "Sum of Digits",
        "description": "What is the sum of digits of the number 356?",
        "options": [
          "12",
          "14",
          "15",
          "11"
        ],
        "correctAnswer": "14",
        "boilerplate": "",
        "tags": [
          "arithmetic"
        ],
        "hint": "3 + 5 + 6",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Simple Multiplication",
        "description": "What is 17 × 8?",
        "options": [
          "126",
          "136",
          "146",
          "116"
        ],
        "correctAnswer": "136",
        "boilerplate": "",
        "tags": [
          "arithmetic"
        ],
        "hint": "10×8 + 7×8 = 80 + 56",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Percentage Calculation",
        "description": "What is 25% of 240?",
        "options": [
          "40",
          "50",
          "60",
          "70"
        ],
        "correctAnswer": "60",
        "boilerplate": "",
        "tags": [
          "percentage"
        ],
        "hint": "240 / 4",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Perfect Square Root",
        "description": "What is √196?",
        "options": [
          "12",
          "13",
          "14",
          "16"
        ],
        "correctAnswer": "14",
        "boilerplate": "",
        "tags": [
          "arithmetic"
        ],
        "hint": "14 × 14",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Identify Prime Number",
        "description": "Which of the following is a prime number?",
        "options": [
          "27",
          "39",
          "41",
          "51"
        ],
        "correctAnswer": "41",
        "boilerplate": "",
        "tags": [
          "number-theory"
        ],
        "hint": "41 has no divisors other than 1 and 41",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Perimeter of Rectangle",
        "description": "What is the perimeter of a rectangle with length 15 cm and width 8 cm?",
        "options": [
          "46 cm",
          "23 cm",
          "120 cm",
          "48 cm"
        ],
        "correctAnswer": "46 cm",
        "boilerplate": "",
        "tags": [
          "geometry"
        ],
        "hint": "2 × (length + width)",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Area of Square",
        "description": "A square has an area of 81 cm². What is the length of one side?",
        "options": [
          "7 cm",
          "8 cm",
          "9 cm",
          "18 cm"
        ],
        "correctAnswer": "9 cm",
        "boilerplate": "",
        "tags": [
          "geometry"
        ],
        "hint": "√81 = 9",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Fraction Addition",
        "description": "What is 2/5 + 1/10?",
        "options": [
          "3/15",
          "1/2",
          "3/10",
          "4/10"
        ],
        "correctAnswer": "1/2",
        "boilerplate": "",
        "tags": [
          "fractions"
        ],
        "hint": "4/10 + 1/10 = 5/10 = 1/2",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Average Calculation",
        "description": "What is the arithmetic mean of 12, 18, 24, and 30?",
        "options": [
          "20",
          "21",
          "22",
          "24"
        ],
        "correctAnswer": "21",
        "boilerplate": "",
        "tags": [
          "statistics"
        ],
        "hint": "(12+18+24+30)/4 = 84/4",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Exponentiation Basics",
        "description": "What is 2^6?",
        "options": [
          "32",
          "64",
          "128",
          "16"
        ],
        "correctAnswer": "64",
        "boilerplate": "",
        "tags": [
          "algebra"
        ],
        "hint": "2 multiplied by itself 6 times",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Linear Equation Solve",
        "description": "Solve for x: 3x - 7 = 14",
        "options": [
          "5",
          "6",
          "7",
          "8"
        ],
        "correctAnswer": "7",
        "boilerplate": "",
        "tags": [
          "algebra"
        ],
        "hint": "3x = 21",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Volume of Cube",
        "description": "What is the volume of a cube with side length 4 cm?",
        "options": [
          "16 cm³",
          "48 cm³",
          "64 cm³",
          "96 cm³"
        ],
        "correctAnswer": "64 cm³",
        "boilerplate": "",
        "tags": [
          "geometry"
        ],
        "hint": "4³ = 64",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Ratio Simplification",
        "description": "Simplify the ratio 45:60 to its simplest form.",
        "options": [
          "3:4",
          "4:5",
          "9:12",
          "2:3"
        ],
        "correctAnswer": "3:4",
        "boilerplate": "",
        "tags": [
          "ratios"
        ],
        "hint": "Divide both by 15",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Complementary Angles",
        "description": "If an angle measures 38°, what is its complementary angle?",
        "options": [
          "42°",
          "52°",
          "62°",
          "142°"
        ],
        "correctAnswer": "52°",
        "boilerplate": "",
        "tags": [
          "geometry"
        ],
        "hint": "90° - 38°",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Discount Price",
        "description": "An item priced at $80 has a 15% discount. What is the final price?",
        "options": [
          "$68",
          "$70",
          "$65",
          "$72"
        ],
        "correctAnswer": "$68",
        "boilerplate": "",
        "tags": [
          "percentage"
        ],
        "hint": "$80 - 15% of $80 = $80 - $12",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Divisibility Rule for 9",
        "description": "Which of the following numbers is divisible by 9?",
        "options": [
          "4,532",
          "6,318",
          "7,215",
          "5,423"
        ],
        "correctAnswer": "6,318",
        "boilerplate": "",
        "tags": [
          "number-theory"
        ],
        "hint": "Sum of digits: 6+3+1+8 = 18 (divisible by 9)",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Unit Conversion Length",
        "description": "How many centimeters are in 3.5 meters?",
        "options": [
          "35 cm",
          "350 cm",
          "3,500 cm",
          "0.35 cm"
        ],
        "correctAnswer": "350 cm",
        "boilerplate": "",
        "tags": [
          "units"
        ],
        "hint": "1 m = 100 cm",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Circle Circumference",
        "description": "If radius of a circle is 7 cm, what is its circumference? (Use π ≈ 22/7)",
        "options": [
          "22 cm",
          "44 cm",
          "88 cm",
          "154 cm"
        ],
        "correctAnswer": "44 cm",
        "boilerplate": "",
        "tags": [
          "geometry"
        ],
        "hint": "2 × (22/7) × 7",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Speed Time Distance",
        "description": "A train travels 180 km in 3 hours. What is its average speed?",
        "options": [
          "50 km/h",
          "60 km/h",
          "70 km/h",
          "80 km/h"
        ],
        "correctAnswer": "60 km/h",
        "boilerplate": "",
        "tags": [
          "arithmetic"
        ],
        "hint": "180 / 3",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Median of Odd Dataset",
        "description": "What is the median of [3, 9, 1, 7, 5]?",
        "options": [
          "3",
          "5",
          "7",
          "9"
        ],
        "correctAnswer": "5",
        "boilerplate": "",
        "tags": [
          "statistics"
        ],
        "hint": "Sort first: 1, 3, 5, 7, 9. Middle is 5.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      }
    ],
    "intermediate": [
      {
        "title": "Quadratic Equation Roots",
        "description": "Solve x² - 5x + 6 = 0. What is the larger root?",
        "options": [
          "2",
          "3",
          "4",
          "6"
        ],
        "correctAnswer": "3",
        "boilerplate": "",
        "tags": [
          "algebra"
        ],
        "hint": "(x - 2)(x - 3) = 0",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Probability of Marble",
        "description": "A bag contains 4 red, 6 green, and 10 blue marbles. What is probability of picking green?",
        "options": [
          "0.2",
          "0.3",
          "0.4",
          "0.5"
        ],
        "correctAnswer": "0.3",
        "boilerplate": "",
        "tags": [
          "probability"
        ],
        "hint": "6 / 20 = 0.3",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Pythagorean Hypotenuse",
        "description": "A right-angled triangle has legs of length 9 cm and 12 cm. What is the hypotenuse?",
        "options": [
          "13 cm",
          "14 cm",
          "15 cm",
          "18 cm"
        ],
        "correctAnswer": "15 cm",
        "boilerplate": "",
        "tags": [
          "geometry"
        ],
        "hint": "√(81 + 144) = √225 = 15",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Arithmetic Progression Nth Term",
        "description": "In an AP: 4, 9, 14, 19... what is the 12th term?",
        "options": [
          "54",
          "59",
          "64",
          "69"
        ],
        "correctAnswer": "59",
        "boilerplate": "",
        "tags": [
          "sequences"
        ],
        "hint": "a + (n-1)d = 4 + 11(5) = 59",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Lowest Common Multiple",
        "description": "What is the LCM of 14 and 21?",
        "options": [
          "28",
          "42",
          "63",
          "84"
        ],
        "correctAnswer": "42",
        "boilerplate": "",
        "tags": [
          "number-theory"
        ],
        "hint": "14 = 2×7, 21 = 3×7, LCM = 2×3×7 = 42",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Logarithm Value",
        "description": "What is log₂(128)?",
        "options": [
          "6",
          "7",
          "8",
          "9"
        ],
        "correctAnswer": "7",
        "boilerplate": "",
        "tags": [
          "algebra"
        ],
        "hint": "2^7 = 128",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Compound Interest Amount",
        "description": "$1000 is invested at 10% annual interest compounded annually for 2 years. What is total amount?",
        "options": [
          "$1,200",
          "$1,210",
          "$1,220",
          "$1,250"
        ],
        "correctAnswer": "$1,210",
        "boilerplate": "",
        "tags": [
          "finance"
        ],
        "hint": "1000 × (1.1)² = 1000 × 1.21",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "System of Linear Equations",
        "description": "If 2x + y = 11 and x - y = 1, what is the value of x?",
        "options": [
          "3",
          "4",
          "5",
          "6"
        ],
        "correctAnswer": "4",
        "boilerplate": "",
        "tags": [
          "algebra"
        ],
        "hint": "Add equations: 3x = 12 → x = 4",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Geometric Sequence Term",
        "description": "In a GP: 3, 6, 12, 24... what is the 7th term?",
        "options": [
          "96",
          "144",
          "192",
          "384"
        ],
        "correctAnswer": "192",
        "boilerplate": "",
        "tags": [
          "sequences"
        ],
        "hint": "a × r^6 = 3 × 2^6 = 3 × 64 = 192",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Area of Trapezoid",
        "description": "A trapezoid has parallel bases 10 cm and 16 cm and height 5 cm. What is its area?",
        "options": [
          "52 cm²",
          "65 cm²",
          "78 cm²",
          "130 cm²"
        ],
        "correctAnswer": "65 cm²",
        "boilerplate": "",
        "tags": [
          "geometry"
        ],
        "hint": "((10 + 16) / 2) × 5 = 13 × 5 = 65",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Combinations Calculation",
        "description": "Calculate 7C3 (number of combinations of 7 items taken 3 at a time).",
        "options": [
          "21",
          "35",
          "42",
          "56"
        ],
        "correctAnswer": "35",
        "boilerplate": "",
        "tags": [
          "combinatorics"
        ],
        "hint": "(7 × 6 × 5) / (3 × 2 × 1) = 35",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Sum of Angles in Polygon",
        "description": "What is the sum of interior angles of a hexagon (6 sides)?",
        "options": [
          "540°",
          "720°",
          "900°",
          "1080°"
        ],
        "correctAnswer": "720°",
        "boilerplate": "",
        "tags": [
          "geometry"
        ],
        "hint": "(6 - 2) × 180° = 4 × 180° = 720°",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Slope of Line",
        "description": "Find slope of line passing through points (2, 3) and (6, 11).",
        "options": [
          "1",
          "2",
          "3",
          "4"
        ],
        "correctAnswer": "2",
        "boilerplate": "",
        "tags": [
          "coordinate-geometry"
        ],
        "hint": "(11 - 3) / (6 - 2) = 8 / 4 = 2",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Distance Between Points",
        "description": "Find distance between (1, 2) and (4, 6).",
        "options": [
          "3",
          "4",
          "5",
          "6"
        ],
        "correctAnswer": "5",
        "boilerplate": "",
        "tags": [
          "coordinate-geometry"
        ],
        "hint": "√((4-1)² + (6-2)²) = √(9+16) = 5",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Trigonometry Tangent 45",
        "description": "What is the value of tan(45°)?",
        "options": [
          "0",
          "0.5",
          "1",
          "√3"
        ],
        "correctAnswer": "1",
        "boilerplate": "",
        "tags": [
          "trigonometry"
        ],
        "hint": "sin(45°)/cos(45°) = 1",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Difference of Two Squares",
        "description": "Evaluate 105² - 95² using algebraic identity.",
        "options": [
          "1,000",
          "1,800",
          "2,000",
          "2,400"
        ],
        "correctAnswer": "2,000",
        "boilerplate": "",
        "tags": [
          "algebra"
        ],
        "hint": "(105 - 95)(105 + 95) = 10 × 200 = 2000",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Cylinder Surface Area",
        "description": "A cylinder has radius 7 and height 10. What is its curved surface area? (π ≈ 22/7)",
        "options": [
          "220",
          "440",
          "660",
          "880"
        ],
        "correctAnswer": "440",
        "boilerplate": "",
        "tags": [
          "geometry"
        ],
        "hint": "2πrh = 2 × (22/7) × 7 × 10 = 440",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Absolute Value Equation",
        "description": "How many solutions exist for |2x - 5| = -3?",
        "options": [
          "0",
          "1",
          "2",
          "Infinitely many"
        ],
        "correctAnswer": "0",
        "boilerplate": "",
        "tags": [
          "algebra"
        ],
        "hint": "Absolute value can never be negative",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "HCF Greatest Common Divisor",
        "description": "Find the HCF of 48 and 72.",
        "options": [
          "12",
          "16",
          "24",
          "36"
        ],
        "correctAnswer": "24",
        "boilerplate": "",
        "tags": [
          "number-theory"
        ],
        "hint": "Largest integer dividing both 48 and 72 is 24",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Two Dice Sum of 7",
        "description": "What is the probability of rolling a sum of 7 with two fair 6-sided dice?",
        "options": [
          "1/6",
          "1/12",
          "5/36",
          "7/36"
        ],
        "correctAnswer": "1/6",
        "boilerplate": "",
        "tags": [
          "probability"
        ],
        "hint": "6 favorable outcomes out of 36: (1,6),(2,5),(3,4)...",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      }
    ],
    "advanced": [
      {
        "title": "Permutations Word Arrange",
        "description": "How many unique arrangements can be made with the letters in the word \"LEVEL\"?",
        "options": [
          "30",
          "60",
          "120",
          "20"
        ],
        "correctAnswer": "30",
        "boilerplate": "",
        "tags": [
          "combinatorics"
        ],
        "hint": "5! / (2! × 2!) = 120 / 4 = 30",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Trigonometric Identity Addition",
        "description": "What is the value of sin(30°)cos(60°) + cos(30°)sin(60°)?",
        "options": [
          "0",
          "0.5",
          "1",
          "√3/2"
        ],
        "correctAnswer": "1",
        "boilerplate": "",
        "tags": [
          "trigonometry"
        ],
        "hint": "sin(30°+60°) = sin(90°) = 1",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Binomial Expansion Term",
        "description": "What is the coefficient of x³ in the expansion of (1 + 2x)⁵?",
        "options": [
          "40",
          "80",
          "120",
          "160"
        ],
        "correctAnswer": "80",
        "boilerplate": "",
        "tags": [
          "algebra"
        ],
        "hint": "5C3 × (2x)³ = 10 × 8 = 80",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Matrix 2x2 Determinant",
        "description": "Find determinant of matrix [[4, 7], [2, 6]].",
        "options": [
          "8",
          "10",
          "12",
          "14"
        ],
        "correctAnswer": "10",
        "boilerplate": "",
        "tags": [
          "linear-algebra"
        ],
        "hint": "4×6 - 7×2 = 24 - 14 = 10",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Infinite Geometric Series",
        "description": "Find sum of infinite series: 8 + 4 + 2 + 1 + ...",
        "options": [
          "14",
          "15",
          "16",
          "18"
        ],
        "correctAnswer": "16",
        "boilerplate": "",
        "tags": [
          "series"
        ],
        "hint": "a / (1 - r) = 8 / (1 - 0.5) = 16",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Limit at Zero",
        "description": "Evaluate lim(x→0) [sin(3x) / x].",
        "options": [
          "0",
          "1",
          "3",
          "Undefined"
        ],
        "correctAnswer": "3",
        "boilerplate": "",
        "tags": [
          "calculus"
        ],
        "hint": "Standard limit rule: 3 × (sin(3x)/(3x)) → 3",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Variance from Standard Deviation",
        "description": "If standard deviation of dataset is 4.5, what is variance?",
        "options": [
          "9.0",
          "18.25",
          "20.25",
          "22.5"
        ],
        "correctAnswer": "20.25",
        "boilerplate": "",
        "tags": [
          "statistics"
        ],
        "hint": "Variance = (SD)² = 4.5² = 20.25",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Circle Tangent Length",
        "description": "A tangent of length 12 is drawn from external point P to a circle with radius 5. What is distance from P to circle center?",
        "options": [
          "13",
          "15",
          "17",
          "10"
        ],
        "correctAnswer": "13",
        "boilerplate": "",
        "tags": [
          "geometry"
        ],
        "hint": "√(12² + 5²) = √(144 + 25) = 13",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Logarithm Base Change",
        "description": "If log₁₀(2) ≈ 0.301, what is log₁₀(5)?",
        "options": [
          "0.499",
          "0.699",
          "0.701",
          "0.500"
        ],
        "correctAnswer": "0.699",
        "boilerplate": "",
        "tags": [
          "algebra"
        ],
        "hint": "log₁₀(10/2) = 1 - 0.301 = 0.699",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Complex Number Modulus",
        "description": "Find modulus of complex number z = 3 - 4i.",
        "options": [
          "3",
          "4",
          "5",
          "7"
        ],
        "correctAnswer": "5",
        "boilerplate": "",
        "tags": [
          "complex-numbers"
        ],
        "hint": "√(3² + (-4)²) = 5",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Derivative Power Rule",
        "description": "What is the first derivative of f(x) = 4x³ - 5x² + 7x - 9?",
        "options": [
          "12x² - 10x + 7",
          "12x² - 5x + 7",
          "4x² - 10x + 7",
          "12x³ - 10x² + 7"
        ],
        "correctAnswer": "12x² - 10x + 7",
        "boilerplate": "",
        "tags": [
          "calculus"
        ],
        "hint": "d/dx(ax^n) = a·n·x^(n-1)",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Definite Integral of Monomial",
        "description": "Evaluate ∫(3x²)dx from x = 1 to x = 3.",
        "options": [
          "24",
          "26",
          "28",
          "30"
        ],
        "correctAnswer": "26",
        "boilerplate": "",
        "tags": [
          "calculus"
        ],
        "hint": "[x³] from 1 to 3 = 27 - 1 = 26",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Dot Product of Vectors",
        "description": "Given vectors A = (2, 3) and B = (4, -1), find A · B.",
        "options": [
          "5",
          "6",
          "7",
          "8"
        ],
        "correctAnswer": "5",
        "boilerplate": "",
        "tags": [
          "vectors"
        ],
        "hint": "2(4) + 3(-1) = 8 - 3 = 5",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Conic Section Eccentricity",
        "description": "What is the eccentricity e of a parabola?",
        "options": [
          "e = 0",
          "0 < e < 1",
          "e = 1",
          "e > 1"
        ],
        "correctAnswer": "e = 1",
        "boilerplate": "",
        "tags": [
          "geometry"
        ],
        "hint": "Parabola has eccentricity exactly equal to 1",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Euler Polyhedron Formula",
        "description": "For a convex polyhedron with 12 vertices and 20 faces, how many edges does it have?",
        "options": [
          "28",
          "30",
          "32",
          "34"
        ],
        "correctAnswer": "30",
        "boilerplate": "",
        "tags": [
          "geometry"
        ],
        "hint": "V - E + F = 2 → 12 - E + 20 = 2 → E = 30",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      }
    ],
    "expert": [
      {
        "title": "Chain Rule Derivative",
        "description": "Find derivative of f(x) = sin(x²).",
        "options": [
          "cos(x²)",
          "2x cos(x²)",
          "-2x cos(x²)",
          "2x sin(x²)"
        ],
        "correctAnswer": "2x cos(x²)",
        "boilerplate": "",
        "tags": [
          "calculus"
        ],
        "hint": "f’(g(x)) · g’(x)",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Integration by Parts",
        "description": "Evaluate ∫(x · e^x) dx.",
        "options": [
          "x e^x - e^x + C",
          "x e^x + e^x + C",
          "e^x + C",
          "x² e^x + C"
        ],
        "correctAnswer": "x e^x - e^x + C",
        "boilerplate": "",
        "tags": [
          "calculus"
        ],
        "hint": "u = x, dv = e^x dx",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Matrix Eigenvalues 2x2",
        "description": "Find eigenvalues of matrix [[5, 2], [2, 5]].",
        "options": [
          "3 and 7",
          "2 and 5",
          "4 and 6",
          "1 and 9"
        ],
        "correctAnswer": "3 and 7",
        "boilerplate": "",
        "tags": [
          "linear-algebra"
        ],
        "hint": "(5-λ)² - 4 = 0 → (5-λ) = ±2 → λ = 7, 3",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Bayes Theorem Calculation",
        "description": "Disease has 1% prevalence. Test is 99% accurate (true pos and true neg). Given positive test, probability of disease?",
        "options": [
          "50%",
          "99%",
          "90%",
          "1%"
        ],
        "correctAnswer": "50%",
        "boilerplate": "",
        "tags": [
          "probability"
        ],
        "hint": "(0.99 × 0.01) / (0.99 × 0.01 + 0.01 × 0.99) = 0.50",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Taylor Series Expansion of e^x",
        "description": "What is the coefficient of x⁴ in Maclaurin series of e^(2x)?",
        "options": [
          "2/3",
          "4/3",
          "1/24",
          "16/24"
        ],
        "correctAnswer": "2/3",
        "boilerplate": "",
        "tags": [
          "analysis"
        ],
        "hint": "(2x)⁴ / 4! = 16/24 = 2/3",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Vector Cross Product Magnitude",
        "description": "Find magnitude of cross product of A = (1, 0, 0) and B = (0, 1, 0).",
        "options": [
          "0",
          "1",
          "√2",
          "2"
        ],
        "correctAnswer": "1",
        "boilerplate": "",
        "tags": [
          "vectors"
        ],
        "hint": "i × j = k, magnitude is 1",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "First Order Differential Equation",
        "description": "Solve dy/dx = 2y with y(0) = 3.",
        "options": [
          "y = 3e^(2x)",
          "y = 2e^(3x)",
          "y = 3 + 2x",
          "y = e^(2x) + 2"
        ],
        "correctAnswer": "y = 3e^(2x)",
        "boilerplate": "",
        "tags": [
          "differential-equations"
        ],
        "hint": "Separable: dy/y = 2 dx → ln|y| = 2x + C",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "L Hospital Rule Indeterminate",
        "description": "Evaluate lim(x→0) [(e^x - 1 - x) / x²].",
        "options": [
          "0",
          "1/2",
          "1",
          "∞"
        ],
        "correctAnswer": "1/2",
        "boilerplate": "",
        "tags": [
          "calculus"
        ],
        "hint": "Apply L’Hopital twice: e^x / 2 → 1/2",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Poisson Distribution Variance",
        "description": "For a Poisson distribution with mean λ = 9, what is standard deviation?",
        "options": [
          "3",
          "4.5",
          "9",
          "81"
        ],
        "correctAnswer": "3",
        "boilerplate": "",
        "tags": [
          "probability"
        ],
        "hint": "Variance = λ = 9, SD = √9 = 3",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Plane Normal Vector",
        "description": "What is normal vector to plane 3x - 4y + 5z = 12?",
        "options": [
          "(3, -4, 5)",
          "(3, 4, 5)",
          "(-3, 4, -5)",
          "(12, 12, 12)"
        ],
        "correctAnswer": "(3, -4, 5)",
        "boilerplate": "",
        "tags": [
          "geometry"
        ],
        "hint": "Coefficients of x, y, z",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "De Moivres Formula Application",
        "description": "Compute (cos(π/4) + i sin(π/4))^4.",
        "options": [
          "1",
          "-1",
          "i",
          "-i"
        ],
        "correctAnswer": "-1",
        "boilerplate": "",
        "tags": [
          "complex-numbers"
        ],
        "hint": "cos(π) + i sin(π) = -1",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Newton Raphson Method",
        "description": "In Newton-Raphson method for f(x) = x² - 2 starting at x₀ = 2, what is x₁?",
        "options": [
          "1.25",
          "1.5",
          "1.75",
          "1.414"
        ],
        "correctAnswer": "1.5",
        "boilerplate": "",
        "tags": [
          "numerical-methods"
        ],
        "hint": "x₁ = 2 - f(2)/f’(2) = 2 - 2/4 = 1.5",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Characteristic Polynomial",
        "description": "What is trace of matrix [[2, 1, 3], [0, 4, 5], [1, 2, -1]]?",
        "options": [
          "4",
          "5",
          "6",
          "7"
        ],
        "correctAnswer": "5",
        "boilerplate": "",
        "tags": [
          "linear-algebra"
        ],
        "hint": "Sum of diagonal: 2 + 4 + (-1) = 5",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Binomial Distribution Variance",
        "description": "In 100 coin tosses with p = 0.5, what is the variance of heads?",
        "options": [
          "50",
          "25",
          "5",
          "10"
        ],
        "correctAnswer": "25",
        "boilerplate": "",
        "tags": [
          "probability"
        ],
        "hint": "n × p × (1 - p) = 100 × 0.5 × 0.5 = 25",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Divergence of Vector Field",
        "description": "Find div F where F = (x², y², z²).",
        "options": [
          "2x + 2y + 2z",
          "x + y + z",
          "2(x² + y² + z²)",
          "0"
        ],
        "correctAnswer": "2x + 2y + 2z",
        "boilerplate": "",
        "tags": [
          "calculus"
        ],
        "hint": "∂Fx/∂x + ∂Fy/∂y + ∂Fz/∂z",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      }
    ],
    "master": [
      {
        "title": "Double Integral Over Unit Square",
        "description": "Evaluate ∫∫ (x + y) dx dy over [0,1] × [0,1].",
        "options": [
          "0.5",
          "1",
          "1.5",
          "2"
        ],
        "correctAnswer": "1",
        "boilerplate": "",
        "tags": [
          "multivariable-calculus"
        ],
        "hint": "∫(x + 1/2) dx = 1/2 + 1/2 = 1",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Curl of Gradient Field",
        "description": "What is curl(grad φ) for any twice continuously differentiable scalar field φ?",
        "options": [
          "Always 0",
          "Laplacian φ",
          "grad(div φ)",
          "Depends on boundary"
        ],
        "correctAnswer": "Always 0",
        "boilerplate": "",
        "tags": [
          "vector-calculus"
        ],
        "hint": "The curl of any gradient field is identically zero",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Singular Value Decomposition Dimension",
        "description": "If A is m × n matrix, what are dimensions of singular value matrix Σ?",
        "options": [
          "m × n",
          "m × m",
          "n × n",
          "min(m,n) × max(m,n)"
        ],
        "correctAnswer": "m × n",
        "boilerplate": "",
        "tags": [
          "linear-algebra"
        ],
        "hint": "A = U Σ V^T, Σ matches dimension of A",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Second Order ODE Characteristic Roots",
        "description": "Find general solution form for y’’ - 4y’ + 4y = 0.",
        "options": [
          "(C₁ + C₂x)e^(2x)",
          "C₁e^(2x) + C₂e^(-2x)",
          "C₁cos(2x) + C₂sin(2x)",
          "C₁e^(4x) + C₂"
        ],
        "correctAnswer": "(C₁ + C₂x)e^(2x)",
        "boilerplate": "",
        "tags": [
          "differential-equations"
        ],
        "hint": "Repeated root r = 2 of characteristic equation (r - 2)² = 0",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Residue Theorem Simple Pole",
        "description": "Find residue of f(z) = 1/(z² + 1) at z = i.",
        "options": [
          "1/(2i)",
          "-1/(2i)",
          "1",
          "0"
        ],
        "correctAnswer": "1/(2i)",
        "boilerplate": "",
        "tags": [
          "complex-analysis"
        ],
        "hint": "lim(z→i) (z - i)/(z² + 1) = 1/(2i)",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Cauchy-Schwarz Inequality Boundary",
        "description": "Under what condition does equality hold in Cauchy-Schwarz |⟨u, v⟩| ≤ ‖u‖ ‖v‖?",
        "options": [
          "When u and v are linearly dependent",
          "When u and v are orthogonal",
          "When ‖u‖ = ‖v‖",
          "When u · v = 0"
        ],
        "correctAnswer": "When u and v are linearly dependent",
        "boilerplate": "",
        "tags": [
          "linear-algebra"
        ],
        "hint": "Equality occurs if and only if one vector is a scalar multiple of the other",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Markov Chain Stationary Distribution",
        "description": "For transition matrix [[0.7, 0.3], [0.4, 0.6]], what is stationary probability of state 1?",
        "options": [
          "4/7",
          "3/7",
          "1/2",
          "7/10"
        ],
        "correctAnswer": "4/7",
        "boilerplate": "",
        "tags": [
          "stochastic-processes"
        ],
        "hint": "π₁ = 0.4/(0.3 + 0.4) = 4/7",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Laplace Transform of t",
        "description": "What is the Laplace transform L{t} for s > 0?",
        "options": [
          "1/s",
          "1/s²",
          "2/s²",
          "s/1"
        ],
        "correctAnswer": "1/s²",
        "boilerplate": "",
        "tags": [
          "transforms"
        ],
        "hint": "∫ t e^(-st) dt = 1/s²",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Gamma Function Integer Value",
        "description": "What is Γ(5)?",
        "options": [
          "12",
          "24",
          "120",
          "720"
        ],
        "correctAnswer": "24",
        "boilerplate": "",
        "tags": [
          "special-functions"
        ],
        "hint": "Γ(n) = (n - 1)! → 4! = 24",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Gram-Schmidt Orthogonalization Basis",
        "description": "What is purpose of Gram-Schmidt process?",
        "options": [
          "Convert basis into orthonormal basis",
          "Find eigenvalues",
          "Solve non-linear equations",
          "Invert singular matrices"
        ],
        "correctAnswer": "Convert basis into orthonormal basis",
        "boilerplate": "",
        "tags": [
          "linear-algebra"
        ],
        "hint": "Produces an orthogonal or orthonormal set from linearly independent vectors",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      }
    ],
    "grandmaster": [
      {
        "title": "Riemann Zeta Function Trivial Zeros",
        "description": "Where are the trivial zeros of the Riemann zeta function ζ(s) located?",
        "options": [
          "Negative even integers: -2, -4, -6...",
          "Negative odd integers: -1, -3, -5...",
          "Real line Re(s) = 1/2",
          "Positive primes"
        ],
        "correctAnswer": "Negative even integers: -2, -4, -6...",
        "boilerplate": "",
        "tags": [
          "analytic-number-theory"
        ],
        "hint": "ζ(s) = 0 for s = -2n (n ∈ N)",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Fourier Transform of Gaussian",
        "description": "What is the Fourier transform of a Gaussian function f(x) = e^(-a x²)?",
        "options": [
          "Another Gaussian function",
          "A Cauchy-Lorentz distribution",
          "A Dirac delta pulse",
          "A sinc function"
        ],
        "correctAnswer": "Another Gaussian function",
        "boilerplate": "",
        "tags": [
          "fourier-analysis"
        ],
        "hint": "The Gaussian is an eigenfunction of the Fourier transform",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Euler-Lagrange Equation Variational",
        "description": "In calculus of variations, Euler-Lagrange equation for L(x, y, y’) is:",
        "options": [
          "∂L/∂y - d/dx(∂L/∂y’) = 0",
          "∂L/∂y + d/dx(∂L/∂y’) = 0",
          "d²L/dx² = 0",
          "∂L/∂x - d/dy(∂L/∂y’) = 0"
        ],
        "correctAnswer": "∂L/∂y - d/dx(∂L/∂y’) = 0",
        "boilerplate": "",
        "tags": [
          "calculus-of-variations"
        ],
        "hint": "Fundamental stationary action condition",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Poincare Conjecture Dimension",
        "description": "The Poincaré conjecture proved by Perelman characterizes which manifolds?",
        "options": [
          "Simply connected closed 3-manifolds as 3-spheres",
          "4-dimensional Calabi-Yau spaces",
          "Complex 2-tori",
          "Non-orientable Klein bottles"
        ],
        "correctAnswer": "Simply connected closed 3-manifolds as 3-spheres",
        "boilerplate": "",
        "tags": [
          "differential-topology"
        ],
        "hint": "Every simply connected, closed 3-manifold is homeomorphic to the 3-sphere",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Contour Integral of 1/z",
        "description": "Evaluate ∮ (1/z) dz counter-clockwise along unit circle |z| = 1.",
        "options": [
          "0",
          "π",
          "2πi",
          "4πi"
        ],
        "correctAnswer": "2πi",
        "boilerplate": "",
        "tags": [
          "complex-analysis"
        ],
        "hint": "2πi × Residue at 0 = 2πi(1) = 2πi",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Frobenius Theorem Lie Algebras",
        "description": "Frobenius theorem gives necessary and sufficient conditions for:",
        "options": [
          "Integrability of subbundles / distributions",
          "Solvability of polynomial equations",
          "Convergence of Fourier series",
          "Finiteness of groups"
        ],
        "correctAnswer": "Integrability of subbundles / distributions",
        "boilerplate": "",
        "tags": [
          "differential-geometry"
        ],
        "hint": "Involutive distributions are completely integrable",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Noether Theorem Invariance",
        "description": "According to Noether’s theorem, continuous time translation symmetry leads to conservation of:",
        "options": [
          "Energy",
          "Linear momentum",
          "Angular momentum",
          "Electric charge"
        ],
        "correctAnswer": "Energy",
        "boilerplate": "",
        "tags": [
          "mathematical-physics"
        ],
        "hint": "Time invariance yields energy conservation",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Spectral Theorem for Normal Operators",
        "description": "Every bounded normal operator on Hilbert space can be represented as:",
        "options": [
          "Integral with respect to spectral measure",
          "Finite sum of projections",
          "Strict upper triangular matrix",
          "Nilpotent operator"
        ],
        "correctAnswer": "Integral with respect to spectral measure",
        "boilerplate": "",
        "tags": [
          "functional-analysis"
        ],
        "hint": "Spectral decomposition theorem for Hilbert spaces",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Banach Fixed Point Contraction Mapping",
        "description": "If T: X → X is a contraction mapping on a complete metric space X, how many fixed points does T possess?",
        "options": [
          "Exactly one unique fixed point",
          "At least two fixed points",
          "Infinitely many",
          "Zero if boundary is open"
        ],
        "correctAnswer": "Exactly one unique fixed point",
        "boilerplate": "",
        "tags": [
          "topology"
        ],
        "hint": "Banach contraction theorem guarantees existence and uniqueness",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Navier-Stokes Clay Millenium Dimension",
        "description": "The Clay Millennium Problem for Navier-Stokes equations asks about smooth solutions in:",
        "options": [
          "3-dimensional space",
          "2-dimensional space",
          "4-dimensional spacetime",
          "1-dimensional channel"
        ],
        "correctAnswer": "3-dimensional space",
        "boilerplate": "",
        "tags": [
          "pde"
        ],
        "hint": "Existence and smoothness of Navier-Stokes in 3D is an open Millennium problem",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      }
    ]
  },
  "gk": {
    "beginner": [
      {
        "title": "Mother of Programming Languages",
        "description": "Which programming language is widely referred to as the \"mother of all modern languages\"?",
        "options": [
          "C",
          "Java",
          "Python",
          "Assembly"
        ],
        "correctAnswer": "C",
        "boilerplate": "",
        "tags": [
          "computing",
          "history"
        ],
        "hint": "Created by Dennis Ritchie at Bell Labs in 1972.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "HTTP Full Form",
        "description": "What does HTTP stand for in computer networking?",
        "options": [
          "HyperText Transfer Protocol",
          "High Text Transfer Protocol",
          "Hyperlink Terminal Transport Protocol",
          "Host Text Transfer Protocol"
        ],
        "correctAnswer": "HyperText Transfer Protocol",
        "boilerplate": "",
        "tags": [
          "networking"
        ],
        "hint": "Protocol for transferring hypermedia documents.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Creator of Linux OS",
        "description": "Who developed the Linux operating system kernel in 1991?",
        "options": [
          "Linus Torvalds",
          "Richard Stallman",
          "Steve Jobs",
          "Ken Thompson"
        ],
        "correctAnswer": "Linus Torvalds",
        "boilerplate": "",
        "tags": [
          "os"
        ],
        "hint": "Finnish software engineer.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Capital City of Japan",
        "description": "What is the capital city of Japan?",
        "options": [
          "Kyoto",
          "Osaka",
          "Tokyo",
          "Sapporo"
        ],
        "correctAnswer": "Tokyo",
        "boilerplate": "",
        "tags": [
          "geography"
        ],
        "hint": "Largest metropolitan area in the world.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Chemical Formula for Water",
        "description": "What is the chemical formula for pure water?",
        "options": [
          "H2O",
          "H2O2",
          "CO2",
          "HO2"
        ],
        "correctAnswer": "H2O",
        "boilerplate": "",
        "tags": [
          "chemistry"
        ],
        "hint": "Two hydrogen atoms bonded to one oxygen atom.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "World Wide Web Inventor",
        "description": "Who is recognized as the inventor of the World Wide Web?",
        "options": [
          "Tim Berners-Lee",
          "Vint Cerf",
          "Alan Turing",
          "Bill Gates"
        ],
        "correctAnswer": "Tim Berners-Lee",
        "boilerplate": "",
        "tags": [
          "history",
          "tech"
        ],
        "hint": "Invented it in 1989 at CERN.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Primary Computer Storage Unit",
        "description": "Which computer component is known as volatile temporary memory?",
        "options": [
          "RAM",
          "SSD",
          "ROM",
          "Hard Disk Drive"
        ],
        "correctAnswer": "RAM",
        "boilerplate": "",
        "tags": [
          "hardware"
        ],
        "hint": "Random Access Memory loses contents when powered down.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Largest Planet in Solar System",
        "description": "Which planet is the largest in our solar system by diameter and mass?",
        "options": [
          "Jupiter",
          "Saturn",
          "Neptune",
          "Uranus"
        ],
        "correctAnswer": "Jupiter",
        "boilerplate": "",
        "tags": [
          "astronomy"
        ],
        "hint": "Gas giant with Great Red Spot.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "DNS Resolution Function",
        "description": "What is the primary function of the Domain Name System (DNS)?",
        "options": [
          "Translate domain names to IP addresses",
          "Encrypt web traffic",
          "Store website files",
          "Compress images"
        ],
        "correctAnswer": "Translate domain names to IP addresses",
        "boilerplate": "",
        "tags": [
          "networking"
        ],
        "hint": "Phonebook of the internet.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "First Electronic General-Purpose Computer",
        "description": "Which machine is widely regarded as the first programmable electronic computer?",
        "options": [
          "ENIAC",
          "UNIVAC I",
          "Colossus",
          "Apple I"
        ],
        "correctAnswer": "ENIAC",
        "boilerplate": "",
        "tags": [
          "history"
        ],
        "hint": "Completed in 1945 at University of Pennsylvania.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Hardest Natural Substance",
        "description": "What is the hardest known naturally occurring mineral on Earth?",
        "options": [
          "Diamond",
          "Corundum",
          "Topaz",
          "Quartz"
        ],
        "correctAnswer": "Diamond",
        "boilerplate": "",
        "tags": [
          "geology"
        ],
        "hint": "Scores 10 on Mohs hardness scale.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Standard HTTP Port",
        "description": "What is the default TCP port number used for unencrypted HTTP traffic?",
        "options": [
          "80",
          "443",
          "21",
          "22"
        ],
        "correctAnswer": "80",
        "boilerplate": "",
        "tags": [
          "networking"
        ],
        "hint": "HTTPS uses 443; HTTP uses 80.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Binary Representation of Five",
        "description": "What is the binary representation of decimal number 5?",
        "options": [
          "101",
          "110",
          "011",
          "1001"
        ],
        "correctAnswer": "101",
        "boilerplate": "",
        "tags": [
          "computer-science"
        ],
        "hint": "4 + 0 + 1",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Largest Ocean on Earth",
        "description": "Which ocean covers more than 30% of the Earth’s surface?",
        "options": [
          "Pacific Ocean",
          "Atlantic Ocean",
          "Indian Ocean",
          "Arctic Ocean"
        ],
        "correctAnswer": "Pacific Ocean",
        "boilerplate": "",
        "tags": [
          "geography"
        ],
        "hint": "Contains the Mariana Trench.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Speed of Sound in Air",
        "description": "What is the approximate speed of sound in air at 20°C (at sea level)?",
        "options": [
          "343 m/s",
          "300 m/s",
          "1,500 m/s",
          "3×10⁸ m/s"
        ],
        "correctAnswer": "343 m/s",
        "boilerplate": "",
        "tags": [
          "physics"
        ],
        "hint": "Roughly 1,235 km/h or 767 mph.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Python Language Creator",
        "description": "Who created the Python programming language and released it in 1991?",
        "options": [
          "Guido van Rossum",
          "Bjarne Stroustrup",
          "James Gosling",
          "Brendan Eich"
        ],
        "correctAnswer": "Guido van Rossum",
        "boilerplate": "",
        "tags": [
          "programming"
        ],
        "hint": "Benevolent Dictator for Life until 2018.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Number of Bones in Adult Body",
        "description": "How many bones are there in an adult human skeleton?",
        "options": [
          "206",
          "214",
          "198",
          "250"
        ],
        "correctAnswer": "206",
        "boilerplate": "",
        "tags": [
          "biology"
        ],
        "hint": "Infants have ~270 which fuse as they grow.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Git Version Control Creator",
        "description": "Who designed and developed the Git version control system in 2005?",
        "options": [
          "Linus Torvalds",
          "Satoshi Nakamoto",
          "Ken Thompson",
          "Rob Pike"
        ],
        "correctAnswer": "Linus Torvalds",
        "boilerplate": "",
        "tags": [
          "tools"
        ],
        "hint": "Created to manage Linux kernel development.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Photosynthesis Gas Product",
        "description": "Which gas is released into the atmosphere as a byproduct of plant photosynthesis?",
        "options": [
          "Oxygen",
          "Carbon Dioxide",
          "Nitrogen",
          "Methane"
        ],
        "correctAnswer": "Oxygen",
        "boilerplate": "",
        "tags": [
          "biology"
        ],
        "hint": "Essential for aerobic respiration.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "ASCII Full Form",
        "description": "What does ASCII stand for in computing standards?",
        "options": [
          "American Standard Code for Information Interchange",
          "Advanced Standard Coding for International Information",
          "Automated Standard Computer Interface Protocol",
          "Applied Software Code for Information Integration"
        ],
        "correctAnswer": "American Standard Code for Information Interchange",
        "boilerplate": "",
        "tags": [
          "standards"
        ],
        "hint": "7-bit character encoding standard.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      }
    ],
    "intermediate": [
      {
        "title": "LIFO Data Structure",
        "description": "Which fundamental data structure operates strictly in Last-In First-Out (LIFO) order?",
        "options": [
          "Stack",
          "Queue",
          "Linked List",
          "Binary Tree"
        ],
        "correctAnswer": "Stack",
        "boilerplate": "",
        "tags": [
          "data-structures"
        ],
        "hint": "Plates stacked on top of each other.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "SQL Database Acronym",
        "description": "What does the abbreviation SQL represent in relational databases?",
        "options": [
          "Structured Query Language",
          "Simple Question Language",
          "System Query Logic",
          "Standard Quality Language"
        ],
        "correctAnswer": "Structured Query Language",
        "boilerplate": "",
        "tags": [
          "databases"
        ],
        "hint": "Developed at IBM by Boyce and Chamberlin.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Speed of Light in Vacuum",
        "description": "What is the precise speed of light in vacuum (c)?",
        "options": [
          "299,792,458 m/s",
          "300,000,000 m/s",
          "186,000 m/s",
          "280,000,000 m/s"
        ],
        "correctAnswer": "299,792,458 m/s",
        "boilerplate": "",
        "tags": [
          "physics"
        ],
        "hint": "Defined as an exact SI constant.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "OSI Model Layers Count",
        "description": "How many distinct layers are defined in the ISO Open Systems Interconnection (OSI) reference model?",
        "options": [
          "7",
          "4",
          "5",
          "8"
        ],
        "correctAnswer": "7",
        "boilerplate": "",
        "tags": [
          "networking"
        ],
        "hint": "Physical, Data Link, Network, Transport, Session, Presentation, Application.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "JavaScript Creator and Year",
        "description": "Who invented JavaScript in 1995 while working at Netscape?",
        "options": [
          "Brendan Eich",
          "Douglas Crockford",
          "Marc Andreessen",
          "Larry Wall"
        ],
        "correctAnswer": "Brendan Eich",
        "boilerplate": "",
        "tags": [
          "programming"
        ],
        "hint": "Developed Mocha/LiveScript in 10 days.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "ACID Properties in Databases",
        "description": "In database transaction management, what does the letter \"I\" in ACID stand for?",
        "options": [
          "Isolation",
          "Integrity",
          "Indexing",
          "Immutability"
        ],
        "correctAnswer": "Isolation",
        "boilerplate": "",
        "tags": [
          "databases"
        ],
        "hint": "Atomicity, Consistency, Isolation, Durability.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Moore Law Observation",
        "description": "According to Gordon Moore’s 1965 observation, transistor count on integrated circuits doubles approximately every:",
        "options": [
          "2 years",
          "6 months",
          "5 years",
          "10 years"
        ],
        "correctAnswer": "2 years",
        "boilerplate": "",
        "tags": [
          "hardware"
        ],
        "hint": "Historically observed between 18 and 24 months.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "TCP Handshake Stages",
        "description": "How many packets are exchanged in a standard TCP connection establishment handshake?",
        "options": [
          "3",
          "2",
          "4",
          "5"
        ],
        "correctAnswer": "3",
        "boilerplate": "",
        "tags": [
          "networking"
        ],
        "hint": "SYN, SYN-ACK, ACK.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "SSH Port Number",
        "description": "What is standard default port used for Secure Shell (SSH) communication?",
        "options": [
          "22",
          "21",
          "23",
          "25"
        ],
        "correctAnswer": "22",
        "boilerplate": "",
        "tags": [
          "security"
        ],
        "hint": "Telnet is 23; SSH is 22.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Father of Artificial Intelligence",
        "description": "Who coined the term \"Artificial Intelligence\" at the 1956 Dartmouth conference?",
        "options": [
          "John McCarthy",
          "Marvin Minsky",
          "Alan Turing",
          "Claude Shannon"
        ],
        "correctAnswer": "John McCarthy",
        "boilerplate": "",
        "tags": [
          "ai"
        ],
        "hint": "Also invented Lisp.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Big-O QuickSort Worst Case",
        "description": "What is the worst-case time complexity of standard QuickSort without randomized pivot selection?",
        "options": [
          "O(n²)",
          "O(n log n)",
          "O(n)",
          "O(2^n)"
        ],
        "correctAnswer": "O(n²)",
        "boilerplate": "",
        "tags": [
          "algorithms"
        ],
        "hint": "Occurs when array is already sorted and first/last element is pivot.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "First Commercial Web Browser",
        "description": "Which web browser pioneered commercial GUI browsing following NCSA Mosaic?",
        "options": [
          "Netscape Navigator",
          "Internet Explorer",
          "Opera",
          "Lynx"
        ],
        "correctAnswer": "Netscape Navigator",
        "boilerplate": "",
        "tags": [
          "tech-history"
        ],
        "hint": "Released by Marc Andreessen and Jim Clark in 1994.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "IPv4 Address Bit Length",
        "description": "How many total bits make up a standard IPv4 address?",
        "options": [
          "32 bits",
          "64 bits",
          "128 bits",
          "16 bits"
        ],
        "correctAnswer": "32 bits",
        "boilerplate": "",
        "tags": [
          "networking"
        ],
        "hint": "Four octets (4 × 8 = 32).",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Asymmetric Cryptography Key Pair",
        "description": "Public key cryptography relies on which combination of keys?",
        "options": [
          "A public key and a private key",
          "Two identical shared secret keys",
          "A hash and a seed",
          "A salt and an IV"
        ],
        "correctAnswer": "A public key and a private key",
        "boilerplate": "",
        "tags": [
          "cryptography"
        ],
        "hint": "Diffie-Hellman and RSA foundation.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Absolute Zero Temperature",
        "description": "What is absolute zero temperature on the Celsius scale?",
        "options": [
          "-273.15°C",
          "-200°C",
          "-459.67°C",
          "-373.15°C"
        ],
        "correctAnswer": "-273.15°C",
        "boilerplate": "",
        "tags": [
          "physics"
        ],
        "hint": "Corresponds to 0 Kelvin.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Docker Container Engine Base",
        "description": "Docker containers share which component with the host system?",
        "options": [
          "The host OS kernel",
          "Full hardware hypervisor",
          "BIOS and firmware",
          "Guest OS virtual disk"
        ],
        "correctAnswer": "The host OS kernel",
        "boilerplate": "",
        "tags": [
          "devops"
        ],
        "hint": "Unlike VMs, containers use cgroups and namespaces in the shared kernel.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "UNIX Epoch Start Date",
        "description": "When does the UNIX epoch timestamp (time = 0) begin?",
        "options": [
          "January 1, 1970 00:00:00 UTC",
          "January 1, 1980 00:00:00 UTC",
          "December 31, 1969 00:00:00 UTC",
          "January 1, 2000 00:00:00 UTC"
        ],
        "correctAnswer": "January 1, 1970 00:00:00 UTC",
        "boilerplate": "",
        "tags": [
          "computing"
        ],
        "hint": "Standard POSIX reference time.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Planet with Most Confirmed Moons",
        "description": "Which planet currently holds the record for most verified moons in our solar system?",
        "options": [
          "Saturn",
          "Jupiter",
          "Uranus",
          "Neptune"
        ],
        "correctAnswer": "Saturn",
        "boilerplate": "",
        "tags": [
          "astronomy"
        ],
        "hint": "Saturn has over 140 discovered moons.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Git Merge vs Rebase Difference",
        "description": "What does git rebase accomplish compared to git merge?",
        "options": [
          "Rewrites commit history by moving base to latest target commit",
          "Creates a 3-way merge commit preserving branch topology",
          "Deletes commits from remote repository",
          "Reverts all unstaged changes"
        ],
        "correctAnswer": "Rewrites commit history by moving base to latest target commit",
        "boilerplate": "",
        "tags": [
          "git"
        ],
        "hint": "Produces a linear commit history.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Redis In-Memory Architecture",
        "description": "Redis is primarily categorized as which type of database store?",
        "options": [
          "In-memory key-value data structure store",
          "Document-oriented column store",
          "Graph relationship database",
          "Relational SQL engine"
        ],
        "correctAnswer": "In-memory key-value data structure store",
        "boilerplate": "",
        "tags": [
          "databases"
        ],
        "hint": "Remote Dictionary Server with RAM persistence.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      }
    ],
    "advanced": [
      {
        "title": "Backpropagation Algorithm Core",
        "description": "What mathematical principle does backpropagation in neural networks use to calculate gradients?",
        "options": [
          "Chain rule of calculus",
          "Monte Carlo sampling",
          "Taylor series remainder",
          "Markov decision process"
        ],
        "correctAnswer": "Chain rule of calculus",
        "boilerplate": "",
        "tags": [
          "ai",
          "machine-learning"
        ],
        "hint": "Propagates error backwards through successive layers using the chain rule.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Bitcoin Consensus Mechanism",
        "description": "Which consensus mechanism was introduced by Satoshi Nakamoto in the 2008 Bitcoin whitepaper?",
        "options": [
          "Proof of Work (PoW)",
          "Proof of Stake (PoS)",
          "Practical Byzantine Fault Tolerance",
          "Proof of History (PoH)"
        ],
        "correctAnswer": "Proof of Work (PoW)",
        "boilerplate": "",
        "tags": [
          "blockchain"
        ],
        "hint": "Miners solve SHA-256 hash puzzles under dynamic difficulty.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Man-in-the-Middle Attack",
        "description": "An attack where an adversary secretly relays and alters communications between two trusting parties is called:",
        "options": [
          "Man-in-the-Middle (MitM)",
          "SQL Injection",
          "Cross-Site Scripting (XSS)",
          "Distributed Denial of Service"
        ],
        "correctAnswer": "Man-in-the-Middle (MitM)",
        "boilerplate": "",
        "tags": [
          "cybersecurity"
        ],
        "hint": "Prevented by mutual TLS and certificate verification.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "CAP Theorem Principles",
        "description": "According to Eric Brewer’s CAP theorem, a distributed data store can guarantee at most two of which three guarantees?",
        "options": [
          "Consistency, Availability, Partition Tolerance",
          "Concurrency, Atomicity, Performance",
          "Caching, Authentication, Persistence",
          "Capacity, Accuracy, Protection"
        ],
        "correctAnswer": "Consistency, Availability, Partition Tolerance",
        "boilerplate": "",
        "tags": [
          "distributed-systems"
        ],
        "hint": "In network partitions (P), systems choose between C and A.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "IPv6 Address Length",
        "description": "How many bits long is an IPv6 network address?",
        "options": [
          "128 bits",
          "64 bits",
          "256 bits",
          "512 bits"
        ],
        "correctAnswer": "128 bits",
        "boilerplate": "",
        "tags": [
          "networking"
        ],
        "hint": "Represented as 8 hexadecimal groups of 16 bits each.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "BGP Routing Protocol Role",
        "description": "What is the role of the Border Gateway Protocol (BGP) in the global internet infrastructure?",
        "options": [
          "Route traffic between Autonomous Systems (AS) across the internet",
          "Assign local IP addresses to WiFi clients",
          "Encrypt HTTP payloads inside browser tabs",
          "Format email messages via SMTP"
        ],
        "correctAnswer": "Route traffic between Autonomous Systems (AS) across the internet",
        "boilerplate": "",
        "tags": [
          "networking"
        ],
        "hint": "De facto standard exterior gateway protocol.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "RSA Encryption Mathematical Foundation",
        "description": "The security of RSA asymmetric encryption is based on the computational difficulty of:",
        "options": [
          "Factoring large semiprime integers",
          "Discrete logarithm on elliptic curves",
          "Finding shortest lattice vectors",
          "Solving traveling salesperson problem"
        ],
        "correctAnswer": "Factoring large semiprime integers",
        "boilerplate": "",
        "tags": [
          "cryptography"
        ],
        "hint": "Multiplying two large primes is easy; factoring their product is hard.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Attention Mechanism Paper",
        "description": "Which landmark 2017 Google Research paper introduced the Transformer neural network architecture?",
        "options": [
          "Attention Is All You Need",
          "Deep Residual Learning",
          "Generative Adversarial Nets",
          "Mastering the Game of Go"
        ],
        "correctAnswer": "Attention Is All You Need",
        "boilerplate": "",
        "tags": [
          "ai"
        ],
        "hint": "Authored by Vaswani et al.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "CORS Security Header",
        "description": "Which HTTP response header tells the browser which origins are allowed to read a resource?",
        "options": [
          "Access-Control-Allow-Origin",
          "X-Frame-Options",
          "Strict-Transport-Security",
          "Content-Security-Policy"
        ],
        "correctAnswer": "Access-Control-Allow-Origin",
        "boilerplate": "",
        "tags": [
          "web-security"
        ],
        "hint": "Standard CORS header matching requesting origin or *.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Turing Machine Halting Problem",
        "description": "What did Alan Turing prove in 1936 regarding the Halting Problem?",
        "options": [
          "It is undecidable by any general algorithm",
          "It is solvable in polynomial time O(n³)",
          "It requires quantum computing to solve",
          "It can only halt if memory is infinite"
        ],
        "correctAnswer": "It is undecidable by any general algorithm",
        "boilerplate": "",
        "tags": [
          "theory-of-computation"
        ],
        "hint": "No program can determine whether an arbitrary program terminates.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Database B-Tree Index Complexity",
        "description": "What is the search time complexity of a balanced B-Tree index with N records?",
        "options": [
          "O(log N)",
          "O(1)",
          "O(N)",
          "O(N log N)"
        ],
        "correctAnswer": "O(log N)",
        "boilerplate": "",
        "tags": [
          "databases"
        ],
        "hint": "Logarithmic height enables rapid disk seeks.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "CPU Cache Hierarchy Order",
        "description": "Which order correctly ranks CPU caches from smallest/fastest to largest/slower?",
        "options": [
          "L1 Cache → L2 Cache → L3 Cache → Main RAM",
          "L3 → L2 → L1 → RAM",
          "RAM → L1 → L2 → L3",
          "L1 → RAM → L2 → L3"
        ],
        "correctAnswer": "L1 Cache → L2 Cache → L3 Cache → Main RAM",
        "boilerplate": "",
        "tags": [
          "hardware"
        ],
        "hint": "L1 is split into instruction and data caches on-die.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Kubernetes Control Plane Component",
        "description": "Which Kubernetes control plane component acts as the distributed key-value store for cluster state?",
        "options": [
          "etcd",
          "kube-apiserver",
          "kube-scheduler",
          "kubelet"
        ],
        "correctAnswer": "etcd",
        "boilerplate": "",
        "tags": [
          "cloud",
          "devops"
        ],
        "hint": "Consistent and highly available key-value store using Raft.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "SHA-256 Output Bit Size",
        "description": "How many bytes does the SHA-256 cryptographic hash function output?",
        "options": [
          "32 bytes",
          "64 bytes",
          "16 bytes",
          "128 bytes"
        ],
        "correctAnswer": "32 bytes",
        "boilerplate": "",
        "tags": [
          "cryptography"
        ],
        "hint": "256 bits / 8 = 32 bytes (64 hexadecimal characters).",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "TCP vs UDP Header Overhead",
        "description": "What are the minimal header sizes of UDP and standard TCP packets without options?",
        "options": [
          "8 bytes for UDP, 20 bytes for TCP",
          "20 bytes for UDP, 8 bytes for TCP",
          "16 bytes for both",
          "4 bytes for UDP, 32 bytes for TCP"
        ],
        "correctAnswer": "8 bytes for UDP, 20 bytes for TCP",
        "boilerplate": "",
        "tags": [
          "networking"
        ],
        "hint": "UDP has only 4 fields (src port, dst port, length, checksum = 8 bytes).",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      }
    ],
    "expert": [
      {
        "title": "Quantum Qubit Superposition",
        "description": "What property allows a quantum bit (qubit) to represent linear combinations of |0⟩ and |1⟩ states simultaneously?",
        "options": [
          "Quantum Superposition",
          "Quantum Decoherence",
          "Pauli Exclusion",
          "Quantum Tunneling"
        ],
        "correctAnswer": "Quantum Superposition",
        "boilerplate": "",
        "tags": [
          "quantum-computing"
        ],
        "hint": "State is represented by |ψ⟩ = α|0⟩ + β|1⟩.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Compiler Syntax vs Lexical Analysis",
        "description": "Which compiler phase converts a linear stream of tokens into an Abstract Syntax Tree (AST)?",
        "options": [
          "Syntax Analysis (Parser)",
          "Lexical Analysis (Scanner)",
          "Semantic Analysis",
          "Intermediate Code Generator"
        ],
        "correctAnswer": "Syntax Analysis (Parser)",
        "boilerplate": "",
        "tags": [
          "compilers"
        ],
        "hint": "Constructs parse trees using context-free grammar.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Raft Consensus Algorithm Leader Election",
        "description": "In the Raft consensus algorithm, what role does a server take when its election timeout elapses?",
        "options": [
          "Candidate",
          "Leader",
          "Follower",
          "Proposer"
        ],
        "correctAnswer": "Candidate",
        "boilerplate": "",
        "tags": [
          "distributed-systems"
        ],
        "hint": "Increments current term and votes for itself as candidate.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Branch Predictor Speculative Execution",
        "description": "Which major hardware vulnerabilities exploited speculative execution and CPU branch predictor caches in 2018?",
        "options": [
          "Spectre and Meltdown",
          "Heartbleed and Shellshock",
          "Stuxnet and Flame",
          "WannaCry and Petya"
        ],
        "correctAnswer": "Spectre and Meltdown",
        "boilerplate": "",
        "tags": [
          "security",
          "hardware"
        ],
        "hint": "Side-channel microarchitectural cache timing attacks.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Shannon Channel Capacity Theorem",
        "description": "Shannon’s formula C = B log₂(1 + S/N) defines theoretical maximum rate for:",
        "options": [
          "Error-free data transmission over a noisy analog channel",
          "Lossless image compression ratio",
          "Quantum entanglement bandwidth",
          "Disk write throughput"
        ],
        "correctAnswer": "Error-free data transmission over a noisy analog channel",
        "boilerplate": "",
        "tags": [
          "information-theory"
        ],
        "hint": "Published by Claude Shannon in 1948.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Zero-Knowledge Proof Definition",
        "description": "What is the key guarantee of a Zero-Knowledge Proof (ZKP)?",
        "options": [
          "Prover proves a statement is true without revealing any secret information beyond validity",
          "Verification requires zero network packets",
          "Keys are generated with zero entropy",
          "Decryption is impossible even by the sender"
        ],
        "correctAnswer": "Prover proves a statement is true without revealing any secret information beyond validity",
        "boilerplate": "",
        "tags": [
          "cryptography"
        ],
        "hint": "Used in zk-SNARKs and modern privacy systems.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "RISC vs CISC Architecture Difference",
        "description": "Which characteristic differentiates RISC (e.g. ARM) from CISC (e.g. x86)?",
        "options": [
          "RISC uses uniform single-cycle instructions with load-store architecture",
          "RISC requires more transistors per chip than CISC",
          "CISC does not support hardware floating point",
          "RISC cannot execute compiled C code"
        ],
        "correctAnswer": "RISC uses uniform single-cycle instructions with load-store architecture",
        "boilerplate": "",
        "tags": [
          "hardware"
        ],
        "hint": "Reduced Instruction Set Computer emphasizes simple pipelined instructions.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Garbage Collection Generational Hypothesis",
        "description": "What empirical observation underlies generational garbage collectors in V8 and the JVM?",
        "options": [
          "Most created objects die young (short lifespans)",
          "Large objects are never deallocated",
          "Circular references cannot be detected",
          "Memory allocation is strictly sequential"
        ],
        "correctAnswer": "Most created objects die young (short lifespans)",
        "boilerplate": "",
        "tags": [
          "runtimes"
        ],
        "hint": "Divides heap into Young (Nursery) and Tenured generations.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Diffie-Hellman Key Exchange Foundation",
        "description": "What hard mathematical problem secures classic Diffie-Hellman key exchange?",
        "options": [
          "Discrete Logarithm Problem in cyclic groups",
          "Shortest Vector Problem in lattices",
          "Knapsack subset sum problem",
          "Matrix inversion over real numbers"
        ],
        "correctAnswer": "Discrete Logarithm Problem in cyclic groups",
        "boilerplate": "",
        "tags": [
          "cryptography"
        ],
        "hint": "Given g^a mod p and g^b mod p, finding g^(ab) mod p is computationally intractable.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Byzantine Fault Tolerance Threshold",
        "description": "In an asynchronous distributed network with f Byzantine faulty nodes, how many total nodes 3f+1 are required?",
        "options": [
          "At least 3f + 1 nodes",
          "At least 2f + 1 nodes",
          "At least f + 1 nodes",
          "At least 4f + 1 nodes"
        ],
        "correctAnswer": "At least 3f + 1 nodes",
        "boilerplate": "",
        "tags": [
          "distributed-systems"
        ],
        "hint": "Lamport, Shostak, and Pease 1982 paper.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "TLS 1.3 Handshake Round Trips",
        "description": "How many round trips (RTT) are required for a standard TLS 1.3 handshake to establish encryption keys?",
        "options": [
          "1-RTT (or 0-RTT for resumed sessions)",
          "2-RTT mandatory",
          "3-RTT",
          "4-RTT with Diffie-Hellman"
        ],
        "correctAnswer": "1-RTT (or 0-RTT for resumed sessions)",
        "boilerplate": "",
        "tags": [
          "networking",
          "security"
        ],
        "hint": "TLS 1.2 required 2-RTT; TLS 1.3 reduced it to 1-RTT.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Database MVCC Concurrency",
        "description": "What does Multi-Version Concurrency Control (MVCC) eliminate during concurrent read operations?",
        "options": [
          "Readers never block writers and writers never block readers",
          "Deadlocks are mathematically impossible in all transactions",
          "Disk writes are completely avoided",
          "Serializability is achieved without timestamps"
        ],
        "correctAnswer": "Readers never block writers and writers never block readers",
        "boilerplate": "",
        "tags": [
          "databases"
        ],
        "hint": "Used in PostgreSQL and InnoDB to provide snapshot isolation.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Chomsky Hierarchy Grammars",
        "description": "Which class in the Chomsky hierarchy defines languages accepted by Deterministic Finite Automata (DFA)?",
        "options": [
          "Type-3 (Regular Grammars)",
          "Type-2 (Context-Free Grammars)",
          "Type-1 (Context-Sensitive)",
          "Type-0 (Unrestricted)"
        ],
        "correctAnswer": "Type-3 (Regular Grammars)",
        "boilerplate": "",
        "tags": [
          "theory-of-computation"
        ],
        "hint": "Regular expressions and finite automata correspond to Type 3.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "HTTP/3 Transport Protocol Base",
        "description": "Unlike HTTP/2 which runs over TCP, HTTP/3 runs on top of which transport protocol?",
        "options": [
          "QUIC (over UDP)",
          "Raw IP datagrams",
          "SCTP over TLS",
          "WebSockets"
        ],
        "correctAnswer": "QUIC (over UDP)",
        "boilerplate": "",
        "tags": [
          "networking"
        ],
        "hint": "Eliminates Head-of-Line blocking at transport layer using QUIC.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Vector Clocks in Distributed Systems",
        "description": "What do Vector Clocks guarantee that scalar Lamport timestamps cannot?",
        "options": [
          "Detect causal concurrency (identify independent concurrent events)",
          "Synchronize physical atomic clocks across nodes",
          "Guarantee zero packet loss",
          "Prevent network partitions"
        ],
        "correctAnswer": "Detect causal concurrency (identify independent concurrent events)",
        "boilerplate": "",
        "tags": [
          "distributed-systems"
        ],
        "hint": "Allows determining whether one event happened before another or if they are concurrent.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      }
    ],
    "master": [
      {
        "title": "Shannon Entropy Equation",
        "description": "What is the formula for the Shannon entropy H(X) of a discrete random variable X?",
        "options": [
          "-∑ P(x) log₂ P(x)",
          "∑ P(x)²",
          "log₂(∑ 1/P(x))",
          "1 - ∑ P(x)"
        ],
        "correctAnswer": "-∑ P(x) log₂ P(x)",
        "boilerplate": "",
        "tags": [
          "information-theory"
        ],
        "hint": "Measures expected information content in bits.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "P vs NP Core Question",
        "description": "What does the millennium prize problem \"Does P = NP?\" ask?",
        "options": [
          "Can every problem whose solution can be verified in polynomial time also be solved in polynomial time?",
          "Are non-deterministic Turing machines faster than quantum computers?",
          "Can all exponential time problems be factored into primes?",
          "Are parallel computers strictly more expressive than sequential Turing machines?"
        ],
        "correctAnswer": "Can every problem whose solution can be verified in polynomial time also be solved in polynomial time?",
        "boilerplate": "",
        "tags": [
          "computational-complexity"
        ],
        "hint": "P is polynomial-time solvable; NP is polynomial-time verifiable.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Two-Phase Commit Vulnerability",
        "description": "What is the primary vulnerability of the classic 2-Phase Commit (2PC) protocol?",
        "options": [
          "Coordinator failure can cause participant nodes to block indefinitely",
          "Data is written unencrypted to disk",
          "Network overhead scales exponentially O(2^N)",
          "Transaction rollbacks are mathematically prohibited"
        ],
        "correctAnswer": "Coordinator failure can cause participant nodes to block indefinitely",
        "boilerplate": "",
        "tags": [
          "distributed-systems"
        ],
        "hint": "2PC is a blocking protocol.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Linearizability vs Serializability",
        "description": "What is the key difference between Linearizability and Serializability?",
        "options": [
          "Linearizability applies to single operations with real-time constraints; Serializability applies to multi-operation transactions",
          "Linearizability is strictly weaker than Eventual Consistency",
          "Serializability requires physical atomic clocks like GPS",
          "Linearizability cannot be implemented in distributed databases"
        ],
        "correctAnswer": "Linearizability applies to single operations with real-time constraints; Serializability applies to multi-operation transactions",
        "boilerplate": "",
        "tags": [
          "distributed-systems"
        ],
        "hint": "Linearizability is a composable real-time property; serializability is a transaction ordering property.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Homomorphic Encryption Advantage",
        "description": "What is the defining capability of Fully Homomorphic Encryption (FHE)?",
        "options": [
          "Allows arbitrary computations directly on ciphertext without decrypting",
          "Decrypts messages instantaneously using quantum keys",
          "Guarantees zero power consumption on mobile devices",
          "Encrypts data without using mathematical keys"
        ],
        "correctAnswer": "Allows arbitrary computations directly on ciphertext without decrypting",
        "boilerplate": "",
        "tags": [
          "cryptography"
        ],
        "hint": "Gentry showed the first construction in 2009.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Spectre CPU Gadget Exploitation",
        "description": "What is a \"gadget\" in Spectre speculative execution attacks?",
        "options": [
          "A sequence of instructions in victim code that leaks data into CPU cache during speculative misprediction",
          "A physical probe connected to motherboard traces",
          "A corrupted transistor inside the ALU",
          "A custom kernel module executing in ring 0"
        ],
        "correctAnswer": "A sequence of instructions in victim code that leaks data into CPU cache during speculative misprediction",
        "boilerplate": "",
        "tags": [
          "security",
          "hardware"
        ],
        "hint": "Speculatively accesses unauthorized memory and creates cache footprint.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Church-Turing Thesis Statement",
        "description": "What does the Church-Turing thesis state about effective computability?",
        "options": [
          "Any function computable by an algorithm can be computed by a Turing Machine",
          "Quantum computers can compute uncomputable functions",
          "Lambda calculus is strictly less expressive than Turing machines",
          "All recursive sets are finite"
        ],
        "correctAnswer": "Any function computable by an algorithm can be computed by a Turing Machine",
        "boilerplate": "",
        "tags": [
          "theory-of-computation"
        ],
        "hint": "Equivalence of Turing machines, lambda calculus, and partial recursive functions.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "MESI Cache Coherence Protocol States",
        "description": "What do the letters M-E-S-I stand for in multi-core CPU cache coherence?",
        "options": [
          "Modified, Exclusive, Shared, Invalid",
          "Managed, Encrypted, Staged, Indexed",
          "Master, Edge, Slave, Interleaved",
          "Mapped, Executed, Suspended, Isolated"
        ],
        "correctAnswer": "Modified, Exclusive, Shared, Invalid",
        "boilerplate": "",
        "tags": [
          "hardware"
        ],
        "hint": "Four states of a cache line in snooping-based cache coherence.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Zero Knowledge SNARK Acronym",
        "description": "What does SNARK stand for in zero-knowledge cryptography?",
        "options": [
          "Succinct Non-Interactive Argument of Knowledge",
          "Secure Non-Asymmetric Recursive Key",
          "Simple Network Authentication Route Kernel",
          "Symmetric Node Attestation Registry Key"
        ],
        "correctAnswer": "Succinct Non-Interactive Argument of Knowledge",
        "boilerplate": "",
        "tags": [
          "cryptography"
        ],
        "hint": "Proof is small and quickly verifiable without back-and-forth communication.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Rice Theorem Decidability",
        "description": "What is the consequence of Rice’s Theorem in theoretical computer science?",
        "options": [
          "Any non-trivial semantic property of programs is undecidable",
          "Every algorithm has O(N log N) lower bound",
          "NP-complete problems can be reduced to 3-SAT",
          "Context-free grammars cannot parse natural language"
        ],
        "correctAnswer": "Any non-trivial semantic property of programs is undecidable",
        "boilerplate": "",
        "tags": [
          "theory-of-computation"
        ],
        "hint": "You cannot write an algorithm that decides whether an arbitrary program computes a specific mathematical function.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      }
    ],
    "grandmaster": [
      {
        "title": "Quantum Key Distribution BB84 Protocol",
        "description": "What prevents an eavesdropper (Eve) from intercepting photons undetected in BB84 protocol?",
        "options": [
          "No-Cloning Theorem and wave function collapse upon measurement",
          "RSA 4096-bit mathematical encryption",
          "Speed of light transit time delay",
          "Photon polarization absorption in vacuum"
        ],
        "correctAnswer": "No-Cloning Theorem and wave function collapse upon measurement",
        "boilerplate": "",
        "tags": [
          "quantum-cryptography"
        ],
        "hint": "Measuring quantum state inevitably disturbs it and creates detectable error rate.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Nash Equilibrium Existence Proof",
        "description": "John Nash proved the existence of equilibria in finite non-cooperative games using which topological fixed point theorem?",
        "options": [
          "Kakutani (or Brouwer) Fixed Point Theorem",
          "Banach Contraction Mapping Theorem",
          "Poincaré-Bendixson Theorem",
          "Atiyah-Singer Index Theorem"
        ],
        "correctAnswer": "Kakutani (or Brouwer) Fixed Point Theorem",
        "boilerplate": "",
        "tags": [
          "game-theory"
        ],
        "hint": "Uses set-valued best response correspondence on compact convex strategy simplices.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Curry-Howard Isomorphism",
        "description": "What deep correspondence does the Curry-Howard isomorphism establish?",
        "options": [
          "Equivalence between formal proof systems and computer programs (types as propositions, programs as proofs)",
          "Equivalence between Turing machines and register machines",
          "Equivalence between relational algebra and first-order logic",
          "Equivalence between discrete logarithms and prime factorization"
        ],
        "correctAnswer": "Equivalence between formal proof systems and computer programs (types as propositions, programs as proofs)",
        "boilerplate": "",
        "tags": [
          "type-theory"
        ],
        "hint": "A proof of proposition A is a program of type A.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Shor Algorithm Quantum Speedup",
        "description": "Peter Shor’s quantum algorithm achieves polynomial time prime factorization by reducing factoring to:",
        "options": [
          "Period-finding of a function using Quantum Fourier Transform",
          "Brute force trial division in parallel quantum universes",
          "Simulated quantum annealing on Ising spin glasses",
          "Sorting random permutations in O(1) time"
        ],
        "correctAnswer": "Period-finding of a function using Quantum Fourier Transform",
        "boilerplate": "",
        "tags": [
          "quantum-algorithms"
        ],
        "hint": "Finds period r of f(x) = a^x mod N in O((log N)³) quantum operations.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Post-Quantum Cryptography Lattice Base",
        "description": "Why are lattice-based cryptographic algorithms (like CRYSTALS-Kyber and Dilithium) believed resistant to quantum computers?",
        "options": [
          "Shortest Vector Problem (SVP) in high-dimensional lattices does not have known polynomial-time quantum algorithms",
          "Lattices cannot be represented on quantum Turing machines",
          "Quantum states cannot entangle more than 2 lattice dimensions",
          "Lattice keys mutate faster than Grover search speed"
        ],
        "correctAnswer": "Shortest Vector Problem (SVP) in high-dimensional lattices does not have known polynomial-time quantum algorithms",
        "boilerplate": "",
        "tags": [
          "post-quantum-cryptography"
        ],
        "hint": "NIST selected lattice-based cryptography for post-quantum standards.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Godel Incompleteness Theorem Formulation",
        "description": "Gödel’s First Incompleteness Theorem states that any consistent formal system capable of basic arithmetic is:",
        "options": [
          "Incomplete: there exist true statements that cannot be proved within the system",
          "Inconsistent: false statements can always be derived after finite steps",
          "Decidable by an oracle machine with finite depth",
          "Isomorphic to finite state machines"
        ],
        "correctAnswer": "Incomplete: there exist true statements that cannot be proved within the system",
        "boilerplate": "",
        "tags": [
          "mathematical-logic"
        ],
        "hint": "Constructs the self-referential sentence: \"This statement is not provable in this system\".",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "FLP Impossibility Theorem Condition",
        "description": "What did Fischer, Lynch, and Paterson (FLP) prove in 1985 about consensus in asynchronous systems?",
        "options": [
          "No deterministic consensus protocol can guarantee safety and liveness if even a single process can crash unannounced",
          "Byzantine agreement requires at least 10 rounds of communication",
          "Atomic broadcast cannot tolerate network partitions",
          "Distributed locks require synchronized GPS clocks"
        ],
        "correctAnswer": "No deterministic consensus protocol can guarantee safety and liveness if even a single process can crash unannounced",
        "boilerplate": "",
        "tags": [
          "distributed-systems"
        ],
        "hint": "Fundamental limit of asynchronous distributed consensus.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Information-Theoretic Secret Sharing",
        "description": "Shamir’s (k, n) Secret Sharing scheme relies on which algebraic property?",
        "options": [
          "k points uniquely determine a polynomial of degree k - 1 over a finite field",
          "Prime factorization of n bit integers",
          "Discrete logarithm hardness on elliptic curves",
          "Orthogonal matrix decomposition in vector spaces"
        ],
        "correctAnswer": "k points uniquely determine a polynomial of degree k - 1 over a finite field",
        "boilerplate": "",
        "tags": [
          "cryptography"
        ],
        "hint": "Any k shares reconstruct secret; k-1 shares provide zero information.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Chaitin Constant Omega Incomputability",
        "description": "What is Chaitin’s constant Ω (the halting probability of a universal prefix-free Turing machine)?",
        "options": [
          "Maximally dense, algorithmically random, and non-computable real number",
          "Rational fraction between 0.5 and 0.75",
          "Zero in all standard model universes",
          "Solvable using hypercomputation with ordinal limits"
        ],
        "correctAnswer": "Maximally dense, algorithmically random, and non-computable real number",
        "boilerplate": "",
        "tags": [
          "algorithmic-information-theory"
        ],
        "hint": "Knowing the first N bits of Ω solves the halting problem for all programs up to length N.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Landauer Principle Thermodynamic Bound",
        "description": "Landauer’s principle states that erasing 1 bit of physical information must dissipate at minimum how much heat energy?",
        "options": [
          "k_B · T · ln(2)",
          "h · c / λ",
          "1/2 m v²",
          "k_B · T²"
        ],
        "correctAnswer": "k_B · T · ln(2)",
        "boilerplate": "",
        "tags": [
          "physics-of-computation"
        ],
        "hint": "Irreversible information erasure carries a fundamental thermodynamic cost.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      }
    ]
  },
  "puzzle": {
    "beginner": [
      {
        "title": "River Crossing Wolf Goat Cabbage",
        "description": "A farmer must cross a river with a wolf, goat, and cabbage. His boat fits only himself and one item. Wolf eats goat if left alone; goat eats cabbage if left alone. What is his first move?",
        "options": [
          "Take the goat across first",
          "Take the wolf across first",
          "Take the cabbage across first",
          "Cross alone first"
        ],
        "correctAnswer": "Take the goat across first",
        "boilerplate": "",
        "tags": [
          "classic-puzzles"
        ],
        "hint": "Leaving wolf with cabbage is safe on the starting bank.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Water Jug Measure 4 Liters",
        "description": "You have a 3-liter jug and a 5-liter jug with unlimited water. How can you measure exactly 4 liters?",
        "options": [
          "Fill 5L, pour into 3L (2L left in 5L), empty 3L, pour 2L into 3L, fill 5L, pour into 3L until full",
          "Fill 3L twice and guess",
          "Fill both jugs halfway",
          "It is impossible with whole jugs"
        ],
        "correctAnswer": "Fill 5L, pour into 3L (2L left in 5L), empty 3L, pour 2L into 3L, fill 5L, pour into 3L until full",
        "boilerplate": "",
        "tags": [
          "water-jugs"
        ],
        "hint": "Leaves 5L - 1L = 4L in the 5L jug.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Balance Scale 8 Coins One Heavy",
        "description": "Out of 8 identical-looking coins, one is heavier than the rest. Using a balance scale, what is the minimum number of weighings guaranteed to find the heavy coin?",
        "options": [
          "2 weighings",
          "3 weighings",
          "4 weighings",
          "1 weighing"
        ],
        "correctAnswer": "2 weighings",
        "boilerplate": "",
        "tags": [
          "scale-puzzles"
        ],
        "hint": "Weigh 3 coins vs 3 coins. If balanced, test remaining 2.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Socks in Dark Drawer",
        "description": "A drawer has 10 black socks and 10 white socks. In pitch darkness, what is minimum number of socks you must pull to guarantee a matching pair?",
        "options": [
          "3 socks",
          "2 socks",
          "11 socks",
          "20 socks"
        ],
        "correctAnswer": "3 socks",
        "boilerplate": "",
        "tags": [
          "pigeonhole"
        ],
        "hint": "Pigeonhole principle: With 2 colors, 3 pulls guarantees at least one duplicate color.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Knights and Knaves Island",
        "description": "On an island where Knights always tell truth and Knaves always lie, Person A says: \"I am a Knave.\" What can you deduce?",
        "options": [
          "Paradox / Person A cannot exist under these rules",
          "Person A is definitely a Knight",
          "Person A is definitely a Knave",
          "Person A is a tourist"
        ],
        "correctAnswer": "Paradox / Person A cannot exist under these rules",
        "boilerplate": "",
        "tags": [
          "logic"
        ],
        "hint": "A knight cannot say he is a knave (false), and a knave cannot say he is a knave (truth).",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Clock Hands Angle at 3:15",
        "description": "What is the angle between the hour hand and minute hand of an analog clock at 3:15?",
        "options": [
          "7.5°",
          "0°",
          "5°",
          "12°"
        ],
        "correctAnswer": "7.5°",
        "boilerplate": "",
        "tags": [
          "clock-angles"
        ],
        "hint": "In 15 minutes, the hour hand moves 15 × 0.5° = 7.5° away from 3.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Light Switches in Basement",
        "description": "Three switches upstairs control three light bulbs in basement. You can only visit basement once. How do you identify which switch controls which bulb?",
        "options": [
          "Turn switch 1 on for 10 min, turn off, turn switch 2 on, go down: check on, off-warm, off-cold",
          "Flip all three on and run downstairs fast",
          "Turn switch 1 and 2 on together and leave switch 3 off",
          "It cannot be done in a single trip"
        ],
        "correctAnswer": "Turn switch 1 on for 10 min, turn off, turn switch 2 on, go down: check on, off-warm, off-cold",
        "boilerplate": "",
        "tags": [
          "lateral-thinking"
        ],
        "hint": "Heat from incandescent bulb acts as third observable state.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Handshake Party Puzzle",
        "description": "There are 5 people in a room. If each person shakes hands with every other person exactly once, how many handshakes occur?",
        "options": [
          "10",
          "15",
          "20",
          "25"
        ],
        "correctAnswer": "10",
        "boilerplate": "",
        "tags": [
          "combinatorics"
        ],
        "hint": "5 × 4 / 2 = 10 handshakes.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Two Hourglasses 7 and 11 Minutes",
        "description": "How can you measure exactly 15 minutes using a 7-minute and an 11-minute hourglass?",
        "options": [
          "Start both at once. When 7m runs out, start boiling (remaining 4m in 11m) then flip 11m once (4+11=15)",
          "Run 7m twice and add 1 min guess",
          "Turn 11m upside down at half mark",
          "Impossible without a 1-minute glass"
        ],
        "correctAnswer": "Start both at once. When 7m runs out, start boiling (remaining 4m in 11m) then flip 11m once (4+11=15)",
        "boilerplate": "",
        "tags": [
          "time-puzzles"
        ],
        "hint": "11 - 7 = 4 minutes left. 4 + 11 = 15 minutes.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Lily Pad Pond Doubling",
        "description": "A patch of lily pads doubles in size every day. If it takes 48 days to cover entire pond, on which day is pond half covered?",
        "options": [
          "Day 47",
          "Day 24",
          "Day 46",
          "Day 12"
        ],
        "correctAnswer": "Day 47",
        "boilerplate": "",
        "tags": [
          "exponential-growth"
        ],
        "hint": "One day before full coverage (day 48), it was half covered.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Bat and Ball Cost",
        "description": "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
        "options": [
          "$0.05 (5 cents)",
          "$0.10 (10 cents)",
          "$0.01 (1 cent)",
          "$0.15 (15 cents)"
        ],
        "correctAnswer": "$0.05 (5 cents)",
        "boilerplate": "",
        "tags": [
          "cognitive-reflection"
        ],
        "hint": "x + (x + 1.00) = 1.10 → 2x = 0.10 → x = 0.05.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Number Sequence Missing Term",
        "description": "Find the next number in sequence: 2, 6, 12, 20, 30, ?",
        "options": [
          "42",
          "40",
          "36",
          "48"
        ],
        "correctAnswer": "42",
        "boilerplate": "",
        "tags": [
          "pattern"
        ],
        "hint": "Differences: +4, +6, +8, +10, next is +12 → 30 + 12 = 42.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Fox Goose Bag of Grain",
        "description": "Similar to wolf and cabbage, what is the key rule for the farmer when returning with an empty boat?",
        "options": [
          "He can bring an animal back to the original shore if needed to prevent conflict",
          "He must never row back with an animal",
          "The boat sinks if loaded on return trip",
          "He can row without oars"
        ],
        "correctAnswer": "He can bring an animal back to the original shore if needed to prevent conflict",
        "boilerplate": "",
        "tags": [
          "river-crossing"
        ],
        "hint": "Classic solution requires taking the goose back on trip 2.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Three Jelly Beans Jar Labels",
        "description": "Three jars labeled \"Red\", \"Green\", and \"Mixed\" are all incorrectly labeled. You pick one bean from which jar to fix all labels?",
        "options": [
          "Pick from the \"Mixed\" jar",
          "Pick from the \"Red\" jar",
          "Pick from the \"Green\" jar",
          "Pick one from every jar"
        ],
        "correctAnswer": "Pick from the \"Mixed\" jar",
        "boilerplate": "",
        "tags": [
          "logic-deduction"
        ],
        "hint": "Since all labels are false, \"Mixed\" must be pure Red or pure Green.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Rope Burning 45 Minutes",
        "description": "You have two ropes that each burn in exactly 60 minutes, but at non-uniform rates. How do you measure 45 minutes?",
        "options": [
          "Light Rope 1 at both ends and Rope 2 at one end; when Rope 1 finishes (30 min), light other end of Rope 2",
          "Cut both ropes with scissors in middle",
          "Light both at one end and wait for 75%",
          "Ropes burning non-uniformly cannot measure time"
        ],
        "correctAnswer": "Light Rope 1 at both ends and Rope 2 at one end; when Rope 1 finishes (30 min), light other end of Rope 2",
        "boilerplate": "",
        "tags": [
          "rope-burning"
        ],
        "hint": "Rope 1 burns in 30 min. Lighting other end of Rope 2 burns remaining 30m in 15m. 30 + 15 = 45m.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Bridge and Torch Night crossing",
        "description": "Four people take 1, 2, 5, 10 minutes to cross a bridge with one torch. Max 2 people can cross at a time. What is minimum total time?",
        "options": [
          "17 minutes",
          "19 minutes",
          "21 minutes",
          "15 minutes"
        ],
        "correctAnswer": "17 minutes",
        "boilerplate": "",
        "tags": [
          "optimization"
        ],
        "hint": "1&2 cross (2), 1 returns (1), 5&10 cross (10), 2 returns (2), 1&2 cross (2) = 17.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Coin in Bottle Cork Trick",
        "description": "A coin is inside a wine bottle sealed with a cork. How can you remove coin without breaking bottle or pulling cork out?",
        "options": [
          "Push the cork into the bottle and shake coin out",
          "Dissolve cork with acid",
          "Melt the glass neck",
          "Use a vacuum pump"
        ],
        "correctAnswer": "Push the cork into the bottle and shake coin out",
        "boilerplate": "",
        "tags": [
          "lateral-thinking"
        ],
        "hint": "The cork can be pushed inwards rather than pulled.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Brothers and Sisters Family Count",
        "description": "Each boy in a family has as many sisters as brothers, but each girl has twice as many brothers as sisters. How many boys and girls?",
        "options": [
          "4 boys and 3 girls",
          "3 boys and 2 girls",
          "2 boys and 1 girl",
          "5 boys and 4 girls"
        ],
        "correctAnswer": "4 boys and 3 girls",
        "boilerplate": "",
        "tags": [
          "algebra-riddle"
        ],
        "hint": "Boys = b, girls = g: b - 1 = g and 2(g - 1) = b. Solve: b = 4, g = 3.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      }
    ],
    "intermediate": [
      {
        "title": "Monty Hall Game Show Probability",
        "description": "In Monty Hall problem with 3 doors (1 car, 2 goats), after you pick door 1 and host opens door 3 revealing a goat, should you switch to door 2?",
        "options": [
          "Yes, switching wins with probability 2/3",
          "No, chances remain 1/2 either way",
          "Staying wins with probability 2/3",
          "It makes zero difference"
        ],
        "correctAnswer": "Yes, switching wins with probability 2/3",
        "boilerplate": "",
        "tags": [
          "probability-puzzles"
        ],
        "hint": "Initial pick was 1/3 right; other door absorbs remaining 2/3 probability.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Two Eggs 100 Floors Problem",
        "description": "What is the minimum number of egg drops required in the worst-case to determine the highest floor from which an egg can drop without breaking (100 floors)?",
        "options": [
          "14 drops",
          "10 drops",
          "50 drops",
          "20 drops"
        ],
        "correctAnswer": "14 drops",
        "boilerplate": "",
        "tags": [
          "dynamic-programming"
        ],
        "hint": "Triangular series: x + (x-1) + ... + 1 ≥ 100 → x = 14.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Pirate Gold Coin Distribution Game",
        "description": "5 rational pirates (ranked 1 to 5) divide 100 gold coins. Oldest pirate (5) proposes allocation; if ≥ 50% vote yes, it passes, else pirate 5 is thrown overboard. What does pirate 5 propose?",
        "options": [
          "Pirate 5 keeps 98, gives 1 to Pirate 3, and 1 to Pirate 1",
          "Pirate 5 divides evenly: 20 each",
          "Pirate 5 keeps 100 for himself",
          "Pirate 5 gives 50 to Pirate 4 and keeps 50"
        ],
        "correctAnswer": "Pirate 5 keeps 98, gives 1 to Pirate 3, and 1 to Pirate 1",
        "boilerplate": "",
        "tags": [
          "game-theory"
        ],
        "hint": "Backward induction from 2 pirates up to 5.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "100 Prisoners and Light Bulb in Room",
        "description": "100 prisoners enter a room with one toggle switch one by one in random order. How can they assert everyone has visited the room?",
        "options": [
          "Designate one prisoner as counter; all others turn light ON once when visiting; counter turns it OFF and counts to 100",
          "Each prisoner turns switch on and off twice",
          "They can whisper through walls",
          "Impossible without synchronized clock"
        ],
        "correctAnswer": "Designate one prisoner as counter; all others turn light ON once when visiting; counter turns it OFF and counts to 100",
        "boilerplate": "",
        "tags": [
          "distributed-protocol"
        ],
        "hint": "Single state toggle switch acts as token accumulator.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Poisoned Wine Bottle 1000 Bottles",
        "description": "Out of 1000 bottles of wine, exactly 1 is poisoned. Poison takes 24 hours to kill a test rat. What is minimum number of rats needed to find poison in 24 hours?",
        "options": [
          "10 rats",
          "100 rats",
          "500 rats",
          "1000 rats"
        ],
        "correctAnswer": "10 rats",
        "boilerplate": "",
        "tags": [
          "binary-representation"
        ],
        "hint": "2^10 = 1024 > 1000. Each rat drinks according to bit positions in binary bottle index.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Birthday Paradox 50 Percent Threshold",
        "description": "What is the minimum number of people in a room required for a > 50% probability that at least two share a birthday?",
        "options": [
          "23 people",
          "183 people",
          "50 people",
          "75 people"
        ],
        "correctAnswer": "23 people",
        "boilerplate": "",
        "tags": [
          "probability"
        ],
        "hint": "1 - (365/365 × 364/365 × ... × 343/365) ≈ 0.507.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Three Ants on Triangle Vertices",
        "description": "Three ants sit on the vertices of an equilateral triangle. Each randomly chooses a direction along an edge. Probability that no ants collide?",
        "options": [
          "1/4 (25%)",
          "1/8 (12.5%)",
          "1/2 (50%)",
          "1/3 (33%)"
        ],
        "correctAnswer": "1/4 (25%)",
        "boilerplate": "",
        "tags": [
          "probability"
        ],
        "hint": "Only 2 collision-free configurations (all clockwise or all counterclockwise) out of 2³ = 8: 2/8 = 1/4.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Fox and Duck in Circular Pond",
        "description": "A duck is in center of circular pond; fox is on perimeter. Fox runs 4× faster than duck swims. Duck escapes if it reaches edge before fox. Can duck escape?",
        "options": [
          "Yes, by swimming inside radius r/4 with angular velocity advantage then sprinting radially",
          "No, fox is too fast",
          "Only if fox falls asleep",
          "Only if pond freezes"
        ],
        "correctAnswer": "Yes, by swimming inside radius r/4 with angular velocity advantage then sprinting radially",
        "boilerplate": "",
        "tags": [
          "pursuit-evasion"
        ],
        "hint": "Duck has higher angular speed within radius r < R/4.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Burning Fuse 15 Minutes Alone",
        "description": "If you have only ONE 60-minute non-uniform rope, what single exact duration can you measure?",
        "options": [
          "30 minutes (by lighting both ends simultaneously)",
          "15 minutes",
          "45 minutes",
          "20 minutes"
        ],
        "correctAnswer": "30 minutes (by lighting both ends simultaneously)",
        "boilerplate": "",
        "tags": [
          "logic"
        ],
        "hint": "Lighting both ends cuts burn duration exactly in half.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Chameleons Color Convergence",
        "description": "An island has 13 red, 15 green, and 17 blue chameleons. When two different colors meet, both change to the third color. Can all become one color?",
        "options": [
          "No, because color counts modulo 3 are pairwise distinct and invariant",
          "Yes, all can become blue",
          "Yes, all can become green",
          "Yes, all can become red"
        ],
        "correctAnswer": "No, because color counts modulo 3 are pairwise distinct and invariant",
        "boilerplate": "",
        "tags": [
          "invariants"
        ],
        "hint": "Differences between color counts modulo 3 never change.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Tiling Deficient Chessboard",
        "description": "An 8×8 chessboard has two opposite corner squares removed. Can you tile the remaining 62 squares with 31 2×1 dominoes?",
        "options": [
          "No, because opposite corners always have the same color (leaving 32 of one color and 30 of another)",
          "Yes, always possible",
          "Only if corners are black",
          "Only if dominoes can be placed diagonally"
        ],
        "correctAnswer": "No, because opposite corners always have the same color (leaving 32 of one color and 30 of another)",
        "boilerplate": "",
        "tags": [
          "coloring-proof"
        ],
        "hint": "Each domino covers exactly 1 white and 1 black square.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Russian Roulette Re-spin",
        "description": "A 6-chamber revolver has 2 bullets in adjacent chambers. Shooter fires once and it clicks empty. For next turn, should you spin or pull directly?",
        "options": [
          "Pull directly without spinning (prob of bullet is 1/4 vs 2/6 = 1/3 if spun)",
          "Spin the cylinder (probability is lower)",
          "Both options are exactly 50%",
          "Drop the gun"
        ],
        "correctAnswer": "Pull directly without spinning (prob of bullet is 1/4 vs 2/6 = 1/3 if spun)",
        "boilerplate": "",
        "tags": [
          "conditional-probability"
        ],
        "hint": "Knowing current chamber is empty, only 1 of 4 possible next chambers contains bullet.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "100 Doors Toggle Sequence",
        "description": "100 closed doors. Person 1 toggles every door, person 2 toggles every 2nd door, up to person 100. Which doors remain open?",
        "options": [
          "Perfect squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100",
          "All prime numbered doors",
          "All even numbered doors",
          "All odd numbered doors"
        ],
        "correctAnswer": "Perfect squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100",
        "boilerplate": "",
        "tags": [
          "number-theory"
        ],
        "hint": "Only perfect squares have an odd number of divisors.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Heavy Coin Among 12 Coins Weighings",
        "description": "Among 12 identical coins, one is counterfeit (either heavier OR lighter). What is minimum balance scale weighings to find coin and determine weight?",
        "options": [
          "3 weighings",
          "4 weighings",
          "2 weighings",
          "5 weighings"
        ],
        "correctAnswer": "3 weighings",
        "boilerplate": "",
        "tags": [
          "scale-puzzles"
        ],
        "hint": "3³ = 27 outcomes ≥ 24 possible states (12 coins × 2 states).",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Einstein House Riddle Nationality",
        "description": "In the classic 5-house puzzle (Einstein’s riddle), who owns the fish?",
        "options": [
          "The German",
          "The Brit",
          "The Swede",
          "The Dane"
        ],
        "correctAnswer": "The German",
        "boilerplate": "",
        "tags": [
          "deductive-logic"
        ],
        "hint": "Logical deduction from the 15 constraint clues.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Grid Paths with Obstacle",
        "description": "On a 5×5 grid from (0,0) to (5,5) moving only Right and Up, how many total paths exist if point (2,2) is completely blocked?",
        "options": [
          "182 paths",
          "252 paths",
          "70 paths",
          "144 paths"
        ],
        "correctAnswer": "182 paths",
        "boilerplate": "",
        "tags": [
          "combinatorics"
        ],
        "hint": "Total paths = 10C5 = 252. Paths through (2,2) = 4C2 × 6C3 = 6 × 20 = 120. 252 - 120 = 132 (or for specific subgrid).",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Mutilated Cube 27 Unit Cubes",
        "description": "A 3×3×3 cube is made of 27 unit cubes. Can a termite tunnel through all 27 cubes visiting each cube once and ending in the center cube?",
        "options": [
          "No, because alternating 3D bipartite coloring has unequal partition counts",
          "Yes, through spiral path",
          "Yes, through Hamiltonian path",
          "Only if it starts at a corner"
        ],
        "correctAnswer": "No, because alternating 3D bipartite coloring has unequal partition counts",
        "boilerplate": "",
        "tags": [
          "bipartite-graph"
        ],
        "hint": "14 cubes of one color and 13 of another; center cube matches the majority color.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Circle Chord Intersection Probability",
        "description": "Four random points are chosen independently on a circle. What is probability that the chord between 1&2 intersects chord between 3&4?",
        "options": [
          "1/3",
          "1/2",
          "1/4",
          "2/3"
        ],
        "correctAnswer": "1/3",
        "boilerplate": "",
        "tags": [
          "geometric-probability"
        ],
        "hint": "Among 3 possible pairings of 4 points, exactly 1 pairing produces intersecting chords.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      }
    ],
    "advanced": [
      {
        "title": "100 Prisoners Box Cycle Strategy",
        "description": "100 prisoners must find their number in 100 closed boxes by inspecting ≤ 50 boxes each. What strategy gives a ~31% team survival probability?",
        "options": [
          "Each prisoner opens the box with their own number, then follows pointer numbers in a permutation cycle",
          "Each prisoner picks 50 boxes at pure random",
          "Prisoners agree to all open the first 50 boxes",
          "The strategy requires a quantum communicator"
        ],
        "correctAnswer": "Each prisoner opens the box with their own number, then follows pointer numbers in a permutation cycle",
        "boilerplate": "",
        "tags": [
          "permutation-cycles"
        ],
        "hint": "Succeeds whenever the permutation contains no cycle longer than 50 (1 - ln 2 ≈ 31.18%).",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Blue Eyes Island Induction Day",
        "description": "100 people with blue eyes live on an island with no mirrors. Guru announces: \"I see someone with blue eyes.\" On which night do all 100 leave?",
        "options": [
          "Night 100",
          "Night 1",
          "Night 99",
          "They never leave"
        ],
        "correctAnswer": "Night 100",
        "boilerplate": "",
        "tags": [
          "common-knowledge"
        ],
        "hint": "Mathematical induction on common knowledge across N = 100 days.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Nim Game Winning Position XOR Sum",
        "description": "In classic Nim with piles of sizes 3, 4, 5, is the first player in a winning position?",
        "options": [
          "Yes, because the nim-sum (3 ⊕ 4 ⊕ 5) is non-zero (equals 2)",
          "No, because nim-sum is zero",
          "No, second player has symmetry strategy",
          "Depends on who draws first pile"
        ],
        "correctAnswer": "Yes, because the nim-sum (3 ⊕ 4 ⊕ 5) is non-zero (equals 2)",
        "boilerplate": "",
        "tags": [
          "game-theory",
          "sprague-grundy"
        ],
        "hint": "Bouton’s theorem: Non-zero XOR sum is winning position.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Secretary Problem 1/e Rule",
        "description": "To maximize probability of hiring best applicant among N candidates interviewed sequentially, what fraction should you reject first as baseline?",
        "options": [
          "1/e (~36.8%)",
          "50%",
          "25%",
          "1/√2 (~70.7%)"
        ],
        "correctAnswer": "1/e (~36.8%)",
        "boilerplate": "",
        "tags": [
          "optimal-stopping"
        ],
        "hint": "Optimal stopping threshold maximizes P = (x/N) ∑ 1/(i-1) → 1/e.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Red and Black Hat Line Induction",
        "description": "10 prisoners stand in a line facing forward; each wears a red or black hat. Rear prisoner sees 9 hats, next sees 8, etc. How many can be saved guaranteed?",
        "options": [
          "At least 9 guaranteed (rear prisoner says parity of red hats, with 50% chance of survival)",
          "All 10 guaranteed",
          "Only 5",
          "Only 1"
        ],
        "correctAnswer": "At least 9 guaranteed (rear prisoner says parity of red hats, with 50% chance of survival)",
        "boilerplate": "",
        "tags": [
          "parity-strategy"
        ],
        "hint": "First speaker communicates parity (odd/even) of red hats seen in front.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Two Generals Asynchronous Channel",
        "description": "Can two generals coordinate an attack over an unreliable communications link with 100% certainty?",
        "options": [
          "No, proven impossible because last messenger always requires an unconfirmed acknowledgment",
          "Yes, by sending 100 messengers",
          "Yes, using Fibonacci backoff",
          "Yes, if they attack at midnight"
        ],
        "correctAnswer": "No, proven impossible because last messenger always requires an unconfirmed acknowledgment",
        "boilerplate": "",
        "tags": [
          "distributed-theory"
        ],
        "hint": "Infinite regress of required acknowledgments.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Knight Tour Closed vs Open",
        "description": "Can an 8×8 chessboard admit a closed Knight’s Tour that visits all 64 squares and returns to start?",
        "options": [
          "Yes, closed tours exist",
          "No, only open tours exist",
          "No, parity forbids 64 moves",
          "Only on odd sized boards"
        ],
        "correctAnswer": "Yes, closed tours exist",
        "boilerplate": "",
        "tags": [
          "graph-theory"
        ],
        "hint": "Discovered by Euler in 1759.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Four Color Map Theorem Counterexample Search",
        "description": "What is maximum number of colors needed to color any planar map so no two adjacent regions share a color?",
        "options": [
          "4 colors",
          "5 colors",
          "3 colors",
          "6 colors"
        ],
        "correctAnswer": "4 colors",
        "boilerplate": "",
        "tags": [
          "graph-theory"
        ],
        "hint": "Appel and Haken computational proof in 1976.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Josephus Problem Power of 2",
        "description": "In Josephus circle of 40 people where every 2nd person is eliminated, which seat survives?",
        "options": [
          "Seat 17",
          "Seat 1",
          "Seat 33",
          "Seat 25"
        ],
        "correctAnswer": "Seat 17",
        "boilerplate": "",
        "tags": [
          "algorithms"
        ],
        "hint": "40 = 2^5 + 8 (L = 8). Winning seat is 2L + 1 = 2(8) + 1 = 17.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Infinite Grid Resistor Equivalent",
        "description": "In an infinite square grid of 1-ohm resistors, what is effective resistance between two diagonally adjacent nodes?",
        "options": [
          "2/π ohms",
          "1/2 ohm",
          "1 ohm",
          "π/4 ohms"
        ],
        "correctAnswer": "2/π ohms",
        "boilerplate": "",
        "tags": [
          "physics-puzzle"
        ],
        "hint": "Superposition of current injections on lattice.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Fair Coin from Biased Coin (Von Neumann)",
        "description": "How can you simulate a fair 50/50 coin toss using a coin with unknown bias p?",
        "options": [
          "Toss twice: HT gives Heads, TH gives Tails; if HH or TT, discard and repeat",
          "Toss 100 times and take majority",
          "Toss until first head appears",
          "Cannot be done without knowing p"
        ],
        "correctAnswer": "Toss twice: HT gives Heads, TH gives Tails; if HH or TT, discard and repeat",
        "boilerplate": "",
        "tags": [
          "randomness-extraction"
        ],
        "hint": "P(HT) = p(1-p) = (1-p)p = P(TH) for any bias p ∈ (0,1).",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Rubik Cube God Number",
        "description": "What is \"God’s Number\" (maximum moves required to solve any 3×3×3 Rubik’s cube in half-turn metric)?",
        "options": [
          "20 moves",
          "26 moves",
          "18 moves",
          "24 moves"
        ],
        "correctAnswer": "20 moves",
        "boilerplate": "",
        "tags": [
          "group-theory"
        ],
        "hint": "Proven by Morley et al. in 2010.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Ant on Expanding Rubber Rope",
        "description": "An ant crawls at 1 cm/s on a 1 km rubber rope that stretches by 1 km every second. Will ant ever reach the end?",
        "options": [
          "Yes, because harmonic series 1/n diverges",
          "No, the rope expands faster than the ant crawls",
          "Only if ant accelerates",
          "Never, distance increases exponentially"
        ],
        "correctAnswer": "Yes, because harmonic series 1/n diverges",
        "boilerplate": "",
        "tags": [
          "infinite-series"
        ],
        "hint": "Ant’s fraction of total rope increases by 1/(100000 n) each second.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Three Hats Hamming Code Strategy",
        "description": "In 7-person hat problem (each wearing red or blue), what error-correcting code allows them to win with 7/8 probability?",
        "options": [
          "Hamming [7, 4, 3] code",
          "Reed-Solomon code",
          "BCH parity code",
          "Repetition code"
        ],
        "correctAnswer": "Hamming [7, 4, 3] code",
        "boilerplate": "",
        "tags": [
          "coding-theory"
        ],
        "hint": "Treats hat configurations as spheres centered on Hamming codewords.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Derangement Probability Asymptote",
        "description": "As N → ∞, what is probability that a random permutation of N items has ZERO fixed points (complete derangement)?",
        "options": [
          "1/e (~36.8%)",
          "0",
          "1/2 (50%)",
          "1/π"
        ],
        "correctAnswer": "1/e (~36.8%)",
        "boilerplate": "",
        "tags": [
          "combinatorics"
        ],
        "hint": "∑ (-1)^k / k! → e^(-1) = 1/e.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      }
    ],
    "expert": [
      {
        "title": "Sprague-Grundy Theorem Equivalence",
        "description": "The Sprague-Grundy theorem states that every impartial game under normal play convention is equivalent to:",
        "options": [
          "A one-pile game of Nim with heap size equal to its Grundy value",
          "A Markov chain",
          "A zero-sum matrix game",
          "A deterministic finite automaton"
        ],
        "correctAnswer": "A one-pile game of Nim with heap size equal to its Grundy value",
        "boilerplate": "",
        "tags": [
          "combinatorial-game-theory"
        ],
        "hint": "Equivalence using minimum excludant (mex) of available successor states.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Conway Game of Life Glider Period",
        "description": "In Conway’s Game of Life, what is period and displacement of a standard glider pattern?",
        "options": [
          "Period 4, moves 1 diagonal cell",
          "Period 2, moves 1 orthogonal cell",
          "Period 8, moves 2 diagonal cells",
          "Period 1, stationary"
        ],
        "correctAnswer": "Period 4, moves 1 diagonal cell",
        "boilerplate": "",
        "tags": [
          "cellular-automata"
        ],
        "hint": "Glider shifts (1,1) every 4 generations with speed c/4.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Godel Incompleteness Coding Mechanism",
        "description": "What numbering mechanism allowed Gödel to encode mathematical assertions about proofs into arithmetic statements?",
        "options": [
          "Gödel Numbering using unique prime factorizations",
          "Binary floating-point arithmetic",
          "Turing tape hashes",
          "Fibonacci base coding"
        ],
        "correctAnswer": "Gödel Numbering using unique prime factorizations",
        "boilerplate": "",
        "tags": [
          "logic"
        ],
        "hint": "Product of p_i^(code_i) yields unique integer representation of proof trees.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Infinite Coin Toss Borel-Cantelli Lemma",
        "description": "By the Borel-Cantelli lemma, if sum of probabilities of independent events diverges (∑ P(A_n) = ∞), what is probability they occur infinitely often?",
        "options": [
          "1 (almost surely)",
          "0",
          "1/2",
          "Undefined"
        ],
        "correctAnswer": "1 (almost surely)",
        "boilerplate": "",
        "tags": [
          "measure-theory"
        ],
        "hint": "Second Borel-Cantelli lemma for independent events.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Solovay-Strassen Primality Test Error Bound",
        "description": "What is the maximum probability of false prime declaration for a composite number in one iteration of Solovay-Strassen?",
        "options": [
          "1/2 (50%)",
          "1/4 (25%)",
          "1/8 (12.5%)",
          "0%"
        ],
        "correctAnswer": "1/2 (50%)",
        "boilerplate": "",
        "tags": [
          "randomized-algorithms"
        ],
        "hint": "Miller-Rabin improves this bound to 1/4 per round.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Kruskal Count Card Trick Principle",
        "description": "In Kruskal’s Count card trick, why do two observers choosing different starting cards almost always converge to the exact same card?",
        "options": [
          "Markov chain with coupling into an absorbing common trajectory",
          "The deck is marked",
          "Subconscious mental suggestion",
          "Cards are strictly ordered by suit"
        ],
        "correctAnswer": "Markov chain with coupling into an absorbing common trajectory",
        "boilerplate": "",
        "tags": [
          "probability",
          "markov-chains"
        ],
        "hint": "Once the two sequences intersect at any card, their paths merge permanently.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Random Walk Return in Dimensions",
        "description": "According to Pólya’s theorem, a simple symmetric random walk on a d-dimensional integer lattice is recurrent for:",
        "options": [
          "d = 1 and d = 2 only",
          "All dimensions d ≥ 1",
          "d = 3 only",
          "Only d = 1"
        ],
        "correctAnswer": "d = 1 and d = 2 only",
        "boilerplate": "",
        "tags": [
          "stochastic-processes"
        ],
        "hint": "“A drunk man will find his way home, but a drunk bird may get lost forever” (Kakutani).",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Hat Guessing Hypercube Coloring",
        "description": "Finding an optimal collective strategy in the n-prisoner hat guessing game is isomorphic to finding:",
        "options": [
          "An independent dominating set or covering code on an n-dimensional hypercube graph",
          "A Hamiltonian cycle in K_n",
          "A minimum spanning tree",
          "A planar embedding"
        ],
        "correctAnswer": "An independent dominating set or covering code on an n-dimensional hypercube graph",
        "boilerplate": "",
        "tags": [
          "graph-theory"
        ],
        "hint": "Vertice states represent assignment configurations on Q_n.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Chomp Game First Player Advantage",
        "description": "Using strategy stealing argument on m × n chocolate bar Chomp game, what can be proved?",
        "options": [
          "First player has a winning strategy (except for trivial 1×1)",
          "Second player always wins",
          "The game always ends in a draw",
          "Both players have equal winning probabilities"
        ],
        "correctAnswer": "First player has a winning strategy (except for trivial 1×1)",
        "boilerplate": "",
        "tags": [
          "combinatorial-game-theory"
        ],
        "hint": "If second player had winning move, first player could have chosen it on move 1.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Sperner Lemma Fixed Point Dimension",
        "description": "Sperner’s Lemma on triangulated simplices provides a combinatorial analogue and constructive proof of:",
        "options": [
          "Brouwer Fixed Point Theorem",
          "Fundamental Theorem of Algebra",
          "Four Color Theorem",
          "PNT Prime Number Theorem"
        ],
        "correctAnswer": "Brouwer Fixed Point Theorem",
        "boilerplate": "",
        "tags": [
          "combinatorial-topology"
        ],
        "hint": "Any properly colored triangulation contains a completely labeled simplex.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Lovasz Local Lemma Application",
        "description": "What does the Lovász Local Lemma prove about a set of bad events with limited dependency?",
        "options": [
          "There is non-zero probability that NONE of the bad events occur",
          "At least one bad event is guaranteed to occur",
          "All bad events are pairwise mutually exclusive",
          "The system enters an absorbing dead-end state"
        ],
        "correctAnswer": "There is non-zero probability that NONE of the bad events occur",
        "boilerplate": "",
        "tags": [
          "probabilistic-method"
        ],
        "hint": "Guarantees existence of configurations avoiding all bad conditions.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Braess Paradox Traffic Routing",
        "description": "Braess’s paradox demonstrates that adding a new high-capacity road to a congested network can:",
        "options": [
          "Increase overall travel time for all drivers in Nash equilibrium",
          "Always decrease travel time by 50%",
          "Eliminate all congestion permanently",
          "Violate conservation of traffic mass"
        ],
        "correctAnswer": "Increase overall travel time for all drivers in Nash equilibrium",
        "boilerplate": "",
        "tags": [
          "game-theory",
          "networks"
        ],
        "hint": "Selfish routing equilibrium can be strictly worse than social optimum.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Penney Game Non-Transitive Sequences",
        "description": "In Penney’s Game (guessing 3-flip coin patterns like HTH vs HHT), what property describes winning chances?",
        "options": [
          "Non-transitive cycles (for every 3-flip pattern, another pattern beats it with > 50% probability)",
          "Strictly transitive ordering",
          "All patterns have identical 50% head-to-head odds",
          "HTH beats every other pattern"
        ],
        "correctAnswer": "Non-transitive cycles (for every 3-flip pattern, another pattern beats it with > 50% probability)",
        "boilerplate": "",
        "tags": [
          "probability"
        ],
        "hint": "Like Rock-Paper-Scissors with coin sequences.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      }
    ],
    "master": [
      {
        "title": "Axiom of Choice Countable Hats Paradox",
        "description": "Countably infinitely many prisoners wear black/white hats in line. Assuming Axiom of Choice, how many can be saved?",
        "options": [
          "All but finitely many prisoners correctly guess their hat color",
          "None can be saved without communication",
          "Exactly 50% can guess correctly",
          "Only the first prisoner"
        ],
        "correctAnswer": "All but finitely many prisoners correctly guess their hat color",
        "boilerplate": "",
        "tags": [
          "set-theory"
        ],
        "hint": "Equivalence relation on sequences differing in only finitely many entries; choose representative sequence using AC.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Banach-Tarski Paradox Decomposition",
        "description": "The Banach-Tarski paradox proves that a solid 3D sphere can be decomposed into 5 non-measurable pieces and reassembled into:",
        "options": [
          "Two identical solid spheres of identical volume",
          "A cube of double the height",
          "An infinite cylinder",
          "A hollow torus"
        ],
        "correctAnswer": "Two identical solid spheres of identical volume",
        "boilerplate": "",
        "tags": [
          "measure-theory"
        ],
        "hint": "Uses free group on 2 generators and non-measurable sets enabled by AC.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Quantum Pseudo-Telepathy Magic Square",
        "description": "In the Mermin-Peres magic square game, what enables two separated players to win with probability 1 without communicating?",
        "options": [
          "Shared quantum entangled state (Bell pairs) and local Pauli measurements",
          "Faster-than-light radio waves",
          "Pre-shared deterministic lookup tables",
          "Classical PRNG seeds"
        ],
        "correctAnswer": "Shared quantum entangled state (Bell pairs) and local Pauli measurements",
        "boilerplate": "",
        "tags": [
          "quantum-foundations"
        ],
        "hint": "Classical optimal strategy max win probability is 8/9; quantum strategy wins 100%.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Goodstein Theorem Unprovability",
        "description": "Goodstein’s theorem states that every Goodstein sequence terminates at 0. Kirby and Paris proved that this theorem:",
        "options": [
          "Is true, but unprovable in Peano Arithmetic (PA)",
          "Is false for numbers greater than 10^100",
          "Violates ZFC axioms",
          "Can be proved by finite mathematical induction in 10 lines"
        ],
        "correctAnswer": "Is true, but unprovable in Peano Arithmetic (PA)",
        "boilerplate": "",
        "tags": [
          "proof-theory"
        ],
        "hint": "Requires transfinite ordinal induction up to ε₀.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Busy Beaver Function Non-Computability",
        "description": "Why grows the Busy Beaver function BB(n) faster than ANY computable function f(n)?",
        "options": [
          "If BB(n) were computable, it would solve the Halting Problem for all n-state Turing machines",
          "It involves quantum superposition",
          "It is defined using imaginary numbers",
          "Its domain is transfinite cardinals"
        ],
        "correctAnswer": "If BB(n) were computable, it would solve the Halting Problem for all n-state Turing machines",
        "boilerplate": "",
        "tags": [
          "computability-theory"
        ],
        "hint": "Upper bound on maximum steps an n-state halting Turing machine can execute.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Thomson Lamp Supertask Contradiction",
        "description": "A lamp is switched on after 1/2 min, off after 1/4 min, on after 1/8 min, summing to 1 minute. At t = 1 min, is lamp on or off?",
        "options": [
          "The lamp’s state at t = 1 is mathematically undefined by the supertask specification",
          "Strictly ON",
          "Strictly OFF",
          "In a 50% quantum superposition"
        ],
        "correctAnswer": "The lamp’s state at t = 1 is mathematically undefined by the supertask specification",
        "boilerplate": "",
        "tags": [
          "paradoxes"
        ],
        "hint": "Supertask provides no limit value at the closure point t = 1.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Newcomb Paradox Two Boxes Problem",
        "description": "A super-predictor places $1,000,000 in Box B if it predicted you take only Box B, else $0. Box A always has $1,000. Dominance principle says take both; Expected utility says take one. What is this debate called?",
        "options": [
          "Causal Decision Theory vs Evidential Decision Theory",
          "Nash Equilibrium vs Pareto Optimality",
          "Frequentist vs Bayesian probability",
          "Consequentialism vs Deontology"
        ],
        "correctAnswer": "Causal Decision Theory vs Evidential Decision Theory",
        "boilerplate": "",
        "tags": [
          "decision-theory"
        ],
        "hint": "Classic Newcomb’s Problem testing causality vs conditional evidence.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Surreal Numbers Conway Construction",
        "description": "In John Conway’s construction of Surreal numbers {L | R}, what defines the number 0?",
        "options": [
          "{ ∅ | ∅ }",
          "{ 0 | ∅ }",
          "{ -1 | 1 }",
          "{ ∅ | 0 }"
        ],
        "correctAnswer": "{ ∅ | ∅ }",
        "boilerplate": "",
        "tags": [
          "game-theory",
          "foundations"
        ],
        "hint": "The empty set on both left and right creates zero.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      }
    ],
    "grandmaster": [
      {
        "title": "Hales-Jewett Theorem Combinatorial Lines",
        "description": "The Hales-Jewett theorem guarantees that in high enough dimension d, any r-coloring of hypercube [k]^d contains:",
        "options": [
          "A monochromatic combinatorial line (generalized tic-tac-toe win)",
          "A dense subgraph of diameter 2",
          "An odd cycle of length k",
          "A Hamiltonian path"
        ],
        "correctAnswer": "A monochromatic combinatorial line (generalized tic-tac-toe win)",
        "boilerplate": "",
        "tags": [
          "ramsey-theory"
        ],
        "hint": "Cornerstone theorem of Ramsey theory generalizing Van der Waerden’s theorem.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Kochen-Specker Theorem Contextuality",
        "description": "What does the Kochen-Specker theorem prove about non-contextual hidden variable theories in quantum mechanics?",
        "options": [
          "They are mathematically impossible in Hilbert spaces of dimension ≥ 3",
          "They require superluminal signaling",
          "They only hold for spin-1/2 systems",
          "They contradict conservation of energy"
        ],
        "correctAnswer": "They are mathematically impossible in Hilbert spaces of dimension ≥ 3",
        "boilerplate": "",
        "tags": [
          "quantum-foundations"
        ],
        "hint": "Pre-existing definite values independent of measurement context cannot reproduce quantum predictions.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Whitehead Problem Independence",
        "description": "Saharon Shelah proved that Whitehead’s problem in abelian group theory is:",
        "options": [
          "Independent of ZFC set theory (undecidable without extra axioms)",
          "True under all models of arithmetic",
          "False in finite groups",
          "Solvable in PSPACE"
        ],
        "correctAnswer": "Independent of ZFC set theory (undecidable without extra axioms)",
        "boilerplate": "",
        "tags": [
          "model-theory"
        ],
        "hint": "True under Axiom of Constructibility (V=L), false under Martin’s Axiom + ¬CH.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Kolmogorov Complexity Incompressibility Lemma",
        "description": "For any integer n, what fraction of binary strings of length n cannot be compressed by more than c bits?",
        "options": [
          "At least 1 - 2^(-c)",
          "Exactly 50%",
          "All strings can be compressed",
          "At most 1/n"
        ],
        "correctAnswer": "At least 1 - 2^(-c)",
        "boilerplate": "",
        "tags": [
          "algorithmic-information-theory"
        ],
        "hint": "Pigeonhole count of shorter programs bounds compressible strings.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Szemerédi Regularity Lemma Partition",
        "description": "Szemerédi’s Regularity Lemma states that every large dense graph can be partitioned into a bounded number of subsets such that:",
        "options": [
          "Almost all pairs of subsets behave like random bipartite graphs (ε-regular pairs)",
          "All partitions are independent cliques",
          "Edges between partitions are strictly bipartite trees",
          "The graph has chromatic number at most 3"
        ],
        "correctAnswer": "Almost all pairs of subsets behave like random bipartite graphs (ε-regular pairs)",
        "boilerplate": "",
        "tags": [
          "extremal-combinatorics"
        ],
        "hint": "Approximates any dense graph as a union of pseudorandom bipartite blocks.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Arrow Impossibility Theorem Dictator",
        "description": "Kenneth Arrow proved that any voting system satisfying Unrestricted Domain, Pareto efficiency, and IIA must:",
        "options": [
          "Be a dictatorship (a single voter determines the social preference)",
          "Produce ties 50% of the time",
          "Require quadratic voting tokens",
          "Violate majority rule always"
        ],
        "correctAnswer": "Be a dictatorship (a single voter determines the social preference)",
        "boilerplate": "",
        "tags": [
          "social-choice-theory"
        ],
        "hint": "No fair ranked-choice voting system with ≥3 alternatives satisfies all criteria.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Prisoners Dilemma Iterated Zero-Determinant Strategies",
        "description": "Press and Dyson discovered that in Iterated Prisoner’s Dilemma, Zero-Determinant (ZD) strategies allow a player to:",
        "options": [
          "Unilaterally enforce a linear relationship between their own payoff and opponent’s payoff",
          "Always achieve the maximum score of 5 points every round",
          "Force opponent to cooperate 100% of the time unconditionally",
          "Guarantee zero losses against quantum adversaries"
        ],
        "correctAnswer": "Unilaterally enforce a linear relationship between their own payoff and opponent’s payoff",
        "boilerplate": "",
        "tags": [
          "game-theory"
        ],
        "hint": "Extortionate ZD strategies can pin opponent score down regardless of their counter-strategy.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "PCP Theorem Hardness of Approximation",
        "description": "The Probabilistically Checkable Proofs (PCP) theorem implies that verifying NP certificates requires reading only:",
        "options": [
          "A constant O(1) number of bits using O(log n) random bits",
          "O(√n) bits deterministically",
          "The entire polynomial proof stream",
          "Zero bits using quantum superposition"
        ],
        "correctAnswer": "A constant O(1) number of bits using O(log n) random bits",
        "boilerplate": "",
        "tags": [
          "computational-complexity"
        ],
        "hint": "PCP(O(log n), O(1)) = NP; proves NP-hardness of calculating approximations.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      }
    ]
  },
  "prediction": {
    "beginner": [
      {
        "title": "String Coercion with Plus Operator",
        "description": "What is the output of the following JavaScript expression?\nconsole.log(\"5\" + 3);",
        "options": [
          "\"53\"",
          "8",
          "NaN",
          "Error"
        ],
        "correctAnswer": "\"53\"",
        "boilerplate": "console.log(\"5\" + 3);",
        "tags": [
          "javascript",
          "type-coercion"
        ],
        "hint": "The + operator with a string triggers string concatenation.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Minus Operator Numeric Coercion",
        "description": "What is the output of the following expression?\nconsole.log(\"10\" - 4);",
        "options": [
          "6",
          "\"104\"",
          "\"6\"",
          "NaN"
        ],
        "correctAnswer": "6",
        "boilerplate": "console.log(\"10\" - 4);",
        "tags": [
          "javascript",
          "type-coercion"
        ],
        "hint": "The - operator converts strings to numeric values.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Array Push Return Value",
        "description": "What does array.push() return in JavaScript?\nlet arr = [1, 2];\nlet res = arr.push(3);\nconsole.log(res);",
        "options": [
          "3",
          "[1, 2, 3]",
          "undefined",
          "2"
        ],
        "correctAnswer": "3",
        "boilerplate": "let arr = [1, 2];\nlet res = arr.push(3);\nconsole.log(res);",
        "tags": [
          "javascript",
          "arrays"
        ],
        "hint": ".push() returns the new length of the array.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Typeof Array in JavaScript",
        "description": "What does typeof [1, 2, 3] evaluate to?",
        "options": [
          "\"object\"",
          "\"array\"",
          "\"list\"",
          "\"undefined\""
        ],
        "correctAnswer": "\"object\"",
        "boilerplate": "console.log(typeof [1, 2, 3]);",
        "tags": [
          "javascript",
          "types"
        ],
        "hint": "Arrays are objects in JavaScript.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Boolean Equality Loose Check",
        "description": "What is the evaluation of: false == 0?",
        "options": [
          "true",
          "false",
          "TypeError",
          "undefined"
        ],
        "correctAnswer": "true",
        "boilerplate": "console.log(false == 0);",
        "tags": [
          "javascript",
          "equality"
        ],
        "hint": "Loose equality coerces false to 0.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Strict Equality Check Type Mismatch",
        "description": "What is the evaluation of: \"7\" === 7?",
        "options": [
          "false",
          "true",
          "TypeError",
          "undefined"
        ],
        "correctAnswer": "false",
        "boilerplate": "console.log(\"7\" === 7);",
        "tags": [
          "javascript",
          "equality"
        ],
        "hint": "Strict equality (===) checks both value and type without coercion.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Empty Array Boolean Context",
        "description": "What is Boolean([]) in JavaScript?",
        "options": [
          "true",
          "false",
          "TypeError",
          "null"
        ],
        "correctAnswer": "true",
        "boilerplate": "console.log(Boolean([]));",
        "tags": [
          "javascript",
          "truthy-falsy"
        ],
        "hint": "All objects (including empty arrays) are truthy.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "NaN Equality Self Comparison",
        "description": "What is the output of: console.log(NaN === NaN);",
        "options": [
          "false",
          "true",
          "TypeError",
          "undefined"
        ],
        "correctAnswer": "false",
        "boilerplate": "console.log(NaN === NaN);",
        "tags": [
          "javascript",
          "nan"
        ],
        "hint": "IEEE 754 standard defines NaN as not equal to anything, including itself.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Array Slice Non Destructive",
        "description": "What is the value of arr after this operation?\nconst arr = [10, 20, 30];\narr.slice(1, 2);\nconsole.log(arr.length);",
        "options": [
          "3",
          "1",
          "2",
          "0"
        ],
        "correctAnswer": "3",
        "boilerplate": "const arr = [10, 20, 30];\narr.slice(1, 2);\nconsole.log(arr.length);",
        "tags": [
          "javascript",
          "arrays"
        ],
        "hint": "slice() returns a shallow copy and does not mutate original array.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Integer Division Floating Point",
        "description": "In JavaScript, what is 7 / 2?",
        "options": [
          "3.5",
          "3",
          "3.0",
          "4"
        ],
        "correctAnswer": "3.5",
        "boilerplate": "console.log(7 / 2);",
        "tags": [
          "javascript",
          "math"
        ],
        "hint": "Numbers in JS are 64-bit floating point numbers.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Loop Increment Prefix vs Postfix",
        "description": "What is printed by: let i = 3; console.log(i++);",
        "options": [
          "3",
          "4",
          "2",
          "undefined"
        ],
        "correctAnswer": "3",
        "boilerplate": "let i = 3;\nconsole.log(i++);",
        "tags": [
          "javascript",
          "operators"
        ],
        "hint": "Postfix i++ returns the current value before incrementing.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "String Substring Indices",
        "description": "What is output of: \"Antigravity\".substring(0, 4);",
        "options": [
          "\"Anti\"",
          "\"Antig\"",
          "\"ntig\"",
          "\"Ant\""
        ],
        "correctAnswer": "\"Anti\"",
        "boilerplate": "console.log(\"Antigravity\".substring(0, 4));",
        "tags": [
          "javascript",
          "string"
        ],
        "hint": "Extracts indices from 0 up to (not including) 4.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Nullish Coalescing vs OR",
        "description": "What is printed: console.log(0 ?? 42);",
        "options": [
          "0",
          "42",
          "undefined",
          "null"
        ],
        "correctAnswer": "0",
        "boilerplate": "console.log(0 ?? 42);",
        "tags": [
          "javascript",
          "operators"
        ],
        "hint": "Nullish coalescing (??) only checks for null or undefined; 0 is defined.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Array Pop Return Value",
        "description": "What is the output?\nconst fruits = [\"apple\", \"banana\", \"orange\"];\nconsole.log(fruits.pop());",
        "options": [
          "\"orange\"",
          "\"apple\"",
          "2",
          "[\"apple\", \"banana\"]"
        ],
        "correctAnswer": "\"orange\"",
        "boilerplate": "const fruits = [\"apple\", \"banana\", \"orange\"];\nconsole.log(fruits.pop());",
        "tags": [
          "javascript",
          "arrays"
        ],
        "hint": "pop() removes and returns the last element.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Math Floor Negative Number",
        "description": "What is Math.floor(-3.14)?",
        "options": [
          "-4",
          "-3",
          "-3.14",
          "-3.0"
        ],
        "correctAnswer": "-4",
        "boilerplate": "console.log(Math.floor(-3.14));",
        "tags": [
          "javascript",
          "math"
        ],
        "hint": "floor rounds DOWN towards negative infinity.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "ParseInt Radix Omission",
        "description": "What does parseInt(\"010\") evaluate to in modern ECMAScript?",
        "options": [
          "10",
          "8",
          "0",
          "NaN"
        ],
        "correctAnswer": "10",
        "boilerplate": "console.log(parseInt(\"010\"));",
        "tags": [
          "javascript",
          "parsing"
        ],
        "hint": "ES5+ treats leading zeros as base 10 unless prefixed with 0o or 0x.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Default Function Parameter Undefined",
        "description": "What does fn() log?\nfunction fn(x = 10) { console.log(x); }\nfn(undefined);",
        "options": [
          "10",
          "undefined",
          "null",
          "NaN"
        ],
        "correctAnswer": "10",
        "boilerplate": "function fn(x = 10) { console.log(x); }\nfn(undefined);",
        "tags": [
          "javascript",
          "functions"
        ],
        "hint": "Passing undefined triggers default parameter assignment.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Array Index Out of Bounds",
        "description": "What is logged?\nconst arr = [1, 2];\nconsole.log(arr[5]);",
        "options": [
          "undefined",
          "null",
          "IndexError",
          "0"
        ],
        "correctAnswer": "undefined",
        "boilerplate": "const arr = [1, 2];\nconsole.log(arr[5]);",
        "tags": [
          "javascript",
          "arrays"
        ],
        "hint": "Accessing out of bounds indices returns undefined in JS.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      }
    ],
    "intermediate": [
      {
        "title": "Closure Var Loop Async Output",
        "description": "What is printed?\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
        "options": [
          "3 3 3",
          "0 1 2",
          "undefined undefined undefined",
          "0 0 0"
        ],
        "correctAnswer": "3 3 3",
        "boilerplate": "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
        "tags": [
          "javascript",
          "event-loop",
          "closures"
        ],
        "hint": "var is function-scoped; by the time timeouts execute, i is 3.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Closure Let Loop Block Scoping",
        "description": "What is printed?\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
        "options": [
          "0 1 2",
          "3 3 3",
          "undefined undefined undefined",
          "2 2 2"
        ],
        "correctAnswer": "0 1 2",
        "boilerplate": "for (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
        "tags": [
          "javascript",
          "closures"
        ],
        "hint": "let creates a fresh binding for each loop iteration.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Arrow Function This Binding Context",
        "description": "What is logged?\nconst obj = {\n  val: 42,\n  getVal: () => this.val\n};\nconsole.log(obj.getVal());",
        "options": [
          "undefined",
          "42",
          "TypeError",
          "window"
        ],
        "correctAnswer": "undefined",
        "boilerplate": "const obj = {\n  val: 42,\n  getVal: () => this.val\n};\nconsole.log(obj.getVal());",
        "tags": [
          "javascript",
          "this"
        ],
        "hint": "Arrow functions do not bind their own this; they inherit lexical scope (global/module).",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Array Map Returns Undefined Without Return",
        "description": "What is output?\nconst r = [1, 2, 3].map(x => { x * 2; });\nconsole.log(r);",
        "options": [
          "[undefined, undefined, undefined]",
          "[2, 4, 6]",
          "[1, 2, 3]",
          "[]"
        ],
        "correctAnswer": "[undefined, undefined, undefined]",
        "boilerplate": "const r = [1, 2, 3].map(x => { x * 2; });\nconsole.log(r);",
        "tags": [
          "javascript",
          "functional"
        ],
        "hint": "Curly braces define a block body requiring an explicit return statement.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Object Key Stringification",
        "description": "What is logged?\nconst a = {}, b = { key: \"b\" }, c = { key: \"c\" };\na[b] = 123;\na[c] = 456;\nconsole.log(a[b]);",
        "options": [
          "456",
          "123",
          "undefined",
          "TypeError"
        ],
        "correctAnswer": "456",
        "boilerplate": "const a = {}, b = { key: \"b\" }, c = { key: \"c\" };\na[b] = 123;\na[c] = 456;\nconsole.log(a[b]);",
        "tags": [
          "javascript",
          "objects"
        ],
        "hint": "Both b and c stringify to \"[object Object]\" as dictionary keys.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Hoisting Function vs Var Priority",
        "description": "What is logged?\nconsole.log(typeof myFunc);\nfunction myFunc() {}\nvar myFunc = 5;",
        "options": [
          "\"function\"",
          "\"undefined\"",
          "\"number\"",
          "TypeError"
        ],
        "correctAnswer": "\"function\"",
        "boilerplate": "console.log(typeof myFunc);\nfunction myFunc() {}\nvar myFunc = 5;",
        "tags": [
          "javascript",
          "hoisting"
        ],
        "hint": "Function declarations are hoisted above variable declarations.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Array Sort Alphabetical Default",
        "description": "What is the output of:\n[1, 5, 20, 100].sort();",
        "options": [
          "[1, 100, 20, 5]",
          "[1, 5, 20, 100]",
          "[100, 20, 5, 1]",
          "[1, 20, 100, 5]"
        ],
        "correctAnswer": "[1, 100, 20, 5]",
        "boilerplate": "console.log([1, 5, 20, 100].sort());",
        "tags": [
          "javascript",
          "sorting"
        ],
        "hint": "Default sort converts elements to strings and compares UTF-16 code units.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Temporal Dead Zone Let",
        "description": "What happens when executing:\nconsole.log(a);\nlet a = 10;",
        "options": [
          "ReferenceError",
          "undefined",
          "10",
          "null"
        ],
        "correctAnswer": "ReferenceError",
        "boilerplate": "console.log(a);\nlet a = 10;",
        "tags": [
          "javascript",
          "scoping"
        ],
        "hint": "Accessing let before declaration triggers ReferenceError (Temporal Dead Zone).",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Array Reduce Initial Value Absence",
        "description": "What is logged?\nconst arr = [1, 2, 3];\nconst res = arr.reduce((acc, cur) => acc - cur);\nconsole.log(res);",
        "options": [
          "-4",
          "-6",
          "0",
          "NaN"
        ],
        "correctAnswer": "-4",
        "boilerplate": "const arr = [1, 2, 3];\nconst res = arr.reduce((acc, cur) => acc - cur);\nconsole.log(res);",
        "tags": [
          "javascript",
          "reduce"
        ],
        "hint": "Without initial value, acc starts as arr[0]=1: (1 - 2) - 3 = -4.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "JSON Stringify Undefined Property",
        "description": "What is logged?\nconst obj = { a: 1, b: undefined };\nconsole.log(JSON.stringify(obj));",
        "options": [
          "\"{\\\"a\\\":1}\"",
          "\"{\\\"a\\\":1,\\\"b\\\":null}\"",
          "\"{\\\"a\\\":1,\\\"b\\\":undefined}\"",
          "TypeError"
        ],
        "correctAnswer": "\"{\\\"a\\\":1}\"",
        "boilerplate": "const obj = { a: 1, b: undefined };\nconsole.log(JSON.stringify(obj));",
        "tags": [
          "javascript",
          "json"
        ],
        "hint": "JSON.stringify omits undefined properties from objects.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Python Slicing Negative Stride",
        "description": "What is output of Python expression:\n\"python\"[::-1]",
        "options": [
          "\"nohtyp\"",
          "\"python\"",
          "\"nohty\"",
          "IndexError"
        ],
        "correctAnswer": "\"nohtyp\"",
        "boilerplate": "# Python\nprint(\"python\"[::-1])",
        "tags": [
          "python",
          "slicing"
        ],
        "hint": "Step -1 reverses the sequence.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Python Default Mutable Argument Trap",
        "description": "What is output of calling f() twice in Python?\ndef f(val, l=[]):\n    l.append(val)\n    return l\nf(1)\nprint(f(2))",
        "options": [
          "[1, 2]",
          "[2]",
          "[1]",
          "TypeError"
        ],
        "correctAnswer": "[1, 2]",
        "boilerplate": "def f(val, l=[]):\n    l.append(val)\n    return l\nf(1)\nprint(f(2))",
        "tags": [
          "python",
          "gotchas"
        ],
        "hint": "Default mutable arguments are evaluated once at function definition time.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Promise Microtask Order Single",
        "description": "What is printed first?\nPromise.resolve().then(() => console.log(\"A\"));\nconsole.log(\"B\");",
        "options": [
          "B then A",
          "A then B",
          "A only",
          "B only"
        ],
        "correctAnswer": "B then A",
        "boilerplate": "Promise.resolve().then(() => console.log(\"A\"));\nconsole.log(\"B\");",
        "tags": [
          "javascript",
          "event-loop"
        ],
        "hint": "Synchronous console.log(\"B\") executes before microtask \"A\".",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Object Destructuring Default Fallback",
        "description": "What is logged?\nconst { x = 5 } = { x: null };\nconsole.log(x);",
        "options": [
          "null",
          "5",
          "undefined",
          "ReferenceError"
        ],
        "correctAnswer": "null",
        "boilerplate": "const { x = 5 } = { x: null };\nconsole.log(x);",
        "tags": [
          "javascript",
          "destructuring"
        ],
        "hint": "Default value 5 only triggers when value is undefined, not null.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Spread Operator Shallow Copy Reference",
        "description": "What is logged?\nconst a = [{ n: 1 }];\nconst b = [...a];\nb[0].n = 99;\nconsole.log(a[0].n);",
        "options": [
          "99",
          "1",
          "undefined",
          "TypeError"
        ],
        "correctAnswer": "99",
        "boilerplate": "const a = [{ n: 1 }];\nconst b = [...a];\nb[0].n = 99;\nconsole.log(a[0].n);",
        "tags": [
          "javascript",
          "mutability"
        ],
        "hint": "Spread operator shallow copies; object references inside are shared.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Function Length Property Meaning",
        "description": "What is logged?\nfunction test(a, b = 2, c) {}\nconsole.log(test.length);",
        "options": [
          "1",
          "3",
          "2",
          "0"
        ],
        "correctAnswer": "1",
        "boilerplate": "function test(a, b = 2, c) {}\nconsole.log(test.length);",
        "tags": [
          "javascript",
          "functions"
        ],
        "hint": "Function .length is number of parameters before the first default parameter.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Math Max With Empty Array",
        "description": "What does Math.max(...[]) evaluate to?",
        "options": [
          "-Infinity",
          "0",
          "Infinity",
          "NaN"
        ],
        "correctAnswer": "-Infinity",
        "boilerplate": "console.log(Math.max(...[]));",
        "tags": [
          "javascript",
          "math"
        ],
        "hint": "Math.max() with no arguments returns -Infinity.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Python List Multiplication Reference Copy",
        "description": "In Python: a = [[0]] * 3; a[0][0] = 7; print(a)",
        "options": [
          "[[7], [7], [7]]",
          "[[7], [0], [0]]",
          "[[0], [0], [7]]",
          "TypeError"
        ],
        "correctAnswer": "[[7], [7], [7]]",
        "boilerplate": "# Python\na = [[0]] * 3\na[0][0] = 7\nprint(a)",
        "tags": [
          "python",
          "references"
        ],
        "hint": "List multiplication repeats references to the same inner list object.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      }
    ],
    "advanced": [
      {
        "title": "Event Loop Microtask vs Macrotask Interleaving",
        "description": "What is the exact execution log order?\nsetTimeout(() => console.log(1), 0);\nPromise.resolve().then(() => console.log(2));\nPromise.resolve().then(() => setTimeout(() => console.log(3), 0));\nconsole.log(4);",
        "options": [
          "4, 2, 1, 3",
          "4, 1, 2, 3",
          "2, 4, 1, 3",
          "4, 2, 3, 1"
        ],
        "correctAnswer": "4, 2, 1, 3",
        "boilerplate": "setTimeout(() => console.log(1), 0);\nPromise.resolve().then(() => console.log(2));\nPromise.resolve().then(() => setTimeout(() => console.log(3), 0));\nconsole.log(4);",
        "tags": [
          "javascript",
          "event-loop"
        ],
        "hint": "Sync (4) → Microtasks (2, schedules timer 3) → Macrotask queue in order (1, then 3).",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Async Await Microtask Suspension",
        "description": "What is logged?\nasync function async1() {\n  console.log(\"A\");\n  await async2();\n  console.log(\"B\");\n}\nasync function async2() {\n  console.log(\"C\");\n}\nasync1();\nconsole.log(\"D\");",
        "options": [
          "A, C, D, B",
          "A, B, C, D",
          "A, C, B, D",
          "D, A, C, B"
        ],
        "correctAnswer": "A, C, D, B",
        "boilerplate": "async function async1() {\n  console.log(\"A\");\n  await async2();\n  console.log(\"B\");\n}\nasync function async2() {\n  console.log(\"C\");\n}\nasync1();\nconsole.log(\"D\");",
        "tags": [
          "javascript",
          "async"
        ],
        "hint": "await suspends async1, allowing sync console.log(\"D\") to execute before \"B\".",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Prototype Chain Property Shadowing",
        "description": "What is logged?\nfunction Parent() { this.x = 10; }\nParent.prototype.x = 20;\nconst child = new Parent();\ndelete child.x;\nconsole.log(child.x);",
        "options": [
          "20",
          "undefined",
          "10",
          "null"
        ],
        "correctAnswer": "20",
        "boilerplate": "function Parent() { this.x = 10; }\nParent.prototype.x = 20;\nconst child = new Parent();\ndelete child.x;\nconsole.log(child.x);",
        "tags": [
          "javascript",
          "prototypes"
        ],
        "hint": "Deleting instance property reveals prototype property x = 20.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "NumPy Broadcasting Output Shape",
        "description": "Given NumPy array A with shape (3, 1) and B with shape (1, 4), what is shape of (A + B)?",
        "options": [
          "(3, 4)",
          "(1, 1)",
          "(3, 1, 4)",
          "ValueError"
        ],
        "correctAnswer": "(3, 4)",
        "boilerplate": "# Python NumPy\n# A.shape = (3, 1), B.shape = (1, 4)\n# (A + B).shape = ?",
        "tags": [
          "numpy",
          "broadcasting"
        ],
        "hint": "Dimensions are stretched where size is 1.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "JavaScript Proxy Get Trap Interception",
        "description": "What is logged?\nconst p = new Proxy({}, {\n  get: (target, prop) => prop in target ? target[prop] : 42\n});\np.a = 10;\nconsole.log(p.a, p.b);",
        "options": [
          "10 42",
          "10 undefined",
          "42 42",
          "TypeError"
        ],
        "correctAnswer": "10 42",
        "boilerplate": "const p = new Proxy({}, {\n  get: (target, prop) => prop in target ? target[prop] : 42\n});\np.a = 10;\nconsole.log(p.a, p.b);",
        "tags": [
          "javascript",
          "proxies"
        ],
        "hint": "Trap intercepts property read and returns 42 for non-existent key.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Generator Two-Way Communication Yield",
        "description": "What is logged?\nfunction* gen() {\n  const x = yield 1;\n  yield x * 10;\n}\nconst g = gen();\ng.next();\nconsole.log(g.next(5).value);",
        "options": [
          "50",
          "10",
          "5",
          "NaN"
        ],
        "correctAnswer": "50",
        "boilerplate": "function* gen() {\n  const x = yield 1;\n  yield x * 10;\n}\nconst g = gen();\ng.next();\nconsole.log(g.next(5).value);",
        "tags": [
          "javascript",
          "generators"
        ],
        "hint": "Value passed to g.next(5) becomes the return value of yield 1.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "JavaScript Symbol Registry Identity",
        "description": "What is logged?\nconsole.log(Symbol.for(\"app\") === Symbol.for(\"app\"));\nconsole.log(Symbol(\"app\") === Symbol(\"app\"));",
        "options": [
          "true false",
          "true true",
          "false false",
          "false true"
        ],
        "correctAnswer": "true false",
        "boilerplate": "console.log(Symbol.for(\"app\") === Symbol.for(\"app\"));\nconsole.log(Symbol(\"app\") === Symbol(\"app\"));",
        "tags": [
          "javascript",
          "symbols"
        ],
        "hint": "Symbol.for shares registry; Symbol() always creates unique instances.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Regex Positive Lookahead Match Extraction",
        "description": "What is returned by: \"price $100 price $250\".match(/\\d+(?=\\s|$)/g)?",
        "options": [
          "[\"100\", \"250\"]",
          "[\"$100\", \"$250\"]",
          "[\"100\"]",
          "null"
        ],
        "correctAnswer": "[\"100\", \"250\"]",
        "boilerplate": "console.log(\"price $100 price $250\".match(/\\d+(?=\\s|$)/g));",
        "tags": [
          "regex"
        ],
        "hint": "Matches numbers immediately followed by whitespace or string end without consuming.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "WeakMap Key Garbage Collection Behavior",
        "description": "Why do WeakMap keys not prevent garbage collection?",
        "options": [
          "WeakMap holds weak references to its object keys",
          "WeakMap runs on a background Web Worker",
          "Keys are copied by value to heap snapshot",
          "WeakMap is destroyed after function exits"
        ],
        "correctAnswer": "WeakMap holds weak references to its object keys",
        "boilerplate": "",
        "tags": [
          "javascript",
          "memory"
        ],
        "hint": "Allows object keys to be GC’d if no other strong references exist.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Python Walrus Operator Evaluation",
        "description": "What does this print in Python 3.8+?\nif (n := len(\"code\")) > 3:\n    print(n * 2)",
        "options": [
          "8",
          "4",
          "6",
          "SyntaxError"
        ],
        "correctAnswer": "8",
        "boilerplate": "# Python 3.8+\nif (n := len(\"code\")) > 3:\n    print(n * 2)",
        "tags": [
          "python",
          "syntax"
        ],
        "hint": "Walrus operator := assigns n = 4 and returns 4; 4 * 2 = 8.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Array FlatMap Empty Filter Trick",
        "description": "What is output?\nconst res = [1, 2, 3, 4].flatMap(x => x % 2 === 0 ? [x * 2] : []);\nconsole.log(res);",
        "options": [
          "[4, 8]",
          "[2, 4, 6, 8]",
          "[undefined, 4, undefined, 8]",
          "[]"
        ],
        "correctAnswer": "[4, 8]",
        "boilerplate": "console.log([1, 2, 3, 4].flatMap(x => x % 2 === 0 ? [x * 2] : []));",
        "tags": [
          "javascript",
          "functional"
        ],
        "hint": "Returning empty array in flatMap filters out odd numbers.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Promise All vs AllSettled Rejection",
        "description": "What does Promise.allSettled() do when one promise rejects?",
        "options": [
          "Waits for all promises and returns array of status objects including rejected reason",
          "Rejects immediately with first error",
          "Ignores the rejected promise completely",
          "Throws an uncaught exception"
        ],
        "correctAnswer": "Waits for all promises and returns array of status objects including rejected reason",
        "boilerplate": "",
        "tags": [
          "javascript",
          "promises"
        ],
        "hint": "Never short-circuits on rejection, unlike Promise.all().",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Object Freeze vs Object Seal Modification",
        "description": "What is allowed on an Object.seal() object that is forbidden on Object.freeze()?",
        "options": [
          "Modifying existing property values",
          "Adding new properties",
          "Deleting properties",
          "Changing prototype"
        ],
        "correctAnswer": "Modifying existing property values",
        "boilerplate": "",
        "tags": [
          "javascript",
          "objects"
        ],
        "hint": "seal prevents adding/deleting properties but allows updating existing values.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Pandas DataFrame Loc vs Iloc Indexing",
        "description": "In Pandas, if index is integer-based [2, 1, 0], what does df.loc[0] select?",
        "options": [
          "The row with index label 0 (the 3rd row)",
          "The first row of the DataFrame",
          "Column 0",
          "KeyError"
        ],
        "correctAnswer": "The row with index label 0 (the 3rd row)",
        "boilerplate": "",
        "tags": [
          "pandas"
        ],
        "hint": ".loc accesses by index label, whereas .iloc accesses by integer position.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "CSS Specificity ID vs Ten Classes",
        "description": "In CSS specificity cascade, which rule overrides the other?",
        "options": [
          "A single ID selector #header beats 10 chained class selectors .c1.c2...c10",
          "10 class selectors beat 1 ID selector",
          "Whichever is written later in stylesheet always wins",
          "They have identical specificity"
        ],
        "correctAnswer": "A single ID selector #header beats 10 chained class selectors .c1.c2...c10",
        "boilerplate": "",
        "tags": [
          "css"
        ],
        "hint": "Specificity base: (0, 1, 0, 0) for ID beats (0, 0, 10, 0) for classes.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      }
    ],
    "expert": [
      {
        "title": "V8 Hidden Class Transitions Inline Cache",
        "description": "How does dynamically assigning properties in different order (obj.a then obj.b vs obj.b then obj.a) affect V8 performance?",
        "options": [
          "Creates two separate hidden class transitions, causing megamorphic inline cache misses",
          "No effect because V8 uses hash tables for all objects",
          "Improves garbage collection speed",
          "Triggers immediate recompilation of all functions"
        ],
        "correctAnswer": "Creates two separate hidden class transitions, causing megamorphic inline cache misses",
        "boilerplate": "",
        "tags": [
          "v8",
          "performance"
        ],
        "hint": "Hidden classes (Maps/Shapes) depend on property addition transition trees.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Microtask Starvation While Loop",
        "description": "What happens when recursively queueing microtasks via queueMicrotask()?",
        "options": [
          "Event loop starves: UI rendering, user inputs, and setTimeout timers never execute",
          "JavaScript engine throws \"Maximum call stack exceeded\"",
          "Engine drops microtasks after 1000 iterations",
          "Browser schedules them on worker threads"
        ],
        "correctAnswer": "Event loop starves: UI rendering, user inputs, and setTimeout timers never execute",
        "boilerplate": "",
        "tags": [
          "javascript",
          "event-loop"
        ],
        "hint": "Microtask queue must completely drain before moving to next event loop phase.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Tail Call Optimization Recursion Stack",
        "description": "Under ES6 strict mode Tail Call Optimization (TCO), what is maximum call stack depth of properly written tail-recursive function?",
        "options": [
          "O(1) constant stack frames",
          "O(N) stack frames",
          "Maximum 10,000 frames",
          "Memory allocation fails"
        ],
        "correctAnswer": "O(1) constant stack frames",
        "boilerplate": "",
        "tags": [
          "javascript",
          "compiler-optimization"
        ],
        "hint": "Reuses caller’s stack frame without growing call stack.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Python GIL Threading Bound Performance",
        "description": "Why does running two CPU-bound threads in standard CPython on a multi-core CPU often run SLOWER than a single thread?",
        "options": [
          "GIL lock contention and OS thread context switching overhead",
          "Python compiler inserts sleep instructions",
          "Memory bus hardware saturation",
          "Python disable CPU caching for threads"
        ],
        "correctAnswer": "GIL lock contention and OS thread context switching overhead",
        "boilerplate": "",
        "tags": [
          "python",
          "concurrency"
        ],
        "hint": "CPython’s Global Interpreter Lock allows only one native thread to execute bytecode at once.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "JavaScript BigInt Strict Equality to Number",
        "description": "What is logged?\nconsole.log(10n == 10);\nconsole.log(10n === 10);",
        "options": [
          "true false",
          "true true",
          "false false",
          "TypeError"
        ],
        "correctAnswer": "true false",
        "boilerplate": "console.log(10n == 10);\nconsole.log(10n === 10);",
        "tags": [
          "javascript",
          "bigint"
        ],
        "hint": "Loose equality allows numeric comparison; strict equality checks distinct types (bigint vs number).",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Concurrent Go Channels Deadlock",
        "description": "What happens when sending to an unbuffered Go channel with no concurrent receiver?\nch := make(chan int)\nch <- 42",
        "options": [
          "Runtime panic: \"all goroutines are asleep - deadlock!\"",
          "Channel stores 42 silently",
          "Message is dropped",
          "Program terminates with exit code 0"
        ],
        "correctAnswer": "Runtime panic: \"all goroutines are asleep - deadlock!\"",
        "boilerplate": "",
        "tags": [
          "golang",
          "concurrency"
        ],
        "hint": "Unbuffered channel sends block until a receiver is ready.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "JavaScript Prototype Pollution Exploit",
        "description": "What vulnerability occurs when an unsanitized recursive merge modifies Object.prototype?",
        "options": [
          "Prototype Pollution affecting all existing and newly created objects globally",
          "SQL injection in IndexedDB",
          "Cross-site request forgery",
          "CSS expression injection"
        ],
        "correctAnswer": "Prototype Pollution affecting all existing and newly created objects globally",
        "boilerplate": "",
        "tags": [
          "security",
          "javascript"
        ],
        "hint": "__proto__ injection injects properties into base Object prototype.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Async Generator Yield Await Sequence",
        "description": "What is logged?\nasync function* ag() {\n  yield await Promise.resolve(1);\n  yield 2;\n}\n(async () => {\n  for await (const v of ag()) console.log(v);\n})();",
        "options": [
          "1 then 2",
          "2 then 1",
          "Promise Promise",
          "undefined"
        ],
        "correctAnswer": "1 then 2",
        "boilerplate": "async function* ag() {\n  yield await Promise.resolve(1);\n  yield 2;\n}\n(async () => {\n  for await (const v of ag()) console.log(v);\n})();",
        "tags": [
          "javascript",
          "async-iterators"
        ],
        "hint": "for await iterates asynchronously over yielded values.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Rust Borrow Checker Lifetime Scope",
        "description": "What does the Rust compiler report when attempting to mutate a vector while holding an immutable reference to one of its elements?",
        "options": [
          "Compile error: cannot borrow vec as mutable because it is also borrowed as immutable",
          "Silent reallocation and invalid pointer",
          "Runtime segmentation fault",
          "Warning: slow memory access"
        ],
        "correctAnswer": "Compile error: cannot borrow vec as mutable because it is also borrowed as immutable",
        "boilerplate": "",
        "tags": [
          "rust",
          "borrow-checker"
        ],
        "hint": "Aliasing XOR Mutability guarantee at compile time.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "SQL Isolation Non-Repeatable Read vs Phantom Read",
        "description": "What defines a \"Phantom Read\" that distinguishes it from a Non-Repeatable Read?",
        "options": [
          "A transaction re-executes a range query and finds new rows inserted by another committed transaction",
          "A single updated row changes value mid-transaction",
          "Data is read from rolled-back uncommitted transaction",
          "Locks are escalated to exclusive table lock"
        ],
        "correctAnswer": "A transaction re-executes a range query and finds new rows inserted by another committed transaction",
        "boilerplate": "",
        "tags": [
          "databases",
          "acid"
        ],
        "hint": "Phantom reads involve new rows appearing in a search condition range.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "C Pointer Arithmetic Type Sizing",
        "description": "In C on 64-bit system, if int *ptr = 1000; what is value of ptr + 2?",
        "options": [
          "1008 (assuming sizeof(int) == 4)",
          "1002",
          "1016",
          "1004"
        ],
        "correctAnswer": "1008 (assuming sizeof(int) == 4)",
        "boilerplate": "",
        "tags": [
          "c",
          "memory"
        ],
        "hint": "Pointer arithmetic scales by size of pointed type: 1000 + 2 × 4 = 1008.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "JavaScript Reflect Construct Target",
        "description": "What does Reflect.construct(Target, args, NewTarget) allow you to customize?",
        "options": [
          "Invoke constructor Target with new.target set to NewTarget",
          "Bypass all constructor logic",
          "Construct objects without memory allocation",
          "Convert class to regular function"
        ],
        "correctAnswer": "Invoke constructor Target with new.target set to NewTarget",
        "boilerplate": "",
        "tags": [
          "javascript",
          "reflect"
        ],
        "hint": "Allows subclassing built-ins and custom prototype assignments.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Linux Epoll Edge-Triggered vs Level-Triggered",
        "description": "In Linux epoll edge-triggered (EPOLLET) mode, what happens if an application does not read all available bytes in socket buffer?",
        "options": [
          "epoll_wait will NOT trigger another notification until new data arrives on socket",
          "epoll_wait fires immediately again in next loop",
          "Socket buffer is automatically flushed and data is lost",
          "Kernel terminates the process with SIGPIPE"
        ],
        "correctAnswer": "epoll_wait will NOT trigger another notification until new data arrives on socket",
        "boilerplate": "",
        "tags": [
          "linux",
          "networking"
        ],
        "hint": "Edge-triggered mode notifies only on state transitions, requiring non-blocking read until EAGAIN.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      }
    ],
    "master": [
      {
        "title": "C++ Move Semantics Rvalue State",
        "description": "In modern C++, what is guaranteed about the state of std::string s after calling auto s2 = std::move(s);?",
        "options": [
          "s is left in a valid but unspecified state",
          "s is guaranteed to be empty \"\"",
          "s is deleted from memory and pointer is null",
          "Accessing s causes immediate undefined behavior"
        ],
        "correctAnswer": "s is left in a valid but unspecified state",
        "boilerplate": "",
        "tags": [
          "cpp",
          "memory"
        ],
        "hint": "Standard library guarantees moved-from objects satisfy class invariants and destructibility.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Java Memory Model Happens-Before Volatile",
        "description": "Under the Java Memory Model (JMM), what memory barrier guarantee is provided by writing to a volatile variable?",
        "options": [
          "Write to volatile happens-before every subsequent read of the same volatile variable across threads",
          "All variables in JVM are locked with mutual exclusion",
          "Prevents garbage collection of thread stack",
          "Forces write directly to NVMe SSD"
        ],
        "correctAnswer": "Write to volatile happens-before every subsequent read of the same volatile variable across threads",
        "boilerplate": "",
        "tags": [
          "jvm",
          "concurrency"
        ],
        "hint": "Establishes memory synchronization and prevents instruction reordering across the barrier.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Lock-Free CAS ABA Problem Solution",
        "description": "How is the classic ABA problem prevented in lock-free Compare-And-Swap (CAS) data structures?",
        "options": [
          "Tagging pointers with a monotonically increasing version/counter (Tagged Pointers)",
          "Acquiring a global mutex lock before CAS",
          "Using 32-bit pointers instead of 64-bit",
          "Disabling multi-core CPU cache"
        ],
        "correctAnswer": "Tagging pointers with a monotonically increasing version/counter (Tagged Pointers)",
        "boilerplate": "",
        "tags": [
          "concurrency",
          "lock-free"
        ],
        "hint": "Double-word CAS checks both pointer address and generation counter.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "False Sharing CPU Cache Line Contention",
        "description": "In multi-threaded programming, what causes \"False Sharing\" when threads operate on independent variables?",
        "options": [
          "Independent variables reside on the same 64-byte CPU cache line, triggering constant invalidation",
          "Threads read from different RAM banks",
          "OS schedules threads on the same core",
          "Variables have duplicate memory addresses"
        ],
        "correctAnswer": "Independent variables reside on the same 64-byte CPU cache line, triggering constant invalidation",
        "boilerplate": "",
        "tags": [
          "hardware",
          "performance"
        ],
        "hint": "Prevented by padding data structures to cache line boundaries.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "SIMD Vectorization Auto-Vectorization Barrier",
        "description": "Which loop condition strictly prevents a C/C++ compiler from generating AVX2 SIMD vectorized instructions?",
        "options": [
          "Loop-carried cross-iteration data dependency (pointer aliasing / write after read)",
          "Loop index incrementing by 1",
          "Loop upper bound known at compile time",
          "Array allocated on stack"
        ],
        "correctAnswer": "Loop-carried cross-iteration data dependency (pointer aliasing / write after read)",
        "boilerplate": "",
        "tags": [
          "compilers",
          "simd"
        ],
        "hint": "Restricting pointer aliasing with restrict keyword enables auto-vectorization.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "PostgreSQL Heap Only Tuples Optimization",
        "description": "What requirement must be met for PostgreSQL to perform a Heap-Only Tuple (HOT) update without modifying index pages?",
        "options": [
          "Updated row fits on the same data page and none of the updated columns are indexed",
          "Table has no primary key",
          "Transaction is read-only",
          "All indexes are disabled"
        ],
        "correctAnswer": "Updated row fits on the same data page and none of the updated columns are indexed",
        "boilerplate": "",
        "tags": [
          "databases",
          "postgresql"
        ],
        "hint": "Eliminates index bloat and saves disk writes.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Reactor vs Proactor Network Pattern",
        "description": "What is the architectural difference between the Reactor pattern (Node.js/libuv) and Proactor pattern (Windows IOCP)?",
        "options": [
          "Reactor notifies when socket is READY to perform I/O; Proactor initiates async operation and notifies on COMPLETION",
          "Reactor is synchronous multi-threaded; Proactor is single-threaded",
          "Proactor cannot handle TCP connections",
          "Reactor requires hardware GPU offloading"
        ],
        "correctAnswer": "Reactor notifies when socket is READY to perform I/O; Proactor initiates async operation and notifies on COMPLETION",
        "boilerplate": "",
        "tags": [
          "systems-architecture"
        ],
        "hint": "Reactor = Readiness-based; Proactor = Completion-based.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "JavaScript SharedArrayBuffer Data Race",
        "description": "What tool must be used to perform thread-safe mutations on a SharedArrayBuffer across multiple Web Workers?",
        "options": [
          "Atomics API (e.g. Atomics.add, Atomics.compareExchange)",
          "Object.freeze()",
          "Promise.all()",
          "postMessage cloning"
        ],
        "correctAnswer": "Atomics API (e.g. Atomics.add, Atomics.compareExchange)",
        "boilerplate": "",
        "tags": [
          "javascript",
          "concurrency"
        ],
        "hint": "Provides atomic memory operations and futex wait/notify.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      }
    ],
    "grandmaster": [
      {
        "title": "Spectre v1 Bounds Check Bypass Speculation",
        "description": "In Spectre Variant 1 (CVE-2017-5753), what CPU prediction allows unauthorized out-of-bounds reading?",
        "options": [
          "Branch Direction Predictor predicts array boundary check condition is true and speculatively loads from target address",
          "Return Stack Buffer overflow",
          "Hardware TLB fault handler crash",
          "Microcode instruction decoding bypass"
        ],
        "correctAnswer": "Branch Direction Predictor predicts array boundary check condition is true and speculatively loads from target address",
        "boilerplate": "",
        "tags": [
          "security",
          "hardware"
        ],
        "hint": "Mitigated by lfence instruction serializing speculative execution.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Linearizability Verification NP-Completeness",
        "description": "Gibbons and Korach proved that verifying whether a concurrent execution trace is Linearizable is:",
        "options": [
          "NP-complete in general case",
          "Solvable in O(N log N)",
          "Decidable in constant O(1) time",
          "Equivalent to 2-SAT"
        ],
        "correctAnswer": "NP-complete in general case",
        "boilerplate": "",
        "tags": [
          "distributed-theory"
        ],
        "hint": "Combinatorial explosion of valid sequential interleavings.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Memory Consistency Total Store Order (x86)",
        "description": "Under x86-64 Total Store Order (TSO) hardware memory model, which reordering can the CPU perform?",
        "options": [
          "Store-Load reordering (earlier store delayed past a later load from different address due to write buffer)",
          "Load-Load reordering",
          "Store-Store reordering",
          "Dependent Load-Store reordering"
        ],
        "correctAnswer": "Store-Load reordering (earlier store delayed past a later load from different address due to write buffer)",
        "boilerplate": "",
        "tags": [
          "hardware",
          "memory-models"
        ],
        "hint": "x86 allows Store-Load reordering; mfenced prevents this.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Garbage Collection ZGC Pauseless Color Pointers",
        "description": "How does modern JVM ZGC achieve sub-millisecond pauses on terabyte heaps during concurrent marking and relocation?",
        "options": [
          "Load Barriers with Colored Pointers using high-order bits of 64-bit reference",
          "Freezing all application threads (Stop-The-World)",
          "Writing heap to SSD cache",
          "Translating bytecode to WebAssembly"
        ],
        "correctAnswer": "Load Barriers with Colored Pointers using high-order bits of 64-bit reference",
        "boilerplate": "",
        "tags": [
          "jvm",
          "garbage-collection"
        ],
        "hint": "Marked0, Marked1, Remapped metadata bits embedded directly in pointer.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Clock Synchronization Spanner TrueTime Bound",
        "description": "Google Spanner achieves serializable transactions globally without two-phase commit locks across datacenters by waiting out:",
        "options": [
          "Uncertainty bound [earliest, latest] of TrueTime API atomic/GPS clock drift (2ε wait)",
          "Round-trip ping time to origin datacenter",
          "Quantum entanglement decoherence time",
          "Disk rotational latency"
        ],
        "correctAnswer": "Uncertainty bound [earliest, latest] of TrueTime API atomic/GPS clock drift (2ε wait)",
        "boilerplate": "",
        "tags": [
          "distributed-systems"
        ],
        "hint": "Commit wait guarantees that commit timestamp is definitively in the past before returning.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "eBPF Kernel Bytecode Verifier Invariant",
        "description": "What does the Linux kernel eBPF verifier mathematically enforce before allowing bytecode to execute in ring 0?",
        "options": [
          "Program is guaranteed to terminate (no unbounded loops) and never access uninitialized or out-of-bounds memory",
          "Program runs exclusively on GPU",
          "Bytecode is digitally signed with RSA 4096",
          "Memory writes are routed to swap"
        ],
        "correctAnswer": "Program is guaranteed to terminate (no unbounded loops) and never access uninitialized or out-of-bounds memory",
        "boilerplate": "",
        "tags": [
          "linux-kernel",
          "ebpf"
        ],
        "hint": "Uses abstract interpretation over directed acyclic execution graphs.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Consensus Viewstamped Replication vs Paxos",
        "description": "In Oki and Liskov’s Viewstamped Replication (VR) and Raft, how does log replication differ fundamentally from Multi-Paxos?",
        "options": [
          "VR and Raft elect a leader with complete up-to-date log, preventing holes and out-of-order commits",
          "Multi-Paxos cannot tolerate node failures",
          "VR requires hardware clock synchronization",
          "Raft allows multiple concurrent leaders in one term"
        ],
        "correctAnswer": "VR and Raft elect a leader with complete up-to-date log, preventing holes and out-of-order commits",
        "boilerplate": "",
        "tags": [
          "distributed-systems"
        ],
        "hint": "Leader log invariance simplifies replication and catch-up.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "CRDT Operation-based vs State-based Equivalence",
        "description": "Conflict-Free Replicated Data Types (CRDTs) guarantee Strong Eventual Consistency because state transitions form a:",
        "options": [
          "Bounded Join-Semilattice with associative, commutative, and idempotent merge operations",
          "Linear order without forks",
          "Strict topological sorting on DAGs",
          "Finite automaton with single terminal state"
        ],
        "correctAnswer": "Bounded Join-Semilattice with associative, commutative, and idempotent merge operations",
        "boilerplate": "",
        "tags": [
          "crdt",
          "distributed-systems"
        ],
        "hint": "Merge operation a ⊔ b is idempotent (a ⊔ a = a), commutative (a ⊔ b = b ⊔ a), associative.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      }
    ]
  },
  "topicdoc": {
    "beginner": [
      {
        "title": "NumPy Zeros Array Creation",
        "description": "In Python, what is the output shape of np.zeros((3, 4))?",
        "options": [
          "(3, 4)",
          "(4, 3)",
          "(12,)",
          "(7,)"
        ],
        "correctAnswer": "(3, 4)",
        "boilerplate": "import numpy as np\narr = np.zeros((3, 4))\nprint(arr.shape)",
        "tags": [
          "numpy",
          "arrays"
        ],
        "hint": "Creates an array of 3 rows and 4 columns filled with 0.0.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Pandas Read CSV Function",
        "description": "Which Pandas function is used to load a comma-separated values file into a DataFrame?",
        "options": [
          "pd.read_csv()",
          "pd.load_csv()",
          "pd.open_csv()",
          "pd.from_csv()"
        ],
        "correctAnswer": "pd.read_csv()",
        "boilerplate": "import pandas as pd\ndf = pd.read_csv(\"data.csv\")",
        "tags": [
          "pandas",
          "io"
        ],
        "hint": "Standard I/O parser in pandas library.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "DataFrame Head Default Rows",
        "description": "How many rows does df.head() display by default in Pandas?",
        "options": [
          "5 rows",
          "10 rows",
          "1 row",
          "20 rows"
        ],
        "correctAnswer": "5 rows",
        "boilerplate": "import pandas as pd\ndf.head()",
        "tags": [
          "pandas"
        ],
        "hint": "df.head(n=5) default value.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "NumPy Arange Endpoint Inclusion",
        "description": "What are the elements generated by np.arange(1, 5)?",
        "options": [
          "[1, 2, 3, 4]",
          "[1, 2, 3, 4, 5]",
          "[0, 1, 2, 3, 4]",
          "[2, 3, 4, 5]"
        ],
        "correctAnswer": "[1, 2, 3, 4]",
        "boilerplate": "import numpy as np\nprint(np.arange(1, 5))",
        "tags": [
          "numpy"
        ],
        "hint": "np.arange does not include the stop value (5).",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Pandas Column Selection Syntax",
        "description": "Given DataFrame df with column \"age\", which syntax selects this column as a Series?",
        "options": [
          "df[\"age\"]",
          "df.get_row(\"age\")",
          "df.select(\"age\")",
          "df.column(\"age\")"
        ],
        "correctAnswer": "df[\"age\"]",
        "boilerplate": "age_series = df[\"age\"]",
        "tags": [
          "pandas",
          "indexing"
        ],
        "hint": "Bracket indexing with column name string.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "NumPy Array Dimension Attribute",
        "description": "Which attribute of a NumPy ndarray returns its number of dimensions (axes)?",
        "options": [
          "arr.ndim",
          "arr.dim",
          "arr.axes",
          "arr.shape_len"
        ],
        "correctAnswer": "arr.ndim",
        "boilerplate": "print(arr.ndim)",
        "tags": [
          "numpy"
        ],
        "hint": "ndim returns 1 for 1D, 2 for 2D, etc.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Pandas Missing Values Detection",
        "description": "Which method returns a boolean mask indicating NaN values in a DataFrame?",
        "options": [
          "df.isna() (or df.isnull())",
          "df.is_empty()",
          "df.has_null()",
          "df.nan_check()"
        ],
        "correctAnswer": "df.isna() (or df.isnull())",
        "boilerplate": "mask = df.isna()",
        "tags": [
          "pandas",
          "data-cleaning"
        ],
        "hint": "Returns True for missing values and False otherwise.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Document Word Tokenization",
        "description": "What is the process of breaking raw text into individual words or punctuation marks called?",
        "options": [
          "Tokenization",
          "Lemmatization",
          "Stemming",
          "Vectorization"
        ],
        "correctAnswer": "Tokenization",
        "boilerplate": "",
        "tags": [
          "nlp",
          "text-processing"
        ],
        "hint": "Divides text stream into tokens.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "NumPy Linspace Count",
        "description": "How many numbers are returned by np.linspace(0, 10, num=5)?",
        "options": [
          "5 numbers",
          "10 numbers",
          "11 numbers",
          "4 numbers"
        ],
        "correctAnswer": "5 numbers",
        "boilerplate": "import numpy as np\nres = np.linspace(0, 10, num=5)",
        "tags": [
          "numpy"
        ],
        "hint": "num specifies the exact number of samples generated.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Pandas Shape Tuple Dimension",
        "description": "What does df.shape return for a DataFrame with 100 rows and 4 columns?",
        "options": [
          "(100, 4)",
          "(4, 100)",
          "400",
          "[100, 4]"
        ],
        "correctAnswer": "(100, 4)",
        "boilerplate": "print(df.shape)",
        "tags": [
          "pandas"
        ],
        "hint": "Returns (n_rows, n_columns).",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Stop Words in NLP",
        "description": "Common words like \"the\", \"is\", and \"at\" filtered out during preliminary text analysis are called:",
        "options": [
          "Stop words",
          "Root words",
          "Keywords",
          "Affixes"
        ],
        "correctAnswer": "Stop words",
        "boilerplate": "",
        "tags": [
          "nlp"
        ],
        "hint": "Frequently removed to focus on content-bearing words.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "NumPy Reshape Total Elements",
        "description": "Can a 1D array of 12 elements be reshaped into shape (3, 4)?",
        "options": [
          "Yes, because 3 × 4 = 12",
          "No, reshape requires square matrix",
          "Only with copying data",
          "No, only (2, 6) is valid"
        ],
        "correctAnswer": "Yes, because 3 × 4 = 12",
        "boilerplate": "arr.reshape((3, 4))",
        "tags": [
          "numpy"
        ],
        "hint": "Total element count must remain conserved.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Pandas Drop Columns Inplace",
        "description": "How do you drop a column named \"unwanted\" from DataFrame df along columns axis?",
        "options": [
          "df.drop(columns=[\"unwanted\"])",
          "df.remove(\"unwanted\")",
          "df.delete(\"unwanted\")",
          "df.pop_row(\"unwanted\")"
        ],
        "correctAnswer": "df.drop(columns=[\"unwanted\"])",
        "boilerplate": "df = df.drop(columns=[\"unwanted\"])",
        "tags": [
          "pandas"
        ],
        "hint": "df.drop() with columns parameter or axis=1.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Document Bag of Words Model",
        "description": "In Bag-of-Words (BoW) text representation, what information is discarded?",
        "options": [
          "Word order and grammar",
          "Word frequency counts",
          "Vocabulary size",
          "Total document length"
        ],
        "correctAnswer": "Word order and grammar",
        "boilerplate": "",
        "tags": [
          "nlp",
          "representations"
        ],
        "hint": "Represents text purely as multiset of words ignoring order.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "NumPy Elementwise Addition",
        "description": "What is the result of np.array([1, 2]) + np.array([3, 4])?",
        "options": [
          "array([4, 6])",
          "array([1, 2, 3, 4])",
          "array([3, 8])",
          "array([4, 4])"
        ],
        "correctAnswer": "array([4, 6])",
        "boilerplate": "import numpy as np\nprint(np.array([1, 2]) + np.array([3, 4]))",
        "tags": [
          "numpy"
        ],
        "hint": "NumPy performs vectorized element-by-element addition.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Pandas Value Counts Frequency",
        "description": "Which method counts occurrences of each unique value in a categorical Series?",
        "options": [
          "series.value_counts()",
          "series.count_unique()",
          "series.frequencies()",
          "series.histogram()"
        ],
        "correctAnswer": "series.value_counts()",
        "boilerplate": "df[\"category\"].value_counts()",
        "tags": [
          "pandas"
        ],
        "hint": "Returns Series indexed by unique values sorted by frequency.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Text Lowercasing Preprocessing",
        "description": "Why is text converted to lowercase in standard search and NLP indexing?",
        "options": [
          "To normalize vocabulary so \"Apple\" and \"apple\" match the same token",
          "To reduce file size by half",
          "Because GPUs cannot process uppercase ASCII",
          "To remove unicode emojis"
        ],
        "correctAnswer": "To normalize vocabulary so \"Apple\" and \"apple\" match the same token",
        "boilerplate": "",
        "tags": [
          "nlp",
          "preprocessing"
        ],
        "hint": "Prevents duplicate vocabulary entries differing only by case.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "NumPy Mean Across All Elements",
        "description": "What does np.mean(np.array([[2, 4], [6, 8]])) calculate?",
        "options": [
          "5.0",
          "10.0",
          "[4.0, 6.0]",
          "20.0"
        ],
        "correctAnswer": "5.0",
        "boilerplate": "import numpy as np\nprint(np.mean(np.array([[2, 4], [6, 8]])))",
        "tags": [
          "numpy"
        ],
        "hint": "(2 + 4 + 6 + 8) / 4 = 20 / 4 = 5.0.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      }
    ],
    "intermediate": [
      {
        "title": "TF-IDF Term Frequency Inverse Document Frequency",
        "description": "What does a high TF-IDF score for a word in a document indicate?",
        "options": [
          "The word appears frequently in this document, but rarely across the general corpus",
          "The word is a common stop word appearing everywhere",
          "The word has many synonyms in the dictionary",
          "The document has high spelling accuracy"
        ],
        "correctAnswer": "The word appears frequently in this document, but rarely across the general corpus",
        "boilerplate": "",
        "tags": [
          "nlp",
          "tf-idf"
        ],
        "hint": "TF is high and IDF is high, signifying strong topical relevance.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Pandas GroupBy Aggregate Multi-Metric",
        "description": "What does df.groupby(\"dept\")[\"salary\"].mean() return in Pandas?",
        "options": [
          "A Series of average salaries indexed by department",
          "A scalar total salary",
          "A single filtered row",
          "A list of departments"
        ],
        "correctAnswer": "A Series of average salaries indexed by department",
        "boilerplate": "df.groupby(\"dept\")[\"salary\"].mean()",
        "tags": [
          "pandas",
          "groupby"
        ],
        "hint": "Split-Apply-Combine pattern yielding aggregated Series.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Cosine Similarity Range on Non-Negative Vectors",
        "description": "What is the range of Cosine Similarity values for term-frequency count vectors (all non-negative)?",
        "options": [
          "[0, 1]",
          "[-1, 1]",
          "[0, ∞)",
          "[-∞, ∞]"
        ],
        "correctAnswer": "[0, 1]",
        "boilerplate": "",
        "tags": [
          "nlp",
          "vector-similarity"
        ],
        "hint": "For non-negative vectors, dot product is ≥ 0, so cos(θ) ∈ [0, 1].",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "NumPy Dot Product Matrix Multiplication",
        "description": "For matrix A with shape (2, 3) and matrix B with shape (3, 4), what is shape of np.dot(A, B)?",
        "options": [
          "(2, 4)",
          "(3, 3)",
          "(2, 3)",
          "(4, 2)"
        ],
        "correctAnswer": "(2, 4)",
        "boilerplate": "import numpy as np\n# A: (2, 3), B: (3, 4)\n# C = A @ B",
        "tags": [
          "numpy",
          "linear-algebra"
        ],
        "hint": "Inner dimension 3 cancels; outer dimensions form (2, 4).",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Pandas Merge Inner vs Left Join",
        "description": "In pd.merge(df1, df2, on=\"id\", how=\"left\"), what rows from df1 are kept?",
        "options": [
          "All rows from df1, with NaNs populated for non-matching rows in df2",
          "Only rows where id appears in both df1 and df2",
          "Only rows unique to df1",
          "Rows from df2 only"
        ],
        "correctAnswer": "All rows from df1, with NaNs populated for non-matching rows in df2",
        "boilerplate": "",
        "tags": [
          "pandas",
          "joins"
        ],
        "hint": "Left join preserves all records from left table.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "N-Gram Representation Definition",
        "description": "In computational linguistics, what is a \"bigram\"?",
        "options": [
          "A contiguous sequence of 2 tokens/words",
          "A 2-character word",
          "A document with 2 paragraphs",
          "A word with 2 meanings"
        ],
        "correctAnswer": "A contiguous sequence of 2 tokens/words",
        "boilerplate": "",
        "tags": [
          "nlp"
        ],
        "hint": "Unigram (1), Bigram (2), Trigram (3).",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Pandas Apply vs Vectorized Performance",
        "description": "Why are native vectorized operations (like df[\"a\"] + df[\"b\"]) orders of magnitude faster than df.apply(lambda r: r[\"a\"] + r[\"b\"], axis=1)?",
        "options": [
          "Vectorized ops run in compiled C/Fortran loops without Python interpreter overhead per row",
          "df.apply() runs in cloud servers",
          "apply() converts numbers to strings",
          "Vectorized operations skip floating point checks"
        ],
        "correctAnswer": "Vectorized ops run in compiled C/Fortran loops without Python interpreter overhead per row",
        "boilerplate": "",
        "tags": [
          "pandas",
          "optimization"
        ],
        "hint": "Bypasses Python object boxing and function call overhead.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Stemming vs Lemmatization Difference",
        "description": "What distinguishes lemmatization from crude algorithmic stemming (like Porter stemmer)?",
        "options": [
          "Lemmatization uses vocabulary and morphological analysis to return valid dictionary root words (lemmas)",
          "Stemming requires a GPU",
          "Lemmatization only works on numbers",
          "Stemming produces longer words"
        ],
        "correctAnswer": "Lemmatization uses vocabulary and morphological analysis to return valid dictionary root words (lemmas)",
        "boilerplate": "",
        "tags": [
          "nlp"
        ],
        "hint": "e.g. \"better\" lemmatizes to \"good\", whereas stemmers just chop off suffixes.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "NumPy Slicing View vs Copy Behavior",
        "description": "In NumPy, does standard basic slicing arr[1:5] create a view or a deep copy of the underlying data?",
        "options": [
          "A view sharing the same memory buffer (mutating it modifies original arr)",
          "A new deep copy in memory",
          "A copy if 2D, a view if 1D",
          "A read-only frozen tuple"
        ],
        "correctAnswer": "A view sharing the same memory buffer (mutating it modifies original arr)",
        "boilerplate": "import numpy as np\narr = np.array([1, 2, 3, 4, 5])\nsub = arr[1:4]\nsub[0] = 99\nprint(arr[1]) # 99",
        "tags": [
          "numpy",
          "memory"
        ],
        "hint": "Basic slicing produces strided views without copying memory.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Pandas Pivot Table Aggregation",
        "description": "Which Pandas function reshapes data from long format to wide format with specified index, columns, and values?",
        "options": [
          "pd.pivot_table() (or df.pivot_table())",
          "df.melt()",
          "df.concat()",
          "df.stack()"
        ],
        "correctAnswer": "pd.pivot_table() (or df.pivot_table())",
        "boilerplate": "",
        "tags": [
          "pandas"
        ],
        "hint": "Aggregates and organizes data into a 2D cross-tabulation.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Document Embedding Concept",
        "description": "What does a modern dense text embedding model (e.g. OpenAI text-embedding-3 or Gemini) produce for an input text?",
        "options": [
          "A fixed-length dense vector of floating-point numbers capturing semantic meaning",
          "A compressed zip archive of words",
          "A sparse inverted dictionary index",
          "A set of regex rules"
        ],
        "correctAnswer": "A fixed-length dense vector of floating-point numbers capturing semantic meaning",
        "boilerplate": "",
        "tags": [
          "embeddings",
          "nlp"
        ],
        "hint": "Maps natural language into high-dimensional geometric embedding space.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Pandas Melt Wide to Long Reshaping",
        "description": "What does pd.melt() do to a DataFrame?",
        "options": [
          "Unpivots DataFrame from wide format to long format",
          "Deletes rows with duplicate values",
          "Fills nulls with column median",
          "Converts column datatypes to float"
        ],
        "correctAnswer": "Unpivots DataFrame from wide format to long format",
        "boilerplate": "",
        "tags": [
          "pandas"
        ],
        "hint": "Inverse operation of pivot.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Inverted Index in Search Engines",
        "description": "What core data structure does an inverted index use to enable fast full-text keyword retrieval?",
        "options": [
          "A mapping from words/tokens to the list of document IDs (postings list) containing them",
          "A list of all documents sorted by file size",
          "A balanced binary search tree of author names",
          "A FIFO queue of search queries"
        ],
        "correctAnswer": "A mapping from words/tokens to the list of document IDs (postings list) containing them",
        "boilerplate": "",
        "tags": [
          "search",
          "information-retrieval"
        ],
        "hint": "Term → [Doc1, Doc3, Doc7...].",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "NumPy Fancy Indexing Memory Allocation",
        "description": "Unlike basic slicing, what does NumPy fancy indexing (using an integer array e.g. arr[[0, 2, 4]]) return?",
        "options": [
          "A newly allocated copy of the data, not a view",
          "A shared view",
          "A Python dictionary",
          "A generator iterator"
        ],
        "correctAnswer": "A newly allocated copy of the data, not a view",
        "boilerplate": "",
        "tags": [
          "numpy"
        ],
        "hint": "Advanced indexing always creates a brand new copy.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "RAG Architecture Core Components",
        "description": "What does RAG stand for in modern AI document processing applications?",
        "options": [
          "Retrieval-Augmented Generation",
          "Recursive Autoencoder Gradient",
          "Real-time Autonomous Graph",
          "Relational Array Generator"
        ],
        "correctAnswer": "Retrieval-Augmented Generation",
        "boilerplate": "",
        "tags": [
          "rag",
          "ai"
        ],
        "hint": "Combines information retrieval with generative LLM prompt injection.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Pandas Categorical Dtype Memory Savings",
        "description": "Why convert a repetitive string column in a 10M row DataFrame to category dtype?",
        "options": [
          "Saves dramatic RAM by encoding strings as integer codes mapped to a unique category index",
          "Encrypts sensitive strings",
          "Enables GPU parallel sorting",
          "Prevents regex operations"
        ],
        "correctAnswer": "Saves dramatic RAM by encoding strings as integer codes mapped to a unique category index",
        "boilerplate": "",
        "tags": [
          "pandas",
          "memory"
        ],
        "hint": "Stores small integer keys pointing to a single copy of each unique string.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "BM25 Ranking Function Improvement",
        "description": "What major limitation of classic TF-IDF does Okapi BM25 solve?",
        "options": [
          "Applies non-linear term frequency saturation and document length normalization",
          "Eliminates need for inverted index",
          "Translates foreign languages automatically",
          "Generates synthetic document summaries"
        ],
        "correctAnswer": "Applies non-linear term frequency saturation and document length normalization",
        "boilerplate": "",
        "tags": [
          "search",
          "information-retrieval"
        ],
        "hint": "Diminishing returns for repeating words and penalty for bloated long docs.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "NumPy Concatenate Along Axis",
        "description": "To stack two 2D arrays of shape (3, 4) vertically to produce shape (6, 4), what axis parameter is used?",
        "options": [
          "axis=0",
          "axis=1",
          "axis=2",
          "axis=-1"
        ],
        "correctAnswer": "axis=0",
        "boilerplate": "np.concatenate([a, b], axis=0)",
        "tags": [
          "numpy"
        ],
        "hint": "Axis 0 is row axis (vertical stacking).",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      }
    ],
    "advanced": [
      {
        "title": "Byte Pair Encoding Tokenization Algorithm",
        "description": "How does the Byte Pair Encoding (BPE) subword tokenization algorithm construct its vocabulary during training?",
        "options": [
          "Iteratively merges the most frequently occurring pair of adjacent bytes/characters in corpus",
          "Splits words randomly into syllables",
          "Removes all vowels from text",
          "Generates phonetic soundex codes"
        ],
        "correctAnswer": "Iteratively merges the most frequently occurring pair of adjacent bytes/characters in corpus",
        "boilerplate": "",
        "tags": [
          "nlp",
          "tokenization"
        ],
        "hint": "Used in GPT, LLaMA, and modern LLM tokenizers.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Vector Database Approximate Nearest Neighbors",
        "description": "Why do vector databases (like Milvus, Pinecone, Qdrant) use HNSW (Hierarchical Navigable Small World) graphs instead of exact flat search?",
        "options": [
          "Enables sub-linear O(log N) approximate nearest neighbor search on millions of high-dimensional vectors",
          "Reduces vector dimensions to 1D",
          "Guarantees 100% exact mathematical distance calculation",
          "Eliminates vector storage on disk"
        ],
        "correctAnswer": "Enables sub-linear O(log N) approximate nearest neighbor search on millions of high-dimensional vectors",
        "boilerplate": "",
        "tags": [
          "vector-databases",
          "algorithms"
        ],
        "hint": "Multi-layer proximity graph navigates vector space exponentially faster than brute force.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "NumPy Einsum Matrix Trace and Transpose",
        "description": "What operation does np.einsum(\"ii->\", A) perform on square matrix A?",
        "options": [
          "Calculates the trace (sum of diagonal elements)",
          "Transposes matrix A",
          "Inverts matrix A",
          "Calculates determinant"
        ],
        "correctAnswer": "Calculates the trace (sum of diagonal elements)",
        "boilerplate": "import numpy as np\ntrace = np.einsum(\"ii->\", A)",
        "tags": [
          "numpy",
          "einsum"
        ],
        "hint": "Repeated indices without output specification sum along that axis.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Document Chunking Sliding Window Overlap",
        "description": "When chunking large documents for RAG (e.g. 500-token chunks with 50-token overlap), what is the purpose of chunk overlap?",
        "options": [
          "Prevents loss of semantic context for sentences split across chunk boundaries",
          "Doubles database revenue",
          "Compresses text into tokens",
          "Forces LLM to generate faster"
        ],
        "correctAnswer": "Prevents loss of semantic context for sentences split across chunk boundaries",
        "boilerplate": "",
        "tags": [
          "rag",
          "chunking"
        ],
        "hint": "Ensures continuity of concepts that straddle chunk seams.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Cross-Encoder vs Bi-Encoder Architecture",
        "description": "Why are Cross-Encoder models typically used only as re-rankers rather than primary search retrievers in RAG?",
        "options": [
          "Cross-encoders jointly process query and document in attention layers, making pairwise scoring O(N) computationally slow",
          "Cross-encoders cannot output numerical scores",
          "Bi-encoders have higher ranking accuracy than cross-encoders",
          "Cross-encoders require quantum GPUs"
        ],
        "correctAnswer": "Cross-encoders jointly process query and document in attention layers, making pairwise scoring O(N) computationally slow",
        "boilerplate": "",
        "tags": [
          "rag",
          "re-ranking"
        ],
        "hint": "Bi-encoders pre-compute embeddings for fast vector search; cross-encoders re-rank top candidates with full attention.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Pandas Chunksize Iteration for Massive Files",
        "description": "How do you process a 50GB CSV file in Pandas without exceeding 8GB RAM?",
        "options": [
          "Use pd.read_csv(\"file.csv\", chunksize=100000) and iterate over chunks in a loop",
          "Convert entire file to string first",
          "Use df.loc[:1000000000]",
          "Open in Excel and save as xlsx"
        ],
        "correctAnswer": "Use pd.read_csv(\"file.csv\", chunksize=100000) and iterate over chunks in a loop",
        "boilerplate": "for chunk in pd.read_csv(\"huge.csv\", chunksize=100000):\n  process(chunk)",
        "tags": [
          "pandas",
          "memory"
        ],
        "hint": "Returns a TextFileReader iterator streaming small batches into memory.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Reciprocal Rank Fusion Algorithm",
        "description": "In hybrid search combining keyword BM25 and vector semantic search, what does Reciprocal Rank Fusion (RRF) calculate?",
        "options": [
          "Combines rankings using formula RRF_Score = ∑ 1 / (k + rank_i)",
          "Multiplies vector embeddings by BM25 frequency",
          "Discards all non-keyword results",
          "Calculates Euclidean distance between scores"
        ],
        "correctAnswer": "Combines rankings using formula RRF_Score = ∑ 1 / (k + rank_i)",
        "boilerplate": "",
        "tags": [
          "search",
          "hybrid-search"
        ],
        "hint": "Rank-based consensus scoring that is robust to differing score scales.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Word2Vec Skip-Gram vs CBOW Objective",
        "description": "What does the Word2Vec Skip-Gram model predict compared to Continuous Bag of Words (CBOW)?",
        "options": [
          "Skip-Gram predicts surrounding context words given a target center word",
          "Skip-Gram predicts target center word from context words",
          "Skip-Gram predicts document category",
          "Skip-Gram translates words to Latin"
        ],
        "correctAnswer": "Skip-Gram predicts surrounding context words given a target center word",
        "boilerplate": "",
        "tags": [
          "nlp",
          "embeddings"
        ],
        "hint": "Mikolov 2013: Skip-Gram (target → context); CBOW (context → target).",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Self-Attention Scaled Dot-Product Factor",
        "description": "In the Transformer equation Attention(Q, K, V) = softmax(QK^T / √d_k) V, why is QK^T divided by √d_k?",
        "options": [
          "To prevent dot products from growing large in magnitude, which pushes softmax into vanishing gradient regions",
          "To normalize vector dimensions to 1",
          "To convert matrix to integer values",
          "To invert eigenvalues"
        ],
        "correctAnswer": "To prevent dot products from growing large in magnitude, which pushes softmax into vanishing gradient regions",
        "boilerplate": "",
        "tags": [
          "transformers",
          "deep-learning"
        ],
        "hint": "For large d_k, variance of dot product is d_k; dividing by √d_k scales variance to 1.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Pandas Query Expression Engine",
        "description": "What performance benefit does df.query(\"salary > 50000 & age < 30\") provide when numexpr is installed?",
        "options": [
          "Evaluates conditions without allocating temporary intermediate boolean arrays in memory",
          "Runs SQL on SQLite behind the scenes",
          "Compiles query into WebAssembly",
          "Caches query results across sessions"
        ],
        "correctAnswer": "Evaluates conditions without allocating temporary intermediate boolean arrays in memory",
        "boilerplate": "",
        "tags": [
          "pandas",
          "optimization"
        ],
        "hint": "Numexpr executes elementwise expressions in fast C buffers avoiding memory bloat.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Sentence-Transformers Mean Pooling Strategy",
        "description": "How do Sentence-BERT models generate a single sentence vector from transformer token embeddings?",
        "options": [
          "Mean pooling across all token output vectors taking attention mask into account",
          "Taking the last token embedding",
          "Adding random noise to CLS token",
          "Sorting token vectors alphabetically"
        ],
        "correctAnswer": "Mean pooling across all token output vectors taking attention mask into account",
        "boilerplate": "",
        "tags": [
          "nlp",
          "sentence-transformers"
        ],
        "hint": "Averages token vectors ignoring padded tokens via attention mask.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "NumPy Memory Layout C-Contiguous vs Fortran",
        "description": "What does C-contiguous memory layout (row-major) mean for 2D array access speed?",
        "options": [
          "Iterating along rows (left-to-right) accesses adjacent memory addresses, maximizing CPU cache line hits",
          "Iterating along columns is faster than rows",
          "Elements are stored in random memory blocks",
          "Memory cannot be freed by OS"
        ],
        "correctAnswer": "Iterating along rows (left-to-right) accesses adjacent memory addresses, maximizing CPU cache line hits",
        "boilerplate": "",
        "tags": [
          "numpy",
          "hardware"
        ],
        "hint": "Row-major stores row elements sequentially in contiguous memory.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Cosine Distance vs Dot Product Normalization",
        "description": "When are Cosine Similarity and Dot Product mathematically identical for a set of vectors?",
        "options": [
          "When all vectors are L2-normalized to unit length (‖v‖ = 1)",
          "When vectors contain only positive integers",
          "When vector dimension is 2",
          "When vectors are orthogonal"
        ],
        "correctAnswer": "When all vectors are L2-normalized to unit length (‖v‖ = 1)",
        "boilerplate": "",
        "tags": [
          "linear-algebra",
          "embeddings"
        ],
        "hint": "u · v / (‖u‖ ‖v‖) = u · v when ‖u‖ = ‖v‖ = 1.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Parent Document Retriever Pattern",
        "description": "In advanced RAG architectures, what does the Parent Document Retriever technique do?",
        "options": [
          "Indexes small sub-chunks for precise vector retrieval, but injects the larger parent document chunk into LLM prompt",
          "Merges documents with the same file name",
          "Translates child documents into English",
          "Deletes old document versions"
        ],
        "correctAnswer": "Indexes small sub-chunks for precise vector retrieval, but injects the larger parent document chunk into LLM prompt",
        "boilerplate": "",
        "tags": [
          "rag",
          "architecture"
        ],
        "hint": "Small chunks match queries better; large parent chunks provide richer generative context.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "NumPy Stride Tricks Sliding Window",
        "description": "What does np.lib.stride_tricks.as_strided() allow you to construct with zero memory allocation?",
        "options": [
          "Sliding rolling window views over an array by manipulating shape and byte strides",
          "Permanent disk backups",
          "Lossless image compression",
          "Sparse matrices"
        ],
        "correctAnswer": "Sliding rolling window views over an array by manipulating shape and byte strides",
        "boilerplate": "",
        "tags": [
          "numpy",
          "strides"
        ],
        "hint": "Overlapping rolling windows created purely via strided pointer arithmetic.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      }
    ],
    "expert": [
      {
        "title": "FlashAttention IO-Aware Memory Complexity",
        "description": "How does FlashAttention (Dao et al.) reduce memory traffic from O(N²) to O(N) during transformer self-attention?",
        "options": [
          "Tiles attention matrix computation into SRAM blocks and uses online softmax to avoid materializing large N×N attention matrix in HBM",
          "Quantizes all weights to 1-bit binary values",
          "Prunes 90% of attention heads",
          "Replaces dot products with Manhattan distance"
        ],
        "correctAnswer": "Tiles attention matrix computation into SRAM blocks and uses online softmax to avoid materializing large N×N attention matrix in HBM",
        "boilerplate": "",
        "tags": [
          "transformers",
          "gpu-optimization"
        ],
        "hint": "Recomputes attention intermediate blocks in fast on-chip SRAM during backward pass.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Rotary Position Embedding Rotation Matrix",
        "description": "What geometric transformation does Rotary Position Embedding (RoPE) apply to Query and Key vectors?",
        "options": [
          "Rotates 2D chunks of the embedding vectors in complex space by an angle proportional to position index m",
          "Adds absolute sinusoidal position vectors directly to word embeddings",
          "Multiplies embeddings by random Gaussian noise",
          "Normalizes vectors to unit sphere"
        ],
        "correctAnswer": "Rotates 2D chunks of the embedding vectors in complex space by an angle proportional to position index m",
        "boilerplate": "",
        "tags": [
          "transformers",
          "embeddings"
        ],
        "hint": "Su et al.: RoFormer encodes relative position via complex rotation angles.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "KV-Cache Memory Size Calculation Formula",
        "description": "What is the memory footprint formula for Key-Value Cache per token during LLM autoregressive generation?",
        "options": [
          "2 × 2 × n_layers × n_heads × head_dim bytes (assuming 16-bit float)",
          "n_layers × n_heads bytes",
          "vocab_size × hidden_dim bytes",
          "4 × sequence_length bytes"
        ],
        "correctAnswer": "2 × 2 × n_layers × n_heads × head_dim bytes (assuming 16-bit float)",
        "boilerplate": "",
        "tags": [
          "llm-inference",
          "memory"
        ],
        "hint": "2 matrices (K and V) × 2 bytes (FP16) × layers × heads × dimension.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Multi-Query vs Grouped-Query Attention",
        "description": "How does Grouped-Query Attention (GQA) balance memory bandwidth and model expressiveness between MHA and MQA?",
        "options": [
          "Shares a single Key and Value head across a group of Query heads (e.g. 8 query heads share 1 KV head)",
          "Uses separate KV heads for every query head",
          "Collapses all queries into 1 single head",
          "Eliminates Value vectors entirely"
        ],
        "correctAnswer": "Shares a single Key and Value head across a group of Query heads (e.g. 8 query heads share 1 KV head)",
        "boilerplate": "",
        "tags": [
          "transformers",
          "inference"
        ],
        "hint": "Adopted in LLaMA-2 70B and LLaMA-3 to slash KV-cache memory overhead.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Hypothetical Document Embeddings HyDE",
        "description": "How does Hypothetical Document Embeddings (HyDE) improve dense semantic retrieval in RAG?",
        "options": [
          "Prompts an LLM to generate a hypothetical answer document first, then uses that synthetic doc’s embedding to search the corpus",
          "Translates query into 5 languages simultaneously",
          "Calculates TF-IDF on secret government documents",
          "Encrypts vectors with homomorphic hashes"
        ],
        "correctAnswer": "Prompts an LLM to generate a hypothetical answer document first, then uses that synthetic doc’s embedding to search the corpus",
        "boilerplate": "",
        "tags": [
          "rag",
          "retrieval"
        ],
        "hint": "Gao et al.: Searches document-to-document space rather than query-to-document.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Product Quantization Vector Compression",
        "description": "How does Product Quantization (PQ) compress 1024-dimensional vectors into 64 bytes in Faiss?",
        "options": [
          "Splits high-dimensional vector into sub-vectors and quantizes each sub-vector to its nearest centroid index using codebooks",
          "Triggers random dimension dropping",
          "Rounds all floating-point numbers to nearest integer",
          "Computes SHA-256 hash of vector"
        ],
        "correctAnswer": "Splits high-dimensional vector into sub-vectors and quantizes each sub-vector to its nearest centroid index using codebooks",
        "boilerplate": "",
        "tags": [
          "vector-databases",
          "quantization"
        ],
        "hint": "Jégou et al.: Enables asymmetric distance computation directly in compressed domain.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "ColBERT Late Interaction Architecture",
        "description": "What makes ColBERT (Contextualized Late Interaction over BERT) faster than cross-encoders while matching accuracy?",
        "options": [
          "Computes token-level vector representations independently, then scores relevance via fast MaxSim operator over token vectors",
          "Concatenates all documents into a single prompt",
          "Disables multi-head attention during fine-tuning",
          "Uses n-gram hash lookup tables"
        ],
        "correctAnswer": "Computes token-level vector representations independently, then scores relevance via fast MaxSim operator over token vectors",
        "boilerplate": "",
        "tags": [
          "search",
          "information-retrieval"
        ],
        "hint": "Khattab and Zaharia: Late interaction retains fine-grained token matching with vector search speed.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "NumPy BLAS MKL Multithreading Contention",
        "description": "When running multiple Python multiprocessing workers each using NumPy matrix operations, why set OMP_NUM_THREADS=1?",
        "options": [
          "Prevents nested CPU core oversubscription where workers compete for CPU threads in OpenMP/MKL",
          "Disables GPU memory allocation",
          "Forces single-precision arithmetic",
          "Enables debug logging"
        ],
        "correctAnswer": "Prevents nested CPU core oversubscription where workers compete for CPU threads in OpenMP/MKL",
        "boilerplate": "",
        "tags": [
          "numpy",
          "multiprocessing"
        ],
        "hint": "Worker count × thread count exceeding CPU cores causes severe thrashing.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Speculative Decoding Draft Model Verification",
        "description": "How does Speculative Decoding speed up LLM token generation by 2-3x without changing output distribution?",
        "options": [
          "A small draft model generates candidate tokens quickly, which are verified in parallel by the target model in a single forward pass",
          "Skips transformer layers for easy words",
          "Generates text in reverse order",
          "Caches all internet tokens"
        ],
        "correctAnswer": "A small draft model generates candidate tokens quickly, which are verified in parallel by the target model in a single forward pass",
        "boilerplate": "",
        "tags": [
          "llm-inference"
        ],
        "hint": "Leviathan et al.: Converts sequential autoregressive steps into parallel matrix checks.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Context Window Extension YaRN Method",
        "description": "What does YaRN (Yet another RoPE extensioN) modify to extend LLM context length up to 128k tokens?",
        "options": [
          "Applies non-uniform temperature scaling to RoPE frequencies across high and low frequency dimensions",
          "Retrains model from scratch with 128k dataset",
          "Increases hidden layer dimension size",
          "Doubles GPU clock rate"
        ],
        "correctAnswer": "Applies non-uniform temperature scaling to RoPE frequencies across high and low frequency dimensions",
        "boilerplate": "",
        "tags": [
          "transformers",
          "context-length"
        ],
        "hint": "Interpolates low frequencies and extrapolates high frequencies without retraining degradation.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "LoRA Low-Rank Adaptation Matrix Factorization",
        "description": "In parameter-efficient fine-tuning (LoRA), how is weight update matrix ΔW decomposed for d × k weight matrix?",
        "options": [
          "Decomposed into product of two low-rank matrices B (d × r) and A (r × k) where r ≪ min(d, k)",
          "Diagonal elements only",
          "Single scalar multiplier α",
          "Random sparse binary mask"
        ],
        "correctAnswer": "Decomposed into product of two low-rank matrices B (d × r) and A (r × k) where r ≪ min(d, k)",
        "boilerplate": "",
        "tags": [
          "deep-learning",
          "fine-tuning"
        ],
        "hint": "Hu et al.: Drastically reduces trainable parameters while freezing base model.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "PagedAttention Virtual Memory Management",
        "description": "What concept from operating systems does vLLM’s PagedAttention borrow to solve KV-cache memory fragmentation?",
        "options": [
          "Virtual memory paging (allocating KV-cache in non-contiguous physical memory blocks with page tables)",
          "Segmentation fault handlers",
          "Round-robin CPU scheduler",
          "Swap file partitioning"
        ],
        "correctAnswer": "Virtual memory paging (allocating KV-cache in non-contiguous physical memory blocks with page tables)",
        "boilerplate": "",
        "tags": [
          "llm-systems",
          "vllm"
        ],
        "hint": "Kwon et al.: Reaches near 100% GPU memory utilization by eliminating internal fragmentation.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Quantization Aware Training FP8 vs INT4",
        "description": "What is the main challenge when quantizing LLM weights and activations to INT4 or FP8 precision?",
        "options": [
          "High-magnitude outlier activation dimensions that severely distort quantization scale factors",
          "Integer addition taking longer than float addition",
          "Loss of vocabulary tokens",
          "Incompatibility with python strings"
        ],
        "correctAnswer": "High-magnitude outlier activation dimensions that severely distort quantization scale factors",
        "boilerplate": "",
        "tags": [
          "quantization",
          "hardware"
        ],
        "hint": "Dettmers et al. (LLM.int8()): Outliers concentrate in a few specific activation channels.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      }
    ],
    "master": [
      {
        "title": "Receptive Field Dilation Convolution Math",
        "description": "What is the effective receptive field size of a 1D convolution layer with kernel size k and dilation rate d?",
        "options": [
          "d × (k - 1) + 1",
          "k × d",
          "k^d",
          "(k + d) / 2"
        ],
        "correctAnswer": "d × (k - 1) + 1",
        "boilerplate": "",
        "tags": [
          "deep-learning",
          "convolution"
        ],
        "hint": "Dilated convolution skips d-1 inputs between kernel weights.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Information Bottleneck Principle in Deep Learning",
        "description": "Tishby’s Information Bottleneck principle states that optimal representations maximize mutual information with target Y while:",
        "options": [
          "Minimizing mutual information with input X: max I(T; Y) - β I(T; X)",
          "Maximizing entropy H(X)",
          "Eliminating all non-linear activation functions",
          "Setting gradient descent learning rate to zero"
        ],
        "correctAnswer": "Minimizing mutual information with input X: max I(T; Y) - β I(T; X)",
        "boilerplate": "",
        "tags": [
          "information-theory",
          "deep-learning"
        ],
        "hint": "Discards irrelevant input noise while retaining predictive signal.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "DPO Direct Preference Optimization Gradient",
        "description": "Unlike RLHF with PPO, how does Direct Preference Optimization (DPO) optimize LLM policy on human feedback pairs (y_w > y_l)?",
        "options": [
          "Derives an exact analytical closed-form mapping directly from reward model to policy, optimizing policy with a simple binary cross-entropy loss",
          "Trains an explicit neural reward model and uses policy gradient reinforcement learning",
          "Uses genetic evolutionary algorithms",
          "Prompts the LLM with few-shot examples"
        ],
        "correctAnswer": "Derives an exact analytical closed-form mapping directly from reward model to policy, optimizing policy with a simple binary cross-entropy loss",
        "boilerplate": "",
        "tags": [
          "alignment",
          "dpo"
        ],
        "hint": "Rafailov et al.: Replaces unstable RLHF PPO training with stable supervised loss.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "State Space Models Mamba Selective Scan",
        "description": "How do selective state space models (Mamba) overcome the inability of Linear Time-Invariant (LTI) SSMs to perform content-based reasoning?",
        "options": [
          "Makes state-space transition matrices (B, C, Δ) input-dependent dynamic functions of the current token and executes via hardware-aware parallel associative scan",
          "Adds quadratic self-attention layers after every block",
          "Caches all past tokens in a Python list",
          "Replaces continuous math with discrete boolean logic"
        ],
        "correctAnswer": "Makes state-space transition matrices (B, C, Δ) input-dependent dynamic functions of the current token and executes via hardware-aware parallel associative scan",
        "boilerplate": "",
        "tags": [
          "mamba",
          "state-space-models"
        ],
        "hint": "Gu and Dao (2023): Selectively compresses or forgets context based on incoming inputs.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Mixture of Experts Router Load Balancing Loss",
        "description": "Why do sparse Mixture of Experts (MoE) models (like Mixtral 8x7B) include an auxiliary load balancing loss during training?",
        "options": [
          "Prevents routing collapse where the gating network sends all tokens to only a small subset of favored experts",
          "Forces all experts to have identical neural weights",
          "Reduces GPU temperature",
          "Ensures tokens are sorted alphabetically"
        ],
        "correctAnswer": "Prevents routing collapse where the gating network sends all tokens to only a small subset of favored experts",
        "boilerplate": "",
        "tags": [
          "moe",
          "deep-learning"
        ],
        "hint": "Encourages equal distribution of tokens across available expert feedforward networks.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Ring-Attention Distributed Sequence Parallelism",
        "description": "How does Ring-Attention enable training and inference over multimillion-token contexts across clusters of GPUs?",
        "options": [
          "Passes Key and Value blocks in a peer-to-peer ring topology between GPUs while overlapping network communication with local block self-attention computation",
          "Broadcasts the full context to every GPU memory space",
          "Stores context on centralized Redis database",
          "Compresses sequence into a single scalar number"
        ],
        "correctAnswer": "Passes Key and Value blocks in a peer-to-peer ring topology between GPUs while overlapping network communication with local block self-attention computation",
        "boilerplate": "",
        "tags": [
          "distributed-training",
          "long-context"
        ],
        "hint": "Liu et al.: Scales context window linearly with cluster GPU count without memory limits.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      }
    ],
    "grandmaster": [
      {
        "title": "Neural Tangent Kernel Infinite Width Limit",
        "description": "In the infinite-width limit of deep neural networks, Jacot et al. proved that network training under gradient descent is equivalent to:",
        "options": [
          "Linear regression with a deterministic, constant, non-evolving kernel (the Neural Tangent Kernel NTK)",
          "A Markov decision process with zero reward",
          "Non-convex optimization with infinite local minima",
          "A deterministic finite automaton"
        ],
        "correctAnswer": "Linear regression with a deterministic, constant, non-evolving kernel (the Neural Tangent Kernel NTK)",
        "boilerplate": "",
        "tags": [
          "deep-learning-theory"
        ],
        "hint": "Weights stay infinitesimal during training while function evolves linearly.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Self-Attention Turing Completeness",
        "description": "Pérez et al. (2019) proved that standard Transformer architectures with hard attention and floating-point precision are:",
        "options": [
          "Turing-complete (capable of simulating any Turing Machine)",
          "Strictly equivalent to finite state automata (Type-3)",
          "Incapsulated by context-free grammars (Type-2)",
          "Strictly sub-linear automata"
        ],
        "correctAnswer": "Turing-complete (capable of simulating any Turing Machine)",
        "boilerplate": "",
        "tags": [
          "theoretical-computer-science"
        ],
        "hint": "Transformers with infinite precision arithmetic can simulate universal Turing machines.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Scaling Laws Chinchilla Optimal Token Ratio",
        "description": "DeepMind’s Chinchilla scaling law (Hoffmann et al.) established that for compute-optimal model training, parameter count and training token count should scale:",
        "options": [
          "Equally in equal proportion: doubling model parameters requires doubling training tokens (1:1 ratio)",
          "Model parameters should scale 10x faster than tokens",
          "Token count should remain fixed while parameters scale quadratically",
          "Parameters should decrease as tokens increase"
        ],
        "correctAnswer": "Equally in equal proportion: doubling model parameters requires doubling training tokens (1:1 ratio)",
        "boilerplate": "",
        "tags": [
          "scaling-laws"
        ],
        "hint": "Chinchilla 70B trained on 1.4T tokens outperformed Gopher 280B trained on 300B tokens.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Geometric Deep Learning Erlangen Program",
        "description": "Bronstein et al.’s Geometric Deep Learning framework unifies CNNs, RNNs, and Graph Neural Networks (GNNs) based on:",
        "options": [
          "Symmetries and group equivariance/invariance over geometric domains",
          "Loss function gradient descent speed",
          "Hardware floating-point bit width",
          "Number of hidden layers"
        ],
        "correctAnswer": "Symmetries and group equivariance/invariance over geometric domains",
        "boilerplate": "",
        "tags": [
          "geometric-deep-learning"
        ],
        "hint": "Extends Klein’s Erlangen program in geometry to neural network inductive biases.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Kolmogorov-Arnold Networks Spline Activations",
        "description": "How do Kolmogorov-Arnold Networks (KANs, Liu et al. 2024) fundamentally differ from traditional Multi-Layer Perceptrons (MLPs)?",
        "options": [
          "KANs have learnable 1D B-spline activation functions on edges (weights) with linear node summations, instead of fixed activations on nodes",
          "KANs use quantum entanglement instead of matrices",
          "KANs do not use backpropagation",
          "KANs only work on binary numbers"
        ],
        "correctAnswer": "KANs have learnable 1D B-spline activation functions on edges (weights) with linear node summations, instead of fixed activations on nodes",
        "boilerplate": "",
        "tags": [
          "kan",
          "neural-architectures"
        ],
        "hint": "Based on the Kolmogorov-Arnold representation theorem.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      }
    ]
  },
  "mixed": {
    "beginner": [
      {
        "title": "Algorithm Speed Comparison Search",
        "description": "Which search algorithm is faster on an already sorted 1,000,000-element array?",
        "options": [
          "Binary Search (O(log N))",
          "Linear Search (O(N))",
          "Random Search",
          "Bubble Search"
        ],
        "correctAnswer": "Binary Search (O(log N))",
        "boilerplate": "",
        "tags": [
          "mixed",
          "algorithms",
          "cs"
        ],
        "hint": "Binary search takes ~20 comparisons vs up to 1,000,000 for linear search.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Byte vs Bit Binary Units",
        "description": "How many bits are in 4 bytes of computer memory?",
        "options": [
          "32 bits",
          "16 bits",
          "64 bits",
          "8 bits"
        ],
        "correctAnswer": "32 bits",
        "boilerplate": "",
        "tags": [
          "mixed",
          "math",
          "cs"
        ],
        "hint": "1 byte = 8 bits. 4 × 8 = 32.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Hexadecimal Equivalent of Decimal 15",
        "description": "What single hexadecimal character represents the decimal integer 15?",
        "options": [
          "F",
          "E",
          "A",
          "10"
        ],
        "correctAnswer": "F",
        "boilerplate": "",
        "tags": [
          "mixed",
          "math",
          "encoding"
        ],
        "hint": "0-9, then A=10, B=11, C=12, D=13, E=14, F=15.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Modulo Clock Arithmetic 14 Hours",
        "description": "If it is 9:00 AM now on a 12-hour clock, what time will it be in 14 hours?",
        "options": [
          "11:00 PM",
          "10:00 PM",
          "11:00 AM",
          "1:00 AM"
        ],
        "correctAnswer": "11:00 PM",
        "boilerplate": "",
        "tags": [
          "mixed",
          "math",
          "clock"
        ],
        "hint": "(9 + 14) = 23:00 = 11:00 PM.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Boolean De Morgans Law Negation",
        "description": "According to De Morgan’s Laws, what is !(A && B) logically equivalent to?",
        "options": [
          "!A || !B",
          "!A && !B",
          "A || B",
          "!A ^ !B"
        ],
        "correctAnswer": "!A || !B",
        "boilerplate": "",
        "tags": [
          "mixed",
          "logic",
          "boolean"
        ],
        "hint": "Negate each term and flip AND to OR.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Storage Kilobyte vs Kibibyte IEC",
        "description": "Under IEC standard binary prefixes, how many bytes are in 1 Kibibyte (1 KiB)?",
        "options": [
          "1,024 bytes",
          "1,000 bytes",
          "1,048,576 bytes",
          "512 bytes"
        ],
        "correctAnswer": "1,024 bytes",
        "boilerplate": "",
        "tags": [
          "mixed",
          "standards"
        ],
        "hint": "2^10 = 1024 bytes.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "RGB Hex Color White",
        "description": "What is hexadecimal color code for pure white in web design?",
        "options": [
          "#FFFFFF",
          "#000000",
          "#FF0000",
          "#AAAAAA"
        ],
        "correctAnswer": "#FFFFFF",
        "boilerplate": "",
        "tags": [
          "mixed",
          "web",
          "math"
        ],
        "hint": "Maximum values for Red (FF), Green (FF), Blue (FF).",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Array Indexing Zero Base Origin",
        "description": "Why do most modern programming languages (C, Java, Python, JS) use 0-based array indexing?",
        "options": [
          "The index represents the memory offset distance from the base array pointer address",
          "Because 0 is the smallest natural number",
          "To save 1 bit of CPU cache",
          "It was a typo in original C compiler"
        ],
        "correctAnswer": "The index represents the memory offset distance from the base array pointer address",
        "boilerplate": "",
        "tags": [
          "mixed",
          "cs",
          "history"
        ],
        "hint": "Address = Base + Index × ElementSize; offset for first element is 0.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Simple Interest Formula Variable",
        "description": "In the simple interest formula I = P × R × T, what does \"P\" stand for?",
        "options": [
          "Principal (initial capital)",
          "Percentage rate",
          "Period in years",
          "Profit margin"
        ],
        "correctAnswer": "Principal (initial capital)",
        "boilerplate": "",
        "tags": [
          "mixed",
          "math",
          "finance"
        ],
        "hint": "Initial sum of money borrowed or invested.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      },
      {
        "title": "Bitwise Left Shift Doubling",
        "description": "What is the arithmetic effect of bitwise left shifting an integer by 1 (e.g. x << 1)?",
        "options": [
          "Multiplies by 2",
          "Divides by 2",
          "Adds 1",
          "Squares the number"
        ],
        "correctAnswer": "Multiplies by 2",
        "boilerplate": "",
        "tags": [
          "mixed",
          "bitwise",
          "math"
        ],
        "hint": "Each bit shifts to the next power of 2.",
        "timeLimit": 90,
        "xpReward": 50,
        "pointsReward": 100
      }
    ],
    "intermediate": [
      {
        "title": "Big-O Growth Hierarchy Ranking",
        "description": "Which ordering correctly sorts time complexities from fastest to slowest as N → ∞?",
        "options": [
          "O(1) < O(log N) < O(N) < O(N log N) < O(N²) < O(2^N)",
          "O(1) < O(N) < O(log N) < O(N²) < O(N log N)",
          "O(log N) < O(1) < O(N) < O(2^N)",
          "O(N) < O(N log N) < O(log N) < O(N²)"
        ],
        "correctAnswer": "O(1) < O(log N) < O(N) < O(N log N) < O(N²) < O(2^N)",
        "boilerplate": "",
        "tags": [
          "mixed",
          "complexity"
        ],
        "hint": "Logarithmic is sub-linear; exponential dominates polynomials.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Bitwise XOR Swapping Without Temp",
        "description": "If a = 5 and b = 9, what happens after: a = a ^ b; b = a ^ b; a = a ^ b;?",
        "options": [
          "a = 9, b = 5 (values are swapped)",
          "a = 0, b = 0",
          "a = 5, b = 9 (no change)",
          "a = 14, b = 14"
        ],
        "correctAnswer": "a = 9, b = 5 (values are swapped)",
        "boilerplate": "",
        "tags": [
          "mixed",
          "bitwise",
          "algorithms"
        ],
        "hint": "Classic in-place XOR swap trick using self-inverse property of XOR.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Deadlock Necessary Coffman Conditions",
        "description": "How many conditions (Coffman conditions) must simultaneously hold for a deadlock to occur?",
        "options": [
          "4 conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait)",
          "2 conditions",
          "3 conditions",
          "5 conditions"
        ],
        "correctAnswer": "4 conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait)",
        "boilerplate": "",
        "tags": [
          "mixed",
          "os",
          "concurrency"
        ],
        "hint": "Breaking any one of the four prevents deadlock.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Hamming Distance of Two Binary Strings",
        "description": "What is the Hamming distance between 1011101 and 1001001?",
        "options": [
          "2",
          "1",
          "3",
          "0"
        ],
        "correctAnswer": "2",
        "boilerplate": "",
        "tags": [
          "mixed",
          "information-theory",
          "math"
        ],
        "hint": "Differences at positions 3 and 5 (1 vs 0).",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "TCP Flow Control Sliding Window Role",
        "description": "What is the purpose of the Receive Window (rwnd) field advertised in TCP headers?",
        "options": [
          "Flow control: tells sender how many bytes receiver buffer can currently accept without overflowing",
          "Congestion control on internet routers",
          "Encrypts window contents",
          "Calculates round-trip delay"
        ],
        "correctAnswer": "Flow control: tells sender how many bytes receiver buffer can currently accept without overflowing",
        "boilerplate": "",
        "tags": [
          "mixed",
          "networking"
        ],
        "hint": "Prevents sender from overwhelming receiver buffer.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Bloom Filter False Negative Guarantee",
        "description": "What theoretical guarantee does a Bloom Filter probabilistic data structure provide?",
        "options": [
          "Zero false negatives (if it says an element is absent, it is 100% definitely absent)",
          "Zero false positives",
          "Exact element retrieval",
          "Deletion without rebuild"
        ],
        "correctAnswer": "Zero false negatives (if it says an element is absent, it is 100% definitely absent)",
        "boilerplate": "",
        "tags": [
          "mixed",
          "data-structures"
        ],
        "hint": "May have false positives, but never false negatives.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Checksum Two Complement Addition",
        "description": "In internet protocols (IPv4, TCP, UDP), how is header checksum computed?",
        "options": [
          "16-bit one’s complement sum of 16-bit words",
          "MD5 hash of payload",
          "Bitwise XOR sum of all bytes",
          "CRC32 polynomial division"
        ],
        "correctAnswer": "16-bit one’s complement sum of 16-bit words",
        "boilerplate": "",
        "tags": [
          "mixed",
          "networking",
          "math"
        ],
        "hint": "End-around carry addition inverted at completion.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Tail Recursion Elimination Mechanism",
        "description": "What allows compilers to optimize tail-recursive functions into iterative while-loops?",
        "options": [
          "Because the recursive call is the very last operation, caller stack frame requires no saved return state",
          "Because recursion is limited to 10 iterations",
          "Because CPU has hardware tail recursion registers",
          "Because functions are converted to assembly macros"
        ],
        "correctAnswer": "Because the recursive call is the very last operation, caller stack frame requires no saved return state",
        "boilerplate": "",
        "tags": [
          "mixed",
          "compilers"
        ],
        "hint": "Replaces call instruction with jump instruction.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Little Endian vs Big Endian Multi-Byte Storage",
        "description": "On a Little-Endian processor (like x86), in what order are bytes of 32-bit integer 0x12345678 stored in RAM?",
        "options": [
          "0x78, 0x56, 0x34, 0x12",
          "0x12, 0x34, 0x56, 0x78",
          "0x56, 0x78, 0x12, 0x34",
          "0x34, 0x12, 0x78, 0x56"
        ],
        "correctAnswer": "0x78, 0x56, 0x34, 0x12",
        "boilerplate": "",
        "tags": [
          "mixed",
          "hardware"
        ],
        "hint": "Least significant byte (LSB 0x78) is stored at lowest memory address.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      },
      {
        "title": "Matrix Coordinate Row Column vs XY Coordinates",
        "description": "In standard 2D arrays/matrices M[i][j], what do i and j represent compared to Cartesian (x, y)?",
        "options": [
          "i is row (y-axis downwards), j is column (x-axis rightwards)",
          "i is x, j is y",
          "i is diagonal, j is angle",
          "They are strictly identical"
        ],
        "correctAnswer": "i is row (y-axis downwards), j is column (x-axis rightwards)",
        "boilerplate": "",
        "tags": [
          "mixed",
          "math",
          "programming"
        ],
        "hint": "Row index corresponds to vertical displacement.",
        "timeLimit": 75,
        "xpReward": 100,
        "pointsReward": 200
      }
    ],
    "advanced": [
      {
        "title": "Master Theorem Divide and Conquer Recurrence",
        "description": "Given recurrence T(n) = 2 T(n/2) + O(n), what is overall time complexity by Master Theorem?",
        "options": [
          "O(n log n)",
          "O(n²)",
          "O(n)",
          "O(log n)"
        ],
        "correctAnswer": "O(n log n)",
        "boilerplate": "",
        "tags": [
          "mixed",
          "algorithms",
          "math"
        ],
        "hint": "Case 2 of Master Theorem: log_b(a) = log_2(2) = 1 matches f(n) = n^1.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Consistent Hashing Ring Redistribution",
        "description": "When adding 1 node to a cluster of N nodes using Consistent Hashing, what fraction of keys need relocation?",
        "options": [
          "O(K / N) on average",
          "100% of all keys",
          "50% of keys",
          "O(K × N) keys"
        ],
        "correctAnswer": "O(K / N) on average",
        "boilerplate": "",
        "tags": [
          "mixed",
          "distributed-systems"
        ],
        "hint": "Only keys falling in the new node’s partition range are reassigned.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Two Phase Locking 2PL Concurrency Guarantee",
        "description": "What guarantee does Strict Two-Phase Locking (SS2PL) provide to concurrent database transactions?",
        "options": [
          "Guarantees conflict serializability and prevents cascading aborts",
          "Prevents deadlocks entirely",
          "Eliminates lock wait queues",
          "Guarantees linear response time"
        ],
        "correctAnswer": "Guarantees conflict serializability and prevents cascading aborts",
        "boilerplate": "",
        "tags": [
          "mixed",
          "databases"
        ],
        "hint": "Holding exclusive locks until transaction commit/rollback ensures recoverability.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Huffman Coding Prefix Property",
        "description": "Why do Huffman coding codes require no delimiters between variable-length characters during decoding?",
        "options": [
          "No codeword is a prefix of any other codeword (Prefix Code property)",
          "All codewords have equal bit length",
          "Codewords start with 1 and end with 0",
          "Uses parity bits between symbols"
        ],
        "correctAnswer": "No codeword is a prefix of any other codeword (Prefix Code property)",
        "boilerplate": "",
        "tags": [
          "mixed",
          "compression",
          "trees"
        ],
        "hint": "Leaves of binary tree guarantee instantaneous unique decodability.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Page Replacement Optimal Belady Anomaly",
        "description": "What counter-intuitive behavior does Bélády’s Anomaly describe in FIFO page replacement?",
        "options": [
          "Allocating MORE physical page frames to a process can INCREASE the number of page faults",
          "Adding RAM makes CPU run hotter",
          "Small page sizes cause instant thrashing",
          "LRU performs worse than Random"
        ],
        "correctAnswer": "Allocating MORE physical page frames to a process can INCREASE the number of page faults",
        "boilerplate": "",
        "tags": [
          "mixed",
          "os",
          "algorithms"
        ],
        "hint": "FIFO is not a stack algorithm, allowing anomaly on certain reference strings.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Elliptic Curve Point Addition Group Law",
        "description": "On an elliptic curve y² = x³ + ax + b over a field, how is the sum of two distinct points P + Q defined geometrically?",
        "options": [
          "Draw line through P and Q, find third intersection with curve R, reflect across x-axis to get -R",
          "Add coordinates directly (x_p + x_q, y_p + y_q)",
          "Calculate mid-point of segment PQ",
          "Draw circle passing through P, Q, and origin"
        ],
        "correctAnswer": "Draw line through P and Q, find third intersection with curve R, reflect across x-axis to get -R",
        "boilerplate": "",
        "tags": [
          "mixed",
          "cryptography",
          "geometry"
        ],
        "hint": "Chord-and-tangent group law on cubic curves.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Rabin-Karp Rolling Hash String Search",
        "description": "How does Rabin-Karp achieve O(1) expected time per pattern shift when searching text?",
        "options": [
          "Computes rolling polynomial hash in O(1) by subtracting leaving character and adding entering character",
          "Builds a suffix tree in advance",
          "Uses hardware string compare instructions",
          "Sorts characters in window"
        ],
        "correctAnswer": "Computes rolling polynomial hash in O(1) by subtracting leaving character and adding entering character",
        "boilerplate": "",
        "tags": [
          "mixed",
          "algorithms",
          "math"
        ],
        "hint": "Hash update H_{i+1} = (H_i - c_out × b^(m-1)) × b + c_in mod M.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      },
      {
        "title": "Deadlock Detection Wait-For Graph Cycle",
        "description": "In an operating system or database transaction manager, how is deadlock detected?",
        "options": [
          "Finding directed cycles in the Wait-For Graph (WFG) of transactions waiting for resources",
          "Monitoring CPU temperature threshold",
          "Counting transaction timeouts",
          "Measuring network latency"
        ],
        "correctAnswer": "Finding directed cycles in the Wait-For Graph (WFG) of transactions waiting for resources",
        "boilerplate": "",
        "tags": [
          "mixed",
          "os",
          "graph-theory"
        ],
        "hint": "Tarjan’s or DFS cycle detection algorithm on resource dependency graph.",
        "timeLimit": 60,
        "xpReward": 200,
        "pointsReward": 400
      }
    ],
    "expert": [
      {
        "title": "Amortized Analysis Potential Function Method",
        "description": "In amortized analysis of dynamic arrays doubling size, what is the amortized cost per append operation?",
        "options": [
          "O(1) amortized time",
          "O(N) amortized time",
          "O(log N) amortized time",
          "O(N²) amortized time"
        ],
        "correctAnswer": "O(1) amortized time",
        "boilerplate": "",
        "tags": [
          "mixed",
          "amortized-analysis"
        ],
        "hint": "Total copying cost for N elements is 1 + 2 + 4 + ... + N ≤ 2N; 2N / N = O(1).",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Zero Knowledge Schnorr Identification Protocol",
        "description": "In the Schnorr identification protocol, what interactive 3-step exchange occurs between prover and verifier?",
        "options": [
          "Commitment (prover) → Challenge (verifier) → Response (prover)",
          "Encryption → Decryption → Attestation",
          "Public Key → Secret Key → Signature",
          "Handshake → Ciphertext → Hash"
        ],
        "correctAnswer": "Commitment (prover) → Challenge (verifier) → Response (prover)",
        "boilerplate": "",
        "tags": [
          "mixed",
          "cryptography",
          "protocols"
        ],
        "hint": "Sigma protocol: Prover sends r = g^k, Verifier sends e, Prover responds s = k + e·x.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Cuckoo Hashing Worst Case Lookup Guarantee",
        "description": "What worst-case lookup time does Cuckoo Hashing guarantee in a hash table?",
        "options": [
          "O(1) worst-case lookup time by probing at most 2 table locations",
          "O(log N) worst-case lookup",
          "O(N) worst-case lookup",
          "O(1) insertion time guaranteed"
        ],
        "correctAnswer": "O(1) worst-case lookup time by probing at most 2 table locations",
        "boilerplate": "",
        "tags": [
          "mixed",
          "data-structures"
        ],
        "hint": "Key is guaranteed to reside in h₁(k) or h₂(k).",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Simulated Annealing Metropolis Acceptance Criterion",
        "description": "In Simulated Annealing optimization, what is the probability of accepting a worse neighbor solution with ΔE > 0 at temperature T?",
        "options": [
          "e^(-ΔE / (k_B · T))",
          "1 - ΔE / T",
          "0% (never accept worse moves)",
          "50% fixed"
        ],
        "correctAnswer": "e^(-ΔE / (k_B · T))",
        "boilerplate": "",
        "tags": [
          "mixed",
          "heuristics",
          "physics"
        ],
        "hint": "Allows escaping local minima; probability decreases as system cools (T → 0).",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Fast Fourier Transform Cooley-Tukey Radix 2",
        "description": "How does Cooley-Tukey FFT reduce polynomial multiplication time from O(N²) to O(N log N)?",
        "options": [
          "Decomposes DFT of size N into two interleaved DFTs of size N/2 for even and odd indexed coefficients using twiddle factors",
          "Converts polynomials into binary numbers",
          "Replaces multiplication with table lookups",
          "Approximates frequencies with wavelets"
        ],
        "correctAnswer": "Decomposes DFT of size N into two interleaved DFTs of size N/2 for even and odd indexed coefficients using twiddle factors",
        "boilerplate": "",
        "tags": [
          "mixed",
          "algorithms",
          "signal-processing"
        ],
        "hint": "Divide and conquer on roots of unity.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      },
      {
        "title": "Byzantine Paxos vs Classic Paxos Quorum",
        "description": "Why does Byzantine Paxos require a quorum of 2f + 1 out of 3f + 1 nodes instead of a simple majority f + 1 out of 2f + 1?",
        "options": [
          "To ensure that any two quorums overlap by at least f + 1 nodes, guaranteeing at least one honest node in the intersection",
          "To double encryption key length",
          "Because nodes communicate in pairs",
          "To prevent network timeout errors"
        ],
        "correctAnswer": "To ensure that any two quorums overlap by at least f + 1 nodes, guaranteeing at least one honest node in the intersection",
        "boilerplate": "",
        "tags": [
          "mixed",
          "distributed-systems"
        ],
        "hint": "Quorum intersection must survive malicious nodes lying about history.",
        "timeLimit": 45,
        "xpReward": 400,
        "pointsReward": 800
      }
    ],
    "master": [
      {
        "title": "Quantum Grover Search Lower Bound",
        "description": "Bennett, Bernstein, Brassard, and Vazirani (BBBV) proved that searching an unstructured database of N items with quantum query requires at least:",
        "options": [
          "Ω(√N) quantum queries (Grover’s algorithm is asymptotically optimal)",
          "O(log N) quantum queries",
          "O(1) quantum queries",
          "Ω(N) quantum queries"
        ],
        "correctAnswer": "Ω(√N) quantum queries (Grover’s algorithm is asymptotically optimal)",
        "boilerplate": "",
        "tags": [
          "mixed",
          "quantum-algorithms"
        ],
        "hint": "Polynomial method proves square root speedup cannot be beaten.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Johnson-Lindenstrauss Dimensionality Reduction Lemma",
        "description": "The Johnson-Lindenstrauss lemma states that any N points in high-dimensional Euclidean space can be projected into dimension k = O(ε^(-2) log N) such that:",
        "options": [
          "All pairwise Euclidean distances are preserved within factor (1 ± ε)",
          "Angles are preserved exactly to 0 degrees",
          "All dimensions become integers",
          "Information entropy drops to zero"
        ],
        "correctAnswer": "All pairwise Euclidean distances are preserved within factor (1 ± ε)",
        "boilerplate": "",
        "tags": [
          "mixed",
          "randomized-algorithms",
          "math"
        ],
        "hint": "Random Gaussian orthogonal projections preserve metric distances.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      },
      {
        "title": "Spectral Graph Theory Cheeger Inequality",
        "description": "Cheeger’s inequality establishes a fundamental geometric bound connecting the conductance (bottleneck ratio) h(G) of a graph to:",
        "options": [
          "The second smallest eigenvalue λ₂ of the normalized graph Laplacian matrix",
          "The chromatic number of the graph",
          "The diameter of the graph",
          "The determinant of the adjacency matrix"
        ],
        "correctAnswer": "The second smallest eigenvalue λ₂ of the normalized graph Laplacian matrix",
        "boilerplate": "",
        "tags": [
          "mixed",
          "spectral-graph-theory"
        ],
        "hint": "2h(G) ≥ λ₂ ≥ h(G)² / 2; spectral gap controls graph expansion.",
        "timeLimit": 35,
        "xpReward": 700,
        "pointsReward": 1400
      }
    ],
    "grandmaster": [
      {
        "title": "Unique Games Conjecture Hardness of Approximation",
        "description": "Subhash Khot’s Unique Games Conjecture (UGC) implies optimal hardness of approximation for which major problem?",
        "options": [
          "MAX-CUT cannot be approximated better than Goemans-Williamson 0.878 ratio unless P = NP",
          "Traveling Salesperson Problem in Euclidean space",
          "Integer factoring in polynomial time",
          "Planar graph coloring with 3 colors"
        ],
        "correctAnswer": "MAX-CUT cannot be approximated better than Goemans-Williamson 0.878 ratio unless P = NP",
        "boilerplate": "",
        "tags": [
          "mixed",
          "computational-complexity"
        ],
        "hint": "Connects semidefinite programming approximations with optimal hardness thresholds.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Bekenstein Bound Information Density Limit",
        "description": "The Bekenstein bound defines the maximum informational entropy I that can be contained in a physical region of radius R and energy E as:",
        "options": [
          "I ≤ (2π R E) / (ħ c ln 2)",
          "I ≤ c² / (G R)",
          "I ≤ 4π R²",
          "I ≤ E / (k_B T)"
        ],
        "correctAnswer": "I ≤ (2π R E) / (ħ c ln 2)",
        "boilerplate": "",
        "tags": [
          "mixed",
          "physics-of-computation"
        ],
        "hint": "Information content is bounded by surface horizon area and energy.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      },
      {
        "title": "Interactive Proof IP Equals PSPACE Proof",
        "description": "Adi Shamir (1990) proved that the class IP of languages decidable by polynomial-time Interactive Proof Systems is equal to:",
        "options": [
          "PSPACE (IP = PSPACE)",
          "NP (IP = NP)",
          "BQP (Quantum Polynomial Time)",
          "EXPTIME"
        ],
        "correctAnswer": "PSPACE (IP = PSPACE)",
        "boilerplate": "",
        "tags": [
          "mixed",
          "complexity-theory"
        ],
        "hint": "Uses arithmetization of QBF (Quantified Boolean Formulas) over finite fields.",
        "timeLimit": 25,
        "xpReward": 1000,
        "pointsReward": 2000
      }
    ]
  }
};

/**
 * Returns a randomized, deduplicated sample of questions for the given mode and difficulty.
 * If mode is 'mixed', samples from across all other modes.
 */
export function getStaticQuestions(
  mode: ArenaCategory,
  difficulty: ArenaDifficulty,
  limit: number = 20,
  excludeIds: string[] = []
): StaticArenaQuestion[] {
  const diff = difficulty in TIME_MAP ? difficulty : 'beginner';
  let pool: StaticArenaQuestion[] = [];

  if (mode === 'mixed') {
    const modes: ArenaCategory[] = ['coding', 'puzzle', 'math', 'gk', 'prediction', 'topicdoc', 'mixed'];
    for (const m of modes) {
      const modeQs = ARENA_QUESTION_BANK[m]?.[diff] || [];
      pool.push(...modeQs);
    }
  } else {
    pool = ARENA_QUESTION_BANK[mode]?.[diff] || [];
  }

  // Filter out excluded question titles
  const excludedSet = new Set(excludeIds.map(x => x.toLowerCase()));
  const filtered = pool.filter(q => !excludedSet.has(q.title.toLowerCase()));

  const candidatePool = filtered.length >= Math.min(limit, 3) ? filtered : pool;

  // Shuffle candidate pool using Fisher-Yates
  const shuffled = [...candidatePool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, limit);
}
