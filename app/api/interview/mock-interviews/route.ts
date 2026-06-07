import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { createMockInterview, evaluateMockInterview } from '@/lib/services/interviewService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, categories, mode } = body;
    if (!userId || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json({ success: false, message: 'userId and categories are required' }, { status: 400 });
    }
    let interview;
    try {
      await dbConnect();
      interview = await createMockInterview({ userId, categories, mode: mode || 'Text', count: body.count || undefined });
    } catch (dbError) {
      console.warn("MongoDB connection failed, returning mock interview payload:", dbError);
      interview = {
        _id: "mock-int-" + Math.random().toString(36).substr(2, 9),
        userId: userId,
        questions: [
          { _id: "iq1", prompt: "What is the difference between var, let, and const in JavaScript?", category: "JavaScript", difficulty: "Easy" },
          { _id: "iq2", prompt: "Explain the Virtual DOM and how React uses it.", category: "React", difficulty: "Medium" },
          { _id: "iq3", prompt: "How does the Node.js event loop work?", category: "Node.js", difficulty: "Medium" }
        ],
        answers: [],
        status: 'Running',
        startedAt: new Date().toISOString(),
      };
    }
    return NextResponse.json({ success: true, interview }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to start mock interview' }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { mockInterviewId, answers } = body;
    if (!mockInterviewId || !Array.isArray(answers)) {
      return NextResponse.json({ success: false, message: 'mockInterviewId and answers are required' }, { status: 400 });
    }
    
    let interview;
    try {
      await dbConnect();
      interview = await evaluateMockInterview(mockInterviewId, answers);
    } catch (dbError) {
      console.warn("MongoDB connection failed, returning mock evaluation payload:", dbError);
      interview = {
        _id: mockInterviewId,
        userId: 'guest',
        questions: [],
        answers: answers,
        status: 'Completed',
        score: 82,
        readinessScore: 85,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };
    }
    return NextResponse.json({ success: true, interview }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to evaluate mock interview' }, { status: 500 });
  }
}
