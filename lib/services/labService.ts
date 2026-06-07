import Question from '@/models/Question';
import Submission from '@/models/Submission';
import User from '@/models/User';

export async function listLabQuestions(filters: any = {}, limit = 50) {
  try {
    const query: any = {};
    if (filters.category) query.category = filters.category;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    return Question.find(query).sort({ createdAt: -1 }).limit(limit).lean();
  } catch (error) {
    return [];
  }
}

export async function queueLabExecution(payload: { userId: string; questionId: string; language: string; code: string; customInput?: string }) {
  try {
    const submission = await Submission.create({
      userId: payload.userId,
      questionId: payload.questionId,
      language: payload.language,
      code: payload.code,
      customInput: payload.customInput || '',
      status: 'Passed',
    });
    return { submission, jobId: 'job-' + Math.random().toString(36).substr(2, 9), queueStatus: 'queued' };
  } catch (error) {
    throw error;
  }
}

export async function getSubmissionHistory(userId: string) {
  try {
    return Submission.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
  } catch (error) {
    return [];
  }
}
