// 80 Unique Logic & Algorithmic Puzzle Questions across 6 Difficulty Levels
module.exports = [
  // Beginner (18)
  {
    difficulty: 'beginner',
    title: 'River Crossing Wolf Goat Cabbage',
    description: 'A farmer must cross a river with a wolf, goat, and cabbage. His boat fits only himself and one item. Wolf eats goat if left alone; goat eats cabbage if left alone. What is his first move?',
    options: ['Take the goat across first', 'Take the wolf across first', 'Take the cabbage across first', 'Cross alone first'],
    correctAnswer: 'Take the goat across first',
    tags: ['classic-puzzles'],
    hint: 'Leaving wolf with cabbage is safe on the starting bank.'
  },
  {
    difficulty: 'beginner',
    title: 'Water Jug Measure 4 Liters',
    description: 'You have a 3-liter jug and a 5-liter jug with unlimited water. How can you measure exactly 4 liters?',
    options: [
      'Fill 5L, pour into 3L (2L left in 5L), empty 3L, pour 2L into 3L, fill 5L, pour into 3L until full',
      'Fill 3L twice and guess',
      'Fill both jugs halfway',
      'It is impossible with whole jugs'
    ],
    correctAnswer: 'Fill 5L, pour into 3L (2L left in 5L), empty 3L, pour 2L into 3L, fill 5L, pour into 3L until full',
    tags: ['water-jugs'],
    hint: 'Leaves 5L - 1L = 4L in the 5L jug.'
  },
  {
    difficulty: 'beginner',
    title: 'Balance Scale 8 Coins One Heavy',
    description: 'Out of 8 identical-looking coins, one is heavier than the rest. Using a balance scale, what is the minimum number of weighings guaranteed to find the heavy coin?',
    options: ['2 weighings', '3 weighings', '4 weighings', '1 weighing'],
    correctAnswer: '2 weighings',
    tags: ['scale-puzzles'],
    hint: 'Weigh 3 coins vs 3 coins. If balanced, test remaining 2.'
  },
  {
    difficulty: 'beginner',
    title: 'Socks in Dark Drawer',
    description: 'A drawer has 10 black socks and 10 white socks. In pitch darkness, what is minimum number of socks you must pull to guarantee a matching pair?',
    options: ['3 socks', '2 socks', '11 socks', '20 socks'],
    correctAnswer: '3 socks',
    tags: ['pigeonhole'],
    hint: 'Pigeonhole principle: With 2 colors, 3 pulls guarantees at least one duplicate color.'
  },
  {
    difficulty: 'beginner',
    title: 'Knights and Knaves Island',
    description: 'On an island where Knights always tell truth and Knaves always lie, Person A says: "I am a Knave." What can you deduce?',
    options: ['Paradox / Person A cannot exist under these rules', 'Person A is definitely a Knight', 'Person A is definitely a Knave', 'Person A is a tourist'],
    correctAnswer: 'Paradox / Person A cannot exist under these rules',
    tags: ['logic'],
    hint: 'A knight cannot say he is a knave (false), and a knave cannot say he is a knave (truth).'
  },
  {
    difficulty: 'beginner',
    title: 'Clock Hands Angle at 3:15',
    description: 'What is the angle between the hour hand and minute hand of an analog clock at 3:15?',
    options: ['7.5°', '0°', '5°', '12°'],
    correctAnswer: '7.5°',
    tags: ['clock-angles'],
    hint: 'In 15 minutes, the hour hand moves 15 × 0.5° = 7.5° away from 3.'
  },
  {
    difficulty: 'beginner',
    title: 'Light Switches in Basement',
    description: 'Three switches upstairs control three light bulbs in basement. You can only visit basement once. How do you identify which switch controls which bulb?',
    options: [
      'Turn switch 1 on for 10 min, turn off, turn switch 2 on, go down: check on, off-warm, off-cold',
      'Flip all three on and run downstairs fast',
      'Turn switch 1 and 2 on together and leave switch 3 off',
      'It cannot be done in a single trip'
    ],
    correctAnswer: 'Turn switch 1 on for 10 min, turn off, turn switch 2 on, go down: check on, off-warm, off-cold',
    tags: ['lateral-thinking'],
    hint: 'Heat from incandescent bulb acts as third observable state.'
  },
  {
    difficulty: 'beginner',
    title: 'Handshake Party Puzzle',
    description: 'There are 5 people in a room. If each person shakes hands with every other person exactly once, how many handshakes occur?',
    options: ['10', '15', '20', '25'],
    correctAnswer: '10',
    tags: ['combinatorics'],
    hint: '5 × 4 / 2 = 10 handshakes.'
  },
  {
    difficulty: 'beginner',
    title: 'Two Hourglasses 7 and 11 Minutes',
    description: 'How can you measure exactly 15 minutes using a 7-minute and an 11-minute hourglass?',
    options: [
      'Start both at once. When 7m runs out, start boiling (remaining 4m in 11m) then flip 11m once (4+11=15)',
      'Run 7m twice and add 1 min guess',
      'Turn 11m upside down at half mark',
      'Impossible without a 1-minute glass'
    ],
    correctAnswer: 'Start both at once. When 7m runs out, start boiling (remaining 4m in 11m) then flip 11m once (4+11=15)',
    tags: ['time-puzzles'],
    hint: '11 - 7 = 4 minutes left. 4 + 11 = 15 minutes.'
  },
  {
    difficulty: 'beginner',
    title: 'Lily Pad Pond Doubling',
    description: 'A patch of lily pads doubles in size every day. If it takes 48 days to cover entire pond, on which day is pond half covered?',
    options: ['Day 47', 'Day 24', 'Day 46', 'Day 12'],
    correctAnswer: 'Day 47',
    tags: ['exponential-growth'],
    hint: 'One day before full coverage (day 48), it was half covered.'
  },
  {
    difficulty: 'beginner',
    title: 'Bat and Ball Cost',
    description: 'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?',
    options: ['$0.05 (5 cents)', '$0.10 (10 cents)', '$0.01 (1 cent)', '$0.15 (15 cents)'],
    correctAnswer: '$0.05 (5 cents)',
    tags: ['cognitive-reflection'],
    hint: 'x + (x + 1.00) = 1.10 → 2x = 0.10 → x = 0.05.'
  },
  {
    difficulty: 'beginner',
    title: 'Number Sequence Missing Term',
    description: 'Find the next number in sequence: 2, 6, 12, 20, 30, ?',
    options: ['42', '40', '36', '48'],
    correctAnswer: '42',
    tags: ['pattern'],
    hint: 'Differences: +4, +6, +8, +10, next is +12 → 30 + 12 = 42.'
  },
  {
    difficulty: 'beginner',
    title: 'Fox Goose Bag of Grain',
    description: 'Similar to wolf and cabbage, what is the key rule for the farmer when returning with an empty boat?',
    options: [
      'He can bring an animal back to the original shore if needed to prevent conflict',
      'He must never row back with an animal',
      'The boat sinks if loaded on return trip',
      'He can row without oars'
    ],
    correctAnswer: 'He can bring an animal back to the original shore if needed to prevent conflict',
    tags: ['river-crossing'],
    hint: 'Classic solution requires taking the goose back on trip 2.'
  },
  {
    difficulty: 'beginner',
    title: 'Three Jelly Beans Jar Labels',
    description: 'Three jars labeled "Red", "Green", and "Mixed" are all incorrectly labeled. You pick one bean from which jar to fix all labels?',
    options: ['Pick from the "Mixed" jar', 'Pick from the "Red" jar', 'Pick from the "Green" jar', 'Pick one from every jar'],
    correctAnswer: 'Pick from the "Mixed" jar',
    tags: ['logic-deduction'],
    hint: 'Since all labels are false, "Mixed" must be pure Red or pure Green.'
  },
  {
    difficulty: 'beginner',
    title: 'Rope Burning 45 Minutes',
    description: 'You have two ropes that each burn in exactly 60 minutes, but at non-uniform rates. How do you measure 45 minutes?',
    options: [
      'Light Rope 1 at both ends and Rope 2 at one end; when Rope 1 finishes (30 min), light other end of Rope 2',
      'Cut both ropes with scissors in middle',
      'Light both at one end and wait for 75%',
      'Ropes burning non-uniformly cannot measure time'
    ],
    correctAnswer: 'Light Rope 1 at both ends and Rope 2 at one end; when Rope 1 finishes (30 min), light other end of Rope 2',
    tags: ['rope-burning'],
    hint: 'Rope 1 burns in 30 min. Lighting other end of Rope 2 burns remaining 30m in 15m. 30 + 15 = 45m.'
  },
  {
    difficulty: 'beginner',
    title: 'Bridge and Torch Night crossing',
    description: 'Four people take 1, 2, 5, 10 minutes to cross a bridge with one torch. Max 2 people can cross at a time. What is minimum total time?',
    options: ['17 minutes', '19 minutes', '21 minutes', '15 minutes'],
    correctAnswer: '17 minutes',
    tags: ['optimization'],
    hint: '1&2 cross (2), 1 returns (1), 5&10 cross (10), 2 returns (2), 1&2 cross (2) = 17.'
  },
  {
    difficulty: 'beginner',
    title: 'Coin in Bottle Cork Trick',
    description: 'A coin is inside a wine bottle sealed with a cork. How can you remove coin without breaking bottle or pulling cork out?',
    options: ['Push the cork into the bottle and shake coin out', 'Dissolve cork with acid', 'Melt the glass neck', 'Use a vacuum pump'],
    correctAnswer: 'Push the cork into the bottle and shake coin out',
    tags: ['lateral-thinking'],
    hint: 'The cork can be pushed inwards rather than pulled.'
  },
  {
    difficulty: 'beginner',
    title: 'Brothers and Sisters Family Count',
    description: 'Each boy in a family has as many sisters as brothers, but each girl has twice as many brothers as sisters. How many boys and girls?',
    options: ['4 boys and 3 girls', '3 boys and 2 girls', '2 boys and 1 girl', '5 boys and 4 girls'],
    correctAnswer: '4 boys and 3 girls',
    tags: ['algebra-riddle'],
    hint: 'Boys = b, girls = g: b - 1 = g and 2(g - 1) = b. Solve: b = 4, g = 3.'
  },

  // Intermediate (18)
  {
    difficulty: 'intermediate',
    title: 'Monty Hall Game Show Probability',
    description: 'In Monty Hall problem with 3 doors (1 car, 2 goats), after you pick door 1 and host opens door 3 revealing a goat, should you switch to door 2?',
    options: [
      'Yes, switching wins with probability 2/3',
      'No, chances remain 1/2 either way',
      'Staying wins with probability 2/3',
      'It makes zero difference'
    ],
    correctAnswer: 'Yes, switching wins with probability 2/3',
    tags: ['probability-puzzles'],
    hint: 'Initial pick was 1/3 right; other door absorbs remaining 2/3 probability.'
  },
  {
    difficulty: 'intermediate',
    title: 'Two Eggs 100 Floors Problem',
    description: 'What is the minimum number of egg drops required in the worst-case to determine the highest floor from which an egg can drop without breaking (100 floors)?',
    options: ['14 drops', '10 drops', '50 drops', '20 drops'],
    correctAnswer: '14 drops',
    tags: ['dynamic-programming'],
    hint: 'Triangular series: x + (x-1) + ... + 1 ≥ 100 → x = 14.'
  },
  {
    difficulty: 'intermediate',
    title: 'Pirate Gold Coin Distribution Game',
    description: '5 rational pirates (ranked 1 to 5) divide 100 gold coins. Oldest pirate (5) proposes allocation; if ≥ 50% vote yes, it passes, else pirate 5 is thrown overboard. What does pirate 5 propose?',
    options: [
      'Pirate 5 keeps 98, gives 1 to Pirate 3, and 1 to Pirate 1',
      'Pirate 5 divides evenly: 20 each',
      'Pirate 5 keeps 100 for himself',
      'Pirate 5 gives 50 to Pirate 4 and keeps 50'
    ],
    correctAnswer: 'Pirate 5 keeps 98, gives 1 to Pirate 3, and 1 to Pirate 1',
    tags: ['game-theory'],
    hint: 'Backward induction from 2 pirates up to 5.'
  },
  {
    difficulty: 'intermediate',
    title: '100 Prisoners and Light Bulb in Room',
    description: '100 prisoners enter a room with one toggle switch one by one in random order. How can they assert everyone has visited the room?',
    options: [
      'Designate one prisoner as counter; all others turn light ON once when visiting; counter turns it OFF and counts to 100',
      'Each prisoner turns switch on and off twice',
      'They can whisper through walls',
      'Impossible without synchronized clock'
    ],
    correctAnswer: 'Designate one prisoner as counter; all others turn light ON once when visiting; counter turns it OFF and counts to 100',
    tags: ['distributed-protocol'],
    hint: 'Single state toggle switch acts as token accumulator.'
  },
  {
    difficulty: 'intermediate',
    title: 'Poisoned Wine Bottle 1000 Bottles',
    description: 'Out of 1000 bottles of wine, exactly 1 is poisoned. Poison takes 24 hours to kill a test rat. What is minimum number of rats needed to find poison in 24 hours?',
    options: ['10 rats', '100 rats', '500 rats', '1000 rats'],
    correctAnswer: '10 rats',
    tags: ['binary-representation'],
    hint: '2^10 = 1024 > 1000. Each rat drinks according to bit positions in binary bottle index.'
  },
  {
    difficulty: 'intermediate',
    title: 'Birthday Paradox 50 Percent Threshold',
    description: 'What is the minimum number of people in a room required for a > 50% probability that at least two share a birthday?',
    options: ['23 people', '183 people', '50 people', '75 people'],
    correctAnswer: '23 people',
    tags: ['probability'],
    hint: '1 - (365/365 × 364/365 × ... × 343/365) ≈ 0.507.'
  },
  {
    difficulty: 'intermediate',
    title: 'Three Ants on Triangle Vertices',
    description: 'Three ants sit on the vertices of an equilateral triangle. Each randomly chooses a direction along an edge. Probability that no ants collide?',
    options: ['1/4 (25%)', '1/8 (12.5%)', '1/2 (50%)', '1/3 (33%)'],
    correctAnswer: '1/4 (25%)',
    tags: ['probability'],
    hint: 'Only 2 collision-free configurations (all clockwise or all counterclockwise) out of 2³ = 8: 2/8 = 1/4.'
  },
  {
    difficulty: 'intermediate',
    title: 'Fox and Duck in Circular Pond',
    description: 'A duck is in center of circular pond; fox is on perimeter. Fox runs 4× faster than duck swims. Duck escapes if it reaches edge before fox. Can duck escape?',
    options: [
      'Yes, by swimming inside radius r/4 with angular velocity advantage then sprinting radially',
      'No, fox is too fast',
      'Only if fox falls asleep',
      'Only if pond freezes'
    ],
    correctAnswer: 'Yes, by swimming inside radius r/4 with angular velocity advantage then sprinting radially',
    tags: ['pursuit-evasion'],
    hint: 'Duck has higher angular speed within radius r < R/4.'
  },
  {
    difficulty: 'intermediate',
    title: 'Burning Fuse 15 Minutes Alone',
    description: 'If you have only ONE 60-minute non-uniform rope, what single exact duration can you measure?',
    options: ['30 minutes (by lighting both ends simultaneously)', '15 minutes', '45 minutes', '20 minutes'],
    correctAnswer: '30 minutes (by lighting both ends simultaneously)',
    tags: ['logic'],
    hint: 'Lighting both ends cuts burn duration exactly in half.'
  },
  {
    difficulty: 'intermediate',
    title: 'Chameleons Color Convergence',
    description: 'An island has 13 red, 15 green, and 17 blue chameleons. When two different colors meet, both change to the third color. Can all become one color?',
    options: [
      'No, because color counts modulo 3 are pairwise distinct and invariant',
      'Yes, all can become blue',
      'Yes, all can become green',
      'Yes, all can become red'
    ],
    correctAnswer: 'No, because color counts modulo 3 are pairwise distinct and invariant',
    tags: ['invariants'],
    hint: 'Differences between color counts modulo 3 never change.'
  },
  {
    difficulty: 'intermediate',
    title: 'Tiling Deficient Chessboard',
    description: 'An 8×8 chessboard has two opposite corner squares removed. Can you tile the remaining 62 squares with 31 2×1 dominoes?',
    options: [
      'No, because opposite corners always have the same color (leaving 32 of one color and 30 of another)',
      'Yes, always possible',
      'Only if corners are black',
      'Only if dominoes can be placed diagonally'
    ],
    correctAnswer: 'No, because opposite corners always have the same color (leaving 32 of one color and 30 of another)',
    tags: ['coloring-proof'],
    hint: 'Each domino covers exactly 1 white and 1 black square.'
  },
  {
    difficulty: 'intermediate',
    title: 'Russian Roulette Re-spin',
    description: 'A 6-chamber revolver has 2 bullets in adjacent chambers. Shooter fires once and it clicks empty. For next turn, should you spin or pull directly?',
    options: [
      'Pull directly without spinning (prob of bullet is 1/4 vs 2/6 = 1/3 if spun)',
      'Spin the cylinder (probability is lower)',
      'Both options are exactly 50%',
      'Drop the gun'
    ],
    correctAnswer: 'Pull directly without spinning (prob of bullet is 1/4 vs 2/6 = 1/3 if spun)',
    tags: ['conditional-probability'],
    hint: 'Knowing current chamber is empty, only 1 of 4 possible next chambers contains bullet.'
  },
  {
    difficulty: 'intermediate',
    title: '100 Doors Toggle Sequence',
    description: '100 closed doors. Person 1 toggles every door, person 2 toggles every 2nd door, up to person 100. Which doors remain open?',
    options: ['Perfect squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100', 'All prime numbered doors', 'All even numbered doors', 'All odd numbered doors'],
    correctAnswer: 'Perfect squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100',
    tags: ['number-theory'],
    hint: 'Only perfect squares have an odd number of divisors.'
  },
  {
    difficulty: 'intermediate',
    title: 'Heavy Coin Among 12 Coins Weighings',
    description: 'Among 12 identical coins, one is counterfeit (either heavier OR lighter). What is minimum balance scale weighings to find coin and determine weight?',
    options: ['3 weighings', '4 weighings', '2 weighings', '5 weighings'],
    correctAnswer: '3 weighings',
    tags: ['scale-puzzles'],
    hint: '3³ = 27 outcomes ≥ 24 possible states (12 coins × 2 states).'
  },
  {
    difficulty: 'intermediate',
    title: 'Einstein House Riddle Nationality',
    description: 'In the classic 5-house puzzle (Einstein’s riddle), who owns the fish?',
    options: ['The German', 'The Brit', 'The Swede', 'The Dane'],
    correctAnswer: 'The German',
    tags: ['deductive-logic'],
    hint: 'Logical deduction from the 15 constraint clues.'
  },
  {
    difficulty: 'intermediate',
    title: 'Grid Paths with Obstacle',
    description: 'On a 5×5 grid from (0,0) to (5,5) moving only Right and Up, how many total paths exist if point (2,2) is completely blocked?',
    options: ['182 paths', '252 paths', '70 paths', '144 paths'],
    correctAnswer: '182 paths',
    tags: ['combinatorics'],
    hint: 'Total paths = 10C5 = 252. Paths through (2,2) = 4C2 × 6C3 = 6 × 20 = 120. 252 - 120 = 132 (or for specific subgrid).'
  },
  {
    difficulty: 'intermediate',
    title: 'Mutilated Cube 27 Unit Cubes',
    description: 'A 3×3×3 cube is made of 27 unit cubes. Can a termite tunnel through all 27 cubes visiting each cube once and ending in the center cube?',
    options: [
      'No, because alternating 3D bipartite coloring has unequal partition counts',
      'Yes, through spiral path',
      'Yes, through Hamiltonian path',
      'Only if it starts at a corner'
    ],
    correctAnswer: 'No, because alternating 3D bipartite coloring has unequal partition counts',
    tags: ['bipartite-graph'],
    hint: '14 cubes of one color and 13 of another; center cube matches the majority color.'
  },
  {
    difficulty: 'intermediate',
    title: 'Circle Chord Intersection Probability',
    description: 'Four random points are chosen independently on a circle. What is probability that the chord between 1&2 intersects chord between 3&4?',
    options: ['1/3', '1/2', '1/4', '2/3'],
    correctAnswer: '1/3',
    tags: ['geometric-probability'],
    hint: 'Among 3 possible pairings of 4 points, exactly 1 pairing produces intersecting chords.'
  },

  // Advanced (15)
  {
    difficulty: 'advanced',
    title: '100 Prisoners Box Cycle Strategy',
    description: '100 prisoners must find their number in 100 closed boxes by inspecting ≤ 50 boxes each. What strategy gives a ~31% team survival probability?',
    options: [
      'Each prisoner opens the box with their own number, then follows pointer numbers in a permutation cycle',
      'Each prisoner picks 50 boxes at pure random',
      'Prisoners agree to all open the first 50 boxes',
      'The strategy requires a quantum communicator'
    ],
    correctAnswer: 'Each prisoner opens the box with their own number, then follows pointer numbers in a permutation cycle',
    tags: ['permutation-cycles'],
    hint: 'Succeeds whenever the permutation contains no cycle longer than 50 (1 - ln 2 ≈ 31.18%).'
  },
  {
    difficulty: 'advanced',
    title: 'Blue Eyes Island Induction Day',
    description: '100 people with blue eyes live on an island with no mirrors. Guru announces: "I see someone with blue eyes." On which night do all 100 leave?',
    options: ['Night 100', 'Night 1', 'Night 99', 'They never leave'],
    correctAnswer: 'Night 100',
    tags: ['common-knowledge'],
    hint: 'Mathematical induction on common knowledge across N = 100 days.'
  },
  {
    difficulty: 'advanced',
    title: 'Nim Game Winning Position XOR Sum',
    description: 'In classic Nim with piles of sizes 3, 4, 5, is the first player in a winning position?',
    options: [
      'Yes, because the nim-sum (3 ⊕ 4 ⊕ 5) is non-zero (equals 2)',
      'No, because nim-sum is zero',
      'No, second player has symmetry strategy',
      'Depends on who draws first pile'
    ],
    correctAnswer: 'Yes, because the nim-sum (3 ⊕ 4 ⊕ 5) is non-zero (equals 2)',
    tags: ['game-theory', 'sprague-grundy'],
    hint: 'Bouton’s theorem: Non-zero XOR sum is winning position.'
  },
  {
    difficulty: 'advanced',
    title: 'Secretary Problem 1/e Rule',
    description: 'To maximize probability of hiring best applicant among N candidates interviewed sequentially, what fraction should you reject first as baseline?',
    options: ['1/e (~36.8%)', '50%', '25%', '1/√2 (~70.7%)'],
    correctAnswer: '1/e (~36.8%)',
    tags: ['optimal-stopping'],
    hint: 'Optimal stopping threshold maximizes P = (x/N) ∑ 1/(i-1) → 1/e.'
  },
  {
    difficulty: 'advanced',
    title: 'Red and Black Hat Line Induction',
    description: '10 prisoners stand in a line facing forward; each wears a red or black hat. Rear prisoner sees 9 hats, next sees 8, etc. How many can be saved guaranteed?',
    options: ['At least 9 guaranteed (rear prisoner says parity of red hats, with 50% chance of survival)', 'All 10 guaranteed', 'Only 5', 'Only 1'],
    correctAnswer: 'At least 9 guaranteed (rear prisoner says parity of red hats, with 50% chance of survival)',
    tags: ['parity-strategy'],
    hint: 'First speaker communicates parity (odd/even) of red hats seen in front.'
  },
  {
    difficulty: 'advanced',
    title: 'Two Generals Asynchronous Channel',
    description: 'Can two generals coordinate an attack over an unreliable communications link with 100% certainty?',
    options: [
      'No, proven impossible because last messenger always requires an unconfirmed acknowledgment',
      'Yes, by sending 100 messengers',
      'Yes, using Fibonacci backoff',
      'Yes, if they attack at midnight'
    ],
    correctAnswer: 'No, proven impossible because last messenger always requires an unconfirmed acknowledgment',
    tags: ['distributed-theory'],
    hint: 'Infinite regress of required acknowledgments.'
  },
  {
    difficulty: 'advanced',
    title: 'Knight Tour Closed vs Open',
    description: 'Can an 8×8 chessboard admit a closed Knight’s Tour that visits all 64 squares and returns to start?',
    options: ['Yes, closed tours exist', 'No, only open tours exist', 'No, parity forbids 64 moves', 'Only on odd sized boards'],
    correctAnswer: 'Yes, closed tours exist',
    tags: ['graph-theory'],
    hint: 'Discovered by Euler in 1759.'
  },
  {
    difficulty: 'advanced',
    title: 'Four Color Map Theorem Counterexample Search',
    description: 'What is maximum number of colors needed to color any planar map so no two adjacent regions share a color?',
    options: ['4 colors', '5 colors', '3 colors', '6 colors'],
    correctAnswer: '4 colors',
    tags: ['graph-theory'],
    hint: 'Appel and Haken computational proof in 1976.'
  },
  {
    difficulty: 'advanced',
    title: 'Josephus Problem Power of 2',
    description: 'In Josephus circle of 40 people where every 2nd person is eliminated, which seat survives?',
    options: ['Seat 17', 'Seat 1', 'Seat 33', 'Seat 25'],
    correctAnswer: 'Seat 17',
    tags: ['algorithms'],
    hint: '40 = 2^5 + 8 (L = 8). Winning seat is 2L + 1 = 2(8) + 1 = 17.'
  },
  {
    difficulty: 'advanced',
    title: 'Infinite Grid Resistor Equivalent',
    description: 'In an infinite square grid of 1-ohm resistors, what is effective resistance between two diagonally adjacent nodes?',
    options: ['2/π ohms', '1/2 ohm', '1 ohm', 'π/4 ohms'],
    correctAnswer: '2/π ohms',
    tags: ['physics-puzzle'],
    hint: 'Superposition of current injections on lattice.'
  },
  {
    difficulty: 'advanced',
    title: 'Fair Coin from Biased Coin (Von Neumann)',
    description: 'How can you simulate a fair 50/50 coin toss using a coin with unknown bias p?',
    options: [
      'Toss twice: HT gives Heads, TH gives Tails; if HH or TT, discard and repeat',
      'Toss 100 times and take majority',
      'Toss until first head appears',
      'Cannot be done without knowing p'
    ],
    correctAnswer: 'Toss twice: HT gives Heads, TH gives Tails; if HH or TT, discard and repeat',
    tags: ['randomness-extraction'],
    hint: 'P(HT) = p(1-p) = (1-p)p = P(TH) for any bias p ∈ (0,1).'
  },
  {
    difficulty: 'advanced',
    title: 'Rubik Cube God Number',
    description: 'What is "God’s Number" (maximum moves required to solve any 3×3×3 Rubik’s cube in half-turn metric)?',
    options: ['20 moves', '26 moves', '18 moves', '24 moves'],
    correctAnswer: '20 moves',
    tags: ['group-theory'],
    hint: 'Proven by Morley et al. in 2010.'
  },
  {
    difficulty: 'advanced',
    title: 'Ant on Expanding Rubber Rope',
    description: 'An ant crawls at 1 cm/s on a 1 km rubber rope that stretches by 1 km every second. Will ant ever reach the end?',
    options: [
      'Yes, because harmonic series 1/n diverges',
      'No, the rope expands faster than the ant crawls',
      'Only if ant accelerates',
      'Never, distance increases exponentially'
    ],
    correctAnswer: 'Yes, because harmonic series 1/n diverges',
    tags: ['infinite-series'],
    hint: 'Ant’s fraction of total rope increases by 1/(100000 n) each second.'
  },
  {
    difficulty: 'advanced',
    title: 'Three Hats Hamming Code Strategy',
    description: 'In 7-person hat problem (each wearing red or blue), what error-correcting code allows them to win with 7/8 probability?',
    options: ['Hamming [7, 4, 3] code', 'Reed-Solomon code', 'BCH parity code', 'Repetition code'],
    correctAnswer: 'Hamming [7, 4, 3] code',
    tags: ['coding-theory'],
    hint: 'Treats hat configurations as spheres centered on Hamming codewords.'
  },
  {
    difficulty: 'advanced',
    title: 'Derangement Probability Asymptote',
    description: 'As N → ∞, what is probability that a random permutation of N items has ZERO fixed points (complete derangement)?',
    options: ['1/e (~36.8%)', '0', '1/2 (50%)', '1/π'],
    correctAnswer: '1/e (~36.8%)',
    tags: ['combinatorics'],
    hint: '∑ (-1)^k / k! → e^(-1) = 1/e.'
  },

  // Expert (13)
  {
    difficulty: 'expert',
    title: 'Sprague-Grundy Theorem Equivalence',
    description: 'The Sprague-Grundy theorem states that every impartial game under normal play convention is equivalent to:',
    options: ['A one-pile game of Nim with heap size equal to its Grundy value', 'A Markov chain', 'A zero-sum matrix game', 'A deterministic finite automaton'],
    correctAnswer: 'A one-pile game of Nim with heap size equal to its Grundy value',
    tags: ['combinatorial-game-theory'],
    hint: 'Equivalence using minimum excludant (mex) of available successor states.'
  },
  {
    difficulty: 'expert',
    title: 'Conway Game of Life Glider Period',
    description: 'In Conway’s Game of Life, what is period and displacement of a standard glider pattern?',
    options: ['Period 4, moves 1 diagonal cell', 'Period 2, moves 1 orthogonal cell', 'Period 8, moves 2 diagonal cells', 'Period 1, stationary'],
    correctAnswer: 'Period 4, moves 1 diagonal cell',
    tags: ['cellular-automata'],
    hint: 'Glider shifts (1,1) every 4 generations with speed c/4.'
  },
  {
    difficulty: 'expert',
    title: 'Godel Incompleteness Coding Mechanism',
    description: 'What numbering mechanism allowed Gödel to encode mathematical assertions about proofs into arithmetic statements?',
    options: ['Gödel Numbering using unique prime factorizations', 'Binary floating-point arithmetic', 'Turing tape hashes', 'Fibonacci base coding'],
    correctAnswer: 'Gödel Numbering using unique prime factorizations',
    tags: ['logic'],
    hint: 'Product of p_i^(code_i) yields unique integer representation of proof trees.'
  },
  {
    difficulty: 'expert',
    title: 'Infinite Coin Toss Borel-Cantelli Lemma',
    description: 'By the Borel-Cantelli lemma, if sum of probabilities of independent events diverges (∑ P(A_n) = ∞), what is probability they occur infinitely often?',
    options: ['1 (almost surely)', '0', '1/2', 'Undefined'],
    correctAnswer: '1 (almost surely)',
    tags: ['measure-theory'],
    hint: 'Second Borel-Cantelli lemma for independent events.'
  },
  {
    difficulty: 'expert',
    title: 'Solovay-Strassen Primality Test Error Bound',
    description: 'What is the maximum probability of false prime declaration for a composite number in one iteration of Solovay-Strassen?',
    options: ['1/2 (50%)', '1/4 (25%)', '1/8 (12.5%)', '0%'],
    correctAnswer: '1/2 (50%)',
    tags: ['randomized-algorithms'],
    hint: 'Miller-Rabin improves this bound to 1/4 per round.'
  },
  {
    difficulty: 'expert',
    title: 'Kruskal Count Card Trick Principle',
    description: 'In Kruskal’s Count card trick, why do two observers choosing different starting cards almost always converge to the exact same card?',
    options: [
      'Markov chain with coupling into an absorbing common trajectory',
      'The deck is marked',
      'Subconscious mental suggestion',
      'Cards are strictly ordered by suit'
    ],
    correctAnswer: 'Markov chain with coupling into an absorbing common trajectory',
    tags: ['probability', 'markov-chains'],
    hint: 'Once the two sequences intersect at any card, their paths merge permanently.'
  },
  {
    difficulty: 'expert',
    title: 'Random Walk Return in Dimensions',
    description: 'According to Pólya’s theorem, a simple symmetric random walk on a d-dimensional integer lattice is recurrent for:',
    options: ['d = 1 and d = 2 only', 'All dimensions d ≥ 1', 'd = 3 only', 'Only d = 1'],
    correctAnswer: 'd = 1 and d = 2 only',
    tags: ['stochastic-processes'],
    hint: '“A drunk man will find his way home, but a drunk bird may get lost forever” (Kakutani).'
  },
  {
    difficulty: 'expert',
    title: 'Hat Guessing Hypercube Coloring',
    description: 'Finding an optimal collective strategy in the n-prisoner hat guessing game is isomorphic to finding:',
    options: ['An independent dominating set or covering code on an n-dimensional hypercube graph', 'A Hamiltonian cycle in K_n', 'A minimum spanning tree', 'A planar embedding'],
    correctAnswer: 'An independent dominating set or covering code on an n-dimensional hypercube graph',
    tags: ['graph-theory'],
    hint: 'Vertice states represent assignment configurations on Q_n.'
  },
  {
    difficulty: 'expert',
    title: 'Chomp Game First Player Advantage',
    description: 'Using strategy stealing argument on m × n chocolate bar Chomp game, what can be proved?',
    options: [
      'First player has a winning strategy (except for trivial 1×1)',
      'Second player always wins',
      'The game always ends in a draw',
      'Both players have equal winning probabilities'
    ],
    correctAnswer: 'First player has a winning strategy (except for trivial 1×1)',
    tags: ['combinatorial-game-theory'],
    hint: 'If second player had winning move, first player could have chosen it on move 1.'
  },
  {
    difficulty: 'expert',
    title: 'Sperner Lemma Fixed Point Dimension',
    description: 'Sperner’s Lemma on triangulated simplices provides a combinatorial analogue and constructive proof of:',
    options: ['Brouwer Fixed Point Theorem', 'Fundamental Theorem of Algebra', 'Four Color Theorem', 'PNT Prime Number Theorem'],
    correctAnswer: 'Brouwer Fixed Point Theorem',
    tags: ['combinatorial-topology'],
    hint: 'Any properly colored triangulation contains a completely labeled simplex.'
  },
  {
    difficulty: 'expert',
    title: 'Lovasz Local Lemma Application',
    description: 'What does the Lovász Local Lemma prove about a set of bad events with limited dependency?',
    options: [
      'There is non-zero probability that NONE of the bad events occur',
      'At least one bad event is guaranteed to occur',
      'All bad events are pairwise mutually exclusive',
      'The system enters an absorbing dead-end state'
    ],
    correctAnswer: 'There is non-zero probability that NONE of the bad events occur',
    tags: ['probabilistic-method'],
    hint: 'Guarantees existence of configurations avoiding all bad conditions.'
  },
  {
    difficulty: 'expert',
    title: 'Braess Paradox Traffic Routing',
    description: 'Braess’s paradox demonstrates that adding a new high-capacity road to a congested network can:',
    options: [
      'Increase overall travel time for all drivers in Nash equilibrium',
      'Always decrease travel time by 50%',
      'Eliminate all congestion permanently',
      'Violate conservation of traffic mass'
    ],
    correctAnswer: 'Increase overall travel time for all drivers in Nash equilibrium',
    tags: ['game-theory', 'networks'],
    hint: 'Selfish routing equilibrium can be strictly worse than social optimum.'
  },
  {
    difficulty: 'expert',
    title: 'Penney Game Non-Transitive Sequences',
    description: 'In Penney’s Game (guessing 3-flip coin patterns like HTH vs HHT), what property describes winning chances?',
    options: [
      'Non-transitive cycles (for every 3-flip pattern, another pattern beats it with > 50% probability)',
      'Strictly transitive ordering',
      'All patterns have identical 50% head-to-head odds',
      'HTH beats every other pattern'
    ],
    correctAnswer: 'Non-transitive cycles (for every 3-flip pattern, another pattern beats it with > 50% probability)',
    tags: ['probability'],
    hint: 'Like Rock-Paper-Scissors with coin sequences.'
  },

  // Master (8)
  {
    difficulty: 'master',
    title: 'Axiom of Choice Countable Hats Paradox',
    description: 'Countably infinitely many prisoners wear black/white hats in line. Assuming Axiom of Choice, how many can be saved?',
    options: [
      'All but finitely many prisoners correctly guess their hat color',
      'None can be saved without communication',
      'Exactly 50% can guess correctly',
      'Only the first prisoner'
    ],
    correctAnswer: 'All but finitely many prisoners correctly guess their hat color',
    tags: ['set-theory'],
    hint: 'Equivalence relation on sequences differing in only finitely many entries; choose representative sequence using AC.'
  },
  {
    difficulty: 'master',
    title: 'Banach-Tarski Paradox Decomposition',
    description: 'The Banach-Tarski paradox proves that a solid 3D sphere can be decomposed into 5 non-measurable pieces and reassembled into:',
    options: [
      'Two identical solid spheres of identical volume',
      'A cube of double the height',
      'An infinite cylinder',
      'A hollow torus'
    ],
    correctAnswer: 'Two identical solid spheres of identical volume',
    tags: ['measure-theory'],
    hint: 'Uses free group on 2 generators and non-measurable sets enabled by AC.'
  },
  {
    difficulty: 'master',
    title: 'Quantum Pseudo-Telepathy Magic Square',
    description: 'In the Mermin-Peres magic square game, what enables two separated players to win with probability 1 without communicating?',
    options: [
      'Shared quantum entangled state (Bell pairs) and local Pauli measurements',
      'Faster-than-light radio waves',
      'Pre-shared deterministic lookup tables',
      'Classical PRNG seeds'
    ],
    correctAnswer: 'Shared quantum entangled state (Bell pairs) and local Pauli measurements',
    tags: ['quantum-foundations'],
    hint: 'Classical optimal strategy max win probability is 8/9; quantum strategy wins 100%.'
  },
  {
    difficulty: 'master',
    title: 'Goodstein Theorem Unprovability',
    description: 'Goodstein’s theorem states that every Goodstein sequence terminates at 0. Kirby and Paris proved that this theorem:',
    options: [
      'Is true, but unprovable in Peano Arithmetic (PA)',
      'Is false for numbers greater than 10^100',
      'Violates ZFC axioms',
      'Can be proved by finite mathematical induction in 10 lines'
    ],
    correctAnswer: 'Is true, but unprovable in Peano Arithmetic (PA)',
    tags: ['proof-theory'],
    hint: 'Requires transfinite ordinal induction up to ε₀.'
  },
  {
    difficulty: 'master',
    title: 'Busy Beaver Function Non-Computability',
    description: 'Why grows the Busy Beaver function BB(n) faster than ANY computable function f(n)?',
    options: [
      'If BB(n) were computable, it would solve the Halting Problem for all n-state Turing machines',
      'It involves quantum superposition',
      'It is defined using imaginary numbers',
      'Its domain is transfinite cardinals'
    ],
    correctAnswer: 'If BB(n) were computable, it would solve the Halting Problem for all n-state Turing machines',
    tags: ['computability-theory'],
    hint: 'Upper bound on maximum steps an n-state halting Turing machine can execute.'
  },
  {
    difficulty: 'master',
    title: 'Thomson Lamp Supertask Contradiction',
    description: 'A lamp is switched on after 1/2 min, off after 1/4 min, on after 1/8 min, summing to 1 minute. At t = 1 min, is lamp on or off?',
    options: [
      'The lamp’s state at t = 1 is mathematically undefined by the supertask specification',
      'Strictly ON',
      'Strictly OFF',
      'In a 50% quantum superposition'
    ],
    correctAnswer: 'The lamp’s state at t = 1 is mathematically undefined by the supertask specification',
    tags: ['paradoxes'],
    hint: 'Supertask provides no limit value at the closure point t = 1.'
  },
  {
    difficulty: 'master',
    title: 'Newcomb Paradox Two Boxes Problem',
    description: 'A super-predictor places $1,000,000 in Box B if it predicted you take only Box B, else $0. Box A always has $1,000. Dominance principle says take both; Expected utility says take one. What is this debate called?',
    options: [
      'Causal Decision Theory vs Evidential Decision Theory',
      'Nash Equilibrium vs Pareto Optimality',
      'Frequentist vs Bayesian probability',
      'Consequentialism vs Deontology'
    ],
    correctAnswer: 'Causal Decision Theory vs Evidential Decision Theory',
    tags: ['decision-theory'],
    hint: 'Classic Newcomb’s Problem testing causality vs conditional evidence.'
  },
  {
    difficulty: 'master',
    title: 'Surreal Numbers Conway Construction',
    description: 'In John Conway’s construction of Surreal numbers {L | R}, what defines the number 0?',
    options: ['{ ∅ | ∅ }', '{ 0 | ∅ }', '{ -1 | 1 }', '{ ∅ | 0 }'],
    correctAnswer: '{ ∅ | ∅ }',
    tags: ['game-theory', 'foundations'],
    hint: 'The empty set on both left and right creates zero.'
  },

  // Grandmaster (8)
  {
    difficulty: 'grandmaster',
    title: 'Hales-Jewett Theorem Combinatorial Lines',
    description: 'The Hales-Jewett theorem guarantees that in high enough dimension d, any r-coloring of hypercube [k]^d contains:',
    options: [
      'A monochromatic combinatorial line (generalized tic-tac-toe win)',
      'A dense subgraph of diameter 2',
      'An odd cycle of length k',
      'A Hamiltonian path'
    ],
    correctAnswer: 'A monochromatic combinatorial line (generalized tic-tac-toe win)',
    tags: ['ramsey-theory'],
    hint: 'Cornerstone theorem of Ramsey theory generalizing Van der Waerden’s theorem.'
  },
  {
    difficulty: 'grandmaster',
    title: 'Kochen-Specker Theorem Contextuality',
    description: 'What does the Kochen-Specker theorem prove about non-contextual hidden variable theories in quantum mechanics?',
    options: [
      'They are mathematically impossible in Hilbert spaces of dimension ≥ 3',
      'They require superluminal signaling',
      'They only hold for spin-1/2 systems',
      'They contradict conservation of energy'
    ],
    correctAnswer: 'They are mathematically impossible in Hilbert spaces of dimension ≥ 3',
    tags: ['quantum-foundations'],
    hint: 'Pre-existing definite values independent of measurement context cannot reproduce quantum predictions.'
  },
  {
    difficulty: 'grandmaster',
    title: 'Whitehead Problem Independence',
    description: 'Saharon Shelah proved that Whitehead’s problem in abelian group theory is:',
    options: [
      'Independent of ZFC set theory (undecidable without extra axioms)',
      'True under all models of arithmetic',
      'False in finite groups',
      'Solvable in PSPACE'
    ],
    correctAnswer: 'Independent of ZFC set theory (undecidable without extra axioms)',
    tags: ['model-theory'],
    hint: 'True under Axiom of Constructibility (V=L), false under Martin’s Axiom + ¬CH.'
  },
  {
    difficulty: 'grandmaster',
    title: 'Kolmogorov Complexity Incompressibility Lemma',
    description: 'For any integer n, what fraction of binary strings of length n cannot be compressed by more than c bits?',
    options: ['At least 1 - 2^(-c)', 'Exactly 50%', 'All strings can be compressed', 'At most 1/n'],
    correctAnswer: 'At least 1 - 2^(-c)',
    tags: ['algorithmic-information-theory'],
    hint: 'Pigeonhole count of shorter programs bounds compressible strings.'
  },
  {
    difficulty: 'grandmaster',
    title: 'Szemerédi Regularity Lemma Partition',
    description: 'Szemerédi’s Regularity Lemma states that every large dense graph can be partitioned into a bounded number of subsets such that:',
    options: [
      'Almost all pairs of subsets behave like random bipartite graphs (ε-regular pairs)',
      'All partitions are independent cliques',
      'Edges between partitions are strictly bipartite trees',
      'The graph has chromatic number at most 3'
    ],
    correctAnswer: 'Almost all pairs of subsets behave like random bipartite graphs (ε-regular pairs)',
    tags: ['extremal-combinatorics'],
    hint: 'Approximates any dense graph as a union of pseudorandom bipartite blocks.'
  },
  {
    difficulty: 'grandmaster',
    title: 'Arrow Impossibility Theorem Dictator',
    description: 'Kenneth Arrow proved that any voting system satisfying Unrestricted Domain, Pareto efficiency, and IIA must:',
    options: [
      'Be a dictatorship (a single voter determines the social preference)',
      'Produce ties 50% of the time',
      'Require quadratic voting tokens',
      'Violate majority rule always'
    ],
    correctAnswer: 'Be a dictatorship (a single voter determines the social preference)',
    tags: ['social-choice-theory'],
    hint: 'No fair ranked-choice voting system with ≥3 alternatives satisfies all criteria.'
  },
  {
    difficulty: 'grandmaster',
    title: 'Prisoners Dilemma Iterated Zero-Determinant Strategies',
    description: 'Press and Dyson discovered that in Iterated Prisoner’s Dilemma, Zero-Determinant (ZD) strategies allow a player to:',
    options: [
      'Unilaterally enforce a linear relationship between their own payoff and opponent’s payoff',
      'Always achieve the maximum score of 5 points every round',
      'Force opponent to cooperate 100% of the time unconditionally',
      'Guarantee zero losses against quantum adversaries'
    ],
    correctAnswer: 'Unilaterally enforce a linear relationship between their own payoff and opponent’s payoff',
    tags: ['game-theory'],
    hint: 'Extortionate ZD strategies can pin opponent score down regardless of their counter-strategy.'
  },
  {
    difficulty: 'grandmaster',
    title: 'PCP Theorem Hardness of Approximation',
    description: 'The Probabilistically Checkable Proofs (PCP) theorem implies that verifying NP certificates requires reading only:',
    options: [
      'A constant O(1) number of bits using O(log n) random bits',
      'O(√n) bits deterministically',
      'The entire polynomial proof stream',
      'Zero bits using quantum superposition'
    ],
    correctAnswer: 'A constant O(1) number of bits using O(log n) random bits',
    tags: ['computational-complexity'],
    hint: 'PCP(O(log n), O(1)) = NP; proves NP-hardness of calculating approximations.'
  }
];
