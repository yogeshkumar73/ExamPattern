import InterviewQuestion from '@/models/InterviewQuestion';
import MockInterview from '@/models/MockInterview';
import { aiMockFeedback } from './aiService';

export async function listInterviewQuestions(filters: any = {}) {
  try {
    const query: any = {};
    if (filters.category) query.category = filters.category;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    return InterviewQuestion.find(query).sort({ createdAt: -1 }).lean();
  } catch (error) {
    return [];
  }
}

export async function createMockInterview(payload: { userId: string; categories: string[]; mode: string; durationMinutes?: number; count?: number }) {
  try {
    const desired = payload.count && payload.count > 0 ? payload.count : 5
    // Attempt to query matching category questions
    let questionDocs = await InterviewQuestion.find({ category: { $in: payload.categories } }).limit(desired);
    
    // Fallback 1: Query any questions in the DB
    if (questionDocs.length === 0) {
      questionDocs = await InterviewQuestion.find({}).limit(desired);
    }
    
    // If not enough questions found for category in DB, load matching from FALLBACK_INTERVIEW_QUESTIONS
    if (questionDocs.length < desired) {
      try {
        const { FALLBACK_INTERVIEW_QUESTIONS } = await import('@/app/api/interview/questions/route');
        const reqCats = (payload.categories || []).map(c => c.toLowerCase());
        const matchingFallbacks = FALLBACK_INTERVIEW_QUESTIONS.filter(fb => 
          reqCats.length === 0 || reqCats.some(c => fb.category.toLowerCase().includes(c) || c.includes(fb.category.toLowerCase()))
        );
        const pool = matchingFallbacks.length > 0 ? matchingFallbacks : FALLBACK_INTERVIEW_QUESTIONS;
        const toAdd = pool.slice(0, desired - questionDocs.length).map(q => ({
          prompt: q.prompt,
          category: q.category,
          difficulty: q.difficulty,
          tags: q.tags || [],
        }));
        if (toAdd.length > 0) {
          const inserted = await InterviewQuestion.insertMany(toAdd);
          questionDocs = [...questionDocs, ...inserted];
        }
      } catch (fbErr) {
        console.warn("Fallback seed in interviewService failed:", fbErr);
      }
    }

    // If we have fewer than desired, attempt to generate the remainder via AI
    if (questionDocs.length < desired) {
      try {
        const { aiInterviewQuestion } = await import('./aiService');
        const toGenerate = desired - questionDocs.length
        for (let i = 0; i < toGenerate; i++) {
          const gen = await aiInterviewQuestion({ categories: payload.categories, difficulty: undefined });
          if (gen && gen.question) {
            // create lightweight doc but do not necessarily persist to main collection
            questionDocs.push(new InterviewQuestion({ prompt: gen.question, category: payload.categories[0] || 'General', difficulty: 'Medium' }));
          }
        }
      } catch (aiErr) {
        // ignore and continue with available questions
        console.warn('AI question generation failed:', aiErr)
      }
    }

    const interview = await MockInterview.create({
      userId: payload.userId,
      questions: questionDocs.map((q) => q._id || q),
      answers: [],
      status: 'Running',
      startedAt: new Date(),
    });

    // Populate the questions details so that the frontend receives actual questions, not just IDs
    const populated = await MockInterview.findById(interview._id).populate('questions').lean();
    return populated;
  } catch (error) {
    console.error("Error creating mock interview:", error);
    throw error;
  }
}

export async function evaluateMockInterview(mockInterviewId: string, answers: string[]) {
  try {
    const interview = await MockInterview.findById(mockInterviewId);
    if (!interview) throw new Error('Mock interview not found');
    
    // Use OpenAI to score the answers with question context
    let score = 75;
    let readinessScore = 80;
    let feedbackText = '';
    try {
      const populatedInterview = await MockInterview.findById(mockInterviewId).populate('questions').lean() as any;
      const questions = populatedInterview?.questions || [];
      const evaluation = await aiMockFeedback({ answers, questions });
      if (evaluation && evaluation.score !== undefined) {
        score = evaluation.score;
      }
      if (evaluation && evaluation.readinessScore !== undefined) {
        readinessScore = evaluation.readinessScore;
      }
      if (evaluation && evaluation.feedback) {
        feedbackText = evaluation.feedback;
      }
    } catch (aiErr) {
      console.warn("AI Evaluation failed, using local scoring fallback:", aiErr);
    }

    interview.status = 'Completed';
    interview.answers = answers;
    interview.score = score;
    interview.readinessScore = readinessScore;
    if (feedbackText) (interview as any).feedback = feedbackText;
    interview.completedAt = new Date();
    await interview.save();
    const result = interview.toObject ? interview.toObject() : interview;
    if (feedbackText) (result as any).feedback = feedbackText;
    return result;
  } catch (error) {
    console.error("Error evaluating mock interview:", error);
    throw error;
  }
}
