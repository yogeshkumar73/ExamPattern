const fs = require('fs');
const path = require('path');

const TIME_MAP = {
  beginner: 90,
  intermediate: 75,
  advanced: 60,
  expert: 45,
  master: 35,
  grandmaster: 25,
};

const XP_MAP = {
  beginner: 50,
  intermediate: 100,
  advanced: 200,
  expert: 400,
  master: 700,
  grandmaster: 1000,
};

const POINTS_MAP = {
  beginner: 100,
  intermediate: 200,
  advanced: 400,
  expert: 800,
  master: 1400,
  grandmaster: 2000,
};

const ATTEMPTS_MAP = {
  beginner: 12,
  intermediate: 16,
  advanced: 20,
  expert: 25,
  master: 30,
  grandmaster: 35,
};

const codingPart = require('./generator_part1.json').coding;
const mathList = require('./data_math.js');
const gkList = require('./data_gk.js');
const puzzleList = require('./data_puzzle.js');
const predictionList = require('./data_prediction.js');
const topicdocList = require('./data_topicdoc.js');
const mixedList = require('./data_mixed.js');

const finalBank = {
  coding: codingPart,
  math: { beginner: [], intermediate: [], advanced: [], expert: [], master: [], grandmaster: [] },
  gk: { beginner: [], intermediate: [], advanced: [], expert: [], master: [], grandmaster: [] },
  puzzle: { beginner: [], intermediate: [], advanced: [], expert: [], master: [], grandmaster: [] },
  prediction: { beginner: [], intermediate: [], advanced: [], expert: [], master: [], grandmaster: [] },
  topicdoc: { beginner: [], intermediate: [], advanced: [], expert: [], master: [], grandmaster: [] },
  mixed: { beginner: [], intermediate: [], advanced: [], expert: [], master: [], grandmaster: [] },
};

function processList(category, list) {
  for (const item of list) {
    const diff = item.difficulty;
    finalBank[category][diff].push({
      title: item.title,
      description: item.description,
      options: item.options || [],
      correctAnswer: item.correctAnswer,
      boilerplate: item.boilerplate || '',
      tags: item.tags || [category],
      hint: item.hint || '',
      timeLimit: TIME_MAP[diff] || 60,
      xpReward: XP_MAP[diff] || 50,
      pointsReward: POINTS_MAP[diff] || 100,
    });
  }
}

processList('math', mathList);
processList('gk', gkList);
processList('puzzle', puzzleList);
processList('prediction', predictionList);
processList('topicdoc', topicdocList);
processList('mixed', mixedList);

// Verify totals & unique titles
const allTitles = new Set();
let duplicateCount = 0;
let totalQuestions = 0;

console.log('--- Arena Question Bank Summary ---');
for (const [cat, diffs] of Object.entries(finalBank)) {
  let catTotal = 0;
  for (const [diff, qs] of Object.entries(diffs)) {
    catTotal += qs.length;
    totalQuestions += qs.length;
    for (const q of qs) {
      if (allTitles.has(q.title)) {
        console.warn(`Duplicate found: ${q.title}`);
        duplicateCount++;
      }
      allTitles.add(q.title);
    }
  }
  console.log(`${cat.padEnd(12)}: ${catTotal} questions`);
}
console.log(`Total questions   : ${totalQuestions}`);
console.log(`Unique titles     : ${allTitles.size}`);
console.log(`Duplicates detected: ${duplicateCount}`);

if (duplicateCount > 0) {
  console.error('FAILED: Duplicate questions exist!');
  process.exit(1);
}

// Generate the TypeScript file content
const tsContent = `// Arena Question Bank - Production Ready
// 530+ Unique, non-repeating static questions spanning 7 Game Modes & 6 Difficulty Levels

export interface StaticArenaQuestion {
  title: string;
  description: string;
  options: string[];
  correctAnswer: string;
  boilerplate?: string;
  tags: string[];
  timeLimit: number;
  xpReward: number;
  pointsReward: number;
  explanation?: string;
  hint?: string;
}

export type ArenaCategory = 'coding' | 'puzzle' | 'math' | 'gk' | 'prediction' | 'topicdoc' | 'mixed';
export type ArenaDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master' | 'grandmaster';

export const TIME_MAP: Record<ArenaDifficulty, number> = ${JSON.stringify(TIME_MAP, null, 2)};

export const XP_MAP: Record<ArenaDifficulty, number> = ${JSON.stringify(XP_MAP, null, 2)};

export const POINTS_MAP: Record<ArenaDifficulty, number> = ${JSON.stringify(POINTS_MAP, null, 2)};

export const ATTEMPTS_MAP: Record<ArenaDifficulty, number> = ${JSON.stringify(ATTEMPTS_MAP, null, 2)};

export const ARENA_QUESTION_BANK: Record<ArenaCategory, Record<ArenaDifficulty, StaticArenaQuestion[]>> = ${JSON.stringify(finalBank, null, 2)};

/**
 * Returns a randomized, deduplicated sample of questions for the given mode and difficulty.
 * If mode is 'mixed', samples from across all other modes.
 */
export function getStaticQuestions(
  mode: ArenaCategory,
  difficulty: ArenaDifficulty,
  limit: number = 20,
  excludeIds: string[] = []
): StaticArenaQuestion[] {
  const diff = difficulty in TIME_MAP ? difficulty : 'beginner';
  let pool: StaticArenaQuestion[] = [];

  if (mode === 'mixed') {
    const modes: ArenaCategory[] = ['coding', 'puzzle', 'math', 'gk', 'prediction', 'topicdoc', 'mixed'];
    for (const m of modes) {
      const modeQs = ARENA_QUESTION_BANK[m]?.[diff] || [];
      pool.push(...modeQs);
    }
  } else {
    pool = ARENA_QUESTION_BANK[mode]?.[diff] || [];
  }

  // Filter out excluded question titles
  const excludedSet = new Set(excludeIds.map(x => x.toLowerCase()));
  const filtered = pool.filter(q => !excludedSet.has(q.title.toLowerCase()));

  const candidatePool = filtered.length >= Math.min(limit, 3) ? filtered : pool;

  // Shuffle candidate pool using Fisher-Yates
  const shuffled = [...candidatePool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, limit);
}
`;

fs.writeFileSync(path.join(__dirname, '../lib/data/arenaQuestionBank.ts'), tsContent, 'utf-8');
console.log('Successfully wrote lib/data/arenaQuestionBank.ts!');
