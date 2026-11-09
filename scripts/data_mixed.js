// 40 Unique Mixed Mode Questions across 6 Difficulty Levels
module.exports = [
  // Beginner (10)
  {
    difficulty: 'beginner',
    title: 'Algorithm Speed Comparison Search',
    description: 'Which search algorithm is faster on an already sorted 1,000,000-element array?',
    options: ['Binary Search (O(log N))', 'Linear Search (O(N))', 'Random Search', 'Bubble Search'],
    correctAnswer: 'Binary Search (O(log N))',
    tags: ['mixed', 'algorithms', 'cs'],
    hint: 'Binary search takes ~20 comparisons vs up to 1,000,000 for linear search.'
  },
  {
    difficulty: 'beginner',
    title: 'Byte vs Bit Binary Units',
    description: 'How many bits are in 4 bytes of computer memory?',
    options: ['32 bits', '16 bits', '64 bits', '8 bits'],
    correctAnswer: '32 bits',
    tags: ['mixed', 'math', 'cs'],
    hint: '1 byte = 8 bits. 4 × 8 = 32.'
  },
  {
    difficulty: 'beginner',
    title: 'Hexadecimal Equivalent of Decimal 15',
    description: 'What single hexadecimal character represents the decimal integer 15?',
    options: ['F', 'E', 'A', '10'],
    correctAnswer: 'F',
    tags: ['mixed', 'math', 'encoding'],
    hint: '0-9, then A=10, B=11, C=12, D=13, E=14, F=15.'
  },
  {
    difficulty: 'beginner',
    title: 'Modulo Clock Arithmetic 14 Hours',
    description: 'If it is 9:00 AM now on a 12-hour clock, what time will it be in 14 hours?',
    options: ['11:00 PM', '10:00 PM', '11:00 AM', '1:00 AM'],
    correctAnswer: '11:00 PM',
    tags: ['mixed', 'math', 'clock'],
    hint: '(9 + 14) = 23:00 = 11:00 PM.'
  },
  {
    difficulty: 'beginner',
    title: 'Boolean De Morgans Law Negation',
    description: 'According to De Morgan’s Laws, what is !(A && B) logically equivalent to?',
    options: ['!A || !B', '!A && !B', 'A || B', '!A ^ !B'],
    correctAnswer: '!A || !B',
    tags: ['mixed', 'logic', 'boolean'],
    hint: 'Negate each term and flip AND to OR.'
  },
  {
    difficulty: 'beginner',
    title: 'Storage Kilobyte vs Kibibyte IEC',
    description: 'Under IEC standard binary prefixes, how many bytes are in 1 Kibibyte (1 KiB)?',
    options: ['1,024 bytes', '1,000 bytes', '1,048,576 bytes', '512 bytes'],
    correctAnswer: '1,024 bytes',
    tags: ['mixed', 'standards'],
    hint: '2^10 = 1024 bytes.'
  },
  {
    difficulty: 'beginner',
    title: 'RGB Hex Color White',
    description: 'What is hexadecimal color code for pure white in web design?',
    options: ['#FFFFFF', '#000000', '#FF0000', '#AAAAAA'],
    correctAnswer: '#FFFFFF',
    tags: ['mixed', 'web', 'math'],
    hint: 'Maximum values for Red (FF), Green (FF), Blue (FF).'
  },
  {
    difficulty: 'beginner',
    title: 'Array Indexing Zero Base Origin',
    description: 'Why do most modern programming languages (C, Java, Python, JS) use 0-based array indexing?',
    options: [
      'The index represents the memory offset distance from the base array pointer address',
      'Because 0 is the smallest natural number',
      'To save 1 bit of CPU cache',
      'It was a typo in original C compiler'
    ],
    correctAnswer: 'The index represents the memory offset distance from the base array pointer address',
    tags: ['mixed', 'cs', 'history'],
    hint: 'Address = Base + Index × ElementSize; offset for first element is 0.'
  },
  {
    difficulty: 'beginner',
    title: 'Simple Interest Formula Variable',
    description: 'In the simple interest formula I = P × R × T, what does "P" stand for?',
    options: ['Principal (initial capital)', 'Percentage rate', 'Period in years', 'Profit margin'],
    correctAnswer: 'Principal (initial capital)',
    tags: ['mixed', 'math', 'finance'],
    hint: 'Initial sum of money borrowed or invested.'
  },
  {
    difficulty: 'beginner',
    title: 'Bitwise Left Shift Doubling',
    description: 'What is the arithmetic effect of bitwise left shifting an integer by 1 (e.g. x << 1)?',
    options: ['Multiplies by 2', 'Divides by 2', 'Adds 1', 'Squares the number'],
    correctAnswer: 'Multiplies by 2',
    tags: ['mixed', 'bitwise', 'math'],
    hint: 'Each bit shifts to the next power of 2.'
  },

  // Intermediate (10)
  {
    difficulty: 'intermediate',
    title: 'Big-O Growth Hierarchy Ranking',
    description: 'Which ordering correctly sorts time complexities from fastest to slowest as N → ∞?',
    options: [
      'O(1) < O(log N) < O(N) < O(N log N) < O(N²) < O(2^N)',
      'O(1) < O(N) < O(log N) < O(N²) < O(N log N)',
      'O(log N) < O(1) < O(N) < O(2^N)',
      'O(N) < O(N log N) < O(log N) < O(N²)'
    ],
    correctAnswer: 'O(1) < O(log N) < O(N) < O(N log N) < O(N²) < O(2^N)',
    tags: ['mixed', 'complexity'],
    hint: 'Logarithmic is sub-linear; exponential dominates polynomials.'
  },
  {
    difficulty: 'intermediate',
    title: 'Bitwise XOR Swapping Without Temp',
    description: 'If a = 5 and b = 9, what happens after: a = a ^ b; b = a ^ b; a = a ^ b;?',
    options: ['a = 9, b = 5 (values are swapped)', 'a = 0, b = 0', 'a = 5, b = 9 (no change)', 'a = 14, b = 14'],
    correctAnswer: 'a = 9, b = 5 (values are swapped)',
    tags: ['mixed', 'bitwise', 'algorithms'],
    hint: 'Classic in-place XOR swap trick using self-inverse property of XOR.'
  },
  {
    difficulty: 'intermediate',
    title: 'Deadlock Necessary Coffman Conditions',
    description: 'How many conditions (Coffman conditions) must simultaneously hold for a deadlock to occur?',
    options: [
      '4 conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait)',
      '2 conditions',
      '3 conditions',
      '5 conditions'
    ],
    correctAnswer: '4 conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait)',
    tags: ['mixed', 'os', 'concurrency'],
    hint: 'Breaking any one of the four prevents deadlock.'
  },
  {
    difficulty: 'intermediate',
    title: 'Hamming Distance of Two Binary Strings',
    description: 'What is the Hamming distance between 1011101 and 1001001?',
    options: ['2', '1', '3', '0'],
    correctAnswer: '2',
    tags: ['mixed', 'information-theory', 'math'],
    hint: 'Differences at positions 3 and 5 (1 vs 0).'
  },
  {
    difficulty: 'intermediate',
    title: 'TCP Flow Control Sliding Window Role',
    description: 'What is the purpose of the Receive Window (rwnd) field advertised in TCP headers?',
    options: [
      'Flow control: tells sender how many bytes receiver buffer can currently accept without overflowing',
      'Congestion control on internet routers',
      'Encrypts window contents',
      'Calculates round-trip delay'
    ],
    correctAnswer: 'Flow control: tells sender how many bytes receiver buffer can currently accept without overflowing',
    tags: ['mixed', 'networking'],
    hint: 'Prevents sender from overwhelming receiver buffer.'
  },
  {
    difficulty: 'intermediate',
    title: 'Bloom Filter False Negative Guarantee',
    description: 'What theoretical guarantee does a Bloom Filter probabilistic data structure provide?',
    options: [
      'Zero false negatives (if it says an element is absent, it is 100% definitely absent)',
      'Zero false positives',
      'Exact element retrieval',
      'Deletion without rebuild'
    ],
    correctAnswer: 'Zero false negatives (if it says an element is absent, it is 100% definitely absent)',
    tags: ['mixed', 'data-structures'],
    hint: 'May have false positives, but never false negatives.'
  },
  {
    difficulty: 'intermediate',
    title: 'Checksum Two Complement Addition',
    description: 'In internet protocols (IPv4, TCP, UDP), how is header checksum computed?',
    options: [
      '16-bit one’s complement sum of 16-bit words',
      'MD5 hash of payload',
      'Bitwise XOR sum of all bytes',
      'CRC32 polynomial division'
    ],
    correctAnswer: '16-bit one’s complement sum of 16-bit words',
    tags: ['mixed', 'networking', 'math'],
    hint: 'End-around carry addition inverted at completion.'
  },
  {
    difficulty: 'intermediate',
    title: 'Tail Recursion Elimination Mechanism',
    description: 'What allows compilers to optimize tail-recursive functions into iterative while-loops?',
    options: [
      'Because the recursive call is the very last operation, caller stack frame requires no saved return state',
      'Because recursion is limited to 10 iterations',
      'Because CPU has hardware tail recursion registers',
      'Because functions are converted to assembly macros'
    ],
    correctAnswer: 'Because the recursive call is the very last operation, caller stack frame requires no saved return state',
    tags: ['mixed', 'compilers'],
    hint: 'Replaces call instruction with jump instruction.'
  },
  {
    difficulty: 'intermediate',
    title: 'Little Endian vs Big Endian Multi-Byte Storage',
    description: 'On a Little-Endian processor (like x86), in what order are bytes of 32-bit integer 0x12345678 stored in RAM?',
    options: ['0x78, 0x56, 0x34, 0x12', '0x12, 0x34, 0x56, 0x78', '0x56, 0x78, 0x12, 0x34', '0x34, 0x12, 0x78, 0x56'],
    correctAnswer: '0x78, 0x56, 0x34, 0x12',
    tags: ['mixed', 'hardware'],
    hint: 'Least significant byte (LSB 0x78) is stored at lowest memory address.'
  },
  {
    difficulty: 'intermediate',
    title: 'Matrix Coordinate Row Column vs XY Coordinates',
    description: 'In standard 2D arrays/matrices M[i][j], what do i and j represent compared to Cartesian (x, y)?',
    options: ['i is row (y-axis downwards), j is column (x-axis rightwards)', 'i is x, j is y', 'i is diagonal, j is angle', 'They are strictly identical'],
    correctAnswer: 'i is row (y-axis downwards), j is column (x-axis rightwards)',
    tags: ['mixed', 'math', 'programming'],
    hint: 'Row index corresponds to vertical displacement.'
  },

  // Advanced (8)
  {
    difficulty: 'advanced',
    title: 'Master Theorem Divide and Conquer Recurrence',
    description: 'Given recurrence T(n) = 2 T(n/2) + O(n), what is overall time complexity by Master Theorem?',
    options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
    correctAnswer: 'O(n log n)',
    tags: ['mixed', 'algorithms', 'math'],
    hint: 'Case 2 of Master Theorem: log_b(a) = log_2(2) = 1 matches f(n) = n^1.'
  },
  {
    difficulty: 'advanced',
    title: 'Consistent Hashing Ring Redistribution',
    description: 'When adding 1 node to a cluster of N nodes using Consistent Hashing, what fraction of keys need relocation?',
    options: ['O(K / N) on average', '100% of all keys', '50% of keys', 'O(K × N) keys'],
    correctAnswer: 'O(K / N) on average',
    tags: ['mixed', 'distributed-systems'],
    hint: 'Only keys falling in the new node’s partition range are reassigned.'
  },
  {
    difficulty: 'advanced',
    title: 'Two Phase Locking 2PL Concurrency Guarantee',
    description: 'What guarantee does Strict Two-Phase Locking (SS2PL) provide to concurrent database transactions?',
    options: [
      'Guarantees conflict serializability and prevents cascading aborts',
      'Prevents deadlocks entirely',
      'Eliminates lock wait queues',
      'Guarantees linear response time'
    ],
    correctAnswer: 'Guarantees conflict serializability and prevents cascading aborts',
    tags: ['mixed', 'databases'],
    hint: 'Holding exclusive locks until transaction commit/rollback ensures recoverability.'
  },
  {
    difficulty: 'advanced',
    title: 'Huffman Coding Prefix Property',
    description: 'Why do Huffman coding codes require no delimiters between variable-length characters during decoding?',
    options: [
      'No codeword is a prefix of any other codeword (Prefix Code property)',
      'All codewords have equal bit length',
      'Codewords start with 1 and end with 0',
      'Uses parity bits between symbols'
    ],
    correctAnswer: 'No codeword is a prefix of any other codeword (Prefix Code property)',
    tags: ['mixed', 'compression', 'trees'],
    hint: 'Leaves of binary tree guarantee instantaneous unique decodability.'
  },
  {
    difficulty: 'advanced',
    title: 'Page Replacement Optimal Belady Anomaly',
    description: 'What counter-intuitive behavior does Bélády’s Anomaly describe in FIFO page replacement?',
    options: [
      'Allocating MORE physical page frames to a process can INCREASE the number of page faults',
      'Adding RAM makes CPU run hotter',
      'Small page sizes cause instant thrashing',
      'LRU performs worse than Random'
    ],
    correctAnswer: 'Allocating MORE physical page frames to a process can INCREASE the number of page faults',
    tags: ['mixed', 'os', 'algorithms'],
    hint: 'FIFO is not a stack algorithm, allowing anomaly on certain reference strings.'
  },
  {
    difficulty: 'advanced',
    title: 'Elliptic Curve Point Addition Group Law',
    description: 'On an elliptic curve y² = x³ + ax + b over a field, how is the sum of two distinct points P + Q defined geometrically?',
    options: [
      'Draw line through P and Q, find third intersection with curve R, reflect across x-axis to get -R',
      'Add coordinates directly (x_p + x_q, y_p + y_q)',
      'Calculate mid-point of segment PQ',
      'Draw circle passing through P, Q, and origin'
    ],
    correctAnswer: 'Draw line through P and Q, find third intersection with curve R, reflect across x-axis to get -R',
    tags: ['mixed', 'cryptography', 'geometry'],
    hint: 'Chord-and-tangent group law on cubic curves.'
  },
  {
    difficulty: 'advanced',
    title: 'Rabin-Karp Rolling Hash String Search',
    description: 'How does Rabin-Karp achieve O(1) expected time per pattern shift when searching text?',
    options: [
      'Computes rolling polynomial hash in O(1) by subtracting leaving character and adding entering character',
      'Builds a suffix tree in advance',
      'Uses hardware string compare instructions',
      'Sorts characters in window'
    ],
    correctAnswer: 'Computes rolling polynomial hash in O(1) by subtracting leaving character and adding entering character',
    tags: ['mixed', 'algorithms', 'math'],
    hint: 'Hash update H_{i+1} = (H_i - c_out × b^(m-1)) × b + c_in mod M.'
  },
  {
    difficulty: 'advanced',
    title: 'Deadlock Detection Wait-For Graph Cycle',
    description: 'In an operating system or database transaction manager, how is deadlock detected?',
    options: [
      'Finding directed cycles in the Wait-For Graph (WFG) of transactions waiting for resources',
      'Monitoring CPU temperature threshold',
      'Counting transaction timeouts',
      'Measuring network latency'
    ],
    correctAnswer: 'Finding directed cycles in the Wait-For Graph (WFG) of transactions waiting for resources',
    tags: ['mixed', 'os', 'graph-theory'],
    hint: 'Tarjan’s or DFS cycle detection algorithm on resource dependency graph.'
  },

  // Expert (6)
  {
    difficulty: 'expert',
    title: 'Amortized Analysis Potential Function Method',
    description: 'In amortized analysis of dynamic arrays doubling size, what is the amortized cost per append operation?',
    options: ['O(1) amortized time', 'O(N) amortized time', 'O(log N) amortized time', 'O(N²) amortized time'],
    correctAnswer: 'O(1) amortized time',
    tags: ['mixed', 'amortized-analysis'],
    hint: 'Total copying cost for N elements is 1 + 2 + 4 + ... + N ≤ 2N; 2N / N = O(1).'
  },
  {
    difficulty: 'expert',
    title: 'Zero Knowledge Schnorr Identification Protocol',
    description: 'In the Schnorr identification protocol, what interactive 3-step exchange occurs between prover and verifier?',
    options: [
      'Commitment (prover) → Challenge (verifier) → Response (prover)',
      'Encryption → Decryption → Attestation',
      'Public Key → Secret Key → Signature',
      'Handshake → Ciphertext → Hash'
    ],
    correctAnswer: 'Commitment (prover) → Challenge (verifier) → Response (prover)',
    tags: ['mixed', 'cryptography', 'protocols'],
    hint: 'Sigma protocol: Prover sends r = g^k, Verifier sends e, Prover responds s = k + e·x.'
  },
  {
    difficulty: 'expert',
    title: 'Cuckoo Hashing Worst Case Lookup Guarantee',
    description: 'What worst-case lookup time does Cuckoo Hashing guarantee in a hash table?',
    options: [
      'O(1) worst-case lookup time by probing at most 2 table locations',
      'O(log N) worst-case lookup',
      'O(N) worst-case lookup',
      'O(1) insertion time guaranteed'
    ],
    correctAnswer: 'O(1) worst-case lookup time by probing at most 2 table locations',
    tags: ['mixed', 'data-structures'],
    hint: 'Key is guaranteed to reside in h₁(k) or h₂(k).'
  },
  {
    difficulty: 'expert',
    title: 'Simulated Annealing Metropolis Acceptance Criterion',
    description: 'In Simulated Annealing optimization, what is the probability of accepting a worse neighbor solution with ΔE > 0 at temperature T?',
    options: ['e^(-ΔE / (k_B · T))', '1 - ΔE / T', '0% (never accept worse moves)', '50% fixed'],
    correctAnswer: 'e^(-ΔE / (k_B · T))',
    tags: ['mixed', 'heuristics', 'physics'],
    hint: 'Allows escaping local minima; probability decreases as system cools (T → 0).'
  },
  {
    difficulty: 'expert',
    title: 'Fast Fourier Transform Cooley-Tukey Radix 2',
    description: 'How does Cooley-Tukey FFT reduce polynomial multiplication time from O(N²) to O(N log N)?',
    options: [
      'Decomposes DFT of size N into two interleaved DFTs of size N/2 for even and odd indexed coefficients using twiddle factors',
      'Converts polynomials into binary numbers',
      'Replaces multiplication with table lookups',
      'Approximates frequencies with wavelets'
    ],
    correctAnswer: 'Decomposes DFT of size N into two interleaved DFTs of size N/2 for even and odd indexed coefficients using twiddle factors',
    tags: ['mixed', 'algorithms', 'signal-processing'],
    hint: 'Divide and conquer on roots of unity.'
  },
  {
    difficulty: 'expert',
    title: 'Byzantine Paxos vs Classic Paxos Quorum',
    description: 'Why does Byzantine Paxos require a quorum of 2f + 1 out of 3f + 1 nodes instead of a simple majority f + 1 out of 2f + 1?',
    options: [
      'To ensure that any two quorums overlap by at least f + 1 nodes, guaranteeing at least one honest node in the intersection',
      'To double encryption key length',
      'Because nodes communicate in pairs',
      'To prevent network timeout errors'
    ],
    correctAnswer: 'To ensure that any two quorums overlap by at least f + 1 nodes, guaranteeing at least one honest node in the intersection',
    tags: ['mixed', 'distributed-systems'],
    hint: 'Quorum intersection must survive malicious nodes lying about history.'
  },

  // Master (3)
  {
    difficulty: 'master',
    title: 'Quantum Grover Search Lower Bound',
    description: 'Bennett, Bernstein, Brassard, and Vazirani (BBBV) proved that searching an unstructured database of N items with quantum query requires at least:',
    options: [
      'Ω(√N) quantum queries (Grover’s algorithm is asymptotically optimal)',
      'O(log N) quantum queries',
      'O(1) quantum queries',
      'Ω(N) quantum queries'
    ],
    correctAnswer: 'Ω(√N) quantum queries (Grover’s algorithm is asymptotically optimal)',
    tags: ['mixed', 'quantum-algorithms'],
    hint: 'Polynomial method proves square root speedup cannot be beaten.'
  },
  {
    difficulty: 'master',
    title: 'Johnson-Lindenstrauss Dimensionality Reduction Lemma',
    description: 'The Johnson-Lindenstrauss lemma states that any N points in high-dimensional Euclidean space can be projected into dimension k = O(ε^(-2) log N) such that:',
    options: [
      'All pairwise Euclidean distances are preserved within factor (1 ± ε)',
      'Angles are preserved exactly to 0 degrees',
      'All dimensions become integers',
      'Information entropy drops to zero'
    ],
    correctAnswer: 'All pairwise Euclidean distances are preserved within factor (1 ± ε)',
    tags: ['mixed', 'randomized-algorithms', 'math'],
    hint: 'Random Gaussian orthogonal projections preserve metric distances.'
  },
  {
    difficulty: 'master',
    title: 'Spectral Graph Theory Cheeger Inequality',
    description: 'Cheeger’s inequality establishes a fundamental geometric bound connecting the conductance (bottleneck ratio) h(G) of a graph to:',
    options: [
      'The second smallest eigenvalue λ₂ of the normalized graph Laplacian matrix',
      'The chromatic number of the graph',
      'The diameter of the graph',
      'The determinant of the adjacency matrix'
    ],
    correctAnswer: 'The second smallest eigenvalue λ₂ of the normalized graph Laplacian matrix',
    tags: ['mixed', 'spectral-graph-theory'],
    hint: '2h(G) ≥ λ₂ ≥ h(G)² / 2; spectral gap controls graph expansion.'
  },

  // Grandmaster (3)
  {
    difficulty: 'grandmaster',
    title: 'Unique Games Conjecture Hardness of Approximation',
    description: 'Subhash Khot’s Unique Games Conjecture (UGC) implies optimal hardness of approximation for which major problem?',
    options: [
      'MAX-CUT cannot be approximated better than Goemans-Williamson 0.878 ratio unless P = NP',
      'Traveling Salesperson Problem in Euclidean space',
      'Integer factoring in polynomial time',
      'Planar graph coloring with 3 colors'
    ],
    correctAnswer: 'MAX-CUT cannot be approximated better than Goemans-Williamson 0.878 ratio unless P = NP',
    tags: ['mixed', 'computational-complexity'],
    hint: 'Connects semidefinite programming approximations with optimal hardness thresholds.'
  },
  {
    difficulty: 'grandmaster',
    title: 'Bekenstein Bound Information Density Limit',
    description: 'The Bekenstein bound defines the maximum informational entropy I that can be contained in a physical region of radius R and energy E as:',
    options: [
      'I ≤ (2π R E) / (ħ c ln 2)',
      'I ≤ c² / (G R)',
      'I ≤ 4π R²',
      'I ≤ E / (k_B T)'
    ],
    correctAnswer: 'I ≤ (2π R E) / (ħ c ln 2)',
    tags: ['mixed', 'physics-of-computation'],
    hint: 'Information content is bounded by surface horizon area and energy.'
  },
  {
    difficulty: 'grandmaster',
    title: 'Interactive Proof IP Equals PSPACE Proof',
    description: 'Adi Shamir (1990) proved that the class IP of languages decidable by polynomial-time Interactive Proof Systems is equal to:',
    options: [
      'PSPACE (IP = PSPACE)',
      'NP (IP = NP)',
      'BQP (Quantum Polynomial Time)',
      'EXPTIME'
    ],
    correctAnswer: 'PSPACE (IP = PSPACE)',
    tags: ['mixed', 'complexity-theory'],
    hint: 'Uses arithmetization of QBF (Quantified Boolean Formulas) over finite fields.'
  }
];
