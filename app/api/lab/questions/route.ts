import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { listLabQuestions } from '@/lib/services/labService';

const FALLBACK_QUESTIONS = [
  {
    _id: "q1",
    title: "Two Sum",
    slug: "two-sum",
    description: "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.",
    category: "Array",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
  },
  {
    _id: "q2",
    title: "Reverse String",
    slug: "reverse-string",
    description: "Write a function that reverses a string.",
    category: "String",
    difficulty: "Easy",
    tags: ["String", "Two Pointers"],
  },
  {
    _id: "q3",
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    category: "String",
    difficulty: "Medium",
    tags: ["String", "Sliding Window"],
  },
];

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || undefined;
    const difficulty = url.searchParams.get('difficulty') || undefined;
    const questions = await listLabQuestions({ category, difficulty });
    
    const result = questions.length > 0 ? questions : FALLBACK_QUESTIONS;
    return NextResponse.json({ success: true, questions: result }, { status: 200 });
  } catch (error: any) {
    console.warn('Failed to load lab questions from DB, returning fallback:', error);
    return NextResponse.json({ success: true, questions: FALLBACK_QUESTIONS }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.slug || !body.description) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: title, slug, description' },
        { status: 400 }
      );
    }
    await dbConnect();
    const newQuestion = {
      title: body.title,
      slug: body.slug,
      description: body.description,
      category: body.category || 'General',
      difficulty: body.difficulty || 'Medium',
      tags: body.tags || [],
    };
    return NextResponse.json({ success: true, question: newQuestion }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

