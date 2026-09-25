/**
 * Job Queue + Worker Pool System
 * Handles high-concurrency (100+ req/s) with a bounded async queue,
 * per-user concurrency limits, job TTL, and metrics.
 *
 * Node.js is single-threaded, so "workers" are async coroutines that
 * run concurrently via the event loop — effectively a cooperative thread pool.
 */

export type JobType =
  | "auth"
  | "profile"
  | "arena"
  | "admin"
  | "chat"
  | "generic";

export interface Job<T = unknown> {
  id: string;
  type: JobType;
  userId?: string;
  payload: T;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  enqueuedAt: number;
  ttlMs: number;
}

interface QueueMetrics {
  enqueued: number;
  processed: number;
  rejected: number;
  expired: number;
  activeWorkers: number;
  queueDepth: number;
  avgProcessingMs: number;
}

// ─── Config ─────────────────────────────────────────────────────────────────

const MAX_WORKERS = 20;         // concurrent async workers
const MAX_QUEUE_SIZE = 500;     // max pending jobs
const DEFAULT_TTL_MS = 30_000; // 30s job expiry
const MAX_PER_USER = 3;        // max concurrent jobs per userId

// ─── Global state (survives Next.js hot-reloads) ────────────────────────────

const g = global as typeof globalThis & {
  __jobQueue?: Job[];
  __jobMetrics?: QueueMetrics;
  __activeWorkers?: number;
  __userConcurrency?: Map<string, number>;
  __processingTimes?: number[];
  __workerRunning?: boolean;
};

if (!g.__jobQueue) g.__jobQueue = [];
if (!g.__activeWorkers) g.__activeWorkers = 0;
if (!g.__userConcurrency) g.__userConcurrency = new Map();
if (!g.__processingTimes) g.__processingTimes = [];
if (!g.__workerRunning) g.__workerRunning = false;
if (!g.__jobMetrics) {
  g.__jobMetrics = {
    enqueued: 0,
    processed: 0,
    rejected: 0,
    expired: 0,
    activeWorkers: 0,
    queueDepth: 0,
    avgProcessingMs: 0,
  };
}

const queue = g.__jobQueue;
const metrics = g.__jobMetrics;
const userConcurrency = g.__userConcurrency;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function genId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function recordProcessingTime(ms: number) {
  const times = g.__processingTimes!;
  times.push(ms);
  if (times.length > 1000) times.splice(0, 500); // rolling window
  metrics.avgProcessingMs =
    times.reduce((a, b) => a + b, 0) / times.length;
}

function incrementUserConcurrency(userId: string) {
  userConcurrency.set(userId, (userConcurrency.get(userId) ?? 0) + 1);
}

function decrementUserConcurrency(userId: string) {
  const current = userConcurrency.get(userId) ?? 0;
  if (current <= 1) userConcurrency.delete(userId);
  else userConcurrency.set(userId, current - 1);
}

function getUserConcurrency(userId: string): number {
  return userConcurrency.get(userId) ?? 0;
}

// ─── Worker loop ─────────────────────────────────────────────────────────────

async function runWorker() {
  while (queue.length > 0 && g.__activeWorkers! < MAX_WORKERS) {
    const job = queue.shift();
    if (!job) break;

    const now = Date.now();

    // Check TTL
    if (now - job.enqueuedAt > job.ttlMs) {
      metrics.expired++;
      job.reject(new Error("JOB_EXPIRED: Request timed out in queue"));
      if (job.userId) decrementUserConcurrency(job.userId);
      continue;
    }

    g.__activeWorkers!++;
    metrics.activeWorkers = g.__activeWorkers!;
    metrics.queueDepth = queue.length;

    const start = Date.now();
    try {
      // The actual work is the wrapped async fn stored in job.payload
      const fn = (job.payload as { fn: () => Promise<unknown> }).fn;
      const result = await fn();
      job.resolve(result);
      metrics.processed++;
    } catch (err) {
      job.reject(err);
    } finally {
      g.__activeWorkers!--;
      metrics.activeWorkers = g.__activeWorkers!;
      recordProcessingTime(Date.now() - start);
      if (job.userId) decrementUserConcurrency(job.userId);
    }
  }

  // If queue still has items, spawn more workers up to MAX_WORKERS
  if (queue.length > 0 && g.__activeWorkers! < MAX_WORKERS) {
    setImmediate(runWorker);
  }
}

function spawnWorkers() {
  const needed = Math.min(
    MAX_WORKERS - g.__activeWorkers!,
    queue.length,
    MAX_WORKERS
  );
  for (let i = 0; i < needed; i++) {
    runWorker().catch(() => {});
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Enqueue an async function to be executed by the worker pool.
 * Returns a promise that resolves/rejects when the job completes.
 *
 * @example
 * const result = await enqueueJob("arena", () => myHeavyAsyncFn(), userId);
 */
export function enqueueJob<T>(
  type: JobType,
  fn: () => Promise<T>,
  userId?: string,
  ttlMs = DEFAULT_TTL_MS
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // Queue capacity check
    if (queue.length >= MAX_QUEUE_SIZE) {
      metrics.rejected++;
      return reject(
        new Error("QUEUE_FULL: Server is busy, please try again shortly")
      );
    }

    // Per-user concurrency check
    if (userId && getUserConcurrency(userId) >= MAX_PER_USER) {
      metrics.rejected++;
      return reject(
        new Error(
          "USER_LIMIT: Too many concurrent requests from this account"
        )
      );
    }

    if (userId) incrementUserConcurrency(userId);

    const job: Job = {
      id: genId(),
      type,
      userId,
      payload: { fn } as unknown,
      resolve: resolve as (v: unknown) => void,
      reject,
      enqueuedAt: Date.now(),
      ttlMs,
    };

    queue.push(job);
    metrics.enqueued++;
    metrics.queueDepth = queue.length;

    spawnWorkers();
  });
}

/**
 * Get current queue metrics (for admin monitoring).
 */
export function getQueueStats(): QueueMetrics {
  return {
    ...metrics,
    queueDepth: queue.length,
    activeWorkers: g.__activeWorkers!,
  };
}

/**
 * Wrap a Next.js route handler with the job queue.
 * Automatically handles 503 / 429 responses on queue errors.
 *
 * @example
 * export async function POST(req: Request) {
 *   return withQueue("arena", req, userId, async () => {
 *     // your handler logic here
 *   });
 * }
 */
export async function withQueue<T>(
  type: JobType,
  handler: () => Promise<T>,
  userId?: string
): Promise<T | Response> {
  try {
    return await enqueueJob(type, handler, userId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Queue error";

    if (msg.startsWith("QUEUE_FULL")) {
      const { NextResponse } = await import("next/server");
      return NextResponse.json(
        { message: "Server is busy. Please try again shortly." },
        {
          status: 503,
          headers: { "Retry-After": "5" },
        }
      ) as unknown as T;
    }

    if (msg.startsWith("USER_LIMIT")) {
      const { NextResponse } = await import("next/server");
      return NextResponse.json(
        { message: "Too many concurrent requests. Slow down." },
        {
          status: 429,
          headers: { "Retry-After": "2" },
        }
      ) as unknown as T;
    }

    if (msg.startsWith("JOB_EXPIRED")) {
      const { NextResponse } = await import("next/server");
      return NextResponse.json(
        { message: "Request timed out. Please try again." },
        { status: 504 }
      ) as unknown as T;
    }

    throw err;
  }
}
