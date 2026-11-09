// 90 Unique Math Questions across 6 Difficulty Levels
module.exports = [
  // Beginner (20)
  {
    difficulty: 'beginner',
    title: 'Sum of Digits',
    description: 'What is the sum of digits of the number 356?',
    options: ['12', '14', '15', '11'],
    correctAnswer: '14',
    tags: ['arithmetic'],
    hint: '3 + 5 + 6'
  },
  {
    difficulty: 'beginner',
    title: 'Simple Multiplication',
    description: 'What is 17 × 8?',
    options: ['126', '136', '146', '116'],
    correctAnswer: '136',
    tags: ['arithmetic'],
    hint: '10×8 + 7×8 = 80 + 56'
  },
  {
    difficulty: 'beginner',
    title: 'Percentage Calculation',
    description: 'What is 25% of 240?',
    options: ['40', '50', '60', '70'],
    correctAnswer: '60',
    tags: ['percentage'],
    hint: '240 / 4'
  },
  {
    difficulty: 'beginner',
    title: 'Perfect Square Root',
    description: 'What is √196?',
    options: ['12', '13', '14', '16'],
    correctAnswer: '14',
    tags: ['arithmetic'],
    hint: '14 × 14'
  },
  {
    difficulty: 'beginner',
    title: 'Identify Prime Number',
    description: 'Which of the following is a prime number?',
    options: ['27', '39', '41', '51'],
    correctAnswer: '41',
    tags: ['number-theory'],
    hint: '41 has no divisors other than 1 and 41'
  },
  {
    difficulty: 'beginner',
    title: 'Perimeter of Rectangle',
    description: 'What is the perimeter of a rectangle with length 15 cm and width 8 cm?',
    options: ['46 cm', '23 cm', '120 cm', '48 cm'],
    correctAnswer: '46 cm',
    tags: ['geometry'],
    hint: '2 × (length + width)'
  },
  {
    difficulty: 'beginner',
    title: 'Area of Square',
    description: 'A square has an area of 81 cm². What is the length of one side?',
    options: ['7 cm', '8 cm', '9 cm', '18 cm'],
    correctAnswer: '9 cm',
    tags: ['geometry'],
    hint: '√81 = 9'
  },
  {
    difficulty: 'beginner',
    title: 'Fraction Addition',
    description: 'What is 2/5 + 1/10?',
    options: ['3/15', '1/2', '3/10', '4/10'],
    correctAnswer: '1/2',
    tags: ['fractions'],
    hint: '4/10 + 1/10 = 5/10 = 1/2'
  },
  {
    difficulty: 'beginner',
    title: 'Average Calculation',
    description: 'What is the arithmetic mean of 12, 18, 24, and 30?',
    options: ['20', '21', '22', '24'],
    correctAnswer: '21',
    tags: ['statistics'],
    hint: '(12+18+24+30)/4 = 84/4'
  },
  {
    difficulty: 'beginner',
    title: 'Exponentiation Basics',
    description: 'What is 2^6?',
    options: ['32', '64', '128', '16'],
    correctAnswer: '64',
    tags: ['algebra'],
    hint: '2 multiplied by itself 6 times'
  },
  {
    difficulty: 'beginner',
    title: 'Linear Equation Solve',
    description: 'Solve for x: 3x - 7 = 14',
    options: ['5', '6', '7', '8'],
    correctAnswer: '7',
    tags: ['algebra'],
    hint: '3x = 21'
  },
  {
    difficulty: 'beginner',
    title: 'Volume of Cube',
    description: 'What is the volume of a cube with side length 4 cm?',
    options: ['16 cm³', '48 cm³', '64 cm³', '96 cm³'],
    correctAnswer: '64 cm³',
    tags: ['geometry'],
    hint: '4³ = 64'
  },
  {
    difficulty: 'beginner',
    title: 'Ratio Simplification',
    description: 'Simplify the ratio 45:60 to its simplest form.',
    options: ['3:4', '4:5', '9:12', '2:3'],
    correctAnswer: '3:4',
    tags: ['ratios'],
    hint: 'Divide both by 15'
  },
  {
    difficulty: 'beginner',
    title: 'Complementary Angles',
    description: 'If an angle measures 38°, what is its complementary angle?',
    options: ['42°', '52°', '62°', '142°'],
    correctAnswer: '52°',
    tags: ['geometry'],
    hint: '90° - 38°'
  },
  {
    difficulty: 'beginner',
    title: 'Discount Price',
    description: 'An item priced at $80 has a 15% discount. What is the final price?',
    options: ['$68', '$70', '$65', '$72'],
    correctAnswer: '$68',
    tags: ['percentage'],
    hint: '$80 - 15% of $80 = $80 - $12'
  },
  {
    difficulty: 'beginner',
    title: 'Divisibility Rule for 9',
    description: 'Which of the following numbers is divisible by 9?',
    options: ['4,532', '6,318', '7,215', '5,423'],
    correctAnswer: '6,318',
    tags: ['number-theory'],
    hint: 'Sum of digits: 6+3+1+8 = 18 (divisible by 9)'
  },
  {
    difficulty: 'beginner',
    title: 'Unit Conversion Length',
    description: 'How many centimeters are in 3.5 meters?',
    options: ['35 cm', '350 cm', '3,500 cm', '0.35 cm'],
    correctAnswer: '350 cm',
    tags: ['units'],
    hint: '1 m = 100 cm'
  },
  {
    difficulty: 'beginner',
    title: 'Circle Circumference',
    description: 'If radius of a circle is 7 cm, what is its circumference? (Use π ≈ 22/7)',
    options: ['22 cm', '44 cm', '88 cm', '154 cm'],
    correctAnswer: '44 cm',
    tags: ['geometry'],
    hint: '2 × (22/7) × 7'
  },
  {
    difficulty: 'beginner',
    title: 'Speed Time Distance',
    description: 'A train travels 180 km in 3 hours. What is its average speed?',
    options: ['50 km/h', '60 km/h', '70 km/h', '80 km/h'],
    correctAnswer: '60 km/h',
    tags: ['arithmetic'],
    hint: '180 / 3'
  },
  {
    difficulty: 'beginner',
    title: 'Median of Odd Dataset',
    description: 'What is the median of [3, 9, 1, 7, 5]?',
    options: ['3', '5', '7', '9'],
    correctAnswer: '5',
    tags: ['statistics'],
    hint: 'Sort first: 1, 3, 5, 7, 9. Middle is 5.'
  },

  // Intermediate (20)
  {
    difficulty: 'intermediate',
    title: 'Quadratic Equation Roots',
    description: 'Solve x² - 5x + 6 = 0. What is the larger root?',
    options: ['2', '3', '4', '6'],
    correctAnswer: '3',
    tags: ['algebra'],
    hint: '(x - 2)(x - 3) = 0'
  },
  {
    difficulty: 'intermediate',
    title: 'Probability of Marble',
    description: 'A bag contains 4 red, 6 green, and 10 blue marbles. What is probability of picking green?',
    options: ['0.2', '0.3', '0.4', '0.5'],
    correctAnswer: '0.3',
    tags: ['probability'],
    hint: '6 / 20 = 0.3'
  },
  {
    difficulty: 'intermediate',
    title: 'Pythagorean Hypotenuse',
    description: 'A right-angled triangle has legs of length 9 cm and 12 cm. What is the hypotenuse?',
    options: ['13 cm', '14 cm', '15 cm', '18 cm'],
    correctAnswer: '15 cm',
    tags: ['geometry'],
    hint: '√(81 + 144) = √225 = 15'
  },
  {
    difficulty: 'intermediate',
    title: 'Arithmetic Progression Nth Term',
    description: 'In an AP: 4, 9, 14, 19... what is the 12th term?',
    options: ['54', '59', '64', '69'],
    correctAnswer: '59',
    tags: ['sequences'],
    hint: 'a + (n-1)d = 4 + 11(5) = 59'
  },
  {
    difficulty: 'intermediate',
    title: 'Lowest Common Multiple',
    description: 'What is the LCM of 14 and 21?',
    options: ['28', '42', '63', '84'],
    correctAnswer: '42',
    tags: ['number-theory'],
    hint: '14 = 2×7, 21 = 3×7, LCM = 2×3×7 = 42'
  },
  {
    difficulty: 'intermediate',
    title: 'Logarithm Value',
    description: 'What is log₂(128)?',
    options: ['6', '7', '8', '9'],
    correctAnswer: '7',
    tags: ['algebra'],
    hint: '2^7 = 128'
  },
  {
    difficulty: 'intermediate',
    title: 'Compound Interest Amount',
    description: '$1000 is invested at 10% annual interest compounded annually for 2 years. What is total amount?',
    options: ['$1,200', '$1,210', '$1,220', '$1,250'],
    correctAnswer: '$1,210',
    tags: ['finance'],
    hint: '1000 × (1.1)² = 1000 × 1.21'
  },
  {
    difficulty: 'intermediate',
    title: 'System of Linear Equations',
    description: 'If 2x + y = 11 and x - y = 1, what is the value of x?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
    tags: ['algebra'],
    hint: 'Add equations: 3x = 12 → x = 4'
  },
  {
    difficulty: 'intermediate',
    title: 'Geometric Sequence Term',
    description: 'In a GP: 3, 6, 12, 24... what is the 7th term?',
    options: ['96', '144', '192', '384'],
    correctAnswer: '192',
    tags: ['sequences'],
    hint: 'a × r^6 = 3 × 2^6 = 3 × 64 = 192'
  },
  {
    difficulty: 'intermediate',
    title: 'Area of Trapezoid',
    description: 'A trapezoid has parallel bases 10 cm and 16 cm and height 5 cm. What is its area?',
    options: ['52 cm²', '65 cm²', '78 cm²', '130 cm²'],
    correctAnswer: '65 cm²',
    tags: ['geometry'],
    hint: '((10 + 16) / 2) × 5 = 13 × 5 = 65'
  },
  {
    difficulty: 'intermediate',
    title: 'Combinations Calculation',
    description: 'Calculate 7C3 (number of combinations of 7 items taken 3 at a time).',
    options: ['21', '35', '42', '56'],
    correctAnswer: '35',
    tags: ['combinatorics'],
    hint: '(7 × 6 × 5) / (3 × 2 × 1) = 35'
  },
  {
    difficulty: 'intermediate',
    title: 'Sum of Angles in Polygon',
    description: 'What is the sum of interior angles of a hexagon (6 sides)?',
    options: ['540°', '720°', '900°', '1080°'],
    correctAnswer: '720°',
    tags: ['geometry'],
    hint: '(6 - 2) × 180° = 4 × 180° = 720°'
  },
  {
    difficulty: 'intermediate',
    title: 'Slope of Line',
    description: 'Find slope of line passing through points (2, 3) and (6, 11).',
    options: ['1', '2', '3', '4'],
    correctAnswer: '2',
    tags: ['coordinate-geometry'],
    hint: '(11 - 3) / (6 - 2) = 8 / 4 = 2'
  },
  {
    difficulty: 'intermediate',
    title: 'Distance Between Points',
    description: 'Find distance between (1, 2) and (4, 6).',
    options: ['3', '4', '5', '6'],
    correctAnswer: '5',
    tags: ['coordinate-geometry'],
    hint: '√((4-1)² + (6-2)²) = √(9+16) = 5'
  },
  {
    difficulty: 'intermediate',
    title: 'Trigonometry Tangent 45',
    description: 'What is the value of tan(45°)?',
    options: ['0', '0.5', '1', '√3'],
    correctAnswer: '1',
    tags: ['trigonometry'],
    hint: 'sin(45°)/cos(45°) = 1'
  },
  {
    difficulty: 'intermediate',
    title: 'Difference of Two Squares',
    description: 'Evaluate 105² - 95² using algebraic identity.',
    options: ['1,000', '1,800', '2,000', '2,400'],
    correctAnswer: '2,000',
    tags: ['algebra'],
    hint: '(105 - 95)(105 + 95) = 10 × 200 = 2000'
  },
  {
    difficulty: 'intermediate',
    title: 'Cylinder Surface Area',
    description: 'A cylinder has radius 7 and height 10. What is its curved surface area? (π ≈ 22/7)',
    options: ['220', '440', '660', '880'],
    correctAnswer: '440',
    tags: ['geometry'],
    hint: '2πrh = 2 × (22/7) × 7 × 10 = 440'
  },
  {
    difficulty: 'intermediate',
    title: 'Absolute Value Equation',
    description: 'How many solutions exist for |2x - 5| = -3?',
    options: ['0', '1', '2', 'Infinitely many'],
    correctAnswer: '0',
    tags: ['algebra'],
    hint: 'Absolute value can never be negative'
  },
  {
    difficulty: 'intermediate',
    title: 'HCF Greatest Common Divisor',
    description: 'Find the HCF of 48 and 72.',
    options: ['12', '16', '24', '36'],
    correctAnswer: '24',
    tags: ['number-theory'],
    hint: 'Largest integer dividing both 48 and 72 is 24'
  },
  {
    difficulty: 'intermediate',
    title: 'Two Dice Sum of 7',
    description: 'What is the probability of rolling a sum of 7 with two fair 6-sided dice?',
    options: ['1/6', '1/12', '5/36', '7/36'],
    correctAnswer: '1/6',
    tags: ['probability'],
    hint: '6 favorable outcomes out of 36: (1,6),(2,5),(3,4)...'
  },

  // Advanced (15)
  {
    difficulty: 'advanced',
    title: 'Permutations Word Arrange',
    description: 'How many unique arrangements can be made with the letters in the word "LEVEL"?',
    options: ['30', '60', '120', '20'],
    correctAnswer: '30',
    tags: ['combinatorics'],
    hint: '5! / (2! × 2!) = 120 / 4 = 30'
  },
  {
    difficulty: 'advanced',
    title: 'Trigonometric Identity Addition',
    description: 'What is the value of sin(30°)cos(60°) + cos(30°)sin(60°)?',
    options: ['0', '0.5', '1', '√3/2'],
    correctAnswer: '1',
    tags: ['trigonometry'],
    hint: 'sin(30°+60°) = sin(90°) = 1'
  },
  {
    difficulty: 'advanced',
    title: 'Binomial Expansion Term',
    description: 'What is the coefficient of x³ in the expansion of (1 + 2x)⁵?',
    options: ['40', '80', '120', '160'],
    correctAnswer: '80',
    tags: ['algebra'],
    hint: '5C3 × (2x)³ = 10 × 8 = 80'
  },
  {
    difficulty: 'advanced',
    title: 'Matrix 2x2 Determinant',
    description: 'Find determinant of matrix [[4, 7], [2, 6]].',
    options: ['8', '10', '12', '14'],
    correctAnswer: '10',
    tags: ['linear-algebra'],
    hint: '4×6 - 7×2 = 24 - 14 = 10'
  },
  {
    difficulty: 'advanced',
    title: 'Infinite Geometric Series',
    description: 'Find sum of infinite series: 8 + 4 + 2 + 1 + ...',
    options: ['14', '15', '16', '18'],
    correctAnswer: '16',
    tags: ['series'],
    hint: 'a / (1 - r) = 8 / (1 - 0.5) = 16'
  },
  {
    difficulty: 'advanced',
    title: 'Limit at Zero',
    description: 'Evaluate lim(x→0) [sin(3x) / x].',
    options: ['0', '1', '3', 'Undefined'],
    correctAnswer: '3',
    tags: ['calculus'],
    hint: 'Standard limit rule: 3 × (sin(3x)/(3x)) → 3'
  },
  {
    difficulty: 'advanced',
    title: 'Variance from Standard Deviation',
    description: 'If standard deviation of dataset is 4.5, what is variance?',
    options: ['9.0', '18.25', '20.25', '22.5'],
    correctAnswer: '20.25',
    tags: ['statistics'],
    hint: 'Variance = (SD)² = 4.5² = 20.25'
  },
  {
    difficulty: 'advanced',
    title: 'Circle Tangent Length',
    description: 'A tangent of length 12 is drawn from external point P to a circle with radius 5. What is distance from P to circle center?',
    options: ['13', '15', '17', '10'],
    correctAnswer: '13',
    tags: ['geometry'],
    hint: '√(12² + 5²) = √(144 + 25) = 13'
  },
  {
    difficulty: 'advanced',
    title: 'Logarithm Base Change',
    description: 'If log₁₀(2) ≈ 0.301, what is log₁₀(5)?',
    options: ['0.499', '0.699', '0.701', '0.500'],
    correctAnswer: '0.699',
    tags: ['algebra'],
    hint: 'log₁₀(10/2) = 1 - 0.301 = 0.699'
  },
  {
    difficulty: 'advanced',
    title: 'Complex Number Modulus',
    description: 'Find modulus of complex number z = 3 - 4i.',
    options: ['3', '4', '5', '7'],
    correctAnswer: '5',
    tags: ['complex-numbers'],
    hint: '√(3² + (-4)²) = 5'
  },
  {
    difficulty: 'advanced',
    title: 'Derivative Power Rule',
    description: 'What is the first derivative of f(x) = 4x³ - 5x² + 7x - 9?',
    options: ['12x² - 10x + 7', '12x² - 5x + 7', '4x² - 10x + 7', '12x³ - 10x² + 7'],
    correctAnswer: '12x² - 10x + 7',
    tags: ['calculus'],
    hint: 'd/dx(ax^n) = a·n·x^(n-1)'
  },
  {
    difficulty: 'advanced',
    title: 'Definite Integral of Monomial',
    description: 'Evaluate ∫(3x²)dx from x = 1 to x = 3.',
    options: ['24', '26', '28', '30'],
    correctAnswer: '26',
    tags: ['calculus'],
    hint: '[x³] from 1 to 3 = 27 - 1 = 26'
  },
  {
    difficulty: 'advanced',
    title: 'Dot Product of Vectors',
    description: 'Given vectors A = (2, 3) and B = (4, -1), find A · B.',
    options: ['5', '6', '7', '8'],
    correctAnswer: '5',
    tags: ['vectors'],
    hint: '2(4) + 3(-1) = 8 - 3 = 5'
  },
  {
    difficulty: 'advanced',
    title: 'Conic Section Eccentricity',
    description: 'What is the eccentricity e of a parabola?',
    options: ['e = 0', '0 < e < 1', 'e = 1', 'e > 1'],
    correctAnswer: 'e = 1',
    tags: ['geometry'],
    hint: 'Parabola has eccentricity exactly equal to 1'
  },
  {
    difficulty: 'advanced',
    title: 'Euler Polyhedron Formula',
    description: 'For a convex polyhedron with 12 vertices and 20 faces, how many edges does it have?',
    options: ['28', '30', '32', '34'],
    correctAnswer: '30',
    tags: ['geometry'],
    hint: 'V - E + F = 2 → 12 - E + 20 = 2 → E = 30'
  },

  // Expert (15)
  {
    difficulty: 'expert',
    title: 'Chain Rule Derivative',
    description: 'Find derivative of f(x) = sin(x²).',
    options: ['cos(x²)', '2x cos(x²)', '-2x cos(x²)', '2x sin(x²)'],
    correctAnswer: '2x cos(x²)',
    tags: ['calculus'],
    hint: 'f’(g(x)) · g’(x)'
  },
  {
    difficulty: 'expert',
    title: 'Integration by Parts',
    description: 'Evaluate ∫(x · e^x) dx.',
    options: ['x e^x - e^x + C', 'x e^x + e^x + C', 'e^x + C', 'x² e^x + C'],
    correctAnswer: 'x e^x - e^x + C',
    tags: ['calculus'],
    hint: 'u = x, dv = e^x dx'
  },
  {
    difficulty: 'expert',
    title: 'Matrix Eigenvalues 2x2',
    description: 'Find eigenvalues of matrix [[5, 2], [2, 5]].',
    options: ['3 and 7', '2 and 5', '4 and 6', '1 and 9'],
    correctAnswer: '3 and 7',
    tags: ['linear-algebra'],
    hint: '(5-λ)² - 4 = 0 → (5-λ) = ±2 → λ = 7, 3'
  },
  {
    difficulty: 'expert',
    title: 'Bayes Theorem Calculation',
    description: 'Disease has 1% prevalence. Test is 99% accurate (true pos and true neg). Given positive test, probability of disease?',
    options: ['50%', '99%', '90%', '1%'],
    correctAnswer: '50%',
    tags: ['probability'],
    hint: '(0.99 × 0.01) / (0.99 × 0.01 + 0.01 × 0.99) = 0.50'
  },
  {
    difficulty: 'expert',
    title: 'Taylor Series Expansion of e^x',
    description: 'What is the coefficient of x⁴ in Maclaurin series of e^(2x)?',
    options: ['2/3', '4/3', '1/24', '16/24'],
    correctAnswer: '2/3',
    tags: ['analysis'],
    hint: '(2x)⁴ / 4! = 16/24 = 2/3'
  },
  {
    difficulty: 'expert',
    title: 'Vector Cross Product Magnitude',
    description: 'Find magnitude of cross product of A = (1, 0, 0) and B = (0, 1, 0).',
    options: ['0', '1', '√2', '2'],
    correctAnswer: '1',
    tags: ['vectors'],
    hint: 'i × j = k, magnitude is 1'
  },
  {
    difficulty: 'expert',
    title: 'First Order Differential Equation',
    description: 'Solve dy/dx = 2y with y(0) = 3.',
    options: ['y = 3e^(2x)', 'y = 2e^(3x)', 'y = 3 + 2x', 'y = e^(2x) + 2'],
    correctAnswer: 'y = 3e^(2x)',
    tags: ['differential-equations'],
    hint: 'Separable: dy/y = 2 dx → ln|y| = 2x + C'
  },
  {
    difficulty: 'expert',
    title: 'L Hospital Rule Indeterminate',
    description: 'Evaluate lim(x→0) [(e^x - 1 - x) / x²].',
    options: ['0', '1/2', '1', '∞'],
    correctAnswer: '1/2',
    tags: ['calculus'],
    hint: 'Apply L’Hopital twice: e^x / 2 → 1/2'
  },
  {
    difficulty: 'expert',
    title: 'Poisson Distribution Variance',
    description: 'For a Poisson distribution with mean λ = 9, what is standard deviation?',
    options: ['3', '4.5', '9', '81'],
    correctAnswer: '3',
    tags: ['probability'],
    hint: 'Variance = λ = 9, SD = √9 = 3'
  },
  {
    difficulty: 'expert',
    title: 'Plane Normal Vector',
    description: 'What is normal vector to plane 3x - 4y + 5z = 12?',
    options: ['(3, -4, 5)', '(3, 4, 5)', '(-3, 4, -5)', '(12, 12, 12)'],
    correctAnswer: '(3, -4, 5)',
    tags: ['geometry'],
    hint: 'Coefficients of x, y, z'
  },
  {
    difficulty: 'expert',
    title: 'De Moivres Formula Application',
    description: 'Compute (cos(π/4) + i sin(π/4))^4.',
    options: ['1', '-1', 'i', '-i'],
    correctAnswer: '-1',
    tags: ['complex-numbers'],
    hint: 'cos(π) + i sin(π) = -1'
  },
  {
    difficulty: 'expert',
    title: 'Newton Raphson Method',
    description: 'In Newton-Raphson method for f(x) = x² - 2 starting at x₀ = 2, what is x₁?',
    options: ['1.25', '1.5', '1.75', '1.414'],
    correctAnswer: '1.5',
    tags: ['numerical-methods'],
    hint: 'x₁ = 2 - f(2)/f’(2) = 2 - 2/4 = 1.5'
  },
  {
    difficulty: 'expert',
    title: 'Characteristic Polynomial',
    description: 'What is trace of matrix [[2, 1, 3], [0, 4, 5], [1, 2, -1]]?',
    options: ['4', '5', '6', '7'],
    correctAnswer: '5',
    tags: ['linear-algebra'],
    hint: 'Sum of diagonal: 2 + 4 + (-1) = 5'
  },
  {
    difficulty: 'expert',
    title: 'Binomial Distribution Variance',
    description: 'In 100 coin tosses with p = 0.5, what is the variance of heads?',
    options: ['50', '25', '5', '10'],
    correctAnswer: '25',
    tags: ['probability'],
    hint: 'n × p × (1 - p) = 100 × 0.5 × 0.5 = 25'
  },
  {
    difficulty: 'expert',
    title: 'Divergence of Vector Field',
    description: 'Find div F where F = (x², y², z²).',
    options: ['2x + 2y + 2z', 'x + y + z', '2(x² + y² + z²)', '0'],
    correctAnswer: '2x + 2y + 2z',
    tags: ['calculus'],
    hint: '∂Fx/∂x + ∂Fy/∂y + ∂Fz/∂z'
  },

  // Master (10)
  {
    difficulty: 'master',
    title: 'Double Integral Over Unit Square',
    description: 'Evaluate ∫∫ (x + y) dx dy over [0,1] × [0,1].',
    options: ['0.5', '1', '1.5', '2'],
    correctAnswer: '1',
    tags: ['multivariable-calculus'],
    hint: '∫(x + 1/2) dx = 1/2 + 1/2 = 1'
  },
  {
    difficulty: 'master',
    title: 'Curl of Gradient Field',
    description: 'What is curl(grad φ) for any twice continuously differentiable scalar field φ?',
    options: ['Always 0', 'Laplacian φ', 'grad(div φ)', 'Depends on boundary'],
    correctAnswer: 'Always 0',
    tags: ['vector-calculus'],
    hint: 'The curl of any gradient field is identically zero'
  },
  {
    difficulty: 'master',
    title: 'Singular Value Decomposition Dimension',
    description: 'If A is m × n matrix, what are dimensions of singular value matrix Σ?',
    options: ['m × n', 'm × m', 'n × n', 'min(m,n) × max(m,n)'],
    correctAnswer: 'm × n',
    tags: ['linear-algebra'],
    hint: 'A = U Σ V^T, Σ matches dimension of A'
  },
  {
    difficulty: 'master',
    title: 'Second Order ODE Characteristic Roots',
    description: 'Find general solution form for y’’ - 4y’ + 4y = 0.',
    options: ['(C₁ + C₂x)e^(2x)', 'C₁e^(2x) + C₂e^(-2x)', 'C₁cos(2x) + C₂sin(2x)', 'C₁e^(4x) + C₂'],
    correctAnswer: '(C₁ + C₂x)e^(2x)',
    tags: ['differential-equations'],
    hint: 'Repeated root r = 2 of characteristic equation (r - 2)² = 0'
  },
  {
    difficulty: 'master',
    title: 'Residue Theorem Simple Pole',
    description: 'Find residue of f(z) = 1/(z² + 1) at z = i.',
    options: ['1/(2i)', '-1/(2i)', '1', '0'],
    correctAnswer: '1/(2i)',
    tags: ['complex-analysis'],
    hint: 'lim(z→i) (z - i)/(z² + 1) = 1/(2i)'
  },
  {
    difficulty: 'master',
    title: 'Cauchy-Schwarz Inequality Boundary',
    description: 'Under what condition does equality hold in Cauchy-Schwarz |⟨u, v⟩| ≤ ‖u‖ ‖v‖?',
    options: ['When u and v are linearly dependent', 'When u and v are orthogonal', 'When ‖u‖ = ‖v‖', 'When u · v = 0'],
    correctAnswer: 'When u and v are linearly dependent',
    tags: ['linear-algebra'],
    hint: 'Equality occurs if and only if one vector is a scalar multiple of the other'
  },
  {
    difficulty: 'master',
    title: 'Markov Chain Stationary Distribution',
    description: 'For transition matrix [[0.7, 0.3], [0.4, 0.6]], what is stationary probability of state 1?',
    options: ['4/7', '3/7', '1/2', '7/10'],
    correctAnswer: '4/7',
    tags: ['stochastic-processes'],
    hint: 'π₁ = 0.4/(0.3 + 0.4) = 4/7'
  },
  {
    difficulty: 'master',
    title: 'Laplace Transform of t',
    description: 'What is the Laplace transform L{t} for s > 0?',
    options: ['1/s', '1/s²', '2/s²', 's/1'],
    correctAnswer: '1/s²',
    tags: ['transforms'],
    hint: '∫ t e^(-st) dt = 1/s²'
  },
  {
    difficulty: 'master',
    title: 'Gamma Function Integer Value',
    description: 'What is Γ(5)?',
    options: ['12', '24', '120', '720'],
    correctAnswer: '24',
    tags: ['special-functions'],
    hint: 'Γ(n) = (n - 1)! → 4! = 24'
  },
  {
    difficulty: 'master',
    title: 'Gram-Schmidt Orthogonalization Basis',
    description: 'What is purpose of Gram-Schmidt process?',
    options: ['Convert basis into orthonormal basis', 'Find eigenvalues', 'Solve non-linear equations', 'Invert singular matrices'],
    correctAnswer: 'Convert basis into orthonormal basis',
    tags: ['linear-algebra'],
    hint: 'Produces an orthogonal or orthonormal set from linearly independent vectors'
  },

  // Grandmaster (10)
  {
    difficulty: 'grandmaster',
    title: 'Riemann Zeta Function Trivial Zeros',
    description: 'Where are the trivial zeros of the Riemann zeta function ζ(s) located?',
    options: ['Negative even integers: -2, -4, -6...', 'Negative odd integers: -1, -3, -5...', 'Real line Re(s) = 1/2', 'Positive primes'],
    correctAnswer: 'Negative even integers: -2, -4, -6...',
    tags: ['analytic-number-theory'],
    hint: 'ζ(s) = 0 for s = -2n (n ∈ N)'
  },
  {
    difficulty: 'grandmaster',
    title: 'Fourier Transform of Gaussian',
    description: 'What is the Fourier transform of a Gaussian function f(x) = e^(-a x²)?',
    options: ['Another Gaussian function', 'A Cauchy-Lorentz distribution', 'A Dirac delta pulse', 'A sinc function'],
    correctAnswer: 'Another Gaussian function',
    tags: ['fourier-analysis'],
    hint: 'The Gaussian is an eigenfunction of the Fourier transform'
  },
  {
    difficulty: 'grandmaster',
    title: 'Euler-Lagrange Equation Variational',
    description: 'In calculus of variations, Euler-Lagrange equation for L(x, y, y’) is:',
    options: ['∂L/∂y - d/dx(∂L/∂y’) = 0', '∂L/∂y + d/dx(∂L/∂y’) = 0', 'd²L/dx² = 0', '∂L/∂x - d/dy(∂L/∂y’) = 0'],
    correctAnswer: '∂L/∂y - d/dx(∂L/∂y’) = 0',
    tags: ['calculus-of-variations'],
    hint: 'Fundamental stationary action condition'
  },
  {
    difficulty: 'grandmaster',
    title: 'Poincare Conjecture Dimension',
    description: 'The Poincaré conjecture proved by Perelman characterizes which manifolds?',
    options: ['Simply connected closed 3-manifolds as 3-spheres', '4-dimensional Calabi-Yau spaces', 'Complex 2-tori', 'Non-orientable Klein bottles'],
    correctAnswer: 'Simply connected closed 3-manifolds as 3-spheres',
    tags: ['differential-topology'],
    hint: 'Every simply connected, closed 3-manifold is homeomorphic to the 3-sphere'
  },
  {
    difficulty: 'grandmaster',
    title: 'Contour Integral of 1/z',
    description: 'Evaluate ∮ (1/z) dz counter-clockwise along unit circle |z| = 1.',
    options: ['0', 'π', '2πi', '4πi'],
    correctAnswer: '2πi',
    tags: ['complex-analysis'],
    hint: '2πi × Residue at 0 = 2πi(1) = 2πi'
  },
  {
    difficulty: 'grandmaster',
    title: 'Frobenius Theorem Lie Algebras',
    description: 'Frobenius theorem gives necessary and sufficient conditions for:',
    options: ['Integrability of subbundles / distributions', 'Solvability of polynomial equations', 'Convergence of Fourier series', 'Finiteness of groups'],
    correctAnswer: 'Integrability of subbundles / distributions',
    tags: ['differential-geometry'],
    hint: 'Involutive distributions are completely integrable'
  },
  {
    difficulty: 'grandmaster',
    title: 'Noether Theorem Invariance',
    description: 'According to Noether’s theorem, continuous time translation symmetry leads to conservation of:',
    options: ['Energy', 'Linear momentum', 'Angular momentum', 'Electric charge'],
    correctAnswer: 'Energy',
    tags: ['mathematical-physics'],
    hint: 'Time invariance yields energy conservation'
  },
  {
    difficulty: 'grandmaster',
    title: 'Spectral Theorem for Normal Operators',
    description: 'Every bounded normal operator on Hilbert space can be represented as:',
    options: ['Integral with respect to spectral measure', 'Finite sum of projections', 'Strict upper triangular matrix', 'Nilpotent operator'],
    correctAnswer: 'Integral with respect to spectral measure',
    tags: ['functional-analysis'],
    hint: 'Spectral decomposition theorem for Hilbert spaces'
  },
  {
    difficulty: 'grandmaster',
    title: 'Banach Fixed Point Contraction Mapping',
    description: 'If T: X → X is a contraction mapping on a complete metric space X, how many fixed points does T possess?',
    options: ['Exactly one unique fixed point', 'At least two fixed points', 'Infinitely many', 'Zero if boundary is open'],
    correctAnswer: 'Exactly one unique fixed point',
    tags: ['topology'],
    hint: 'Banach contraction theorem guarantees existence and uniqueness'
  },
  {
    difficulty: 'grandmaster',
    title: 'Navier-Stokes Clay Millenium Dimension',
    description: 'The Clay Millennium Problem for Navier-Stokes equations asks about smooth solutions in:',
    options: ['3-dimensional space', '2-dimensional space', '4-dimensional spacetime', '1-dimensional channel'],
    correctAnswer: '3-dimensional space',
    tags: ['pde'],
    hint: 'Existence and smoothness of Navier-Stokes in 3D is an open Millennium problem'
  }
];
