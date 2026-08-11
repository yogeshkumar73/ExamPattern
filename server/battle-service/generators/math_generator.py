"""
Math Question Generator — Pure Python.

Generates unlimited math questions across:
- Arithmetic (add, subtract, multiply, divide)
- Percentage, ratio, proportion
- Area, volume, perimeter
- Algebra (linear, quadratic)
- GCD, LCM, factors, primes
- Combinatorics
"""

import math
import random
from typing import Optional

from generators.base import BaseGenerator
from models.question import QuestionModel, Difficulty, QuestionType, GameMode
from utils.helpers import generate_id, calculate_xp, calculate_coins, calculate_time_limit


class MathGenerator(BaseGenerator):
    """Procedural math question generator using Python's math and random modules."""

    @property
    def mode(self) -> str:
        return GameMode.MATH.value

    TOPIC_TYPES: list[str] = [
        "arithmetic",
        "percentage",
        "algebra",
        "geometry",
        "gcd_lcm",
        "combinatorics",
        "series",
        "roots_powers",
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

        while len(questions) < count and attempts < count * 5:
            attempts += 1
            t = topic if topic and topic in self.TOPIC_TYPES else random.choice(self.TOPIC_TYPES)
            q = self._dispatch(t, difficulty)
            if q and q.id not in exclude:
                exclude.add(q.id)
                questions.append(q)
        return questions

    def _dispatch(self, topic: str, difficulty: Difficulty) -> Optional[QuestionModel]:
        generators = {
            "arithmetic": self._gen_arithmetic,
            "percentage": self._gen_percentage,
            "algebra": self._gen_algebra,
            "geometry": self._gen_geometry,
            "gcd_lcm": self._gen_gcd_lcm,
            "combinatorics": self._gen_combinatorics,
            "series": self._gen_series,
            "roots_powers": self._gen_roots_powers,
        }
        fn = generators.get(topic)
        return fn(difficulty) if fn else None

    def _build(
        self, question: str, correct: str, explanation: str, hint: str,
        difficulty: Difficulty, topic: str, tags: list[str],
        options: list[str] | None = None,
    ) -> QuestionModel:
        if options is None:
            options = self._numeric_distractors(correct)
        if correct not in options:
            options[random.randint(0, len(options) - 1)] = correct
        random.shuffle(options)
        return QuestionModel(
            id=generate_id("math", question),
            mode=GameMode.MATH,
            difficulty=difficulty,
            topic=topic,
            question=question,
            question_type=QuestionType.MCQ,
            options=options,
            correct_answer=correct,
            explanation=explanation,
            hint=hint,
            time_limit=calculate_time_limit(difficulty.value),
            xp=calculate_xp(difficulty.value),
            coins=calculate_coins(difficulty.value),
            tags=["math"] + tags,
        )

    def _numeric_distractors(self, correct: str) -> list[str]:
        try:
            val = int(correct)
        except ValueError:
            try:
                val = float(correct)
                return [correct, str(round(val + 2, 2)), str(round(val - 3, 2)), str(round(val * 1.5, 2))]
            except ValueError:
                return [correct, "A", "B", "C"]
        spread = max(3, abs(val) // 3 + 1)
        d: set[str] = set()
        while len(d) < 3:
            n = val + random.randint(-spread, spread)
            if n != val:
                d.add(str(n))
            spread += 1
        return [correct] + list(d)

    # ── Generators ────────────────────────────────────────────

    def _gen_arithmetic(self, diff: Difficulty) -> QuestionModel:
        ops = {
            Difficulty.BEGINNER: [("+", lambda a, b: a + b), ("-", lambda a, b: a - b)],
            Difficulty.INTERMEDIATE: [
                ("+", lambda a, b: a + b), ("-", lambda a, b: a - b),
                ("×", lambda a, b: a * b),
            ],
            Difficulty.ADVANCED: [
                ("×", lambda a, b: a * b), ("÷", lambda a, b: a // b),
            ],
        }
        symbol, fn = random.choice(ops.get(diff, ops[Difficulty.BEGINNER]))

        if diff == Difficulty.BEGINNER:
            a, b = random.randint(1, 50), random.randint(1, 50)
        elif diff == Difficulty.INTERMEDIATE:
            a, b = random.randint(10, 200), random.randint(2, 50)
        else:
            a, b = random.randint(10, 100), random.randint(2, 25)

        if symbol == "÷":
            a = a * b  # ensure clean division

        answer = fn(a, b)
        return self._build(
            f"What is {a} {symbol} {b}?", str(answer),
            f"{a} {symbol} {b} = {answer}.", f"Perform the {symbol} operation.",
            diff, "arithmetic", ["arithmetic"],
        )

    def _gen_percentage(self, diff: Difficulty) -> QuestionModel:
        if diff == Difficulty.BEGINNER:
            pct = random.choice([10, 20, 25, 50])
            base = random.choice([100, 200, 500, 1000])
        elif diff == Difficulty.INTERMEDIATE:
            pct = random.randint(5, 45)
            base = random.randint(50, 500)
        else:
            pct = random.randint(1, 75)
            base = random.randint(100, 2000)

        answer = round(pct * base / 100, 2)
        answer_str = str(int(answer)) if answer == int(answer) else str(answer)

        return self._build(
            f"What is {pct}% of {base}?", answer_str,
            f"{pct}% of {base} = {pct}/100 × {base} = {answer_str}.",
            "Multiply the base by the percentage divided by 100.",
            diff, "percentage", ["percentage"],
        )

    def _gen_algebra(self, diff: Difficulty) -> QuestionModel:
        if diff == Difficulty.BEGINNER:
            a = random.randint(2, 10)
            b = random.randint(1, 20)
            answer = b // a if b % a == 0 else b / a
            q = f"Solve: {a}x = {b}. What is x?"
            ans_str = str(int(answer)) if answer == int(answer) else str(round(answer, 2))
            expl = f"x = {b}/{a} = {ans_str}"
        elif diff == Difficulty.INTERMEDIATE:
            a = random.randint(2, 8)
            b = random.randint(1, 15)
            c = random.randint(10, 50)
            answer = (c - b) / a
            ans_str = str(int(answer)) if answer == int(answer) else str(round(answer, 2))
            q = f"Solve: {a}x + {b} = {c}. What is x?"
            expl = f"x = ({c} - {b}) / {a} = {ans_str}"
        else:
            # Quadratic: (x - r1)(x - r2) = 0
            r1 = random.randint(1, 10)
            r2 = random.randint(1, 10)
            a_coeff, b_coeff, c_coeff = 1, -(r1 + r2), r1 * r2
            answer = max(r1, r2)
            ans_str = str(answer)
            b_str = f"+ {b_coeff}" if b_coeff >= 0 else f"- {abs(b_coeff)}"
            c_str = f"+ {c_coeff}" if c_coeff >= 0 else f"- {abs(c_coeff)}"
            q = f"Solve: x² {b_str}x {c_str} = 0. What is the larger root?"
            expl = f"Factors: (x - {r1})(x - {r2}) = 0. Roots: {r1} and {r2}. Larger = {answer}."

        return self._build(
            q, ans_str, expl, "Isolate x step by step.",
            diff, "algebra", ["algebra"],
        )

    def _gen_geometry(self, diff: Difficulty) -> QuestionModel:
        variant = random.choice(["area_rect", "area_triangle", "circumference", "volume"])

        if variant == "area_rect":
            l = random.randint(3, 20 if diff != Difficulty.BEGINNER else 10)
            w = random.randint(2, 15 if diff != Difficulty.BEGINNER else 8)
            answer = l * w
            return self._build(
                f"Find the area of a rectangle with length {l} and width {w}.",
                str(answer), f"Area = length × width = {l} × {w} = {answer}.",
                "Area = length × width.", diff, "geometry", ["geometry", "area"],
            )
        elif variant == "area_triangle":
            b = random.randint(4, 20)
            h = random.randint(3, 15)
            answer = b * h / 2
            ans_str = str(int(answer)) if answer == int(answer) else str(answer)
            return self._build(
                f"Find the area of a triangle with base {b} and height {h}.",
                ans_str, f"Area = ½ × base × height = ½ × {b} × {h} = {ans_str}.",
                "Area = ½ × base × height.", diff, "geometry", ["geometry", "area"],
            )
        elif variant == "circumference":
            r = random.randint(2, 15)
            answer = round(2 * math.pi * r, 2)
            return self._build(
                f"Find the circumference of a circle with radius {r} (use π ≈ 3.14).",
                str(round(2 * 3.14 * r, 2)),
                f"C = 2πr = 2 × 3.14 × {r} = {round(2 * 3.14 * r, 2)}.",
                "C = 2πr.", diff, "geometry", ["geometry", "circle"],
            )
        else:
            s = random.randint(2, 10)
            answer = s ** 3
            return self._build(
                f"Find the volume of a cube with side length {s}.",
                str(answer), f"Volume = side³ = {s}³ = {answer}.",
                "Volume of a cube = s³.", diff, "geometry", ["geometry", "volume"],
            )

    def _gen_gcd_lcm(self, diff: Difficulty) -> QuestionModel:
        variant = random.choice(["gcd", "lcm"])
        if diff == Difficulty.BEGINNER:
            a, b = sorted(random.sample(range(4, 30), 2))
        elif diff == Difficulty.INTERMEDIATE:
            a, b = sorted(random.sample(range(10, 100), 2))
        else:
            a, b = sorted(random.sample(range(20, 200), 2))

        if variant == "gcd":
            answer = math.gcd(a, b)
            return self._build(
                f"Find the GCD (Greatest Common Divisor) of {a} and {b}.",
                str(answer), f"GCD({a}, {b}) = {answer}.",
                "Find common factors of both numbers.", diff, "gcd_lcm", ["gcd", "number_theory"],
            )
        else:
            answer = (a * b) // math.gcd(a, b)
            return self._build(
                f"Find the LCM (Least Common Multiple) of {a} and {b}.",
                str(answer), f"LCM({a}, {b}) = ({a} × {b}) / GCD({a}, {b}) = {answer}.",
                "LCM = (a × b) / GCD(a, b).", diff, "gcd_lcm", ["lcm", "number_theory"],
            )

    def _gen_combinatorics(self, diff: Difficulty) -> QuestionModel:
        if diff == Difficulty.BEGINNER:
            n = random.randint(3, 6)
            answer = math.factorial(n)
            return self._build(
                f"How many ways can {n} books be arranged on a shelf?",
                str(answer), f"{n}! = {answer}.",
                "Use the factorial formula: n!", diff, "combinatorics", ["factorial", "permutation"],
            )
        elif diff == Difficulty.INTERMEDIATE:
            n = random.randint(5, 10)
            k = random.randint(2, min(n, 4))
            answer = math.perm(n, k)
            return self._build(
                f"P({n},{k}) = ? (permutations of {k} from {n})",
                str(answer), f"P({n},{k}) = {n}!/({n}-{k})! = {answer}.",
                "Use the permutation formula.", diff, "combinatorics", ["permutation"],
            )
        else:
            n = random.randint(5, 12)
            k = random.randint(2, min(n, 5))
            answer = math.comb(n, k)
            return self._build(
                f"C({n},{k}) = ? (combinations of {k} from {n})",
                str(answer), f"C({n},{k}) = {n}!/({k}!({n}-{k})!) = {answer}.",
                "Use the combination formula.", diff, "combinatorics", ["combination"],
            )

    def _gen_series(self, diff: Difficulty) -> QuestionModel:
        if diff == Difficulty.BEGINNER:
            n = random.randint(5, 15)
            answer = n * (n + 1) // 2
            return self._build(
                f"What is the sum of all integers from 1 to {n}?",
                str(answer), f"Sum = n(n+1)/2 = {n}×{n + 1}/2 = {answer}.",
                "Use the formula: n(n+1)/2.", diff, "series", ["series", "arithmetic"],
            )
        elif diff == Difficulty.INTERMEDIATE:
            a = random.randint(2, 5)
            d = random.randint(2, 6)
            n = random.randint(5, 10)
            answer = n * (2 * a + (n - 1) * d) // 2
            return self._build(
                f"Find the sum of first {n} terms of AP: {a}, {a + d}, {a + 2 * d}, ...",
                str(answer),
                f"Sum = n/2 × (2a + (n-1)d) = {n}/2 × (2×{a} + {n - 1}×{d}) = {answer}.",
                "Sum of AP = n/2 × (2a + (n-1)d).", diff, "series", ["series", "ap"],
            )
        else:
            a = random.randint(1, 3)
            r = random.randint(2, 3)
            n = random.randint(4, 7)
            answer = a * (r ** n - 1) // (r - 1)
            return self._build(
                f"Find the sum of first {n} terms of GP: {a}, {a * r}, {a * r ** 2}, ...",
                str(answer),
                f"Sum = a(rⁿ-1)/(r-1) = {a}×({r}^{n}-1)/({r}-1) = {answer}.",
                "Sum of GP = a(rⁿ-1)/(r-1).", diff, "series", ["series", "gp"],
            )

    def _gen_roots_powers(self, diff: Difficulty) -> QuestionModel:
        variant = random.choice(["sqrt", "power"])
        if variant == "sqrt":
            if diff == Difficulty.BEGINNER:
                n = random.choice([4, 9, 16, 25, 36, 49, 64, 81, 100])
            elif diff == Difficulty.INTERMEDIATE:
                n = random.choice([121, 144, 169, 196, 225, 256])
            else:
                n = random.choice([289, 324, 361, 400, 441, 484, 529, 576, 625])
            answer = int(math.sqrt(n))
            return self._build(
                f"What is √{n}?", str(answer),
                f"√{n} = {answer} because {answer}² = {n}.",
                "Which number multiplied by itself gives the value?",
                diff, "roots_powers", ["sqrt", "roots"],
            )
        else:
            if diff == Difficulty.BEGINNER:
                base = random.randint(2, 5)
                exp = random.randint(2, 3)
            elif diff == Difficulty.INTERMEDIATE:
                base = random.randint(2, 8)
                exp = random.randint(2, 4)
            else:
                base = random.randint(2, 12)
                exp = random.randint(3, 5)
            answer = base ** exp
            return self._build(
                f"What is {base}^{exp}?", str(answer),
                f"{base}^{exp} = {answer}.",
                "Multiply the base by itself 'exp' times.",
                diff, "roots_powers", ["powers", "exponents"],
            )
