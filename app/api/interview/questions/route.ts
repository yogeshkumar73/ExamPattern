import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { listInterviewQuestions } from '@/lib/services/interviewService';

const FALLBACK_INTERVIEW_QUESTIONS = [
  // --- React ---
  {
    _id: "iq-react-1",
    prompt: "Explain the React reconciliation algorithm and how the Virtual DOM uses Fiber architecture to prioritize and interrupt rendering tasks.",
    category: "React",
    difficulty: "Medium",
    tags: ["React", "Fiber", "Virtual DOM", "Performance"],
  },
  {
    _id: "iq-react-2",
    prompt: "What is the difference between useEffect and useLayoutEffect? How can improper dependency arrays cause memory leaks or infinite re-renders?",
    category: "React",
    difficulty: "Medium",
    tags: ["React", "Hooks", "Lifecycle"],
  },
  {
    _id: "iq-react-3",
    prompt: "Explain how React.memo, useMemo, and useCallback work under the hood. When can premature optimization with them actually degrade performance?",
    category: "React",
    difficulty: "Medium",
    tags: ["React", "Optimization", "Memoization"],
  },
  {
    _id: "iq-react-4",
    prompt: "What are Synthetic Events in React, and how does event delegation work in modern React (v17/18) compared to earlier versions?",
    category: "React",
    difficulty: "Easy",
    tags: ["React", "DOM", "Events"],
  },
  {
    _id: "iq-react-5",
    prompt: "How does React 18 Concurrent Rendering work? Explain the difference between useTransition and useDeferredValue.",
    category: "React",
    difficulty: "Hard",
    tags: ["React", "Concurrent", "React 18"],
  },

  // --- Next.js ---
  {
    _id: "iq-next-1",
    prompt: "Compare Server-Side Rendering (SSR), Static Site Generation (SSG), and Incremental Static Regeneration (ISR) in Next.js. What are the caching trade-offs?",
    category: "NextJs",
    difficulty: "Medium",
    tags: ["Next.js", "SSR", "SSG", "ISR"],
  },
  {
    _id: "iq-next-2",
    prompt: "How do React Server Components (RSC) differ from Client Components in the Next.js App Router, and what are the serialization boundary constraints?",
    category: "NextJs",
    difficulty: "Hard",
    tags: ["Next.js", "RSC", "App Router"],
  },
  {
    _id: "iq-next-3",
    prompt: "Explain Middleware in Next.js. How does it execute on Edge runtimes, and what are its latency advantages for authentication and geo-routing?",
    category: "NextJs",
    difficulty: "Hard",
    tags: ["Next.js", "Edge", "Middleware", "Security"],
  },
  {
    _id: "iq-next-4",
    prompt: "How do Server Actions work under the hood in Next.js? How do you prevent CSRF attacks and handle optimistic UI updates?",
    category: "NextJs",
    difficulty: "Medium",
    tags: ["Next.js", "Server Actions", "Forms"],
  },

  // --- Node.js ---
  {
    _id: "iq-node-1",
    prompt: "Explain the phases of the Node.js Event Loop (Timers, Pending Callbacks, Poll, Check, Close) and how process.nextTick() prioritizes execution over setImmediate().",
    category: "Node",
    difficulty: "Medium",
    tags: ["Node.js", "Event Loop", "Async"],
  },
  {
    _id: "iq-node-2",
    prompt: "What is the difference between Streams and Buffers in Node.js? How do you implement backpressure when streaming large files over HTTP?",
    category: "Node",
    difficulty: "Hard",
    tags: ["Node.js", "Streams", "Backpressure"],
  },
  {
    _id: "iq-node-3",
    prompt: "How does Node.js achieve concurrency despite being single-threaded? Compare the Cluster module with Worker Threads for CPU-bound tasks.",
    category: "Node",
    difficulty: "Medium",
    tags: ["Node.js", "Concurrency", "Worker Threads"],
  },
  {
    _id: "iq-node-4",
    prompt: "How would you design a scalable distributed rate-limiting middleware in Express or Fastify using Redis sliding-window counter?",
    category: "Node",
    difficulty: "Hard",
    tags: ["Node.js", "Redis", "Rate Limiting", "System Design"],
  },
  {
    _id: "iq-node-5",
    prompt: "How do you detect, profile, and fix memory leaks (closures, global variables, event listeners) in a production Node.js service?",
    category: "Node",
    difficulty: "Hard",
    tags: ["Node.js", "Debugging", "Memory Management"],
  },

  // --- DSA & Algorithms ---
  {
    _id: "iq-dsa-1",
    prompt: "Given an unsorted array of integers, how would you find two numbers that sum up to a target value in O(n) time and O(n) space?",
    category: "DSA",
    difficulty: "Easy",
    tags: ["DSA", "Arrays", "Hash Map"],
  },
  {
    _id: "iq-dsa-2",
    prompt: "Explain how to detect a cycle and find the entry point of the cycle in a singly linked list using Floyd's Tortoise and Hare algorithm.",
    category: "DSA",
    difficulty: "Medium",
    tags: ["DSA", "Linked List", "Two Pointers"],
  },
  {
    _id: "iq-dsa-3",
    prompt: "How would you design an LRU (Least Recently Used) Cache supporting O(1) get and put operations using a Doubly Linked List and Hash Map?",
    category: "DSA",
    difficulty: "Hard",
    tags: ["DSA", "LRU Cache", "Data Structures"],
  },
  {
    _id: "iq-dsa-4",
    prompt: "Explain the sliding window technique to find the length of the longest substring without repeating characters in O(n) time.",
    category: "DSA",
    difficulty: "Medium",
    tags: ["DSA", "Sliding Window", "Strings"],
  },
  {
    _id: "iq-dsa-5",
    prompt: "How does Binary Search on a rotated sorted array work in O(log n) time? How do you determine which half of the array is sorted?",
    category: "DSA",
    difficulty: "Medium",
    tags: ["DSA", "Binary Search", "Algorithms"],
  },
  {
    _id: "iq-dsa-6",
    prompt: "Explain the difference between BFS and DFS. In what interview scenarios would you choose BFS over DFS for graph traversal?",
    category: "DSA",
    difficulty: "Easy",
    tags: ["DSA", "Graphs", "BFS", "DFS"],
  },

  // --- System Design ---
  {
    _id: "iq-sys-1",
    prompt: "Design a high-throughput URL shortening service like TinyURL or bit.ly. How do you generate unique 7-character Base62 keys and handle 100,000 read QPS?",
    category: "SystemDesign",
    difficulty: "Medium",
    tags: ["System Design", "Scalability", "Hashing"],
  },
  {
    _id: "iq-sys-2",
    prompt: "Design a real-time Notification System (Push, SMS, Email) supporting 100 million active users. How do you ensure idempotency and handle provider outages?",
    category: "SystemDesign",
    difficulty: "Hard",
    tags: ["System Design", "Message Queues", "Kafka", "Fault Tolerance"],
  },
  {
    _id: "iq-sys-3",
    prompt: "Design a real-time Chat Application like WhatsApp or Slack. Explain WebSocket connection pooling, message ordering, and offline message storage.",
    category: "SystemDesign",
    difficulty: "Hard",
    tags: ["System Design", "WebSockets", "Distributed Systems"],
  },
  {
    _id: "iq-sys-4",
    prompt: "Explain cache invalidation strategies (Cache-Aside, Write-Through, Write-Behind) and how to mitigate Cache Stampede / Dog-piling during sudden traffic spikes.",
    category: "SystemDesign",
    difficulty: "Medium",
    tags: ["System Design", "Caching", "Redis"],
  },
  {
    _id: "iq-sys-5",
    prompt: "Explain the CAP Theorem and PACELC theorem. How do consistency models (strong, eventual, monotonic read) impact database selection?",
    category: "SystemDesign",
    difficulty: "Hard",
    tags: ["System Design", "CAP Theorem", "Distributed Databases"],
  },

  // --- Python ---
  {
    _id: "iq-py-1",
    prompt: "What is the Global Interpreter Lock (GIL) in CPython? How does it affect CPU-bound vs I/O-bound concurrency, and how does multiprocessing bypass it?",
    category: "Python",
    difficulty: "Medium",
    tags: ["Python", "GIL", "Concurrency"],
  },
  {
    _id: "iq-py-2",
    prompt: "Explain how Python Generators and the 'yield' statement work. How do they enable streaming and memory efficiency compared to returning lists?",
    category: "Python",
    difficulty: "Easy",
    tags: ["Python", "Generators", "Memory"],
  },
  {
    _id: "iq-py-3",
    prompt: "How does Python handle memory management? Explain reference counting, cyclic garbage collection, and the difference between shallow and deep copy.",
    category: "Python",
    difficulty: "Medium",
    tags: ["Python", "Garbage Collection", "Memory"],
  },
  {
    _id: "iq-py-4",
    prompt: "How do Python decorators work internally, and how do you write a decorator that accepts arguments while preserving docstrings and metadata using functools.wraps?",
    category: "Python",
    difficulty: "Medium",
    tags: ["Python", "Decorators", "Metaprogramming"],
  },

  // --- Java ---
  {
    _id: "iq-java-1",
    prompt: "Explain the internal working of Java HashMap in Java 8+. How does it resolve hash collisions, and when does a bucket convert from a LinkedList to a Red-Black Tree?",
    category: "Java",
    difficulty: "Medium",
    tags: ["Java", "HashMap", "Collections"],
  },
  {
    _id: "iq-java-2",
    prompt: "What is the difference between synchronized, ReentrantLock, and volatile in Java? Explain the Java Memory Model happens-before relationship.",
    category: "Java",
    difficulty: "Medium",
    tags: ["Java", "Concurrency", "Multithreading"],
  },
  {
    _id: "iq-java-3",
    prompt: "Explain JVM memory architecture (Heap, Stack, Metaspace) and how modern Garbage Collectors like G1 and ZGC achieve low-latency pause times.",
    category: "Java",
    difficulty: "Hard",
    tags: ["Java", "JVM", "Garbage Collection"],
  },
  {
    _id: "iq-java-4",
    prompt: "What are Java Virtual Threads (Project Loom)? How do they achieve high throughput for blocking I/O compared to traditional platform threads?",
    category: "Java",
    difficulty: "Hard",
    tags: ["Java", "Virtual Threads", "Project Loom"],
  },

  // --- SQL & Databases ---
  {
    _id: "iq-sql-1",
    prompt: "Explain the difference between Clustered and Non-Clustered indexes. How does a B-Tree index speed up range queries and equality lookups?",
    category: "SQL",
    difficulty: "Medium",
    tags: ["SQL", "Indexing", "B-Tree"],
  },
  {
    _id: "iq-sql-2",
    prompt: "Explain ACID properties and the four SQL transaction isolation levels. What are dirty reads, non-repeatable reads, and phantom reads?",
    category: "SQL",
    difficulty: "Medium",
    tags: ["SQL", "Transactions", "ACID"],
  },
  {
    _id: "iq-sql-3",
    prompt: "How do you analyze a slow SQL query using EXPLAIN ANALYZE? What indicates a table scan vs index scan, and how would you optimize it?",
    category: "SQL",
    difficulty: "Medium",
    tags: ["SQL", "Optimization", "EXPLAIN"],
  },
  {
    _id: "iq-sql-4",
    prompt: "Compare Horizontal Sharding with Master-Slave Database Replication. How do you resolve replication lag and write bottlenecks at scale?",
    category: "SQL",
    difficulty: "Hard",
    tags: ["SQL", "Sharding", "Replication", "Databases"],
  },
];

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || undefined;
    const difficulty = url.searchParams.get('difficulty') || undefined;
    const questions = await listInterviewQuestions({ category, difficulty });
    
    let result: any[] = questions.length > 0 ? questions : FALLBACK_INTERVIEW_QUESTIONS;

    // If using fallback questions, apply category and difficulty filters accurately
    if (questions.length === 0) {
      if (category && category !== 'All') {
        const catNorm = category.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matched = result.filter(q => {
          const qCatNorm = q.category.toLowerCase().replace(/[^a-z0-9]/g, '');
          return qCatNorm.includes(catNorm) || catNorm.includes(qCatNorm);
        });
        if (matched.length > 0) result = matched;
      }
      if (difficulty && difficulty !== 'All') {
        const diffMatched = result.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
        if (diffMatched.length > 0) result = diffMatched;
      }
    }

    return NextResponse.json({ success: true, questions: result }, { status: 200 });
  } catch (error: any) {
    console.warn('Failed to load interview questions from DB, returning fallback:', error);
    return NextResponse.json({ success: true, questions: FALLBACK_INTERVIEW_QUESTIONS }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.prompt) {
      return NextResponse.json(
        { success: false, message: 'Missing required field: prompt' },
        { status: 400 }
      );
    }
    await dbConnect();
    const newQuestion = {
      prompt: body.prompt,
      category: body.category || 'General',
      difficulty: body.difficulty || 'Medium',
      tags: body.tags || [],
    };
    return NextResponse.json({ success: true, question: newQuestion }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
