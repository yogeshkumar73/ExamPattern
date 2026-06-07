import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ArenaQuestion from '@/models/ArenaQuestion';

// Massive question bank for all 6 modes × 6 difficulties
const QUESTION_BANK = {
  coding: {
    beginner: [
      { title: "Hello World Function", description: "Write a function that returns the string 'Hello, World!'", boilerplate: "function helloWorld() {\n  // your code here\n}", correctAnswer: "Hello, World!", options: [], tags: ["string", "basics"] },
      { title: "Sum Two Numbers", description: "Write a function that takes two numbers and returns their sum.", boilerplate: "function sum(a, b) {\n  // your code here\n}", correctAnswer: "sum", options: [], tags: ["math", "basics"] },
      { title: "Check Even or Odd", description: "Return 'even' if number is even, 'odd' otherwise.", boilerplate: "function evenOrOdd(n) {\n  // your code here\n}", correctAnswer: "even/odd", options: [], tags: ["conditionals"] },
      { title: "Reverse a String", description: "Write a function that reverses a given string.", boilerplate: "function reverseString(s) {\n  // your code here\n}", correctAnswer: "reversed", options: [], tags: ["string"] },
      { title: "Find Max in Array", description: "Return the maximum value in an array of numbers.", boilerplate: "function findMax(arr) {\n  // your code here\n}", correctAnswer: "max value", options: [], tags: ["array"] },
    ],
    intermediate: [
      { title: "Two Sum", description: "Given an array and target, return indices of two numbers that add to target.", boilerplate: "function twoSum(nums, target) {\n  // your code here\n}", correctAnswer: "indices", options: [], tags: ["array", "hashmap"] },
      { title: "Palindrome Check", description: "Return true if a string reads the same forwards and backwards.", boilerplate: "function isPalindrome(s) {\n  // your code here\n}", correctAnswer: "boolean", options: [], tags: ["string"] },
      { title: "Fibonacci Sequence", description: "Return the nth Fibonacci number using dynamic programming.", boilerplate: "function fibonacci(n) {\n  // your code here\n}", correctAnswer: "fib number", options: [], tags: ["dp", "recursion"] },
      { title: "Count Vowels", description: "Count the number of vowels in a given string.", boilerplate: "function countVowels(s) {\n  // your code here\n}", correctAnswer: "count", options: [], tags: ["string"] },
      { title: "Remove Duplicates", description: "Remove all duplicate values from an array.", boilerplate: "function removeDuplicates(arr) {\n  // your code here\n}", correctAnswer: "unique array", options: [], tags: ["array", "set"] },
    ],
    advanced: [
      { title: "Max Subarray (Kadane's)", description: "Find the contiguous subarray with the largest sum.", boilerplate: "function maxSubArray(nums) {\n  // Kadane's algorithm\n}", correctAnswer: "max sum", options: [], tags: ["dp", "greedy"] },
      { title: "Binary Search", description: "Implement binary search on a sorted array.", boilerplate: "function binarySearch(arr, target) {\n  // your code here\n}", correctAnswer: "index", options: [], tags: ["search", "algorithms"] },
      { title: "Valid Parentheses", description: "Check if a string of brackets is valid.", boilerplate: "function isValid(s) {\n  // use a stack\n}", correctAnswer: "boolean", options: [], tags: ["stack", "string"] },
      { title: "Merge Two Sorted Arrays", description: "Merge two sorted arrays into one sorted array.", boilerplate: "function mergeSorted(a, b) {\n  // your code here\n}", correctAnswer: "merged array", options: [], tags: ["array", "sorting"] },
      { title: "Anagram Check", description: "Determine if two strings are anagrams of each other.", boilerplate: "function isAnagram(s, t) {\n  // your code here\n}", correctAnswer: "boolean", options: [], tags: ["string", "hashmap"] },
    ],
    expert: [
      { title: "Longest Common Subsequence", description: "Find the length of the longest common subsequence of two strings.", boilerplate: "function lcs(s1, s2) {\n  // DP approach\n}", correctAnswer: "length", options: [], tags: ["dp", "string"] },
      { title: "Graph BFS", description: "Implement BFS traversal on an adjacency list graph.", boilerplate: "function bfs(graph, start) {\n  // BFS with queue\n}", correctAnswer: "visited order", options: [], tags: ["graph", "bfs"] },
    ],
    master: [
      { title: "Word Ladder", description: "Find shortest transformation from beginWord to endWord changing one letter at a time.", boilerplate: "function ladderLength(begin, end, wordList) {\n  // BFS approach\n}", correctAnswer: "steps", options: [], tags: ["bfs", "graph", "string"] },
    ],
    grandmaster: [
      { title: "Minimum Edit Distance", description: "Find the minimum operations to convert one string to another (Levenshtein distance).", boilerplate: "function minDistance(word1, word2) {\n  // DP table\n}", correctAnswer: "distance", options: [], tags: ["dp", "string"] },
    ],
  },

  math: {
    beginner: [
      { title: "Sum of Digits", description: "What is the sum of digits of 356?", options: ["12", "14", "15", "11"], correctAnswer: "14", boilerplate: "", tags: ["arithmetic"] },
      { title: "Simple Multiplication", description: "What is 17 × 8?", options: ["126", "136", "146", "116"], correctAnswer: "136", boilerplate: "", tags: ["arithmetic"] },
      { title: "Percentage", description: "What is 25% of 200?", options: ["40", "50", "60", "45"], correctAnswer: "50", boilerplate: "", tags: ["percentage"] },
      { title: "Square Root", description: "What is √144?", options: ["11", "12", "13", "14"], correctAnswer: "12", boilerplate: "", tags: ["algebra"] },
      { title: "Prime Number", description: "Which of these is a prime number?", options: ["9", "15", "17", "21"], correctAnswer: "17", boilerplate: "", tags: ["primes"] },
    ],
    intermediate: [
      { title: "Quadratic Formula", description: "Solve x² - 5x + 6 = 0. What is the larger root?", options: ["2", "3", "4", "1"], correctAnswer: "3", boilerplate: "", tags: ["algebra"] },
      { title: "Probability", description: "A bag has 3 red and 7 blue balls. Probability of drawing red?", options: ["0.3", "0.7", "0.5", "0.2"], correctAnswer: "0.3", boilerplate: "", tags: ["probability"] },
      { title: "Area of Triangle", description: "Find the area of a triangle with base 8 and height 6.", options: ["24", "48", "18", "36"], correctAnswer: "24", boilerplate: "", tags: ["geometry"] },
      { title: "Arithmetic Sequence", description: "Find the 10th term of sequence: 3, 7, 11, 15...", options: ["39", "43", "35", "41"], correctAnswer: "39", boilerplate: "", tags: ["sequences"] },
      { title: "LCM", description: "Find LCM of 12 and 18.", options: ["36", "72", "24", "108"], correctAnswer: "36", boilerplate: "", tags: ["number theory"] },
    ],
    advanced: [
      { title: "Permutations", description: "How many ways can 5 books be arranged on a shelf?", options: ["24", "60", "120", "720"], correctAnswer: "120", boilerplate: "", tags: ["combinatorics"] },
      { title: "Trigonometry", description: "What is sin(30°) + cos(60°)?", options: ["0", "0.5", "1", "1.5"], correctAnswer: "1", boilerplate: "", tags: ["trigonometry"] },
      { title: "Binomial Theorem", description: "What is the coefficient of x² in expansion of (1+x)⁵?", options: ["5", "10", "15", "20"], correctAnswer: "10", boilerplate: "", tags: ["algebra"] },
      { title: "Matrix Determinant", description: "Find det([[2,3],[1,4]])", options: ["5", "8", "11", "14"], correctAnswer: "5", boilerplate: "", tags: ["linear algebra"] },
      { title: "Geometric Series", description: "Sum of infinite geometric series: 1 + 1/2 + 1/4 + ...", options: ["1", "1.5", "2", "∞"], correctAnswer: "2", boilerplate: "", tags: ["series"] },
    ],
    expert: [
      { title: "Derivative", description: "Find the derivative of f(x) = 3x³ - 2x² + x - 5.", options: ["9x²-4x+1", "6x²-4x+1", "9x²-2x+1", "3x²-4x+1"], correctAnswer: "9x²-4x+1", boilerplate: "", tags: ["calculus"] },
      { title: "Integration", description: "∫(2x+3)dx from 0 to 2 equals:", options: ["10", "14", "8", "12"], correctAnswer: "10", boilerplate: "", tags: ["calculus"] },
    ],
    master: [
      { title: "Eigenvalue", description: "Find eigenvalue of matrix [[3,1],[0,2]].", options: ["1 and 2", "2 and 3", "3 and 2", "1 and 3"], correctAnswer: "3 and 2", boilerplate: "", tags: ["linear algebra"] },
    ],
    grandmaster: [
      { title: "Fourier Transform", description: "The Fourier transform of δ(t) (Dirac delta) is:", options: ["0", "1", "∞", "t"], correctAnswer: "1", boilerplate: "", tags: ["signal processing"] },
    ],
  },

  gk: {
    beginner: [
      { title: "Programming Language", description: "Which language is known as the 'mother of all languages'?", options: ["C", "Java", "Python", "Assembly"], correctAnswer: "C", boilerplate: "", tags: ["programming"] },
      { title: "Internet Protocol", description: "What does HTTP stand for?", options: ["HyperText Transfer Protocol", "High Text Transfer Protocol", "Hyper Transfer Text Protocol", "None"], correctAnswer: "HyperText Transfer Protocol", boilerplate: "", tags: ["networking"] },
      { title: "Operating System", description: "Which OS was created by Linus Torvalds?", options: ["Windows", "macOS", "Linux", "UNIX"], correctAnswer: "Linux", boilerplate: "", tags: ["os"] },
      { title: "World Capital", description: "What is the capital of Japan?", options: ["Beijing", "Seoul", "Tokyo", "Bangkok"], correctAnswer: "Tokyo", boilerplate: "", tags: ["geography"] },
      { title: "Science", description: "What is the chemical formula for water?", options: ["H2O2", "HO2", "H2O", "HO"], correctAnswer: "H2O", boilerplate: "", tags: ["science"] },
    ],
    intermediate: [
      { title: "Data Structure", description: "Which data structure uses LIFO order?", options: ["Queue", "Stack", "Heap", "Tree"], correctAnswer: "Stack", boilerplate: "", tags: ["cs"] },
      { title: "Database", description: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "System Query Language", "Standard Query Language"], correctAnswer: "Structured Query Language", boilerplate: "", tags: ["database"] },
      { title: "History", description: "In which year did the World Wide Web go public?", options: ["1989", "1991", "1994", "1999"], correctAnswer: "1991", boilerplate: "", tags: ["history", "tech"] },
      { title: "Physics", description: "What is the speed of light (approx)?", options: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], correctAnswer: "3×10⁸ m/s", boilerplate: "", tags: ["physics"] },
      { title: "Sports", description: "How many players are in a standard cricket team?", options: ["9", "10", "11", "12"], correctAnswer: "11", boilerplate: "", tags: ["sports"] },
    ],
    advanced: [
      { title: "AI", description: "Which algorithm is used in training neural networks?", options: ["Dijkstra", "Backpropagation", "BFS", "QuickSort"], correctAnswer: "Backpropagation", boilerplate: "", tags: ["ai", "ml"] },
      { title: "Blockchain", description: "What consensus mechanism does Bitcoin use?", options: ["Proof of Stake", "Proof of Work", "Delegated PoS", "PoA"], correctAnswer: "Proof of Work", boilerplate: "", tags: ["blockchain"] },
      { title: "Cybersecurity", description: "What type of attack involves intercepting communication between two parties?", options: ["DDoS", "Man-in-the-Middle", "SQL Injection", "Phishing"], correctAnswer: "Man-in-the-Middle", boilerplate: "", tags: ["security"] },
      { title: "Cloud", description: "What does AWS stand for?", options: ["Azure Web Services", "Amazon Web Services", "Advanced Web Services", "American Web Stack"], correctAnswer: "Amazon Web Services", boilerplate: "", tags: ["cloud"] },
      { title: "Space", description: "Which planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], correctAnswer: "Saturn", boilerplate: "", tags: ["science", "space"] },
    ],
    expert: [
      { title: "Quantum Computing", description: "What is a qubit?", options: ["A quantum bit that can be 0 or 1 simultaneously", "A type of RAM", "A CPU register", "A GPU shader"], correctAnswer: "A quantum bit that can be 0 or 1 simultaneously", boilerplate: "", tags: ["quantum"] },
      { title: "Compiler", description: "Which phase of a compiler converts tokens to a parse tree?", options: ["Lexical Analysis", "Syntax Analysis", "Semantic Analysis", "Code Generation"], correctAnswer: "Syntax Analysis", boilerplate: "", tags: ["compilers"] },
    ],
    master: [
      { title: "Cryptography", description: "RSA encryption is based on the difficulty of:", options: ["Sorting large arrays", "Factoring large numbers", "Hashing strings", "Graph traversal"], correctAnswer: "Factoring large numbers", boilerplate: "", tags: ["cryptography"] },
    ],
    grandmaster: [
      { title: "P vs NP", description: "The P vs NP problem is about:", options: ["Memory vs speed tradeoff", "Whether every problem whose solution can be verified quickly can also be solved quickly", "Parallel vs sequential execution", "Polynomial equations"], correctAnswer: "Whether every problem whose solution can be verified quickly can also be solved quickly", boilerplate: "", tags: ["theory", "computer science"] },
    ],
  },

  puzzle: {
    beginner: [
      { title: "Missing Number", description: "Find the missing number: 2, 4, 6, ?, 10", options: ["7", "8", "9", "11"], correctAnswer: "8", boilerplate: "", tags: ["sequence"] },
      { title: "Odd One Out", description: "Which is different? Apple, Banana, Carrot, Mango", options: ["Apple", "Banana", "Carrot", "Mango"], correctAnswer: "Carrot", boilerplate: "", tags: ["logic"] },
      { title: "Pattern", description: "Complete: A, C, E, G, ?", options: ["H", "I", "J", "K"], correctAnswer: "I", boilerplate: "", tags: ["pattern"] },
      { title: "Number Puzzle", description: "If 3 + 5 = 16 and 5 + 7 = 24, what is 7 + 9 = ?", options: ["32", "34", "36", "30"], correctAnswer: "32", boilerplate: "", tags: ["logic"] },
      { title: "Word Puzzle", description: "I have hands but can't clap. What am I?", options: ["A robot", "A clock", "A glove", "A tree"], correctAnswer: "A clock", boilerplate: "", tags: ["riddle"] },
    ],
    intermediate: [
      { title: "Towers of Hanoi", description: "Minimum moves to transfer 3 disks: source → target (with 1 auxiliary peg)?", options: ["5", "7", "9", "11"], correctAnswer: "7", boilerplate: "", tags: ["recursion", "classic"] },
      { title: "Debug: Off-by-One", description: "for(i=0; i<=arr.length; i++) — what bug is this?", options: ["Syntax error", "Off-by-one error", "Type error", "Null reference"], correctAnswer: "Off-by-one error", boilerplate: "", tags: ["debugging"] },
      { title: "Logic Gates", description: "Output of: A=1, B=0 through AND gate?", options: ["0", "1", "Undefined", "-1"], correctAnswer: "0", boilerplate: "", tags: ["logic gates"] },
      { title: "Algorithm", description: "What is the time complexity of binary search?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], correctAnswer: "O(log n)", boilerplate: "", tags: ["complexity"] },
      { title: "Bitwise", description: "What is 5 & 3 in binary?", options: ["7", "1", "6", "0"], correctAnswer: "1", boilerplate: "", tags: ["bitwise"] },
    ],
    advanced: [
      { title: "Dynamic Programming", description: "What is the overlapping subproblems + optimal substructure problem-solving paradigm?", options: ["Greedy", "Divide & Conquer", "Dynamic Programming", "Backtracking"], correctAnswer: "Dynamic Programming", boilerplate: "", tags: ["algorithms"] },
      { title: "Memory Leak", description: "Which C++ construct is most likely to cause a memory leak?", options: ["unique_ptr", "shared_ptr", "raw new without delete", "stack allocation"], correctAnswer: "raw new without delete", boilerplate: "", tags: ["c++", "memory"] },
      { title: "Big-O", description: "Quicksort worst-case time complexity:", options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], correctAnswer: "O(n²)", boilerplate: "", tags: ["sorting", "complexity"] },
      { title: "Database Design", description: "Which normal form eliminates transitive dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], correctAnswer: "3NF", boilerplate: "", tags: ["database"] },
      { title: "Race Condition", description: "A race condition occurs when:", options: ["CPU is overloaded", "Two threads access shared data without sync", "Memory is full", "Disk I/O is slow"], correctAnswer: "Two threads access shared data without sync", boilerplate: "", tags: ["concurrency"] },
    ],
    expert: [
      { title: "NP-Hard Problem", description: "Which of these is classified as NP-Hard?", options: ["Binary Search", "BFS", "Travelling Salesman Problem", "Merge Sort"], correctAnswer: "Travelling Salesman Problem", boilerplate: "", tags: ["complexity theory"] },
      { title: "Deadlock", description: "Which condition is NOT required for a deadlock?", options: ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"], correctAnswer: "Preemption", boilerplate: "", tags: ["os"] },
    ],
    master: [
      { title: "Cache Miss", description: "Which cache replacement policy replaces the least recently used item?", options: ["FIFO", "LRU", "MRU", "Random"], correctAnswer: "LRU", boilerplate: "", tags: ["systems"] },
    ],
    grandmaster: [
      { title: "Byzantine Fault", description: "Byzantine fault tolerance allows a system to continue if:", options: ["All nodes agree", "Up to f nodes out of 3f+1 are faulty", "CPU has no errors", "Network has 100% uptime"], correctAnswer: "Up to f nodes out of 3f+1 are faulty", boilerplate: "", tags: ["distributed systems"] },
    ],
  },

  prediction: {
    beginner: [
      { title: "Next Number", description: "Predict the next number: 1, 3, 5, 7, ?", options: ["8", "9", "10", "11"], correctAnswer: "9", boilerplate: "", tags: ["sequence"] },
      { title: "Pattern Guess", description: "What comes next: 2, 4, 8, 16, ?", options: ["24", "32", "30", "20"], correctAnswer: "32", boilerplate: "", tags: ["geometric"] },
      { title: "Color Prediction", description: "Red, Blue, Red, Blue, Red, ?", options: ["Red", "Blue", "Green", "Yellow"], correctAnswer: "Blue", boilerplate: "", tags: ["pattern"] },
      { title: "Number Guess", description: "I'm thinking of a number between 1-10. It's odd, > 5, < 9. What is it?", options: ["7", "5", "9", "3"], correctAnswer: "7", boilerplate: "", tags: ["deduction"] },
      { title: "Fibonacci Predict", description: "Next in Fibonacci: 1, 1, 2, 3, 5, 8, ?", options: ["11", "12", "13", "15"], correctAnswer: "13", boilerplate: "", tags: ["fibonacci"] },
    ],
    intermediate: [
      { title: "Stock Trend", description: "Prices: 100, 105, 110, 120, 115, 125, ? (trend analysis)", options: ["120", "130", "125", "135"], correctAnswer: "130", boilerplate: "", tags: ["trends"] },
      { title: "Matrix Pattern", description: "In a 3×3 matrix [1,2,3][4,5,6][7,?,9], what is ?", options: ["7", "8", "9", "6"], correctAnswer: "8", boilerplate: "", tags: ["matrix"] },
      { title: "Difference Sequence", description: "Differences are 1,2,3,4... Sequence: 0,1,3,6,10,?", options: ["15", "14", "16", "12"], correctAnswer: "15", boilerplate: "", tags: ["differences"] },
      { title: "Letter Code", description: "A=1, B=2, C=3... What is Z?", options: ["25", "26", "27", "24"], correctAnswer: "26", boilerplate: "", tags: ["encoding"] },
      { title: "Growth Rate", description: "Population doubles every 5 years from 1000. After 15 years:", options: ["4000", "6000", "8000", "10000"], correctAnswer: "8000", boilerplate: "", tags: ["exponential"] },
    ],
    advanced: [
      { title: "Regression", description: "If y = 2x + 3, predict y when x = 7:", options: ["14", "17", "19", "20"], correctAnswer: "17", boilerplate: "", tags: ["statistics"] },
      { title: "Probability Sequence", description: "P(heads) = 0.6. Probability of 3 consecutive heads:", options: ["0.216", "0.512", "0.125", "0.343"], correctAnswer: "0.216", boilerplate: "", tags: ["probability"] },
      { title: "Time Series", description: "Predict Q5 sales: Q1=100, Q2=110, Q3=121, Q4=133.1, Q5=?", options: ["140", "146", "146.4", "150"], correctAnswer: "146.4", boilerplate: "", tags: ["time series"] },
      { title: "Missing Term", description: "Series: 1, 4, 9, 16, 25, 36, ? (perfect squares)", options: ["42", "49", "48", "50"], correctAnswer: "49", boilerplate: "", tags: ["squares"] },
      { title: "Complex Pattern", description: "2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "48"], correctAnswer: "42", boilerplate: "", tags: ["pattern"] },
    ],
    expert: [
      { title: "Fourier Prediction", description: "A signal repeats every 4 units: 0,1,0,-1. What is the value at t=9?", options: ["0", "1", "-1", "0.5"], correctAnswer: "1", boilerplate: "", tags: ["signal"] },
      { title: "Chaos Theory", description: "Logistic map x_{n+1}=rx_n(1-x_n), r=4, x0=0.5. Behavior is:", options: ["Stable", "Periodic", "Chaotic", "Constant"], correctAnswer: "Chaotic", boilerplate: "", tags: ["chaos"] },
    ],
    master: [
      { title: "Markov Chain", description: "Markov chains predict future states based on:", options: ["All past states", "Only the current state", "Future inputs", "Random noise"], correctAnswer: "Only the current state", boilerplate: "", tags: ["statistics"] },
    ],
    grandmaster: [
      { title: "Kolmogorov Complexity", description: "Kolmogorov complexity of a string is the length of:", options: ["The string itself", "The shortest program that produces the string", "Its Huffman encoding", "Its MD5 hash"], correctAnswer: "The shortest program that produces the string", boilerplate: "", tags: ["information theory"] },
    ],
  },

  mixed: {
    beginner: [
      { title: "Mixed: Basics", description: "What is 2² + 3?", options: ["7", "6", "9", "8"], correctAnswer: "7", boilerplate: "", tags: ["mixed"] },
      { title: "Mixed: Pattern", description: "Next: 1, 2, 4, 8, ?", options: ["10", "12", "14", "16"], correctAnswer: "16", boilerplate: "", tags: ["mixed"] },
    ],
    intermediate: [
      { title: "Mixed Challenge", description: "Time complexity of insertion sort best-case?", options: ["O(n²)", "O(n log n)", "O(n)", "O(1)"], correctAnswer: "O(n)", boilerplate: "", tags: ["mixed"] },
      { title: "Mixed: Logic", description: "If all roses are flowers and some flowers are red, can we conclude all roses are red?", options: ["Yes", "No", "Maybe", "Not enough info"], correctAnswer: "No", boilerplate: "", tags: ["logic"] },
    ],
    advanced: [
      { title: "Mixed: Systems", description: "Which sorting algorithm is stable AND O(n log n) worst case?", options: ["Quicksort", "Heapsort", "Merge Sort", "Shell Sort"], correctAnswer: "Merge Sort", boilerplate: "", tags: ["mixed"] },
    ],
    expert: [
      { title: "Mixed Expert", description: "CAP theorem states a distributed system can guarantee at most 2 of 3: Consistency, Availability, and:", options: ["Performance", "Partition tolerance", "Persistence", "Parallelism"], correctAnswer: "Partition tolerance", boilerplate: "", tags: ["distributed"] },
    ],
    master: [
      { title: "Master Mixed", description: "In a skip list, average time for search is:", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correctAnswer: "O(log n)", boilerplate: "", tags: ["data structures"] },
    ],
    grandmaster: [
      { title: "Grandmaster Mixed", description: "Curry-Howard correspondence links:", options: ["Algebra and geometry", "Proofs and programs", "SQL and NoSQL", "AI and ML"], correctAnswer: "Proofs and programs", boilerplate: "", tags: ["type theory"] },
    ],
  },
};

const XP_MAP: Record<string, number> = {
  beginner: 50, intermediate: 100, advanced: 200, expert: 400, master: 700, grandmaster: 1000,
};
const POINTS_MAP: Record<string, number> = {
  beginner: 100, intermediate: 200, advanced: 400, expert: 800, master: 1400, grandmaster: 2000,
};
const TIME_MAP: Record<string, number> = {
  beginner: 90, intermediate: 75, advanced: 60, expert: 45, master: 35, grandmaster: 25,
};

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
  } catch (err) {
    console.error('DB connection failed, using fallback:', err);
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'math';
  const difficulty = searchParams.get('difficulty') || 'beginner';
  const count = parseInt(searchParams.get('count') || '5');

  // Try DB first
  try {
    const questions = await ArenaQuestion.aggregate([
      { $match: { category, difficulty } },
      { $sample: { size: count } },
    ]);
    if (questions.length >= count) {
      return NextResponse.json({ questions, source: 'db' });
    }
  } catch (_) {}

  // Fallback to in-memory bank
  const bank = (QUESTION_BANK as any)[category]?.[difficulty] || [];
  const shuffled = [...bank].sort(() => Math.random() - 0.5).slice(0, count);
  const questions = shuffled.map((q: any, i: number) => ({
    _id: `mock-${category}-${difficulty}-${i}`,
    category,
    difficulty,
    xpReward: XP_MAP[difficulty] || 50,
    pointsReward: POINTS_MAP[difficulty] || 100,
    timeLimit: TIME_MAP[difficulty] || 60,
    ...q,
  }));

  return NextResponse.json({ questions, source: 'memory' });
}

export async function POST(req: NextRequest) {
  // Seed questions into DB
  await dbConnect();
  let seeded = 0;
  for (const [category, diffs] of Object.entries(QUESTION_BANK)) {
    for (const [difficulty, qs] of Object.entries(diffs as any)) {
      for (const q of qs as any[]) {
        try {
          await ArenaQuestion.findOneAndUpdate(
            { title: q.title, category, difficulty },
            {
              ...q, category, difficulty,
              xpReward: XP_MAP[difficulty] || 50,
              pointsReward: POINTS_MAP[difficulty] || 100,
              timeLimit: TIME_MAP[difficulty] || 60,
            },
            { upsert: true }
          );
          seeded++;
        } catch (_) {}
      }
    }
  }
  return NextResponse.json({ success: true, seeded });
}
