import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { listInterviewQuestions } from '@/lib/services/interviewService';

const FALLBACK_INTERVIEW_QUESTIONS = [
  {
    _id: "iq1",
    prompt: "What is the difference between var, let, and const in JavaScript?",
    category: "JavaScript",
    difficulty: "Easy",
    tags: ["JavaScript", "Fundamentals"],
  },
  {
    _id: "iq2",
    prompt: "Explain the Virtual DOM and how React uses it.",
    category: "React",
    difficulty: "Medium",
    tags: ["React", "Performance"],
  },
  {
    _id: "iq3",
    prompt: "Design a URL shortening service like bit.ly.",
    category: "System Design",
    difficulty: "Hard",
    tags: ["System Design", "Scalability"],
  },
  {
    _id: "iq4",
    prompt: "How does the Node.js event loop work?",
    category: "Node.js",
    difficulty: "Medium",
    tags: ["Node.js", "Async"],
  },
  {
    _id: "iq5",
    prompt: "Explain CORS and how to handle it in web applications.",
    category: "Web Security",
    difficulty: "Medium",
    tags: ["Security", "HTTP"],
  },
];

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || undefined;
    const difficulty = url.searchParams.get('difficulty') || undefined;
    const questions = await listInterviewQuestions({ category, difficulty });
    
    const result = questions.length > 0 ? questions : FALLBACK_INTERVIEW_QUESTIONS;
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

