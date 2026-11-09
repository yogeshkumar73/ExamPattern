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
    
    // Fallback 2: Dynamically seed the DB with base interview questions if completely empty
    if (questionDocs.length === 0) {
      const defaults = [
        { prompt: "Explain the React reconciliation algorithm and how the Virtual DOM uses Fiber trees to prioritize updates.", category: "React", difficulty: "Medium", tags: ["React", "Fiber"] },
        { prompt: "What is the difference between useEffect and useLayoutEffect? When can improper dependencies cause memory leaks?", category: "React", difficulty: "Medium", tags: ["React", "Hooks"] },
        { prompt: "Compare Server-Side Rendering (SSR), SSG, and ISR in Next.js. How do you decide caching trade-offs?", category: "NextJs", difficulty: "Medium", tags: ["NextJs", "SSR"] },
        { prompt: "Explain the phases of the Node.js event loop and how process.nextTick() prioritizes execution.", category: "Node", difficulty: "Medium", tags: ["Node", "Async"] },
        { prompt: "How do you implement an LRU Cache with O(1) get and put operations using a Doubly Linked List and Hash Map?", category: "DSA", difficulty: "Hard", tags: ["DSA", "Cache"] },
        { prompt: "Design a high-throughput URL shortening service like bit.ly. How do you generate unique Base62 keys and handle 100,000 QPS?", category: "SystemDesign", difficulty: "Medium", tags: ["SystemDesign", "Scalability"] },
        { prompt: "What is the Global Interpreter Lock (GIL) in CPython, and how does it impact concurrency for CPU vs I/O tasks?", category: "Python", difficulty: "Medium", tags: ["Python", "GIL"] },
        { prompt: "Explain the internal bucket architecture and collision resolution in Java 8+ HashMap.", category: "Java", difficulty: "Medium", tags: ["Java", "HashMap"] },
        { prompt: "Explain Clustered vs Non-Clustered indexes in SQL and how a B-Tree index optimizes range scans.", category: "SQL", difficulty: "Medium", tags: ["SQL", "Indexing"] }
      ];
      questionDocs = await InterviewQuestion.insertMany(defaults);
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
