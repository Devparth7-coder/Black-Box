export type TestCategory =
  | "consistency"
  | "prompt_sensitivity"
  | "hallucination"
  | "contradiction"
  | "memory"
  | "context"
  | "instruction"
  | "robustness"
  | "refusal"
  | "tool_use"
  | "failure_injection"
  | "discovery";

export interface TestCase {
  id: string;
  category: TestCategory;
  prompt: string;
  expected?: string;
  variation?: string;
  groundTruth?: string;
}

export interface ModelResponse {
  testId: string;
  text: string;
  latencyMs: number;
  timestamp: number;
  tokens: number;
  toolCalls?: number;
  refused?: boolean;
}

export interface Evaluation {
  testId: string;
  pass: boolean;
  score: number; // 0-1
  notes?: string;
  issues?: string[];
}

export interface DimensionScore {
  key: string;
  label: string;
  score: number; // 0-100
  description: string;
}

export interface ExperimentConfig {
  model: string;
  endpoint: string;
  temperature: number;
  runsPerTest: number;
  categories: TestCategory[];
  contextWindows: number[];
  failureInjection: boolean;
  toolSandbox: boolean;
}

export interface LogEntry {
  id: number;
  ts: string;
  level: "ok" | "info" | "warn" | "err" | "test";
  msg: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  connected: boolean;
  endpoint: string;
}

export interface ExperimentResult {
  config: ExperimentConfig;
  startedAt: number;
  finishedAt?: number;
  totalTests: number;
  completedTests: number;
  dimensions: DimensionScore[];
  contextCurve: { tokens: number; accuracy: number; latency: number; consistency: number }[];
  hallucinationBreakdown: { correct: number; incorrect: number; unsupported: number; total: number };
  refusalBreakdown: { appropriate: number; inappropriate: number; overRefusal: number; inconsistent: number };
  toolBreakdown: { ok: number; unnecessary: number; wrong: number; invalidArgs: number; repeated: number; recovered: number };
  recoveryPath: { step: string; count: number }[];
  behavioralMap: { x: number; y: number; z: number; cluster: number; label?: string }[];
  contradictions: { q1: string; a1: string; q2: string; a2: string; severity: "low" | "med" | "high" }[];
  findings: Finding[];
  experiments: ExperimentRecord[];
}

export interface Finding {
  id: string;
  severity: "info" | "warn" | "critical";
  category: TestCategory | "system";
  title: string;
  detail: string;
}

export interface ExperimentRecord {
  id: number;
  model: string;
  prompt: string;
  variation?: string;
  config: string;
  input: string;
  output: string;
  evaluator: string;
  timestamp: string;
  result: "PASS" | "FAIL" | "WARN";
  score: number;
}
