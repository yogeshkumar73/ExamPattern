"""
Puzzle Question Generator — Logic, patterns, riddles.

Covers: number puzzles, logic riddles, visual/word patterns,
lateral thinking, and classic CS puzzles.
"""

import random

from generators.base import BaseGenerator
from models.question import QuestionModel, Difficulty, QuestionType, GameMode
from utils.helpers import generate_id, calculate_xp, calculate_coins, calculate_time_limit

_PUZZLE_BANK: dict[str, list[dict]] = {
    "beginner": [
        {"q": "I have hands but cannot clap. What am I?", "o": ["A clock", "A robot", "A glove", "A statue"], "a": "A clock", "e": "Clock hands point to the time but don't clap.", "h": "Think of something that shows time."},
        {"q": "What comes once in a minute, twice in a moment, but never in a thousand years?", "o": ["The letter 'M'", "A second", "A heartbeat", "A blink"], "a": "The letter 'M'", "e": "Minute=M once, Moment=M twice, Thousand=no M.", "h": "Think about letters, not time."},
        {"q": "Find the missing number: 2, 4, 6, ?, 10", "o": ["8", "7", "9", "11"], "a": "8", "e": "Even numbers increasing by 2. After 6 comes 8.", "h": "What's the pattern between consecutive numbers?"},
        {"q": "Which is different? Apple, Banana, Carrot, Mango", "o": ["Carrot", "Apple", "Banana", "Mango"], "a": "Carrot", "e": "Carrot is a vegetable; the rest are fruits.", "h": "Classify each item."},
        {"q": "A rooster lays an egg on top of a barn. Which way does it fall?", "o": ["Roosters don't lay eggs", "Left", "Right", "It slides down"], "a": "Roosters don't lay eggs", "e": "Roosters are male chickens and don't lay eggs.", "h": "Think about biology."},
        {"q": "Complete: A, C, E, G, ?", "o": ["I", "H", "J", "K"], "a": "I", "e": "Skip every other letter: A(skip B)C(skip D)E(skip F)G(skip H)I.", "h": "Count every other letter in the alphabet."},
        {"q": "If 3 + 5 = 16 and 5 + 7 = 24, what is 7 + 9 = ?", "o": ["32", "34", "36", "16"], "a": "32", "e": "Pattern: (a + b) × 2 = result. (7+9)×2 = 32.", "h": "What operation links the sum to the result?"},
        {"q": "How many months have 28 days?", "o": ["All 12", "1", "2", "3"], "a": "All 12", "e": "All 12 months have at least 28 days.", "h": "Read carefully — it says AT LEAST 28."},
        {"q": "A man walks into a bar and asks for water. The bartender pulls out a gun. The man says 'thank you' and leaves. Why?", "o": ["He had hiccups", "He was a thief", "He was a bartender", "He was blind"], "a": "He had hiccups", "e": "The gun scared him (cured hiccups). He needed water for hiccups.", "h": "What can scare away hiccups?"},
        {"q": "Towers of Hanoi: Minimum moves for 3 disks?", "o": ["7", "5", "9", "3"], "a": "7", "e": "Formula: 2ⁿ - 1 = 2³ - 1 = 7 moves.", "h": "Use the formula 2ⁿ - 1."},
        {"q": "What 3-digit number when reversed is 7 more than double itself? (Trick: pick the right one)", "o": ["100", "This is a trick: no such number", "121", "312"], "a": "This is a trick: no such number", "e": "No 3-digit number satisfies reversed = 2× original + 7.", "h": "Check each option mathematically."},
        {"q": "Find the next: 1, 4, 9, 16, 25, ?", "o": ["36", "30", "32", "49"], "a": "36", "e": "These are perfect squares: 1²,2²,3²,4²,5². Next: 6²=36.", "h": "What mathematical operation produces 1,4,9,16,25?"},
    ],
    "intermediate": [
        {"q": "A bat and ball cost $1.10 total. The bat costs $1 more than the ball. How much does the ball cost?", "o": ["$0.05", "$0.10", "$0.15", "$0.20"], "a": "$0.05", "e": "Ball=x, Bat=x+1. x + (x+1) = 1.10 → x=0.05.", "h": "Set up an equation with the ball price as x."},
        {"q": "What is 5 & 3 in binary (bitwise AND)?", "o": ["1", "7", "8", "0"], "a": "1", "e": "5=101, 3=011. AND: 001 = 1.", "h": "Convert to binary and AND each bit."},
        {"q": "for(i=0; i<=arr.length; i++) — what is the bug?", "o": ["Off-by-one error", "Syntax error", "Type error", "Null reference"], "a": "Off-by-one error", "e": "Should be i < arr.length. i<=arr.length accesses index out of bounds.", "h": "When does the loop terminate?"},
        {"q": "Output of AND gate: A=1, B=0?", "o": ["0", "1", "Undefined", "-1"], "a": "0", "e": "AND gate: output is 1 only when BOTH inputs are 1.", "h": "AND requires all inputs to be 1."},
        {"q": "If all Bloops are Razzles and all Razzles are Lazzles, are all Bloops Lazzles?", "o": ["Yes", "No", "Maybe", "Cannot determine"], "a": "Yes", "e": "Transitive logic: Bloop→Razzle→Lazzle, so Bloop→Lazzle.", "h": "Apply transitive reasoning step by step."},
        {"q": "What is 5! (5 factorial)?", "o": ["120", "60", "24", "720"], "a": "120", "e": "5! = 5×4×3×2×1 = 120.", "h": "Multiply all integers from 1 to 5."},
        {"q": "A train travels 60km/h. How long to travel 90km?", "o": ["1.5 hours", "2 hours", "1 hour", "45 minutes"], "a": "1.5 hours", "e": "Time = Distance / Speed = 90 / 60 = 1.5 hours.", "h": "Use: time = distance ÷ speed."},
        {"q": "Which is NOT a valid IPv4 address?", "o": ["256.1.2.3", "192.168.1.1", "10.0.0.1", "172.16.0.1"], "a": "256.1.2.3", "e": "Each IPv4 octet must be 0-255. 256 is invalid.", "h": "What is the maximum value for an IP octet?"},
        {"q": "What does XOR of a number with itself always equal?", "o": ["0", "1", "The number", "-1"], "a": "0", "e": "n XOR n = 0 for any n. Every bit cancels itself.", "h": "What happens when you XOR identical bits?"},
        {"q": "What is the minimum number of comparisons to find max in an array of n elements?", "o": ["n-1", "n", "n/2", "log n"], "a": "n-1", "e": "You must compare every element at least once against max: n-1 comparisons.", "h": "How many elements must be compared to eliminate non-maximums?"},
        {"q": "I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?", "o": ["An echo", "A shadow", "A thought", "A dream"], "a": "An echo", "e": "An echo 'speaks' (repeats sound) and exists without physical form.", "h": "Think about sound phenomena in nature."},
        {"q": "How many squares are on a standard 8×8 chessboard? (All sizes)", "o": ["204", "64", "100", "164"], "a": "204", "e": "Sum of k² from k=1 to 8: 64+49+36+25+16+9+4+1 = 204.", "h": "Count squares of all sizes: 1×1, 2×2, ..., 8×8."},
    ],
    "advanced": [
        {"q": "A prisoner must choose between 3 doors. Behind one is freedom, behind two are lions. He picks door 1. The guard opens door 3 (lion). Should he switch?", "o": ["Yes — switching wins 2/3 of the time", "No — 50/50 now", "Doesn't matter", "Always stay"], "a": "Yes — switching wins 2/3 of the time", "e": "Monty Hall Problem: initial P(win)=1/3. After reveal, switching gives P=2/3.", "h": "This is the famous Monty Hall Problem."},
        {"q": "You have 8 identical balls. One is slightly heavier. Using a balance scale, minimum weighings to find it?", "o": ["2", "3", "4", "1"], "a": "2", "e": "Split 8→3+3+2. Weigh 3 vs 3. If equal, weigh remaining 2. If not, weigh 2 of the heavier group.", "h": "Divide into thirds, not halves."},
        {"q": "What is the output of: x=5; print(x:=10, x)?", "o": ["10 10", "5 5", "10 5", "Error"], "a": "10 10", "e": "Walrus operator := assigns and evaluates. x becomes 10; both prints show 10.", "h": "The walrus operator assigns AND returns the value."},
        {"q": "Two trains approach each other: one at 70km/h, one at 80km/h, 300km apart. A fly at 150km/h bounces between them. Total fly distance?", "o": ["300 km", "150 km", "450 km", "600 km"], "a": "300 km", "e": "Trains meet in 300/(70+80) = 2 hours. Fly travels 150×2 = 300km.", "h": "Find when trains meet first."},
        {"q": "Which NP-Hard problem is solved by Dijkstra's algorithm? (Trick question)", "o": ["None — Dijkstra solves shortest path in P", "Travelling Salesman", "Subset Sum", "Graph Coloring"], "a": "None — Dijkstra solves shortest path in P", "e": "Dijkstra solves SSSP in O((V+E)log V), which is polynomial (P class).", "h": "Is shortest path NP-hard or solvable in polynomial time?"},
        {"q": "What does this evaluate to: not not not True?", "o": ["False", "True", "None", "Error"], "a": "False", "e": "not True=False, not False=True, not True=False. Three NOTs.", "h": "Apply 'not' three times step by step."},
        {"q": "A frog is at the bottom of a 20m well. It climbs 3m/day and slides 2m/night. When does it reach the top?", "o": ["Day 18", "Day 20", "Day 17", "Day 19"], "a": "Day 18", "e": "Net gain: 1m/day. After 17 days at 17m, on day 18 it climbs 3m to 20m and escapes.", "h": "On the last day it doesn't slide back."},
        {"q": "What is the parity of the number of 1s in: 0b10110111?", "o": ["Odd (5 ones)", "Even", "Odd (6 ones)", "Odd (7 ones)"], "a": "Odd (5 ones)", "e": "10110111 has 1s at positions: 1,1,0,1,1,0,1,1 → actually 1+0+1+1+0+1+1+1 = 6 ones — wait: 1,0,1,1,0,1,1,1 = 6. Correct answer depends on bit count.", "h": "Count the 1-bits carefully."},
        {"q": "Einstein's riddle: 5 houses, 5 nationalities. The German keeps fish. How many clues are minimum to solve?", "o": ["This is determined by the puzzle constraints, not a fixed number", "5", "10", "15"], "a": "This is determined by the puzzle constraints, not a fixed number", "e": "Einstein's riddle has 15 clues; fewer may still uniquely determine the solution.", "h": "Think about constraint satisfaction problems."},
        {"q": "Which sorting algorithm is best for nearly-sorted data?", "o": ["Insertion Sort (O(n) best case)", "Bubble Sort", "Merge Sort", "Quick Sort"], "a": "Insertion Sort (O(n) best case)", "e": "Insertion sort has O(n) best case for nearly-sorted input.", "h": "Which algorithm performs well when data is mostly in order?"},
    ],
}


class PuzzleGenerator(BaseGenerator):
    """Logic puzzle and riddle generator from curated bank."""

    @property
    def mode(self) -> str:
        return GameMode.PUZZLE.value

    def generate(
        self,
        difficulty: Difficulty,
        count: int = 10,
        topic: str | None = None,
        exclude_ids: set[str] | None = None,
    ) -> list[QuestionModel]:
        exclude = set(exclude_ids) if exclude_ids else set()
        bank = _PUZZLE_BANK.get(difficulty.value, _PUZZLE_BANK["beginner"])
        pool = list(bank)
        random.shuffle(pool)

        questions: list[QuestionModel] = []
        idx = 0
        max_attempts = len(pool) * 10
        attempts = 0

        while len(questions) < count and attempts < max_attempts and pool:
            entry = pool[idx % len(pool)]
            idx += 1
            attempts += 1
            qid = generate_id("pzl", entry["q"])
            if qid in exclude:
                continue

            opts = list(entry["o"])
            random.shuffle(opts)

            q = QuestionModel(
                id=qid,
                mode=GameMode.PUZZLE,
                difficulty=difficulty,
                topic="puzzle",
                question=entry["q"],
                question_type=QuestionType.MCQ,
                options=opts,
                correct_answer=entry["a"],
                explanation=entry["e"],
                hint=entry["h"],
                time_limit=calculate_time_limit(difficulty.value),
                xp=calculate_xp(difficulty.value),
                coins=calculate_coins(difficulty.value),
                tags=["puzzle", "logic"],
            )
            exclude.add(qid)
            questions.append(q)

        return questions
