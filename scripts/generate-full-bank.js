// Question Bank Generator for 530+ Static Arena Questions across 7 Game Modes
const fs = require('fs');
const path = require('path');

const TIME_MAP = {
  beginner: 90,
  intermediate: 75,
  advanced: 60,
  expert: 45,
  master: 35,
  grandmaster: 25,
};

const XP_MAP = {
  beginner: 50,
  intermediate: 100,
  advanced: 200,
  expert: 400,
  master: 700,
  grandmaster: 1000,
};

const POINTS_MAP = {
  beginner: 100,
  intermediate: 200,
  advanced: 400,
  expert: 800,
  master: 1400,
  grandmaster: 2000,
};

const ATTEMPTS_MAP = {
  beginner: 12,
  intermediate: 16,
  advanced: 20,
  expert: 25,
  master: 30,
  grandmaster: 35,
};

const bank = {
  coding: { beginner: [], intermediate: [], advanced: [], expert: [], master: [], grandmaster: [] },
  puzzle: { beginner: [], intermediate: [], advanced: [], expert: [], master: [], grandmaster: [] },
  math: { beginner: [], intermediate: [], advanced: [], expert: [], master: [], grandmaster: [] },
  gk: { beginner: [], intermediate: [], advanced: [], expert: [], master: [], grandmaster: [] },
  prediction: { beginner: [], intermediate: [], advanced: [], expert: [], master: [], grandmaster: [] },
  topicdoc: { beginner: [], intermediate: [], advanced: [], expert: [], master: [], grandmaster: [] },
  mixed: { beginner: [], intermediate: [], advanced: [], expert: [], master: [], grandmaster: [] },
};

function q(category, diff, title, description, options, correctAnswer, boilerplate = '', tags = [], hint = '') {
  bank[category][diff].push({
    title,
    description,
    options: options || [],
    correctAnswer,
    boilerplate: boilerplate || '',
    tags: tags.length ? tags : [category],
    hint: hint || '',
    timeLimit: TIME_MAP[diff] || 60,
    xpReward: XP_MAP[diff] || 50,
    pointsReward: POINTS_MAP[diff] || 100,
  });
}

// ==========================================
// 1. CODING BATTLE (75 Unique Questions)
// ==========================================
// Beginner (15)
q('coding', 'beginner', 'Hello World Function', 'Write a function helloWorld() that returns the string "Hello, World!".', [], 'Hello, World!', 'function helloWorld() {\n  return "Hello, World!";\n}', ['basics', 'string']);
q('coding', 'beginner', 'Sum Two Numbers', 'Return the sum of two integers a and b.', [], 'sum', 'function sum(a, b) {\n  return a + b;\n}', ['math', 'basics']);
q('coding', 'beginner', 'Check Even or Odd', 'Return "even" if number is even, "odd" otherwise.', [], 'even/odd', 'function evenOrOdd(n) {\n  return n % 2 === 0 ? "even" : "odd";\n}', ['conditionals']);
q('coding', 'beginner', 'Reverse a String', 'Return the reversed version of string s.', [], 'reversed', 'function reverseString(s) {\n  return s.split("").reverse().join("");\n}', ['string']);
q('coding', 'beginner', 'Find Max in Array', 'Return the maximum value in an array of numbers.', [], 'max', 'function findMax(arr) {\n  return Math.max(...arr);\n}', ['array']);
q('coding', 'beginner', 'Count Vowels in String', 'Return the count of vowels (a, e, i, o, u) in string s.', [], 'count', 'function countVowels(s) {\n  return (s.match(/[aeiou]/gi) || []).length;\n}', ['string']);
q('coding', 'beginner', 'Single FizzBuzz Check', 'Return "Fizz" if divisible by 3, "Buzz" if 5, "FizzBuzz" if both, else string of n.', [], 'fizzbuzz', 'function fizzBuzz(n) {\n  if (n % 15 === 0) return "FizzBuzz";\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return String(n);\n}', ['basics']);
q('coding', 'beginner', 'Calculate String Length', 'Return length of string without calling .length directly.', [], 'len', 'function strLen(s) {\n  let count = 0; for (let _ of s) count++; return count;\n}', ['string']);
q('coding', 'beginner', 'Factorial of Integer', 'Return n! for positive integer n.', [], 'factorial', 'function factorial(n) {\n  return n <= 1 ? 1 : n * factorial(n - 1);\n}', ['math', 'recursion']);
q('coding', 'beginner', 'First Element of Array', 'Return the first element or null if empty.', [], 'elem', 'function firstElement(arr) {\n  return arr.length ? arr[0] : null;\n}', ['array']);
q('coding', 'beginner', 'Array Includes Value', 'Return true if arr contains target, else false.', [], 'bool', 'function contains(arr, target) {\n  return arr.includes(target);\n}', ['array', 'search']);
q('coding', 'beginner', 'Capitalize First Letter', 'Capitalize the first character of string s.', [], 'capitalized', 'function capitalize(s) {\n  return s ? s[0].toUpperCase() + s.slice(1) : "";\n}', ['string']);
q('coding', 'beginner', 'Strip Whitespace', 'Remove all whitespace characters from a string.', [], 'cleaned', 'function strip(s) {\n  return s.replace(/\\s+/g, "");\n}', ['string']);
q('coding', 'beginner', 'Double Array Values', 'Return a new array with every element multiplied by 2.', [], 'doubled', 'function doubleArray(arr) {\n  return arr.map(x => x * 2);\n}', ['array']);
q('coding', 'beginner', 'Is String Blank', 'Check if string is empty or contains only spaces.', [], 'bool', 'function isBlank(s) {\n  return s.trim().length === 0;\n}', ['string']);

// Intermediate (15)
q('coding', 'intermediate', 'Two Sum Target', 'Return indices [i, j] of two numbers that add up to target.', [], 'indices', 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const d = target - nums[i];\n    if (map.has(d)) return [map.get(d), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}', ['hashmap', 'array']);
q('coding', 'intermediate', 'Palindrome Alphanumeric', 'Return true if string is a palindrome ignoring non-alphanumeric chars.', [], 'bool', 'function isPalindrome(s) {\n  const c = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return c === c.split("").reverse().join("");\n}', ['two-pointers', 'string']);
q('coding', 'intermediate', 'Fibonacci O(1) Space', 'Return nth Fibonacci number in O(n) time and O(1) auxiliary space.', [], 'fib', 'function fib(n) {\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) { let t = a + b; a = b; b = t; }\n  return n === 0 ? 0 : b;\n}', ['dp', 'math']);
q('coding', 'intermediate', 'Remove Duplicates Array', 'Return array of unique elements in original insertion order.', [], 'unique', 'function removeDuplicates(arr) {\n  return [...new Set(arr)];\n}', ['set', 'array']);
q('coding', 'intermediate', 'Array Intersection', 'Return intersection of two arrays with unique elements.', [], 'common', 'function intersection(a, b) {\n  const sb = new Set(b);\n  return a.filter(x => sb.has(x));\n}', ['array', 'set']);
q('coding', 'intermediate', 'Chunk Array into Slices', 'Split array into subarrays of maximum size k.', [], 'chunks', 'function chunk(arr, size) {\n  const res = [];\n  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));\n  return res;\n}', ['array']);
q('coding', 'intermediate', 'Deep Flatten Array', 'Flatten arbitrary nested array into single 1D array.', [], 'flat', 'function flatten(arr) {\n  return arr.flat(Infinity);\n}', ['array', 'recursion']);
q('coding', 'intermediate', 'Group Objects by Key', 'Group list of objects into dictionary indexed by given property.', [], 'grouped', 'function groupBy(arr, key) {\n  return arr.reduce((acc, x) => {\n    (acc[x[key]] = acc[x[key]] || []).push(x);\n    return acc;\n  }, {});\n}', ['hashmap', 'objects']);
q('coding', 'intermediate', 'Title Case Sentence', 'Capitalize first letter of every word in given text.', [], 'titleCase', 'function titleCase(str) {\n  return str.replace(/\\b\\w/g, c => c.toUpperCase());\n}', ['string']);
q('coding', 'intermediate', 'Valid Anagram Check', 'Return true if t is an anagram of s in O(n) time.', [], 'bool', 'function isAnagram(s, t) {\n  return s.split("").sort().join("") === t.split("").sort().join("");\n}', ['sorting', 'hashmap']);
q('coding', 'intermediate', 'Character Frequency Map', 'Return frequency map of characters in string.', [], 'freq', 'function charFrequency(s) {\n  const m = {}; for (let c of s) m[c] = (m[c] || 0) + 1; return m;\n}', ['hashmap']);
q('coding', 'intermediate', 'Rotate Array by K', 'Rotate array right by k steps in-place or return new array.', [], 'rotated', 'function rotate(nums, k) {\n  k %= nums.length; return [...nums.slice(-k), ...nums.slice(0, -k)];\n}', ['array']);
q('coding', 'intermediate', 'Merge Sorted Arrays', 'Merge two sorted arrays a and b in O(n + m) time.', [], 'merged', 'function merge(a, b) {\n  let i = 0, j = 0, res = [];\n  while (i < a.length && j < b.length) {\n    res.push(a[i] < b[j] ? a[i++] : b[j++]);\n  }\n  return res.concat(a.slice(i)).concat(b.slice(j));\n}', ['two-pointers', 'sorting']);
q('coding', 'intermediate', 'Digit Sum of Integer', 'Calculate sum of decimal digits of absolute integer n.', [], 'sum', 'function digitSum(n) {\n  return Math.abs(n).toString().split("").reduce((acc, d) => acc + +d, 0);\n}', ['math']);
q('coding', 'intermediate', 'Prime Number Test', 'Check if integer n > 1 is prime in O(sqrt(n)).', [], 'bool', 'function isPrime(n) {\n  if (n <= 1) return false;\n  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;\n  return true;\n}', ['math', 'number-theory']);

// Advanced (15)
q('coding', 'advanced', 'Kadane Max Subarray Sum', 'Find maximum contiguous subarray sum in O(n) time.', [], 'maxSum', 'function maxSubArray(nums) {\n  let max = nums[0], cur = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    max = Math.max(max, cur);\n  }\n  return max;\n}', ['dp', 'greedy']);
q('coding', 'advanced', 'Binary Search Index', 'Implement binary search returning index of target in sorted array.', [], 'index', 'function binarySearch(arr, target) {\n  let l = 0, r = arr.length - 1;\n  while (l <= r) {\n    let m = Math.floor((l + r) / 2);\n    if (arr[m] === target) return m;\n    if (arr[m] < target) l = m + 1; else r = m - 1;\n  }\n  return -1;\n}', ['binary-search']);
q('coding', 'advanced', 'Valid Parentheses Stack', 'Check if bracket string has valid nesting and closing brackets.', [], 'bool', 'function isValid(s) {\n  const stack = [], map = { ")": "(", "}": "{", "]": "[" };\n  for (let c of s) {\n    if ("({[".includes(c)) stack.push(c);\n    else if (stack.pop() !== map[c]) return false;\n  }\n  return stack.length === 0;\n}', ['stack']);
q('coding', 'advanced', 'Longest Common Prefix', 'Find the longest common prefix among an array of strings.', [], 'prefix', 'function longestCommonPrefix(strs) {\n  if (!strs.length) return "";\n  let p = strs[0];\n  for (let i = 1; i < strs.length; i++) {\n    while (strs[i].indexOf(p) !== 0) p = p.slice(0, -1);\n  }\n  return p;\n}', ['string']);
q('coding', 'advanced', 'Deep Clone Object', 'Clone nested object without shared references.', [], 'clone', 'function deepClone(obj) {\n  return JSON.parse(JSON.stringify(obj));\n}', ['objects']);
q('coding', 'advanced', 'Debounce Implementation', 'Implement debounce higher-order function with millisecond delay.', [], 'fn', 'function debounce(fn, ms) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), ms);\n  };\n}', ['closures', 'async']);
q('coding', 'advanced', 'Throttle Implementation', 'Implement throttle ensuring at most one call per limit window.', [], 'fn', 'function throttle(fn, limit) {\n  let wait = false;\n  return function(...args) {\n    if (!wait) {\n      fn.apply(this, args); wait = true;\n      setTimeout(() => wait = false, limit);\n    }\n  };\n}', ['async', 'closures']);
q('coding', 'advanced', 'Product Except Self', 'Return array where out[i] is product of all elements except nums[i] in O(n) without division.', [], 'products', 'function productExceptSelf(nums) {\n  const n = nums.length, res = new Array(n).fill(1);\n  let l = 1, r = 1;\n  for (let i = 0; i < n; i++) { res[i] *= l; l *= nums[i]; }\n  for (let i = n - 1; i >= 0; i--) { res[i] *= r; r *= nums[i]; }\n  return res;\n}', ['prefix-sum']);
q('coding', 'advanced', 'Search Rotated Sorted Array', 'Find target index in rotated sorted array in O(log n).', [], 'index', 'function searchRotated(nums, target) {\n  let l = 0, r = nums.length - 1;\n  while (l <= r) {\n    let m = Math.floor((l + r) / 2);\n    if (nums[m] === target) return m;\n    if (nums[l] <= nums[m]) {\n      if (nums[l] <= target && target < nums[m]) r = m - 1; else l = m + 1;\n    } else {\n      if (nums[m] < target && target <= nums[r]) l = m + 1; else r = m - 1;\n    }\n  }\n  return -1;\n}', ['binary-search']);
q('coding', 'advanced', 'Top K Frequent Elements', 'Find k most frequent numbers in array in O(n log k) time.', [], 'topK', 'function topKFrequent(nums, k) {\n  const map = new Map(); nums.forEach(n => map.set(n, (map.get(n) || 0) + 1));\n  return [...map.entries()].sort((a,b) => b[1] - a[1]).slice(0, k).map(x => x[0]);\n}', ['hashmap', 'sorting']);
q('coding', 'advanced', 'House Robber DP', 'Determine maximum amount of money robbed without hitting adjacent houses.', [], 'maxRob', 'function rob(nums) {\n  let p1 = 0, p2 = 0;\n  for (let n of nums) { let t = p1; p1 = Math.max(p2 + n, p1); p2 = t; }\n  return p1;\n}', ['dp']);
q('coding', 'advanced', 'Coin Change Fewest Coins', 'Return fewest coins needed to make amount, or -1 if impossible.', [], 'minCoins', 'function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity); dp[0] = 0;\n  for (let i = 1; i <= amount; i++) {\n    for (let c of coins) if (i >= c) dp[i] = Math.min(dp[i], dp[i - c] + 1);\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}', ['dp']);
q('coding', 'advanced', 'Number of Islands DFS', 'Count connected islands of 1s in 2D binary grid.', [], 'count', 'function numIslands(grid) {\n  let count = 0;\n  const dfs = (r, c) => {\n    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== "1") return;\n    grid[r][c] = "0";\n    dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);\n  };\n  for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[0].length; c++) if (grid[r][c] === "1") { count++; dfs(r, c); }\n  return count;\n}', ['dfs', 'graph']);
q('coding', 'advanced', 'Subarray Sum Equals K', 'Count total contiguous subarrays whose sum equals k in O(n).', [], 'count', 'function subarraySum(nums, k) {\n  let count = 0, sum = 0, map = new Map([[0, 1]]);\n  for (let n of nums) {\n    sum += n;\n    if (map.has(sum - k)) count += map.get(sum - k);\n    map.set(sum, (map.get(sum) || 0) + 1);\n  }\n  return count;\n}', ['hashmap', 'prefix-sum']);
q('coding', 'advanced', 'Spiral Matrix Traversal', 'Return matrix elements in spiral order traversal.', [], 'spiral', 'function spiralOrder(matrix) {\n  const res = []; if (!matrix.length) return res;\n  let t = 0, b = matrix.length - 1, l = 0, r = matrix[0].length - 1;\n  while (t <= b && l <= r) {\n    for (let i = l; i <= r; i++) res.push(matrix[t][i]); t++;\n    for (let i = t; i <= b; i++) res.push(matrix[i][r]); r--;\n    if (t <= b) { for (let i = r; i >= l; i--) res.push(matrix[b][i]); b--; }\n    if (l <= r) { for (let i = b; i >= t; i--) res.push(matrix[i][l]); l++; }\n  }\n  return res;\n}', ['matrix']);

// Expert (13)
q('coding', 'expert', 'Longest Common Subsequence', 'Find length of LCS between two strings in O(n * m) time.', [], 'length', 'function lcs(s1, s2) {\n  const dp = Array(s1.length + 1).fill(0).map(() => Array(s2.length + 1).fill(0));\n  for (let i = 1; i <= s1.length; i++) {\n    for (let j = 1; j <= s2.length; j++) {\n      dp[i][j] = s1[i-1] === s2[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);\n    }\n  }\n  return dp[s1.length][s2.length];\n}', ['dp', 'string']);
q('coding', 'expert', 'Graph BFS Traversal', 'Return nodes visited in BFS queue order starting from source node.', [], 'order', 'function bfs(graph, start) {\n  const visited = new Set([start]), queue = [start], order = [];\n  while (queue.length) {\n    const u = queue.shift(); order.push(u);\n    for (let v of graph[u] || []) if (!visited.has(v)) { visited.add(v); queue.push(v); }\n  }\n  return order;\n}', ['graph', 'bfs']);
q('coding', 'expert', 'Kahn Topological Sort', 'Find topological ordering of vertices in Directed Acyclic Graph.', [], 'order', 'function topoSort(n, prereqs) {\n  const inDeg = Array(n).fill(0), adj = Array(n).fill(0).map(() => []);\n  prereqs.forEach(([v, u]) => { adj[u].push(v); inDeg[v]++; });\n  const q = [], res = [];\n  for (let i = 0; i < n; i++) if (inDeg[i] === 0) q.push(i);\n  while (q.length) {\n    const u = q.shift(); res.push(u);\n    adj[u].forEach(v => { if (--inDeg[v] === 0) q.push(v); });\n  }\n  return res.length === n ? res : [];\n}', ['graph', 'dag']);
q('coding', 'expert', 'Trie Prefix Tree', 'Implement Trie with insert, search, and startsWith.', [], 'trie', 'class Trie {\n  constructor() { this.root = {}; }\n  insert(w) { let n = this.root; for (let c of w) n = n[c] = n[c] || {}; n.isEnd = true; }\n  search(w) { let n = this.root; for (let c of w) if (!n[c]) return false; else n = n[c]; return !!n.isEnd; }\n  startsWith(p) { let n = this.root; for (let c of p) if (!n[c]) return false; else n = n[c]; return true; }\n}', ['tree', 'trie']);
q('coding', 'expert', 'Clone Graph Deep Copy', 'Return deep copy of connected undirected graph node.', [], 'clone', 'function cloneGraph(node) {\n  if (!node) return null; const map = new Map();\n  const dfs = (curr) => {\n    if (map.has(curr)) return map.get(curr);\n    const copy = { val: curr.val, neighbors: [] }; map.set(curr, copy);\n    curr.neighbors.forEach(n => copy.neighbors.push(dfs(n))); return copy;\n  };\n  return dfs(node);\n}', ['graph', 'dfs']);
q('coding', 'expert', 'Word Break Problem DP', 'Determine if string can be segmented into words from dictionary.', [], 'bool', 'function wordBreak(s, dict) {\n  const set = new Set(dict), dp = Array(s.length + 1).fill(false);\n  dp[0] = true;\n  for (let i = 1; i <= s.length; i++) {\n    for (let j = 0; j < i; j++) if (dp[j] && set.has(s.slice(j, i))) { dp[i] = true; break; }\n  }\n  return dp[s.length];\n}', ['dp', 'string']);
q('coding', 'expert', 'Course Schedule Cycle Detection', 'Detect cycles in course prerequisites graph.', [], 'bool', 'function canFinish(n, edges) {\n  const inDeg = Array(n).fill(0), adj = Array(n).fill(0).map(() => []);\n  edges.forEach(([v, u]) => { adj[u].push(v); inDeg[v]++; });\n  const q = []; for (let i = 0; i < n; i++) if (inDeg[i] === 0) q.push(i);\n  let seen = 0;\n  while (q.length) { const u = q.shift(); seen++; adj[u].forEach(v => { if (--inDeg[v] === 0) q.push(v); }); }\n  return seen === n;\n}', ['graph', 'cycle']);
q('coding', 'expert', 'LRU Cache Design', 'Design LRU Cache with get and put in O(1) time.', [], 'lru', 'class LRUCache {\n  constructor(cap) { this.cap = cap; this.m = new Map(); }\n  get(k) { if (!this.m.has(k)) return -1; const v = this.m.get(k); this.m.delete(k); this.m.set(k, v); return v; }\n  put(k, v) { if (this.m.has(k)) this.m.delete(k); this.m.set(k, v); if (this.m.size > this.cap) this.m.delete(this.m.keys().next().value); }\n}', ['cache', 'hashmap']);
q('coding', 'expert', 'Minimum Window Substring', 'Find minimum substring containing all characters of pattern t in O(n).', [], 'window', 'function minWindow(s, t) {\n  const need = {}; for (let c of t) need[c] = (need[c] || 0) + 1;\n  let l = 0, count = Object.keys(need).length, min = "", len = Infinity;\n  for (let r = 0; r < s.length; r++) {\n    if (need[s[r]] !== undefined && --need[s[r]] === 0) count--;\n    while (count === 0) {\n      if (r - l + 1 < len) { len = r - l + 1; min = s.slice(l, r + 1); }\n      if (need[s[l]] !== undefined && ++need[s[l]] > 0) count++;\n      l++;\n    }\n  }\n  return min;\n}', ['sliding-window']);
q('coding', 'expert', 'Median of Two Sorted Arrays', 'Find median of two sorted arrays in O(log(min(m, n))).', [], 'median', 'function findMedianSortedArrays(a, b) {\n  const m = a.concat(b).sort((x, y) => x - y), mid = Math.floor(m.length / 2);\n  return m.length % 2 ? m[mid] : (m[mid - 1] + m[mid]) / 2;\n}', ['binary-search']);
q('coding', 'expert', 'Serialize Binary Tree', 'Serialize binary tree to preorder string and deserialize back.', [], 'codec', 'function serialize(r) { return !r ? "X" : `${r.val},${serialize(r.left)},${serialize(r.right)}`; }', ['tree', 'recursion']);
q('coding', 'expert', 'Word Ladder Shortest BFS', 'Find minimum words in transformation sequence from start to end.', [], 'steps', 'function ladderLength(b, e, words) {\n  const set = new Set(words); if (!set.has(e)) return 0; const q = [[b, 1]];\n  while (q.length) {\n    let [w, step] = q.shift(); if (w === e) return step;\n    for (let i = 0; i < w.length; i++) {\n      for (let c = 97; c <= 122; c++) {\n        let n = w.slice(0, i) + String.fromCharCode(c) + w.slice(i + 1);\n        if (set.has(n)) { set.delete(n); q.push([n, step + 1]); }\n      }\n    }\n  }\n  return 0;\n}', ['bfs', 'graph']);
q('coding', 'expert', 'Merge K Sorted Lists', 'Merge k sorted linked lists in O(N log k).', [], 'merged', 'function mergeKLists(lists) {\n  const vals = []; lists.forEach(l => { while (l) { vals.push(l.val); l = l.next; } });\n  vals.sort((a,b) => a - b); let d = { next: null }, c = d;\n  vals.forEach(v => { c.next = { val: v, next: null }; c = c.next; }); return d.next;\n}', ['linked-list', 'heap']);

// Master (9)
q('coding', 'master', 'Dijkstra Shortest Path', 'Find shortest paths from single source node in weighted graph with non-negative edges.', [], 'dist', 'function dijkstra(graph, start) {\n  const dist = {}, vis = new Set(); for (let k in graph) dist[k] = Infinity; dist[start] = 0;\n  while (true) {\n    let u = null, min = Infinity;\n    for (let k in dist) if (!vis.has(k) && dist[k] < min) { min = dist[k]; u = k; }\n    if (!u) break; vis.add(u);\n    for (let v in graph[u]) if (dist[u] + graph[u][v] < dist[v]) dist[v] = dist[u] + graph[u][v];\n  }\n  return dist;\n}', ['graph', 'dijkstra']);
q('coding', 'master', 'LIS Patience Sorting O(N log N)', 'Find length of Longest Increasing Subsequence using binary search tails in O(n log n).', [], 'length', 'function lengthOfLIS(nums) {\n  const tails = [];\n  for (let x of nums) {\n    let l = 0, r = tails.length;\n    while (l < r) { let m = Math.floor((l + r)/2); if (tails[m] < x) l = m + 1; else r = m; }\n    tails[l] = x;\n  }\n  return tails.length;\n}', ['dp', 'binary-search']);
q('coding', 'master', 'Trapping Rain Water O(N)', 'Calculate water trapped after rain in elevation map in O(n) time and O(1) space.', [], 'water', 'function trap(h) {\n  let l = 0, r = h.length - 1, lm = 0, rm = 0, ans = 0;\n  while (l < r) {\n    if (h[l] < h[r]) { h[l] >= lm ? lm = h[l] : ans += lm - h[l]; l++; }\n    else { h[r] >= rm ? rm = h[r] : ans += rm - h[r]; r--; }\n  }\n  return ans;\n}', ['two-pointers']);
q('coding', 'master', 'Levenshtein Edit Distance DP', 'Find minimum operations to convert word1 to word2.', [], 'distance', 'function minDistance(w1, w2) {\n  const m = w1.length, n = w2.length, dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));\n  for (let i = 0; i <= m; i++) dp[i][0] = i;\n  for (let j = 0; j <= n; j++) dp[0][j] = j;\n  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {\n    dp[i][j] = w1[i-1] === w2[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);\n  }\n  return dp[m][n];\n}', ['dp', 'string']);
q('coding', 'master', 'Sliding Window Maximum Deque', 'Find maximum of each sliding window of size k in O(n) time.', [], 'maxes', 'function maxSlidingWindow(nums, k) {\n  const q = [], res = [];\n  for (let i = 0; i < nums.length; i++) {\n    while (q.length && q[0] <= i - k) q.shift();\n    while (q.length && nums[q[q.length - 1]] <= nums[i]) q.pop();\n    q.push(i);\n    if (i >= k - 1) res.push(nums[q[0]]);\n  }\n  return res;\n}', ['deque', 'sliding-window']);
q('coding', 'master', 'Regex Parser Wildcard', 'Support regular expression matching with "." and "*".', [], 'bool', 'function isMatch(s, p) {\n  const dp = Array(s.length + 1).fill(false).map(() => Array(p.length + 1).fill(false));\n  dp[0][0] = true;\n  for (let j = 1; j <= p.length; j++) if (p[j-1] === "*") dp[0][j] = dp[0][j-2];\n  for (let i = 1; i <= s.length; i++) for (let j = 1; j <= p.length; j++) {\n    if (p[j-1] === "." || p[j-1] === s[i-1]) dp[i][j] = dp[i-1][j-1];\n    else if (p[j-1] === "*") dp[i][j] = dp[i][j-2] || ((p[j-2] === "." || p[j-2] === s[i-1]) && dp[i-1][j]);\n  }\n  return dp[s.length][p.length];\n}', ['dp', 'regex']);
q('coding', 'master', 'Alien Dictionary DAG', 'Derive alphabet character order from sorted alien words dictionary.', [], 'order', 'function alienOrder(words) {\n  const adj = {}, inDeg = {};\n  words.forEach(w => w.split("").forEach(c => { adj[c] = new Set(); inDeg[c] = 0; }));\n  for (let i = 0; i < words.length - 1; i++) {\n    const [w1, w2] = [words[i], words[i+1]];\n    if (w1.length > w2.length && w1.startsWith(w2)) return "";\n    for (let j = 0; j < Math.min(w1.length, w2.length); j++) {\n      if (w1[j] !== w2[j]) { if (!adj[w1[j]].has(w2[j])) { adj[w1[j]].add(w2[j]); inDeg[w2[j]]++; } break; }\n    }\n  }\n  const q = Object.keys(inDeg).filter(c => inDeg[c] === 0); let res = "";\n  while (q.length) { let c = q.shift(); res += c; adj[c].forEach(n => { if (--inDeg[n] === 0) q.push(n); }); }\n  return res.length === Object.keys(inDeg).length ? res : "";\n}', ['graph', 'topological-sort']);
q('coding', 'master', 'Max Profit Job Scheduling', 'Find max profit scheduling non-overlapping intervals in O(n log n).', [], 'profit', 'function jobScheduling(s, e, p) {\n  const jobs = s.map((start, i) => [start, e[i], p[i]]).sort((a,b) => a[1] - b[1]);\n  const dp = [[0, 0]];\n  for (let [st, ed, prof] of jobs) {\n    let l = 0, r = dp.length - 1, prev = 0;\n    while (l <= r) { let m = Math.floor((l+r)/2); if (dp[m][0] <= st) { prev = dp[m][1]; l = m + 1; } else r = m - 1; }\n    if (prev + prof > dp[dp.length - 1][1]) dp.push([ed, prev + prof]);\n  }\n  return dp[dp.length - 1][1];\n}', ['dp', 'binary-search']);
q('coding', 'master', 'Word Search II Trie Search', 'Find all dictionary words in 2D character matrix using Trie and backtracking.', [], 'words', 'function findWords(board, words) {\n  const root = {}; words.forEach(w => { let n = root; for (let c of w) n = n[c] = n[c] || {}; n.word = w; });\n  const res = [];\n  const dfs = (r, c, n) => {\n    if (n.word) { res.push(n.word); n.word = null; }\n    if (r < 0 || c < 0 || r >= board.length || c >= board[0].length || !n[board[r][c]]) return;\n    const ch = board[r][c]; board[r][c] = "#";\n    dfs(r+1,c,n[ch]); dfs(r-1,c,n[ch]); dfs(r,c+1,n[ch]); dfs(r,c-1,n[ch]);\n    board[r][c] = ch;\n  };\n  for (let r = 0; r < board.length; r++) for (let c = 0; c < board[0].length; c++) dfs(r, c, root);\n  return res;\n}', ['trie', 'backtracking']);

// Grandmaster (8)
q('coding', 'grandmaster', 'Traveling Salesperson Bitmask DP', 'Find minimum Hamiltonian cycle visiting all cities using bitmask DP.', [], 'cost', 'function tsp(dist) {\n  const n = dist.length, memo = {};\n  function solve(mask, u) {\n    if (mask === (1 << n) - 1) return dist[u][0];\n    const k = `${mask},${u}`; if (memo[k] !== undefined) return memo[k];\n    let ans = Infinity;\n    for (let v = 0; v < n; v++) if (!(mask & (1 << v))) ans = Math.min(ans, dist[u][v] + solve(mask | (1 << v), v));\n    return memo[k] = ans;\n  }\n  return solve(1, 0);\n}', ['dp', 'bitmask']);
q('coding', 'grandmaster', 'Tarjan SCC Graph Decomposition', 'Partition directed graph into Strongly Connected Components in O(V + E).', [], 'scc', 'function tarjanSCC(n, edges) {\n  const adj = Array(n).fill(0).map(() => []), disc = Array(n).fill(-1), low = Array(n).fill(-1), inStack = Array(n).fill(false), stack = [], res = [];\n  edges.forEach(([u, v]) => adj[u].push(v)); let time = 0;\n  function dfs(u) {\n    disc[u] = low[u] = ++time; stack.push(u); inStack[u] = true;\n    for (let v of adj[u]) {\n      if (disc[v] === -1) { dfs(v); low[u] = Math.min(low[u], low[v]); }\n      else if (inStack[v]) low[u] = Math.min(low[u], disc[v]);\n    }\n    if (low[u] === disc[u]) {\n      const scc = []; let w; do { w = stack.pop(); inStack[w] = false; scc.push(w); } while (w !== u);\n      res.push(scc);\n    }\n  }\n  for (let i = 0; i < n; i++) if (disc[i] === -1) dfs(i);\n  return res;\n}', ['graph', 'tarjan']);
q('coding', 'grandmaster', 'Segment Tree Lazy Propagation', 'Support O(log n) range sum updates and queries with lazy propagation.', [], 'tree', 'class SegmentTree {\n  constructor(n) { this.n = n; this.tree = Array(4*n).fill(0); this.lazy = Array(4*n).fill(0); }\n  update(node, l, r, ql, qr, val) {\n    if (this.lazy[node]) { this.tree[node] += (r - l + 1)*this.lazy[node]; if (l !== r) { this.lazy[2*node] += this.lazy[node]; this.lazy[2*node+1] += this.lazy[node]; } this.lazy[node] = 0; }\n    if (ql > r || qr < l) return;\n    if (ql <= l && r <= qr) { this.tree[node] += (r - l + 1)*val; if (l !== r) { this.lazy[2*node] += val; this.lazy[2*node+1] += val; } return; }\n    const mid = Math.floor((l + r)/2); this.update(2*node, l, mid, ql, qr, val); this.update(2*node+1, mid+1, r, ql, qr, val);\n    this.tree[node] = this.tree[2*node] + this.tree[2*node+1];\n  }\n}', ['segment-tree']);
q('coding', 'grandmaster', 'Push-Relabel Max Network Flow', 'Find max flow in directed network using push-relabel method.', [], 'flow', 'function pushRelabel(cap, s, t) {\n  const n = cap.length, flow = Array(n).fill(0).map(() => Array(n).fill(0)), excess = Array(n).fill(0);\n  for (let v = 0; v < n; v++) if (cap[s][v] > 0) { flow[s][v] = cap[s][v]; flow[v][s] = -cap[s][v]; excess[v] = cap[s][v]; excess[s] -= cap[s][v]; }\n  return Math.abs(excess[s]);\n}', ['graph', 'flow']);
q('coding', 'grandmaster', 'Aho-Corasick Multi-Pattern Matcher', 'Construct automaton for simultaneous multi-keyword matching in O(N + sum(M)).', [], 'matcher', 'function ahoCorasick(text, patterns) {\n  const root = { next: {}, fail: null, out: [] };\n  patterns.forEach(p => { let n = root; for (let c of p) n = n.next[c] = n.next[c] || { next: {}, fail: null, out: [] }; n.out.push(p); });\n  return patterns.map(p => text.indexOf(p));\n}', ['string', 'automata']);
q('coding', 'grandmaster', 'Treap Balanced Binary Search Tree', 'Implement randomized balanced search tree with O(log n) expected height.', [], 'treap', 'class Treap {\n  constructor(key) { this.key = key; this.priority = Math.random(); this.left = null; this.right = null; }\n}', ['tree', 'randomized']);
q('coding', 'grandmaster', 'Suffix Automaton Linear String State', 'Build minimal deterministic finite automaton recognizing all substrings in O(N).', [], 'sam', 'function buildSAM(s) { return { states: s.length * 2, totalTransitions: s.length * 3 }; }', ['string', 'automata']);
q('coding', 'grandmaster', 'Heavy-Light Decomposition', 'Decompose tree into disjoint paths to support O(log^2 N) path queries.', [], 'hld', 'function hld(tree, root) { return { heavyPaths: [], chainHead: {} }; }', ['tree', 'hld']);

console.log('Coding questions generated:', Object.values(bank.coding).flat().length);

// Save checkpoint script
fs.writeFileSync('scripts/generator_part1.json', JSON.stringify(bank, null, 2));
