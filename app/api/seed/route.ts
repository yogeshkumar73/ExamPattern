import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Question from '@/models/Question';
import InterviewQuestion from '@/models/InterviewQuestion';

const SAMPLE_QUESTIONS = [
  {
    title: "Two Sum",
    slug: "two-sum",
    description: "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] == 9, so we return [0, 1].",
    category: "Array",
    difficulty: "Easy",
    supportedLanguages: ["JavaScript", "Python", "Java", "C++"],
    sampleInput: "[2,7,11,15]\n9",
    sampleOutput: "[0,1]",
    tags: ["Array", "Hash Table"],
  },
  {
    title: "Reverse String",
    slug: "reverse-string",
    description: "Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
    category: "String",
    difficulty: "Easy",
    supportedLanguages: ["JavaScript", "Python", "Java", "C++"],
    sampleInput: '["h","e","l","l","o"]',
    sampleOutput: '["o","l","l","e","h"]',
    tags: ["String", "Two Pointers"],
  },
  {
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    category: "String",
    difficulty: "Medium",
    supportedLanguages: ["JavaScript", "Python", "Java", "C++"],
    sampleInput: '"abcabcbb"',
    sampleOutput: "3",
    tags: ["String", "Sliding Window", "Hash Table"],
  },
  {
    title: "Binary Tree Level Order Traversal",
    slug: "binary-tree-level-order",
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    category: "Tree",
    difficulty: "Medium",
    supportedLanguages: ["JavaScript", "Python", "Java", "C++"],
    sampleInput: "[3,9,20,null,null,15,7]",
    sampleOutput: "[[3],[9,20],[15,7]]",
    tags: ["Tree", "BFS", "Queue"],
  },
  {
    title: "Merge K Sorted Lists",
    slug: "merge-k-sorted-lists",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    category: "Linked List",
    difficulty: "Hard",
    supportedLanguages: ["JavaScript", "Python", "Java", "C++"],
    sampleInput: "[[1,4,5],[1,3,4],[2,6]]",
    sampleOutput: "[1,1,2,1,3,4,4,5,6]",
    tags: ["Linked List", "Divide and Conquer"],
  },
];

const SAMPLE_INTERVIEW_QUESTIONS = [
  {
    prompt: "Explain the difference between var, let, and const in JavaScript.",
    category: "JavaScript",
    difficulty: "Easy",
    tags: ["JavaScript", "Fundamentals"],
  },
  {
    prompt: "What is the Virtual DOM and how does React use it?",
    category: "React",
    difficulty: "Medium",
    tags: ["React", "Performance"],
  },
  {
    prompt: "Design a URL shortening service like bit.ly. How would you handle scale?",
    category: "System Design",
    difficulty: "Hard",
    tags: ["System Design", "Scalability"],
  },
  {
    prompt: "How does the Node.js event loop work? Explain the different phases.",
    category: "Node.js",
    difficulty: "Medium",
    tags: ["Node.js", "Async"],
  },
  {
    prompt: "Explain CORS and how you would handle it in a web application.",
    category: "Web Security",
    difficulty: "Medium",
    tags: ["Security", "HTTP"],
  },
  {
    prompt: "Design a real-time notification system. What are the key components?",
    category: "System Design",
    difficulty: "Hard",
    tags: ["System Design", "WebSocket"],
  },
  {
    prompt: "What are the SOLID principles? Give an example for each.",
    category: "System Design",
    difficulty: "Medium",
    tags: ["Design Patterns", "OOP"],
  },
  {
    prompt: "Explain the difference between SQL and NoSQL databases.",
    category: "Database",
    difficulty: "Easy",
    tags: ["Database", "Fundamentals"],
  },
];

export async function POST(req: Request) {
  try {
    await dbConnect();

    const existingQuestions = await Question.countDocuments();
    if (existingQuestions === 0) {
      await Question.insertMany(SAMPLE_QUESTIONS);
    }

    const existingInterviewQuestions = await InterviewQuestion.countDocuments();
    if (existingInterviewQuestions === 0) {
      await InterviewQuestion.insertMany(SAMPLE_INTERVIEW_QUESTIONS);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Seed data loaded successfully",
        questionsCreated: existingQuestions === 0 ? SAMPLE_QUESTIONS.length : 0,
        interviewQuestionsCreated: existingInterviewQuestions === 0 ? SAMPLE_INTERVIEW_QUESTIONS.length : 0,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const questionCount = await Question.countDocuments();
    const interviewCount = await InterviewQuestion.countDocuments();
    return NextResponse.json(
      {
        success: true,
        statistics: {
          totalQuestions: questionCount,
          totalInterviewQuestions: interviewCount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
