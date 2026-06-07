import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { queueLabExecution } from '@/lib/services/labService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, questionId, language, code, customInput } = body;
    if (!userId || !questionId || !language || !code) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    let result;
    try {
      await dbConnect();
      // Store submission record
      await queueLabExecution({ userId, questionId, language, code, customInput });
    } catch (dbError) {
      console.warn("MongoDB connection failed while storing submission:", dbError);
    }

    const { executeCodeLocal } = await import('@/lib/services/executorService');
    const executionResult = await executeCodeLocal(language, code, customInput || '');
    
    result = {
      passed: executionResult.passed,
      output: executionResult.output,
      error: executionResult.error,
      runtimeMs: executionResult.runtimeMs,
      memoryMb: Math.random() * 10 + 2 // Mock memory usage
    };

    if (!executionResult.passed) {
      return NextResponse.json({ success: false, message: executionResult.error, execution: result }, { status: 400 });
    }

    return NextResponse.json({ success: true, execution: result }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Code execution failed' }, { status: 400 });
  }
}
