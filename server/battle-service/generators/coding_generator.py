"""
Coding Question Generator — Static bank + Code Output patterns.

Covers:
- Algorithm complexity MCQ
- Code output prediction (Python snippets)
- Bug-finding questions
- Data structures MCQ
- Design patterns
"""

import random

from generators.base import BaseGenerator
from models.question import QuestionModel, Difficulty, QuestionType, GameMode
from utils.helpers import generate_id, calculate_xp, calculate_coins, calculate_time_limit

# ── Static Question Bank ──────────────────────────────────────
_CODING_BANK: dict[str, list[dict]] = {
    "beginner": [
        {"q": "What is the output of: print(type(42))?", "o": ["<class 'int'>", "<class 'str'>", "<class 'float'>", "42"], "a": "<class 'int'>", "e": "42 is an integer literal. type() returns the type object.", "t": "code_output"},
        {"q": "What does len([1, 2, 3]) return?", "o": ["3", "2", "4", "0"], "a": "3", "e": "len() returns the number of elements in the list.", "t": "code_output"},
        {"q": "What is the output of: print(10 % 3)?", "o": ["1", "3", "0", "2"], "a": "1", "e": "10 % 3 is the remainder of 10 divided by 3 = 1.", "t": "code_output"},
        {"q": "What does range(5) produce?", "o": ["0, 1, 2, 3, 4", "1, 2, 3, 4, 5", "0, 1, 2, 3, 4, 5", "1, 2, 3, 4"], "a": "0, 1, 2, 3, 4", "e": "range(5) produces integers from 0 to 4 (exclusive end).", "t": "code_output"},
        {"q": "Which data structure uses LIFO?", "o": ["Stack", "Queue", "Array", "Heap"], "a": "Stack", "e": "Stack = Last In, First Out. Push and pop from the top.", "t": "ds"},
        {"q": "Which data structure uses FIFO?", "o": ["Queue", "Stack", "Tree", "Graph"], "a": "Queue", "e": "Queue = First In, First Out. Enqueue at back, dequeue from front.", "t": "ds"},
        {"q": "What is the output of: 'hello'[::-1]?", "o": ["olleh", "hello", "hllo", "Error"], "a": "olleh", "e": "[::-1] reverses the string using Python slice notation.", "t": "code_output"},
        {"q": "What does [] + [1, 2] evaluate to?", "o": ["[1, 2]", "[]", "Error", "[0, 1, 2]"], "a": "[1, 2]", "e": "List concatenation: empty list + [1, 2] = [1, 2].", "t": "code_output"},
        {"q": "Which keyword is used to define a function in Python?", "o": ["def", "function", "fn", "func"], "a": "def", "e": "Python uses 'def' to define functions. E.g., def my_func():", "t": "syntax"},
        {"q": "What is the output of: bool('') ?", "o": ["False", "True", "None", "Error"], "a": "False", "e": "An empty string is falsy in Python.", "t": "code_output"},
        {"q": "What is the time complexity of accessing an element in a list by index?", "o": ["O(1)", "O(n)", "O(log n)", "O(n²)"], "a": "O(1)", "e": "Python lists are backed by arrays; index access is O(1).", "t": "complexity"},
        {"q": "What does `not True` evaluate to?", "o": ["False", "True", "None", "0"], "a": "False", "e": "not reverses boolean: not True = False.", "t": "code_output"},
        {"q": "Which of these creates an empty dictionary in Python?", "o": ["{}", "[]", "()", "set()"], "a": "{}", "e": "{} creates an empty dict. {} vs set(): set() creates an empty set.", "t": "syntax"},
        {"q": "What is the output of: print(2 ** 3)?", "o": ["8", "6", "9", "5"], "a": "8", "e": "** is the exponentiation operator. 2³ = 8.", "t": "code_output"},
        {"q": "Which loop guarantees at least one execution?", "o": ["do-while", "for", "while", "foreach"], "a": "do-while", "e": "do-while checks condition after the first iteration.", "t": "control_flow"},
    ],
    "intermediate": [
        {"q": "What is the output of: [x for x in range(10) if x % 2 == 0][-1]?", "o": ["8", "10", "6", "9"], "a": "8", "e": "Even numbers in range(10): [0,2,4,6,8]. Last element is 8.", "t": "code_output"},
        {"q": "What is the worst-case time complexity of QuickSort?", "o": ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], "a": "O(n²)", "e": "Worst case occurs with bad pivot (e.g., sorted input). Average is O(n log n).", "t": "complexity"},
        {"q": "What does 'mutable' mean for Python data types?", "o": ["Can be changed after creation", "Cannot be changed after creation", "Can be sorted", "Can be copied"], "a": "Can be changed after creation", "e": "Lists, dicts, sets are mutable. Strings, tuples, ints are immutable.", "t": "concepts"},
        {"q": "What is a closure in Python?", "o": ["A function that remembers its enclosing scope", "A class method", "A decorator", "A lambda function"], "a": "A function that remembers its enclosing scope", "e": "Closures 'close over' variables from their enclosing scope.", "t": "concepts"},
        {"q": "Which algorithm finds shortest path in unweighted graphs?", "o": ["BFS", "DFS", "Dijkstra", "Bellman-Ford"], "a": "BFS", "e": "BFS explores level by level, guaranteeing shortest path in unweighted graphs.", "t": "algorithms"},
        {"q": "What is the space complexity of merge sort?", "o": ["O(n)", "O(1)", "O(log n)", "O(n²)"], "a": "O(n)", "e": "Merge sort requires O(n) auxiliary space for merging.", "t": "complexity"},
        {"q": "What does @property do in Python?", "o": ["Makes a method accessible as an attribute", "Makes a class immutable", "Caches function results", "Creates a class variable"], "a": "Makes a method accessible as an attribute", "e": "@property allows method to be called without () parentheses.", "t": "syntax"},
        {"q": "What is the output of: dict.fromkeys(['a','b','c'], 0)?", "o": ["{'a':0,'b':0,'c':0}", "{'a','b','c'}", "[0,0,0]", "Error"], "a": "{'a':0,'b':0,'c':0}", "e": "fromkeys creates a dict with specified keys and default value.", "t": "code_output"},
        {"q": "Which data structure is best for O(1) average lookup?", "o": ["Hash Table", "Array", "BST", "Linked List"], "a": "Hash Table", "e": "Hash tables use hashing for O(1) average get/set/delete.", "t": "ds"},
        {"q": "What does 'yield' do in Python?", "o": ["Pauses function, returns value to caller, resumes on next()", "Returns a value and terminates the function", "Throws an exception", "Sleeps the thread"], "a": "Pauses function, returns value to caller, resumes on next()", "e": "yield creates a generator function that lazily produces values.", "t": "concepts"},
        {"q": "What is a decorator in Python?", "o": ["A function that wraps another function", "A class attribute", "A type annotation", "An import statement"], "a": "A function that wraps another function", "e": "Decorators modify or enhance functions without changing their source code.", "t": "concepts"},
        {"q": "What is the output of: sorted([3,1,4,1,5], reverse=True)?", "o": ["[5,4,3,1,1]", "[1,1,3,4,5]", "[5,4,3,2,1]", "Error"], "a": "[5,4,3,1,1]", "e": "sorted() with reverse=True sorts descending.", "t": "code_output"},
        {"q": "What is an abstract class?", "o": ["A class with at least one abstract method that cannot be instantiated", "A class with no attributes", "A private class", "A class with only static methods"], "a": "A class with at least one abstract method that cannot be instantiated", "e": "Abstract classes define interfaces; concrete subclasses implement them.", "t": "oop"},
        {"q": "What is the result of: (1, 2, 3) + (4, 5)?", "o": ["(1,2,3,4,5)", "(1,2,3)", "Error", "(4,5,1,2,3)"], "a": "(1,2,3,4,5)", "e": "Tuples support concatenation with + producing a new tuple.", "t": "code_output"},
        {"q": "Which Python built-in finds the largest value?", "o": ["max()", "largest()", "top()", "first()"], "a": "max()", "e": "max() returns the largest item in an iterable.", "t": "builtins"},
    ],
    "advanced": [
        {"q": "What is the time complexity of building a heap?", "o": ["O(n)", "O(n log n)", "O(log n)", "O(n²)"], "a": "O(n)", "e": "Heapify from bottom-up is O(n) due to geometric series convergence.", "t": "complexity"},
        {"q": "What does the Global Interpreter Lock (GIL) in CPython prevent?", "o": ["True parallel execution of Python threads", "Memory leaks", "Deadlocks", "Garbage collection"], "a": "True parallel execution of Python threads", "e": "GIL ensures only one thread runs Python bytecode at a time.", "t": "concurrency"},
        {"q": "What is memoization?", "o": ["Caching results of expensive function calls", "Allocating memory for a program", "A sorting technique", "A type of recursion"], "a": "Caching results of expensive function calls", "e": "Memoization stores results to avoid recomputation (top-down DP).", "t": "optimization"},
        {"q": "What problem does the Traveling Salesman Problem (TSP) solve?", "o": ["Shortest route visiting all cities exactly once", "Shortest path between two nodes", "Maximum flow in a network", "Minimum spanning tree"], "a": "Shortest route visiting all cities exactly once", "e": "TSP is NP-Hard: finding optimal Hamiltonian cycle in a weighted graph.", "t": "algorithms"},
        {"q": "What is the difference between TCP and UDP?", "o": ["TCP is reliable/ordered; UDP is faster/connectionless", "TCP is faster; UDP is reliable", "TCP uses HTTP; UDP uses FTP", "No difference"], "a": "TCP is reliable/ordered; UDP is faster/connectionless", "e": "TCP has error checking and ordering; UDP trades reliability for speed.", "t": "networking"},
        {"q": "What is tail recursion optimization?", "o": ["Compiler converts tail call into iteration to save stack frames", "Using recursion at the end of a file", "Optimizing the base case", "Reducing function arguments"], "a": "Compiler converts tail call into iteration to save stack frames", "e": "TCO eliminates stack overflow risk for recursive algorithms.", "t": "optimization"},
        {"q": "What is the output of: list(map(lambda x: x**2, [1,2,3,4]))?", "o": ["[1, 4, 9, 16]", "[1, 2, 3, 4]", "[2, 4, 6, 8]", "Error"], "a": "[1, 4, 9, 16]", "e": "map applies the lambda to each element: [1², 2², 3², 4²] = [1,4,9,16].", "t": "code_output"},
        {"q": "What is Big-O of finding an element in a balanced BST?", "o": ["O(log n)", "O(n)", "O(1)", "O(n log n)"], "a": "O(log n)", "e": "Balanced BST height is log n, so search is O(log n).", "t": "complexity"},
        {"q": "What is the Observer design pattern used for?", "o": ["Notifying dependents when an object's state changes", "Creating objects without specifying class", "Controlling object access", "Wrapping an interface"], "a": "Notifying dependents when an object's state changes", "e": "Observer implements publish-subscribe for event-driven systems.", "t": "design_patterns"},
        {"q": "What is a race condition?", "o": ["When two threads access shared data unsynchronised", "When a thread runs too fast", "When memory runs out", "When a CPU overheats"], "a": "When two threads access shared data unsynchronised", "e": "Race conditions produce undefined behavior; solved with locks/semaphores.", "t": "concurrency"},
        {"q": "Which of these is NOT a SOLID principle?", "o": ["Don't Repeat Yourself (DRY)", "Single Responsibility", "Open/Closed", "Liskov Substitution"], "a": "Don't Repeat Yourself (DRY)", "e": "SOLID = S,O,L,I,D. DRY is a separate principle about code duplication.", "t": "principles"},
        {"q": "What does `async/await` enable?", "o": ["Non-blocking concurrency using coroutines", "Parallel threading", "Synchronized I/O", "Memory pooling"], "a": "Non-blocking concurrency using coroutines", "e": "async/await allows cooperative multitasking without OS threads.", "t": "concurrency"},
        {"q": "What is consistent hashing used for?", "o": ["Distributing load across servers with minimal remapping", "Hashing passwords", "Sorting hash tables", "Checking data integrity"], "a": "Distributing load across servers with minimal remapping", "e": "Consistent hashing minimises key remapping when nodes are added/removed.", "t": "distributed"},
        {"q": "Which sorting is stable AND O(n) for small alphabets?", "o": ["Counting Sort", "Merge Sort", "Heap Sort", "Quick Sort"], "a": "Counting Sort", "e": "Counting sort is O(n+k) where k = range. Stable by default.", "t": "algorithms"},
    ],
}


class CodingGenerator(BaseGenerator):
    """Coding question generator from a curated static bank."""

    @property
    def mode(self) -> str:
        return GameMode.CODING.value

    def generate(
        self,
        difficulty: Difficulty,
        count: int = 10,
        topic: str | None = None,
        exclude_ids: set[str] | None = None,
    ) -> list[QuestionModel]:
        exclude = set(exclude_ids) if exclude_ids else set()
        bank = _CODING_BANK.get(difficulty.value, _CODING_BANK["beginner"])

        if topic:
            bank = [q for q in bank if q["t"] == topic] or bank

        pool = list(bank)
        random.shuffle(pool)

        questions: list[QuestionModel] = []
        idx = 0

        while len(questions) < count and idx < len(pool) * 4:
            entry = pool[idx % len(pool)]
            idx += 1
            qid = generate_id("code")
            if qid in exclude:
                continue

            opts = list(entry["o"])
            random.shuffle(opts)

            qt = (
                QuestionType.CODE_OUTPUT
                if entry["t"] == "code_output"
                else QuestionType.MCQ
            )

            q = QuestionModel(
                id=qid,
                mode=GameMode.CODING,
                difficulty=difficulty,
                topic=entry["t"],
                question=entry["q"],
                question_type=qt,
                options=opts,
                correct_answer=entry["a"],
                explanation=entry["e"],
                hint="Trace through the code or recall the concept.",
                time_limit=calculate_time_limit(difficulty.value),
                xp=calculate_xp(difficulty.value),
                coins=calculate_coins(difficulty.value),
                tags=["coding", entry["t"]],
            )
            exclude.add(qid)
            questions.append(q)

        return questions
