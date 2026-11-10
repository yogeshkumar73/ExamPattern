"use client"

import React, { useState } from "react"
import {
  Code2,
  Terminal,
  Play,
  CheckCircle2,
  Sparkles,
  Swords,
  Cpu,
  Layers,
  ArrowRight,
  Zap,
  Flame,
  Award,
  ChevronRight,
  FileCode2,
  Copy,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNav } from "@/hooks/use-nav"

interface ProblemPreview {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  category: string
  description: string
  sampleInput: string
  sampleOutput: string
  codeSnippet: Record<string, string>
}

const PREVIEW_PROBLEMS: ProblemPreview[] = [
  {
    id: "merge-k-lists",
    title: "Merge K Sorted Lists",
    difficulty: "Hard",
    category: "Linked List • Priority Queue",
    description: "Given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    sampleInput: "lists = [[1,4,5],[1,3,4],[2,6]]",
    sampleOutput: "[1,1,2,3,4,4,5,6]",
    codeSnippet: {
      javascript: `// Aura Compiler • JavaScript (Node.js)
function mergeKLists(lists) {
  const minHeap = new MinPriorityQueue({ priority: x => x.val });
  for (const head of lists) {
    if (head) minHeap.enqueue(head);
  }
  const dummy = new ListNode(0);
  let tail = dummy;
  while (!minHeap.isEmpty()) {
    const node = minHeap.dequeue().element;
    tail.next = node;
    tail = tail.next;
    if (node.next) minHeap.enqueue(node.next);
  }
  return dummy.next;
}`,
      python: `# Aura Compiler • Python 3
from queue import PriorityQueue

def mergeKLists(lists):
    pq = PriorityQueue()
    for i, node in enumerate(lists):
        if node:
            pq.put((node.val, i, node))
    dummy = ListNode(0)
    curr = dummy
    while not pq.empty():
        val, i, node = pq.get()
        curr.next = node
        curr = curr.next
        if node.next:
            pq.put((node.next.val, i, node.next))
    return dummy.next`,
      cpp: `// Aura Compiler • C++20
ListNode* mergeKLists(vector<ListNode*>& lists) {
    auto comp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
    priority_queue<ListNode*, vector<ListNode*>, decltype(comp)> pq(comp);
    for (auto list : lists) if (list) pq.push(list);
    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (!pq.empty()) {
        auto node = pq.top(); pq.pop();
        tail->next = node; tail = tail->next;
        if (node->next) pq.push(node->next);
    }
    return dummy.next;
}`
    }
  },
  {
    id: "tree-level-order",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    category: "Tree • BFS • Queue",
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    sampleInput: "root = [3,9,20,null,null,15,7]",
    sampleOutput: "[[3],[9,20],[15,7]]",
    codeSnippet: {
      javascript: `function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(currentLevel);
  }
  return result;
}`,
      python: `def levelOrder(root):
    if not root: return []
    result, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(level)
    return result`,
      cpp: `vector<vector<int>> levelOrder(TreeNode* root) {
    if (!root) return {};
    vector<vector<int>> ans;
    queue<TreeNode*> q;
    q.push(root);
    while(!q.empty()){
        int sz = q.size();
        vector<int> cur;
        for(int i=0; i<sz; ++i){
            auto* node = q.front(); q.pop();
            cur.push_back(node->val);
            if(node->left) q.push(node->left);
            if(node->right) q.push(node->right);
        }
        ans.push_back(cur);
    }
    return ans;
}`
    }
  },
  {
    id: "two-sum",
    title: "Two Sum Optimal Hash",
    difficulty: "Easy",
    category: "Array • Hash Table",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target in O(n) time.",
    sampleInput: "nums = [2,7,11,15], target = 9",
    sampleOutput: "[0,1]",
    codeSnippet: {
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> mp;
    for (int i = 0; i < nums.size(); ++i) {
        int comp = target - nums[i];
        if (mp.count(comp)) return {mp[comp], i};
        mp[nums[i]] = i;
    }
    return {};
}`
    }
  }
]

export function PracticePlatformShowcase() {
  const { setStep } = useNav()
  const [selectedProblem, setSelectedProblem] = useState<ProblemPreview>(PREVIEW_PROBLEMS[0])
  const [selectedLanguage, setSelectedLanguage] = useState<"javascript" | "python" | "cpp">("javascript")
  const [copied, setCopied] = useState(false)
  const [simulatingRun, setSimulatingRun] = useState(false)
  const [runResult, setRunResult] = useState<boolean | null>(null)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedProblem.codeSnippet[selectedLanguage])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSimulateRun = () => {
    setSimulatingRun(true)
    setRunResult(null)
    setTimeout(() => {
      setSimulatingRun(false)
      setRunResult(true)
    }, 600)
  }

  const difficultyColors = {
    Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    Hard: "bg-rose-500/10 text-rose-400 border-rose-500/30"
  }

  return (
    <section className="py-16 sm:py-24 border-b bg-background relative overflow-hidden">
      {/* Subtle background ambient blur */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Badge
            variant="outline"
            className="mb-3 py-1 px-3.5 text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border-primary/20"
          >
            PRACTICE PLATFORM
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            Master Algorithmic Intellect & <br className="hidden sm:inline" />
            Interactive Engineering
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            Where theoretical concepts transform into high-velocity muscle memory. Write code, pass automated test cases, optimize Big-O complexity, and duel peers in synchronized arenas.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          <div className="p-5 sm:p-6 rounded-2xl border bg-card/60 backdrop-blur hover:border-primary/50 transition-all hover:-translate-y-1 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-foreground mb-1.5">Multi-Language Web Compiler</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Instant execution in JavaScript, Python, C++, and Java with sub-second feedback and zero local environment setup.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl border bg-card/60 backdrop-blur hover:border-primary/50 transition-all hover:-translate-y-1 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-foreground mb-1.5">Automated Edge-Case Runner</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Validate your solutions against strict edge test cases, memory constraints, and runtime limits automatically.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl border bg-card/60 backdrop-blur hover:border-primary/50 transition-all hover:-translate-y-1 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <Swords className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-foreground mb-1.5">1v1 PvP Algorithm Battles</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Test your speed against friends or random peers in synchronized live arenas with real MongoDB leaderboard scores.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl border bg-card/60 backdrop-blur hover:border-primary/50 transition-all hover:-translate-y-1 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-foreground mb-1.5">Socratic AI Mentor & Guider</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Stuck on an algorithm? Get progressive hints, Big-O trade-offs, and architectural breakdowns without spoiling the answer.
            </p>
          </div>
        </div>

        {/* Interactive Problem Solving & Compiler Playground */}
        <div className="rounded-3xl border-2 border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Top Bar with Problem Selector Tabs */}
          <div className="p-4 sm:p-5 border-b bg-muted/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1 hidden sm:inline">
                Practice Problems:
              </span>
              {PREVIEW_PROBLEMS.map((prob) => (
                <button
                  key={prob.id}
                  onClick={() => {
                    setSelectedProblem(prob)
                    setRunResult(null)
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                    selectedProblem.id === prob.id
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background/80 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{prob.title}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${difficultyColors[prob.difficulty]}`}>
                    {prob.difficulty}
                  </span>
                </button>
              ))}
            </div>

            {/* Direct Lab Redirect Button */}
            <Button
              onClick={() => setStep("lab")}
              size="sm"
              className="h-9 px-4 rounded-xl font-bold text-xs gap-1.5 bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md hover:scale-105 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Open in Full Practice Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Playground Body: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* Left: Problem Details & Description */}
            <div className="lg:col-span-5 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`font-black text-xs px-2.5 py-0.5 ${difficultyColors[selectedProblem.difficulty]}`}>
                  {selectedProblem.difficulty}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">{selectedProblem.category}</span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2">
                  {selectedProblem.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {selectedProblem.description}
                </p>
              </div>

              {/* Sample Input / Output */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs">
                  <span className="font-bold text-muted-foreground block mb-1 uppercase tracking-wider text-[10px]">
                    Sample Input:
                  </span>
                  <code className="font-mono text-foreground font-semibold">{selectedProblem.sampleInput}</code>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs">
                  <span className="font-bold text-muted-foreground block mb-1 uppercase tracking-wider text-[10px]">
                    Expected Output:
                  </span>
                  <code className="font-mono text-emerald-400 font-semibold">{selectedProblem.sampleOutput}</code>
                </div>
              </div>

              {/* Interactive Execution Controls */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleSimulateRun}
                  disabled={simulatingRun}
                  className="h-11 px-5 rounded-xl font-bold text-xs gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                >
                  <Play className={`w-3.5 h-3.5 ${simulatingRun ? "animate-spin" : ""}`} />
                  <span>{simulatingRun ? "Running Test Cases..." : "Run Test Code"}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setStep("arena")}
                  className="h-11 px-5 rounded-xl font-bold text-xs gap-2 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Duel on this Problem</span>
                </Button>
              </div>

              {/* Run Feedback Output */}
              {runResult && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold">All 3/3 Test Cases Passed! Runtime: 42ms (Faster than 92%)</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-none">
                    +50 XP
                  </Badge>
                </div>
              )}
            </div>

            {/* Right: Interactive Code Editor View */}
            <div className="lg:col-span-7 bg-[#0d1117] flex flex-col justify-between">
              {/* Language Toolbar */}
              <div className="p-3 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-white/40 ml-3 hidden sm:inline">solution.aura</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg bg-[#0d1117] p-1 border border-[#30363d]">
                    {(["javascript", "python", "cpp"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase font-bold transition-all ${
                          selectedLanguage === lang
                            ? "bg-primary text-white shadow-sm"
                            : "text-white/50 hover:text-white"
                        }`}
                      >
                        {lang === "cpp" ? "C++" : lang}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleCopyCode}
                    title="Copy Code"
                    className="p-1.5 rounded-lg bg-[#0d1117] text-white/60 hover:text-white border border-[#30363d] transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Code Display */}
              <div className="p-5 font-mono text-xs text-white/90 overflow-x-auto leading-relaxed select-text min-h-[300px]">
                <pre>
                  <code>{selectedProblem.codeSnippet[selectedLanguage]}</code>
                </pre>
              </div>

              {/* Code Footer Status Bar */}
              <div className="p-3 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between text-[11px] font-mono text-white/40">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> V8 Sandbox Ready
                  </span>
                  <span>UTF-8</span>
                  <span>Tab: 2 spaces</span>
                </div>
                <div className="text-primary font-bold hover:underline cursor-pointer" onClick={() => setStep("lab")}>
                  Open Full IDE Editor →
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Call to Action Ribbon */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-indigo-500/10 to-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h4 className="text-lg sm:text-xl font-black text-foreground mb-1">
              Ready to challenge your programming limits?
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Over 500+ problems, automated test suites, and dynamic Diamond rankings await.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              onClick={() => setStep("lab")}
              className="h-12 px-6 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              Start Coding Practice
            </Button>
            <Button
              variant="outline"
              onClick={() => setStep("arena")}
              className="h-12 px-6 rounded-xl font-bold text-sm border-border bg-background/50 hover:bg-muted"
            >
              Enter Battle Arena
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
