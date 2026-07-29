"""
Prediction Question Generator — Zero AI Dependency.

Generates unlimited unique pattern recognition and sequence prediction
questions using pure Python algorithms. NEVER calls OpenAI.

Supports 16+ pattern types:
- Number Series, Geometric, Fibonacci, Missing Number
- Prime, Odd/Even, Binary, Hexadecimal, Roman Numeral
- Alphabet, Mirror, Clock, Dice, Probability
- Coding Pattern, Random Logic
"""

import math
import random
import string
from typing import Optional

from generators.base import BaseGenerator
from models.question import QuestionModel, Difficulty, QuestionType, GameMode
from utils.helpers import generate_id, calculate_xp, calculate_coins, calculate_time_limit


class PredictionGenerator(BaseGenerator):
    """
    Pure Python prediction/pattern question generator.

    Every method auto-calculates:
    - correct_answer
    - explanation
    - distractor options
    """

    @property
    def mode(self) -> str:
        return GameMode.PREDICTION.value

    # ── Pattern type registry ─────────────────────────────────
    PATTERN_TYPES: list[str] = [
        "arithmetic_series",
        "geometric_series",
        "fibonacci_variant",
        "missing_number",
        "prime_number",
        "odd_even",
        "binary",
        "hexadecimal",
        "roman_numeral",
        "alphabet",
        "mirror",
        "clock",
        "dice",
        "probability",
        "coding_pattern",
        "square_cube",
    ]

    def generate(
        self,
        difficulty: Difficulty,
        count: int = 10,
        topic: str | None = None,
        exclude_ids: set[str] | None = None,
    ) -> list[QuestionModel]:
        exclude = set(exclude_ids) if exclude_ids else set()
        questions: list[QuestionModel] = []
        attempts = 0
        max_attempts = count * 5  # Prevent infinite loop

        while len(questions) < count and attempts < max_attempts:
            attempts += 1

            # Pick a random pattern type (or use topic if specified)
            if topic and topic in self.PATTERN_TYPES:
                pattern_type = topic
            else:
                pattern_type = random.choice(self.PATTERN_TYPES)

            q = self._dispatch(pattern_type, difficulty)

            if q and q.id not in exclude:
                exclude.add(q.id)
                questions.append(q)

        return questions

    def _dispatch(self, pattern_type: str, difficulty: Difficulty) -> Optional[QuestionModel]:
        """Route to the appropriate generator method."""
        generators = {
            "arithmetic_series": self._gen_arithmetic,
            "geometric_series": self._gen_geometric,
            "fibonacci_variant": self._gen_fibonacci,
            "missing_number": self._gen_missing_number,
            "prime_number": self._gen_prime,
            "odd_even": self._gen_odd_even,
            "binary": self._gen_binary,
            "hexadecimal": self._gen_hexadecimal,
            "roman_numeral": self._gen_roman,
            "alphabet": self._gen_alphabet,
            "mirror": self._gen_mirror,
            "clock": self._gen_clock,
            "dice": self._gen_dice,
            "probability": self._gen_probability,
            "coding_pattern": self._gen_coding_pattern,
            "square_cube": self._gen_square_cube,
        }
        gen_fn = generators.get(pattern_type)
        if gen_fn:
            return gen_fn(difficulty)
        return None

    # ── Helper: Build question ────────────────────────────────
    def _build_question(
        self,
        question_text: str,
        correct: str,
        explanation: str,
        hint: str,
        difficulty: Difficulty,
        topic: str,
        tags: list[str],
        options: list[str] | None = None,
        sequence: list[int | float] | None = None,
    ) -> QuestionModel:
        """Construct a QuestionModel with auto-generated distractors if needed."""
        if options is None:
            options = self._generate_numeric_distractors(correct)

        # Ensure correct answer is in options
        if correct not in options:
            options[random.randint(0, len(options) - 1)] = correct

        random.shuffle(options)

        return QuestionModel(
            id=generate_id("pred"),
            mode=GameMode.PREDICTION,
            difficulty=difficulty,
            topic=topic,
            question=question_text,
            question_type=QuestionType.PATTERN_RECOGNITION,
            options=options,
            correct_answer=correct,
            explanation=explanation,
            hint=hint,
            time_limit=calculate_time_limit(difficulty.value),
            xp=calculate_xp(difficulty.value),
            coins=calculate_coins(difficulty.value),
            tags=["prediction"] + tags,
            sequence=sequence,
        )

    def _generate_numeric_distractors(self, correct: str) -> list[str]:
        """Generate 3 plausible wrong answers near the correct numeric answer."""
        try:
            val = int(correct)
        except (ValueError, TypeError):
            try:
                val = float(correct)
                offsets = [
                    round(val + random.uniform(1, 5), 2),
                    round(val - random.uniform(1, 5), 2),
                    round(val + random.uniform(5, 10), 2),
                ]
                return [correct] + [str(o) for o in offsets]
            except (ValueError, TypeError):
                return [correct, "A", "B", "C"]

        spread = max(2, abs(val) // 4 + 1)
        distractors: set[str] = set()
        while len(distractors) < 3:
            d = val + random.randint(-spread, spread)
            if d != val:
                distractors.add(str(d))
            spread += 1  # widen if stuck
        return [correct] + list(distractors)

    # ══════════════════════════════════════════════════════════
    # GENERATOR METHODS
    # ══════════════════════════════════════════════════════════

    def _gen_arithmetic(self, difficulty: Difficulty) -> QuestionModel:
        """Arithmetic progression: a, a+d, a+2d, ..., ?"""
        ranges = {
            Difficulty.BEGINNER: (1, 20, 1, 5),
            Difficulty.INTERMEDIATE: (10, 100, 3, 15),
            Difficulty.ADVANCED: (-50, 200, 5, 30),
        }
        a_min, a_max, d_min, d_max = ranges.get(difficulty, (1, 20, 1, 5))

        a = random.randint(a_min, a_max)
        d = random.randint(d_min, d_max) * random.choice([1, -1])
        length = random.randint(4, 6)

        seq = [a + i * d for i in range(length)]
        answer = a + length * d

        displayed = ", ".join(str(x) for x in seq)
        return self._build_question(
            question_text=f"What comes next in the sequence: {displayed}, ?",
            correct=str(answer),
            explanation=f"This is an arithmetic progression with first term {a} and common difference {d}. Each term increases by {d}. The next term is {seq[-1]} + {d} = {answer}.",
            hint=f"Look at the difference between consecutive terms.",
            difficulty=difficulty,
            topic="arithmetic_series",
            tags=["arithmetic", "sequence"],
            sequence=seq,
        )

    def _gen_geometric(self, difficulty: Difficulty) -> QuestionModel:
        """Geometric progression: a, a*r, a*r², ..., ?"""
        ranges = {
            Difficulty.BEGINNER: (1, 5, 2, 3),
            Difficulty.INTERMEDIATE: (2, 10, 2, 5),
            Difficulty.ADVANCED: (1, 20, 2, 7),
        }
        a_min, a_max, r_min, r_max = ranges.get(difficulty, (1, 5, 2, 3))

        a = random.randint(a_min, a_max)
        r = random.randint(r_min, r_max)
        length = random.randint(4, 5)

        seq = [a * (r ** i) for i in range(length)]
        answer = a * (r ** length)

        displayed = ", ".join(str(x) for x in seq)
        return self._build_question(
            question_text=f"Find the next number: {displayed}, ?",
            correct=str(answer),
            explanation=f"This is a geometric progression with first term {a} and ratio {r}. Each term is multiplied by {r}. Next: {seq[-1]} × {r} = {answer}.",
            hint=f"Try dividing each term by the previous one.",
            difficulty=difficulty,
            topic="geometric_series",
            tags=["geometric", "sequence"],
            sequence=seq,
        )

    def _gen_fibonacci(self, difficulty: Difficulty) -> QuestionModel:
        """Fibonacci-like: each term is sum of previous two."""
        a = random.randint(1, 5) if difficulty == Difficulty.BEGINNER else random.randint(2, 15)
        b = random.randint(a, a + 5)
        length = random.randint(5, 7)

        seq = [a, b]
        for _ in range(length - 2):
            seq.append(seq[-1] + seq[-2])
        answer = seq[-1] + seq[-2]

        displayed = ", ".join(str(x) for x in seq)
        return self._build_question(
            question_text=f"Each number is the sum of the two before it: {displayed}, ?",
            correct=str(answer),
            explanation=f"Fibonacci-like sequence: each term = sum of previous two. {seq[-2]} + {seq[-1]} = {answer}.",
            hint="Add the last two numbers together.",
            difficulty=difficulty,
            topic="fibonacci_variant",
            tags=["fibonacci", "sequence"],
            sequence=seq,
        )

    def _gen_missing_number(self, difficulty: Difficulty) -> QuestionModel:
        """Sequence with a missing number in the middle."""
        d = random.randint(2, 6) if difficulty == Difficulty.BEGINNER else random.randint(3, 15)
        start = random.randint(1, 30)
        length = random.randint(5, 7)

        seq = [start + i * d for i in range(length)]
        missing_idx = random.randint(1, length - 2)
        answer = seq[missing_idx]

        display_seq = seq.copy()
        display_seq[missing_idx] = "?"  # type: ignore
        displayed = ", ".join(str(x) for x in display_seq)

        return self._build_question(
            question_text=f"Find the missing number: {displayed}",
            correct=str(answer),
            explanation=f"The sequence increases by {d} each step. The missing value at position {missing_idx + 1} is {answer}.",
            hint="Find the common difference between known terms.",
            difficulty=difficulty,
            topic="missing_number",
            tags=["missing", "pattern"],
            sequence=[x for x in seq if x != answer],
        )

    def _gen_prime(self, difficulty: Difficulty) -> QuestionModel:
        """Questions about prime numbers."""
        def is_prime(n: int) -> bool:
            if n < 2:
                return False
            for i in range(2, int(math.sqrt(n)) + 1):
                if n % i == 0:
                    return False
            return True

        def nth_prime(n: int) -> int:
            count, num = 0, 1
            while count < n:
                num += 1
                if is_prime(num):
                    count += 1
            return num

        if difficulty == Difficulty.BEGINNER:
            start = random.randint(2, 8)
        elif difficulty == Difficulty.INTERMEDIATE:
            start = random.randint(5, 15)
        else:
            start = random.randint(10, 25)

        primes = [nth_prime(start + i) for i in range(5)]
        answer = nth_prime(start + 5)

        displayed = ", ".join(str(p) for p in primes)
        return self._build_question(
            question_text=f"What is the next prime number after: {displayed}, ?",
            correct=str(answer),
            explanation=f"These are consecutive prime numbers. The next prime after {primes[-1]} is {answer}.",
            hint="Check divisibility to find the next number that has no divisors other than 1 and itself.",
            difficulty=difficulty,
            topic="prime_number",
            tags=["prime", "number_theory"],
            sequence=primes,
        )

    def _gen_odd_even(self, difficulty: Difficulty) -> QuestionModel:
        """Odd/even pattern sequences."""
        variant = random.choice(["odd", "even", "alternating"])

        if variant == "odd":
            start = random.choice(range(1, 20, 2))
            step = 2 * random.randint(1, 3) if difficulty != Difficulty.BEGINNER else 2
            seq = [start + i * step for i in range(5)]
            answer = start + 5 * step
            desc = f"odd numbers with step {step}"
        elif variant == "even":
            start = random.choice(range(2, 20, 2))
            step = 2 * random.randint(1, 3) if difficulty != Difficulty.BEGINNER else 2
            seq = [start + i * step for i in range(5)]
            answer = start + 5 * step
            desc = f"even numbers with step {step}"
        else:
            start = random.randint(1, 10)
            seq = [start + i for i in range(6)]
            # Ask which type the 7th term is
            answer_val = start + 6
            answer = "odd" if answer_val % 2 != 0 else "even"
            displayed = ", ".join(str(x) for x in seq)
            return self._build_question(
                question_text=f"In the sequence {displayed}, ..., is the next number odd or even?",
                correct=answer,
                explanation=f"The next number is {answer_val}, which is {answer}.",
                hint="Check if the pattern alternates between odd and even.",
                difficulty=difficulty,
                topic="odd_even",
                tags=["odd_even", "pattern"],
                options=["odd", "even", str(answer_val), str(answer_val + 1)],
                sequence=seq,
            )

        displayed = ", ".join(str(x) for x in seq)
        return self._build_question(
            question_text=f"Continue the pattern of {desc}: {displayed}, ?",
            correct=str(answer),
            explanation=f"This sequence lists {desc}. Next term: {seq[-1]} + {step} = {answer}.",
            hint=f"These are all {variant} numbers. What's the step?",
            difficulty=difficulty,
            topic="odd_even",
            tags=["odd_even", "pattern"],
            sequence=seq,
        )

    def _gen_binary(self, difficulty: Difficulty) -> QuestionModel:
        """Binary number pattern questions."""
        if difficulty == Difficulty.BEGINNER:
            nums = random.sample(range(1, 16), 4)
        elif difficulty == Difficulty.INTERMEDIATE:
            nums = random.sample(range(8, 64), 4)
        else:
            nums = random.sample(range(32, 256), 4)

        variant = random.choice(["convert", "sequence"])

        if variant == "convert":
            num = random.choice(nums)
            binary = bin(num)[2:]
            return self._build_question(
                question_text=f"Convert the decimal number {num} to binary.",
                correct=binary,
                explanation=f"{num} in binary is {binary}. Method: repeatedly divide by 2 and read remainders bottom-up.",
                hint="Divide by 2 repeatedly and collect remainders.",
                difficulty=difficulty,
                topic="binary",
                tags=["binary", "conversion"],
                options=[binary, bin(num + 1)[2:], bin(num - 1)[2:], bin(num + 2)[2:]],
            )
        else:
            seq = list(range(1, 6))
            binary_seq = [bin(x)[2:] for x in seq]
            answer = bin(6)[2:]
            displayed = ", ".join(binary_seq)
            return self._build_question(
                question_text=f"Binary sequence: {displayed}, ? (what comes next?)",
                correct=answer,
                explanation=f"These are binary representations of 1, 2, 3, 4, 5. Next is 6 = {answer}.",
                hint="Convert each binary number to decimal first.",
                difficulty=difficulty,
                topic="binary",
                tags=["binary", "sequence"],
                options=[answer, bin(7)[2:], bin(5)[2:], bin(8)[2:]],
                sequence=seq,
            )

    def _gen_hexadecimal(self, difficulty: Difficulty) -> QuestionModel:
        """Hexadecimal conversion/sequence questions."""
        if difficulty == Difficulty.BEGINNER:
            num = random.randint(1, 30)
        elif difficulty == Difficulty.INTERMEDIATE:
            num = random.randint(16, 255)
        else:
            num = random.randint(100, 4095)

        hex_val = hex(num)[2:].upper()
        wrong1 = hex(num + random.randint(1, 5))[2:].upper()
        wrong2 = hex(num - random.randint(1, 3))[2:].upper() if num > 3 else hex(num + 10)[2:].upper()
        wrong3 = hex(num + random.randint(6, 15))[2:].upper()

        return self._build_question(
            question_text=f"Convert decimal {num} to hexadecimal.",
            correct=hex_val,
            explanation=f"{num} in hexadecimal is {hex_val}. Method: divide by 16, use 0-9 and A-F for remainders.",
            hint="Divide by 16 and map remainders to 0-F.",
            difficulty=difficulty,
            topic="hexadecimal",
            tags=["hexadecimal", "conversion"],
            options=[hex_val, wrong1, wrong2, wrong3],
        )

    def _gen_roman(self, difficulty: Difficulty) -> QuestionModel:
        """Roman numeral questions."""
        roman_map = [
            (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
            (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
            (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
        ]

        def to_roman(n: int) -> str:
            result = ""
            for value, numeral in roman_map:
                while n >= value:
                    result += numeral
                    n -= value
            return result

        if difficulty == Difficulty.BEGINNER:
            num = random.randint(1, 20)
        elif difficulty == Difficulty.INTERMEDIATE:
            num = random.randint(10, 100)
        else:
            num = random.randint(50, 500)

        roman = to_roman(num)
        variant = random.choice(["to_roman", "from_roman"])

        if variant == "to_roman":
            return self._build_question(
                question_text=f"What is {num} in Roman numerals?",
                correct=roman,
                explanation=f"{num} = {roman}. I=1, V=5, X=10, L=50, C=100, D=500, M=1000.",
                hint="Break the number into parts: thousands, hundreds, tens, ones.",
                difficulty=difficulty,
                topic="roman_numeral",
                tags=["roman", "conversion"],
                options=[roman, to_roman(num + 1), to_roman(max(1, num - 1)), to_roman(num + 5)],
            )
        else:
            return self._build_question(
                question_text=f"What decimal number does the Roman numeral {roman} represent?",
                correct=str(num),
                explanation=f"{roman} = {num}. Add values left-to-right; subtract when a smaller numeral precedes a larger one.",
                hint="I=1, V=5, X=10, L=50, C=100.",
                difficulty=difficulty,
                topic="roman_numeral",
                tags=["roman", "conversion"],
            )

    def _gen_alphabet(self, difficulty: Difficulty) -> QuestionModel:
        """Alphabet pattern sequences (skip letters)."""
        if difficulty == Difficulty.BEGINNER:
            skip = random.choice([1, 2])
        elif difficulty == Difficulty.INTERMEDIATE:
            skip = random.choice([2, 3, 4])
        else:
            skip = random.choice([3, 4, 5])

        start_idx = random.randint(0, 25 - (5 * (skip + 1)))
        indices = [start_idx + i * (skip + 1) for i in range(5)]
        indices = [i % 26 for i in indices]

        letters = [string.ascii_uppercase[i] for i in indices]
        answer_idx = (indices[-1] + skip + 1) % 26
        answer = string.ascii_uppercase[answer_idx]

        displayed = ", ".join(letters)
        return self._build_question(
            question_text=f"What letter comes next: {displayed}, ?",
            correct=answer,
            explanation=f"The pattern skips {skip} letter(s) each step. After {letters[-1]}, skipping {skip} gives {answer}.",
            hint=f"Count how many letters are skipped between each pair.",
            difficulty=difficulty,
            topic="alphabet",
            tags=["alphabet", "pattern"],
            options=[
                answer,
                string.ascii_uppercase[(answer_idx + 1) % 26],
                string.ascii_uppercase[(answer_idx - 1) % 26],
                string.ascii_uppercase[(answer_idx + 2) % 26],
            ],
        )

    def _gen_mirror(self, difficulty: Difficulty) -> QuestionModel:
        """Palindromic / mirror number sequences."""
        if difficulty == Difficulty.BEGINNER:
            base = random.randint(10, 30)
            seq = [int(str(base + i) + str(base + i)[::-1]) for i in range(4)]
        elif difficulty == Difficulty.INTERMEDIATE:
            # Three-digit palindromes: 121, 131, 141, ...
            d = random.randint(1, 3)
            start = random.randint(1, 5)
            seq = []
            for i in range(4):
                mid = start + i * d
                seq.append(int(f"{mid}{0}{mid}") if mid < 10 else mid * 101)
        else:
            seq = [int(f"{i}{i*11}{i}") for i in range(2, 6)]

        # Build next term using same pattern
        # Simple approach: find difference pattern
        diffs = [seq[i + 1] - seq[i] for i in range(len(seq) - 1)]
        if len(set(diffs)) == 1:
            answer = seq[-1] + diffs[0]
        else:
            answer = seq[-1] + diffs[-1]

        displayed = ", ".join(str(x) for x in seq)
        return self._build_question(
            question_text=f"Continue the palindromic pattern: {displayed}, ?",
            correct=str(answer),
            explanation=f"These are mirror/palindrome numbers. The pattern difference is consistent. Next: {answer}.",
            hint="Look at the digits — they read the same forwards and backwards.",
            difficulty=difficulty,
            topic="mirror",
            tags=["mirror", "palindrome"],
            sequence=seq,
        )

    def _gen_clock(self, difficulty: Difficulty) -> QuestionModel:
        """Clock-based pattern questions."""
        if difficulty == Difficulty.BEGINNER:
            step = random.choice([1, 2, 3])
        else:
            step = random.choice([2, 3, 4, 5])

        start = random.randint(1, 12)
        seq = [(start + i * step - 1) % 12 + 1 for i in range(5)]
        answer = (start + 5 * step - 1) % 12 + 1

        times = [f"{h}:00" for h in seq]
        displayed = ", ".join(times)

        return self._build_question(
            question_text=f"A clock shows these times: {displayed}. What time is next?",
            correct=f"{answer}:00",
            explanation=f"The clock advances by {step} hour(s) each step (mod 12). After {seq[-1]}:00, next is {answer}:00.",
            hint="Count how many hours pass between each time.",
            difficulty=difficulty,
            topic="clock",
            tags=["clock", "modular"],
            options=[f"{answer}:00", f"{(answer % 12) + 1}:00", f"{(answer - 2) % 12 + 1}:00", f"{(answer + 2) % 12 + 1}:00"],
        )

    def _gen_dice(self, difficulty: Difficulty) -> QuestionModel:
        """Dice probability questions."""
        if difficulty == Difficulty.BEGINNER:
            target = random.randint(1, 6)
            return self._build_question(
                question_text=f"A fair 6-sided die is rolled. What is the probability of getting {target}?",
                correct="1/6",
                explanation=f"A fair die has 6 equally likely outcomes. P({target}) = 1/6.",
                hint="Each face has equal probability on a fair die.",
                difficulty=difficulty,
                topic="dice",
                tags=["dice", "probability"],
                options=["1/6", "1/3", "1/2", "2/6"],
            )
        elif difficulty == Difficulty.INTERMEDIATE:
            target = random.randint(2, 12)
            # Two dice: count ways to make target
            ways = sum(1 for a in range(1, 7) for b in range(1, 7) if a + b == target)
            total = 36
            from math import gcd
            g = gcd(ways, total)
            frac = f"{ways // g}/{total // g}"
            return self._build_question(
                question_text=f"Two fair dice are rolled. What is the probability of their sum being {target}?",
                correct=frac,
                explanation=f"There are {ways} ways to roll a sum of {target} out of 36 total outcomes. P = {ways}/36 = {frac}.",
                hint="List all pairs (a, b) where a + b equals the target.",
                difficulty=difficulty,
                topic="dice",
                tags=["dice", "probability"],
                options=[frac, f"{ways + 1}/36", f"{max(1, ways - 1)}/36", "1/6"],
            )
        else:
            n = random.randint(3, 4)
            target = random.randint(n, n * 3)
            return self._build_question(
                question_text=f"If {n} dice are rolled, what is the minimum possible sum?",
                correct=str(n),
                explanation=f"The minimum sum is {n} (all dice show 1). Each die contributes at least 1.",
                hint="What's the lowest value each die can show?",
                difficulty=difficulty,
                topic="dice",
                tags=["dice", "probability"],
            )

    def _gen_probability(self, difficulty: Difficulty) -> QuestionModel:
        """Basic probability questions."""
        if difficulty == Difficulty.BEGINNER:
            red = random.randint(2, 5)
            blue = random.randint(2, 5)
            total = red + blue
            from math import gcd
            g = gcd(red, total)
            frac = f"{red // g}/{total // g}"
            return self._build_question(
                question_text=f"A bag has {red} red balls and {blue} blue balls. What is the probability of drawing a red ball?",
                correct=frac,
                explanation=f"P(red) = {red}/{total} = {frac}. There are {red} favorable outcomes out of {total} total.",
                hint="Probability = favorable outcomes / total outcomes.",
                difficulty=difficulty,
                topic="probability",
                tags=["probability", "basics"],
                options=[frac, f"{blue}/{total}", "1/2", f"{red}/{total + 1}"],
            )
        elif difficulty == Difficulty.INTERMEDIATE:
            n = random.randint(3, 8)
            k = random.randint(1, n)
            # Permutations
            perm = math.perm(n, k)
            return self._build_question(
                question_text=f"How many ways can you arrange {k} items from {n} distinct items? (P({n},{k}))",
                correct=str(perm),
                explanation=f"P({n},{k}) = {n}! / ({n}-{k})! = {perm}.",
                hint="Use the permutation formula: n! / (n-k)!",
                difficulty=difficulty,
                topic="probability",
                tags=["probability", "combinatorics"],
            )
        else:
            n = random.randint(4, 10)
            k = random.randint(2, min(n, 5))
            comb = math.comb(n, k)
            return self._build_question(
                question_text=f"How many ways can you choose {k} items from {n}? (C({n},{k}))",
                correct=str(comb),
                explanation=f"C({n},{k}) = {n}! / ({k}! × ({n}-{k})!) = {comb}.",
                hint="Use the combination formula: n! / (k! × (n-k)!)",
                difficulty=difficulty,
                topic="probability",
                tags=["probability", "combinatorics"],
            )

    def _gen_coding_pattern(self, difficulty: Difficulty) -> QuestionModel:
        """Code output prediction questions using Python snippets."""
        snippets = {
            Difficulty.BEGINNER: [
                {
                    "code": "x = 5\ny = x * 2 + 3\nprint(y)",
                    "answer": "13",
                    "explanation": "x=5, y = 5*2+3 = 13.",
                },
                {
                    "code": "nums = [1, 2, 3, 4, 5]\nprint(sum(nums))",
                    "answer": "15",
                    "explanation": "sum([1,2,3,4,5]) = 15.",
                },
                {
                    "code": "s = 'hello'\nprint(len(s))",
                    "answer": "5",
                    "explanation": "The string 'hello' has 5 characters.",
                },
                {
                    "code": "print(10 // 3)",
                    "answer": "3",
                    "explanation": "Integer division: 10 // 3 = 3 (floor).",
                },
                {
                    "code": "print(2 ** 4)",
                    "answer": "16",
                    "explanation": "2^4 = 16. The ** operator is exponentiation.",
                },
            ],
            Difficulty.INTERMEDIATE: [
                {
                    "code": "x = [i**2 for i in range(5)]\nprint(x[-1])",
                    "answer": "16",
                    "explanation": "range(5) = [0,1,2,3,4]. Squares = [0,1,4,9,16]. Last element is 16.",
                },
                {
                    "code": "s = 'abcdef'\nprint(s[1:4])",
                    "answer": "bcd",
                    "explanation": "Slicing s[1:4] gives characters at index 1, 2, 3: 'bcd'.",
                },
                {
                    "code": "d = {'a': 1, 'b': 2, 'c': 3}\nprint(d.get('d', 0))",
                    "answer": "0",
                    "explanation": "Key 'd' doesn't exist; .get() returns the default value 0.",
                },
                {
                    "code": "print(bool(0) or bool('hello'))",
                    "answer": "True",
                    "explanation": "bool(0) = False, bool('hello') = True. False or True = True.",
                },
            ],
            Difficulty.ADVANCED: [
                {
                    "code": "f = lambda x: x if x <= 1 else f(x-1) + f(x-2)\nprint(f(6))",
                    "answer": "8",
                    "explanation": "This is a recursive Fibonacci. f(6) = f(5)+f(4) = 5+3 = 8.",
                },
                {
                    "code": "from functools import reduce\nprint(reduce(lambda a,b: a*b, [1,2,3,4,5]))",
                    "answer": "120",
                    "explanation": "reduce multiplies: 1*2*3*4*5 = 120 (5 factorial).",
                },
                {
                    "code": "x = {i: i**2 for i in range(4)}\nprint(sum(x.values()))",
                    "answer": "14",
                    "explanation": "Values are [0, 1, 4, 9]. Sum = 14.",
                },
            ],
        }

        choices = snippets.get(difficulty, snippets[Difficulty.BEGINNER])
        snippet = random.choice(choices)

        return self._build_question(
            question_text=f"What does this Python code output?\n\n```python\n{snippet['code']}\n```",
            correct=snippet["answer"],
            explanation=snippet["explanation"],
            hint="Trace through the code step by step.",
            difficulty=difficulty,
            topic="coding_pattern",
            tags=["coding", "output_prediction"],
        )

    def _gen_square_cube(self, difficulty: Difficulty) -> QuestionModel:
        """Perfect square and cube sequence questions."""
        if difficulty == Difficulty.BEGINNER:
            variant = "square"
            start = random.randint(1, 6)
            seq = [(start + i) ** 2 for i in range(5)]
            answer = (start + 5) ** 2
            power_name = "squared"
        elif difficulty == Difficulty.INTERMEDIATE:
            variant = random.choice(["square", "cube"])
            start = random.randint(2, 8)
            exp = 2 if variant == "square" else 3
            seq = [(start + i) ** exp for i in range(5)]
            answer = (start + 5) ** exp
            power_name = "squared" if exp == 2 else "cubed"
        else:
            start = random.randint(1, 5)
            seq = [(start + i) ** 3 for i in range(5)]
            answer = (start + 5) ** 3
            variant = "cube"
            power_name = "cubed"

        displayed = ", ".join(str(x) for x in seq)
        return self._build_question(
            question_text=f"These are consecutive numbers {power_name}: {displayed}, ?",
            correct=str(answer),
            explanation=f"The sequence shows {start}², {start+1}², ... ({power_name}). Next: {start+5}² = {answer}." if variant == "square" else f"The sequence shows {start}³, {start+1}³, ... ({power_name}). Next: {start+5}³ = {answer}.",
            hint=f"Try taking the {'square' if variant == 'square' else 'cube'} root of each number.",
            difficulty=difficulty,
            topic="square_cube",
            tags=["squares", "cubes", "pattern"],
            sequence=seq,
        )
