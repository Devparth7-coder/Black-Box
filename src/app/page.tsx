"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import BehaviorProfile from "./components/BehaviorProfile";
import {
  BehavioralMap,
  ContextCurve,
  FactualBar,
  RadarProfile,
  RecoveryBars,
  RefusalBar,
  ToolBar,
} from "./components/Charts";
import Comparison from "./components/Comparison";
import ExperimentBuilder from "./components/ExperimentBuilder";
import { AVAILABLE_MODELS, BlackboxSimulator, getCategoryLabel } from "./lib/simulation";
import type {
  ExperimentConfig,
  ExperimentResult,
  LogEntry,
  ModelInfo,
  TestCategory,
} from "./lib/types";
import {
  Activity,
  AlertTriangle,
  Ban,
  Beaker,
  Binary,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Cpu,
  Database,
  Eye,
  FlaskConical,
  Gauge,
  GitCompare,
  Hammer,
  Layers,
  MemoryStick,
  MessageSquare,
  Play,
  PlayCircle,
  RefreshCw,
  Save,
  Scale,
  Search,
  Send,
  ShieldAlert,
  Shuffle,
  Sparkles,
  Square,
  StopCircle,
  Terminal,
  Timer,
  Wand2,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";

type Tab = "dashboard" | "findings" | "compare" | "builder" | "discovery" | "experiments";

const DEFAULT_CATEGORIES: TestCategory[] = [
  "consistency",
  "prompt_sensitivity",
  "hallucination",
  "contradiction",
  "memory",
  "context",
  "instruction",
  "robustness",
  "refusal",
  "tool_use",
  "failure_injection",
];

const CATEGORY_META: Record<
  TestCategory,
  { icon: React.ComponentType<any>; blurb: string }
> = {
  consistency: { icon: Shuffle, blurb: "Same question re-run; measures semantic stability." },
  prompt_sensitivity: { icon: MessageSquare, blurb: "Wording, formatting, tone and ordering drift." },
  hallucination: { icon: BookOpen, blurb: "Ground-truth fact verification." },
  contradiction: { icon: GitCompare, blurb: "Cross-response logical consistency checks." },
  memory: { icon: MemoryStick, blurb: "Retention, contamination and conflict across turns." },
  context: { icon: Layers, blurb: "Degradation curves across growing context windows." },
  instruction: { icon: Binary, blurb: "Schema, format and directive adherence." },
  robustness: { icon: ShieldAlert, blurb: "Typos, casing, whitespace, distractors." },
  refusal: { icon: Ban, blurb: "Over/under-refusal, calibration on safety probes." },
  tool_use: { icon: Wrench, blurb: "Tool selection, args, retry behavior in a sandbox." },
  failure_injection: { icon: Zap, blurb: "Timeouts, malformed responses, rate limits." },
  discovery: { icon: Sparkles, blurb: "Unsupervised search for behavioral boundaries." },
};

export default function Home() {
  const [selectedModelId, setSelectedModelId] = useState<string>("gpt-4o");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [categories, setCategories] = useState<TestCategory[]>(DEFAULT_CATEGORIES);
  const [runsPerTest, setRunsPerTest] = useState<number>(30);
  const [toolSandbox, setToolSandbox] = useState(true);
  const [failureInjection, setFailureInjection] = useState(true);
  const [discoveryMode, setDiscoveryMode] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");

  // refs so the interval loop always reads current values without stale closures
  const simRef = useRef<BlackboxSimulator | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExperimentResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsRef = useRef<HTMLDivElement | null>(null);
  // stash the latest config so we can launch runs from stale callbacks (e.g. builder)
  const configRef = useRef({
    modelId: selectedModelId,
    temperature,
    categories,
    runsPerTest,
    toolSandbox,
    failureInjection,
    discoveryMode,
  });
  useEffect(() => {
    configRef.current = {
      modelId: selectedModelId,
      temperature,
      categories,
      runsPerTest,
      toolSandbox,
      failureInjection,
      discoveryMode,
    };
  }, [selectedModelId, temperature, categories, runsPerTest, toolSandbox, failureInjection, discoveryMode]);

  const model: ModelInfo = useMemo(
    () => AVAILABLE_MODELS.find((m) => m.id === selectedModelId) ?? AVAILABLE_MODELS[0],
    [selectedModelId]
  );

  // run the simulation loop on an interval while running
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const s = simRef.current;
      if (!s) return;
      if (s.isDone()) {
        setRunning(false);
        return;
      }
      // tick multiple times per interval for throughput
      const ticksPerPulse = 2;
      for (let t = 0; t < ticksPerPulse; t++) {
        if (s.isDone()) break;
        const delta = s.tick();
        if (delta.log && delta.log.length) {
          setLogs((prev) => [...prev, ...delta.log!].slice(-600));
        }
        if (delta.partial) {
          setResult({ ...s.result, ...delta.partial });
        } else {
          setResult({ ...s.result });
        }
        if (delta.done) {
          setRunning(false);
          break;
        }
      }
    }, 120);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  function startAnalysis() {
    const cfg0 = configRef.current;
    const m = AVAILABLE_MODELS.find((mm) => mm.id === cfg0.modelId) ?? AVAILABLE_MODELS[0];
    const cfg: ExperimentConfig = {
      model: m.id,
      endpoint: m.endpoint,
      temperature: cfg0.temperature,
      runsPerTest: cfg0.runsPerTest,
      categories: cfg0.discoveryMode ? [...cfg0.categories, "discovery"] : cfg0.categories,
      contextWindows: [1, 4, 8, 16, 32, 64, 128],
      failureInjection: cfg0.failureInjection,
      toolSandbox: cfg0.toolSandbox,
    };
    const s = new BlackboxSimulator(cfg);
    simRef.current = s;
    setResult({ ...s.result });
    setLogs([]);
    setTab("dashboard");
    // small delay so React renders initial "Running" state before the interval starts pumping
    setTimeout(() => setRunning(true), 20);
  }

  function stopAnalysis() {
    setRunning(false);
  }

  function resetAnalysis() {
    setRunning(false);
    simRef.current = null;
    setResult(null);
    setLogs([]);
  }

  const progressPct = result
    ? Math.min(100, (result.completedTests / result.totalTests) * 100)
    : 0;
  const elapsed = result
    ? ((result.finishedAt ?? Date.now()) - result.startedAt) / 1000
    : 0;

  const catStatus: { key: TestCategory; state: "pending" | "running" | "done" }[] = categories.map((c, i) => {
    if (!running && !result) return { key: c, state: "pending" };
    const perCat = result ? result.totalTests / Math.max(1, categories.length) : 0;
    const done = result ? result.completedTests : 0;
    const idx = Math.floor(done / Math.max(1, perCat));
    if (!result || done === 0) return { key: c, state: "pending" };
    if (i < idx) return { key: c, state: "done" };
    if (i === idx && running) return { key: c, state: "running" };
    if (result.finishedAt) return { key: c, state: "done" };
    return { key: c, state: "pending" };
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        connected={model.connected}
        modelName={model.name}
        endpoint={model.endpoint}
      />

      <div className="flex-1 grid grid-cols-12 gap-4 p-4">
        {/* LEFT: Config panel */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-[var(--accent)]" />
              <div className="text-xs tracking-[0.3em] uppercase text-dim">Target Model</div>
            </div>
            <select
              className="w-full text-sm"
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              disabled={running}
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.provider} {m.connected ? "" : "(offline)"}
                </option>
              ))}
            </select>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="panel-bright p-2">
                <div className="text-dim uppercase tracking-widest">Provider</div>
                <div className="text-[var(--text)] mt-0.5">{model.provider}</div>
              </div>
              <div className="panel-bright p-2">
                <div className="text-dim uppercase tracking-widest">Status</div>
                <div
                  className={`mt-0.5 flex items-center gap-1 ${
                    model.connected ? "text-[var(--accent)]" : "text-[var(--danger)]"
                  }`}
                >
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      model.connected ? "bg-[var(--accent)] pulse-dot text-[var(--accent)]" : "bg-[var(--danger)]"
                    }`}
                  />
                  {model.connected ? "Connected" : "Offline"}
                </div>
              </div>
            </div>
          </div>

          <div className="panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-4 h-4 text-[var(--accent)]" />
              <div className="text-xs tracking-[0.3em] uppercase text-dim">Run Parameters</div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-dim uppercase tracking-widest">Temperature</span>
                  <span className="text-[var(--accent)]">{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.05}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  disabled={running}
                  className="w-full accent-[var(--accent)]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-dim uppercase tracking-widest">Runs / test</span>
                  <span className="text-[var(--accent)]">{runsPerTest}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={runsPerTest}
                  onChange={(e) => setRunsPerTest(parseInt(e.target.value))}
                  disabled={running}
                  className="w-full accent-[var(--accent)]"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-dim cursor-pointer">
                <input
                  type="checkbox"
                  checked={toolSandbox}
                  onChange={(e) => setToolSandbox(e.target.checked)}
                  disabled={running}
                  className="accent-[var(--accent)]"
                />
                Enable tool-use sandbox
              </label>
              <label className="flex items-center gap-2 text-xs text-dim cursor-pointer">
                <input
                  type="checkbox"
                  checked={failureInjection}
                  onChange={(e) => setFailureInjection(e.target.checked)}
                  disabled={running}
                  className="accent-[var(--accent)]"
                />
                Inject API / tool failures
              </label>
              <label className="flex items-center gap-2 text-xs text-dim cursor-pointer">
                <input
                  type="checkbox"
                  checked={discoveryMode}
                  onChange={(e) => setDiscoveryMode(e.target.checked)}
                  disabled={running}
                  className="accent-[var(--accent)]"
                />
                Discovery mode (auto-fuzz)
              </label>
            </div>
          </div>

          <div className="panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-4 h-4 text-[var(--accent)]" />
              <div className="text-xs tracking-[0.3em] uppercase text-dim">Test Batteries</div>
            </div>
            <div className="space-y-1.5">
              {catStatus.map(({ key, state }) => {
                const Icon = CATEGORY_META[key].icon;
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-2 text-xs p-2 rounded cursor-pointer border ${
                      state === "running"
                        ? "border-[var(--accent)] bg-[rgba(0,255,156,0.06)]"
                        : state === "done"
                        ? "border-[#1c2227] bg-[#0a0c0e]"
                        : "border-transparent hover:bg-[#0a0c0e]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={categories.includes(key)}
                      onChange={(e) =>
                        setCategories((cs) =>
                          e.target.checked ? [...cs, key] : cs.filter((c) => c !== key)
                        )
                      }
                      disabled={running}
                      className="accent-[var(--accent)]"
                    />
                    <Icon className="w-3.5 h-3.5 text-dim" />
                    <span
                      className={`flex-1 ${
                        state === "running"
                          ? "text-[var(--accent)]"
                          : state === "done"
                          ? "text-[var(--text)]"
                          : "text-dim"
                      }`}
                    >
                      {getCategoryLabel(key)}
                    </span>
                    {state === "running" && (
                      <span className="text-[var(--accent)] text-[10px] rapid-blink">RUN</span>
                    )}
                    {state === "done" && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />}
                    {state === "pending" && !running && (
                      <CircleDot className="w-3.5 h-3.5 text-dimmer" />
                    )}
                  </label>
                );
              })}
              {discoveryMode && (
                <div className="flex items-center gap-2 text-xs p-2 rounded border border-[var(--warn)] bg-[rgba(255,176,32,0.05)]">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--warn)]" />
                  <span className="flex-1 text-[var(--warn)]">Discovery Mode</span>
                  <span className="text-[var(--warn)] text-[10px]">AUTO</span>
                </div>
              )}
            </div>
          </div>

          <div className="panel p-5">
            {!running && !result && (
              <button
                className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2 glow"
                onClick={startAnalysis}
                disabled={!model.connected || categories.length === 0}
              >
                <Play size={14} /> Start Analysis
              </button>
            )}
            {running && (
              <button
                className="w-full py-4 text-sm flex items-center justify-center gap-2 border border-[var(--danger)] text-[var(--danger)] hover:bg-[rgba(255,68,85,0.08)]"
                onClick={stopAnalysis}
              >
                <StopCircle size={14} /> Halt
              </button>
            )}
            {result && !running && (
              <div className="space-y-2">
                <button
                  className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
                  onClick={startAnalysis}
                >
                  <RefreshCw size={14} /> Run Again
                </button>
                <button
                  className="btn-ghost w-full py-3 text-sm flex items-center justify-center gap-2"
                  onClick={resetAnalysis}
                >
                  <Square size={14} /> Reset
                </button>
                <button
                  className="btn-ghost w-full py-2 text-xs flex items-center justify-center gap-2 opacity-70"
                  onClick={() => setTab("experiments")}
                >
                  <Save size={12} /> Export Report
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER: Main content */}
        <main className="col-span-12 lg:col-span-6 space-y-4 min-w-0">
          {/* Start hero if no run yet */}
          {!result && (
            <div className="panel p-8 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <pre className="ascii-box text-[10px] text-[var(--accent)] leading-none">
{`   ╔══════════════════════════════════════╗
   ║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
   ║  ░░░░  AI INSIDE BLACK BOX    ░░░░░  ║
   ║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
   ╚══════════════════════════════════════╝
      ░  PROBE. OBSERVE. MEASURE.  ░`}
                </pre>
              </div>
              <div className="relative">
                <div className="text-[10px] tracking-[0.5em] text-dimmer mb-3">// INITIALIZE</div>
                <h1 className="text-4xl font-bold tracking-tight text-[var(--text)] mb-3">
                  <span className="text-[var(--accent)]">BLACK</span>BOX
                </h1>
                <p className="text-sm text-dim max-w-2xl leading-relaxed mb-5">
                  Don't trust the model's description of itself. Treat the AI as an unknown system
                  and run hundreds of controlled experiments to discover how it <em>actually</em>{" "}
                  behaves — under stress, across rephrasings, inside long contexts, when tools fail.
                </p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {[
                    "Consistency",
                    "Prompt sensitivity",
                    "Hallucination",
                    "Contradictions",
                    "Memory",
                    "Context",
                    "Instruction following",
                    "Robustness",
                    "Refusal calibration",
                    "Tool-use",
                    "Failure recovery",
                    "Discovery fuzzing",
                  ].map((t) => (
                    <span
                      key={t}
                      className="px-2 py-1 border border-[#1c2227] rounded text-dim bg-[#0a0c0e]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <button
                    className="btn-primary px-6 py-3 text-sm flex items-center gap-2 glow"
                    onClick={startAnalysis}
                    disabled={!model.connected}
                  >
                    <Play size={14} /> Start Analysis
                  </button>
                  <button
                    className="btn-ghost px-5 py-3 text-sm flex items-center gap-2"
                    onClick={() => setTab("builder")}
                  >
                    <Wand2 size={14} /> Build Experiment
                  </button>
                </div>
                <div className="mt-6 text-[11px] text-dimmer">
                  <span className="text-[var(--accent)]">$</span> blackbox probe --model={model.id}{" "}
                  --runs={runsPerTest} --temp={temperature.toFixed(2)}
                  <span className="blink">_</span>
                </div>
              </div>
            </div>
          )}

          {/* Run progress */}
          {result && (
            <div className="panel p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {running ? (
                    <Activity className="w-4 h-4 text-[var(--accent)] rapid-blink" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                  )}
                  <div className="text-xs tracking-[0.3em] uppercase text-dim">
                    {running ? "Running Experiment" : "Run Complete"}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-dim">
                  <span className="flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {elapsed.toFixed(1)}s
                  </span>
                  <span>
                    {result.completedTests}/{result.totalTests} tests
                  </span>
                  <span>{Math.round(progressPct)}%</span>
                </div>
              </div>
              <div className="meter-track h-3 rounded">
                <div
                  className={`meter-fill ${running ? "shimmer" : ""}`}
                  style={{
                    width: `${progressPct}%`,
                    background: running
                      ? "linear-gradient(90deg, #00b870, #00ff9c)"
                      : "var(--accent)",
                  }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                {catStatus.map(({ key, state }) => (
                  <span
                    key={key}
                    className={`px-1.5 py-0.5 rounded border ${
                      state === "running"
                        ? "border-[var(--accent)] text-[var(--accent)] bg-[rgba(0,255,156,0.08)]"
                        : state === "done"
                        ? "border-[#1c2227] text-dim"
                        : "border-[#1c2227] text-dimmer"
                    }`}
                  >
                    {getCategoryLabel(key)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          {result && (
            <div className="flex items-center border-b border-[#1c2227] overflow-x-auto">
              {(
                [
                  ["dashboard", "Dashboard", Gauge],
                  ["findings", "Findings", Eye],
                  ["compare", "Compare", GitCompare],
                  ["builder", "Builder", Beaker],
                  ["discovery", "Discovery", Search],
                  ["experiments", "Experiments", Database],
                ] as [Tab, string, React.ComponentType<any>][]
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`btn-tab flex items-center gap-2 whitespace-nowrap ${
                    tab === id ? "active" : ""
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Dashboard tab */}
          {result && tab === "dashboard" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BehaviorProfile dimensions={result.dimensions} />
                <RadarProfile dimensions={result.dimensions} />
              </div>

              <BehavioralMap points={result.behavioralMap} />

              <ContextCurve data={result.contextCurve} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FactualBar data={result.hallucinationBreakdown} />
                <RefusalBar data={result.refusalBreakdown} />
              </div>

              {toolSandbox && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ToolBar data={result.toolBreakdown} />
                  {failureInjection && <RecoveryBars data={result.recoveryPath} />}
                </div>
              )}

              {/* Contradictions */}
              <div className="panel p-5">
                <div className="flex items-center gap-2 mb-3">
                  <GitCompare className="w-4 h-4 text-[var(--warn)]" />
                  <div className="text-xs tracking-[0.3em] uppercase text-dim">
                    Detected Contradictions
                  </div>
                  <span className="text-[11px] text-[var(--warn)]">
                    {result.contradictions.length} potential
                  </span>
                </div>
                <div className="space-y-3">
                  {result.contradictions.map((c, i) => (
                    <div
                      key={i}
                      className="border-l-2 pl-3 py-1"
                      style={{
                        borderColor:
                          c.severity === "high"
                            ? "var(--danger)"
                            : c.severity === "med"
                            ? "var(--warn)"
                            : "var(--info)",
                      }}
                    >
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest mb-1">
                        <span
                          className={
                            c.severity === "high"
                              ? "text-[var(--danger)]"
                              : c.severity === "med"
                              ? "text-[var(--warn)]"
                              : "text-[var(--info)]"
                          }
                        >
                          ⚠ {c.severity} severity
                        </span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div>
                          <span className="text-dimmer">Q1:</span>{" "}
                          <span className="text-[var(--text)]">{c.q1}</span>
                        </div>
                        <div>
                          <span className="text-[var(--accent)]">→</span>{" "}
                          <span className="text-dim">{c.a1}</span>
                        </div>
                        <div>
                          <span className="text-dimmer">Q2:</span>{" "}
                          <span className="text-[var(--text)]">{c.q2}</span>
                        </div>
                        <div>
                          <span className="text-[var(--danger)]">→</span>{" "}
                          <span className="text-dim">{c.a2}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Findings tab */}
          {result && tab === "findings" && (
            <div className="panel p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-[var(--warn)]" />
                <div className="text-xs tracking-[0.3em] uppercase text-dim">Automated Findings</div>
              </div>
              <div className="space-y-3">
                {result.findings.map((f) => (
                  <div
                    key={f.id}
                    className="panel-bright p-4 border-l-4"
                    style={{
                      borderLeftColor:
                        f.severity === "critical"
                          ? "var(--danger)"
                          : f.severity === "warn"
                          ? "var(--warn)"
                          : "var(--info)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {f.severity === "critical" ? (
                        <XCircle className="w-4 h-4 text-[var(--danger)] mt-0.5" />
                      ) : f.severity === "warn" ? (
                        <AlertTriangle className="w-4 h-4 text-[var(--warn)] mt-0.5" />
                      ) : (
                        <Eye className="w-4 h-4 text-[var(--info)] mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-[var(--text)]">{f.title}</span>
                          <span className="text-[10px] uppercase tracking-widest text-dim border border-[#1c2227] px-1.5 py-0.5 rounded">
                            {getCategoryLabel(f.category as TestCategory)}
                          </span>
                        </div>
                        <div className="text-xs text-dim leading-relaxed">{f.detail}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compare tab */}
          {result && tab === "compare" && <Comparison current={result} />}

          {/* Builder tab */}
          {tab === "builder" && (
            <ExperimentBuilder
              onRun={({ prompt, runs, categories: cats }) => {
                setRunsPerTest(runs);
                setCategories(cats.length ? cats : DEFAULT_CATEGORIES);
                setTimeout(startAnalysis, 50);
              }}
            />
          )}

          {/* Discovery tab */}
          {tab === "discovery" && <DiscoveryView running={running} result={result} />}

          {/* Experiments tab */}
          {tab === "experiments" && result && <ExperimentsView result={result} />}

          {result && tab === "discovery" && !result && null}
        </main>

        {/* RIGHT: Live ticker / logs */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="panel p-5 flex flex-col" style={{ height: result ? 480 : 300 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[var(--accent)]" />
                <div className="text-xs tracking-[0.3em] uppercase text-dim">Live Ticker</div>
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    running ? "bg-[var(--accent)] rapid-blink" : "bg-dimmer"
                  }`}
                />
                <span className="text-dimmer">{running ? "streaming" : "idle"}</span>
              </div>
            </div>
            <div
              ref={logsRef}
              className="flex-1 overflow-y-auto bg-[#050607] border border-[#14181c] rounded p-3 text-[11px] leading-relaxed"
            >
              {logs.length === 0 && (
                <div className="text-dimmer">
                  <div>BLACKBOX shell v0.1.0 — awaiting command.</div>
                  <div className="mt-1">
                    <span className="text-[var(--accent)]">$</span> ready
                    <span className="blink">_</span>
                  </div>
                </div>
              )}
              {logs.map((l) => (
                <div key={l.id} className="ticker-row log-enter">
                  <span className="text-dimmer">{l.ts}</span>{" "}
                  <span
                    className={
                      l.level === "ok"
                        ? "text-[var(--accent)]"
                        : l.level === "warn"
                        ? "text-[var(--warn)]"
                        : l.level === "err"
                        ? "text-[var(--danger)]"
                        : l.level === "test"
                        ? "text-dim"
                        : "text-dimmer"
                    }
                  >
                    {l.level === "ok"
                      ? "[OK] "
                      : l.level === "warn"
                      ? "[WARN] "
                      : l.level === "err"
                      ? "[ERR] "
                      : l.level === "test"
                      ? "[TST] "
                      : "[INFO] "}
                  </span>
                  <span
                    className={
                      l.level === "ok"
                        ? "text-[var(--text)]"
                        : l.level === "warn"
                        ? "text-[var(--warn)]"
                        : l.level === "err"
                        ? "text-[var(--danger)]"
                        : "text-dim"
                    }
                  >
                    {l.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {result && (
            <div className="panel p-5">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-4 h-4 text-[var(--accent)]" />
                <div className="text-xs tracking-[0.3em] uppercase text-dim">Run Summary</div>
              </div>
              <div className="space-y-2 text-xs">
                <SummaryRow label="Model" value={result.config.model} />
                <SummaryRow label="Endpoint" value={result.config.endpoint} />
                <SummaryRow label="Temperature" value={String(result.config.temperature)} />
                <SummaryRow label="Categories" value={String(result.config.categories.length)} />
                <SummaryRow label="Total tests" value={String(result.totalTests)} />
                <SummaryRow
                  label="Completed"
                  value={`${result.completedTests} (${Math.round(progressPct)}%)`}
                />
                <SummaryRow
                  label="Elapsed"
                  value={`${elapsed.toFixed(1)}s`}
                />
                <SummaryRow
                  label="Dimensions"
                  value={String(result.dimensions.length)}
                />
                <SummaryRow
                  label="Findings"
                  value={String(result.findings.length)}
                  highlight={result.findings.some((f) => f.severity === "critical") ? "danger" : undefined}
                />
              </div>
              <div className="mt-4 pt-3 border-t border-[#1c2227]">
                <div className="text-[10px] text-dimmer uppercase tracking-widest mb-2">Topline</div>
                {result.dimensions.length > 0 && (
                  <div className="text-2xl font-bold text-[var(--accent)]">
                    {(
                      result.dimensions.reduce((a, b) => a + b.score, 0) /
                      result.dimensions.length
                    ).toFixed(1)}
                    <span className="text-sm text-dim font-normal">% composite</span>
                  </div>
                )}
                <div className="text-[10px] text-dimmer mt-1">
                  composite is a convenience — inspect the individual dimensions.
                </div>
              </div>
            </div>
          )}

          <div className="panel p-5">
            <div className="flex items-center gap-2 mb-3">
              <Hammer className="w-4 h-4 text-dim" />
              <div className="text-xs tracking-[0.3em] uppercase text-dim">Methodology</div>
            </div>
            <div className="text-[11px] text-dim leading-relaxed space-y-2">
              <p>
                BLACKBOX treats the target model as a <span className="text-[var(--text)]">black box</span>:
                no access to weights, gradients or internals. All metrics are derived from observable
                input/output behavior.
              </p>
              <p>
                Evaluators: deterministic checks (schema, exact match), statistical metrics (embedding
                similarity across re-runs), and calibrated LLM-as-judge only when explicitly noted.
              </p>
              <p className="text-dimmer">
                Every experiment is saved with full prompt, config, response and evaluator output for
                reproducibility.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <footer className="border-t border-[#1c2227] px-6 py-3 text-[10px] text-dimmer flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent)]">BLACKBOX</span>
          <span>·</span>
          <span>AI Behavior Analysis &amp; Reliability Laboratory</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/walkthrough"
            className="flex items-center gap-1.5 text-[var(--accent)] hover:underline"
          >
            <PlayCircle size={12} /> WATCH WALKTHROUGH
          </Link>
          <span>PostgreSQL · Redis · FastAPI · Next.js</span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            all systems nominal
          </span>
        </div>
      </footer>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "accent" | "danger" | "warn";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-dim uppercase tracking-widest">{label}</span>
      <span
        className={
          highlight === "danger"
            ? "text-[var(--danger)]"
            : highlight === "warn"
            ? "text-[var(--warn)]"
            : highlight === "accent"
            ? "text-[var(--accent)]"
            : "text-[var(--text)]"
        }
      >
        {value}
      </span>
    </div>
  );
}

function DiscoveryView({ running, result }: { running: boolean; result?: ExperimentResult | null }) {
  const [log, setLog] = useState<string[]>([]);
  const [active, setActive] = useState(false);
  const [found, setFound] = useState<
    { kind: string; detail: string; severity: "info" | "warn" | "critical" }[]
  >([]);

  useEffect(() => {
    if (!active) return;
    const discoveries = [
      { kind: "confidence shift", detail: "Confidence calibration dropped 18% when system prompt re-ordered", severity: "warn" as const },
      { kind: "formatting anomaly", detail: "Model added unrequested markdown fencing on 3 consecutive runs", severity: "info" as const },
      { kind: "contradiction", detail: "Answer flipped when prompt prefix changed from 'Please' to 'You must'", severity: "critical" as const },
      { kind: "refusal boundary", detail: "Benign chemistry question refused when prefixed with 'strictly'", severity: "warn" as const },
      { kind: "context order", detail: "Moved a fact from position 1 to position 8 → answer changed", severity: "warn" as const },
      { kind: "tool selection", detail: "Chose search tool over calculator for purely arithmetic query", severity: "warn" as const },
      { kind: "latency cliff", detail: "Latency jumped 4x when input exceeded ~64K tokens", severity: "info" as const },
    ];
    let i = 0;
    const lines = [
      "[DISCOVERY] initializing fuzzer...",
      "[DISCOVERY] mutating seed prompts (wording, order, casing, context)",
      "[DISCOVERY] running population...",
    ];
    setLog(lines);
    const id = setInterval(() => {
      i++;
      setLog((l) => [
        ...l,
        `[GEN ${i}] population=${50 + i * 10}, anomalies=${Math.min(i, discoveries.length)}`,
        `[MUTATE] ${["wording", "order", "context", "casing", "typo", "distractor"][i % 6]} perturbation`,
      ]);
      if (i <= discoveries.length) {
        setFound((f) => [...f, discoveries[i - 1]]);
      }
      if (i > 20) {
        clearInterval(id);
        setActive(false);
        setLog((l) => [...l, "[DISCOVERY] search converged. 7 behavioral boundaries identified."]);
      }
    }, 600);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[var(--warn)]" />
          <div className="text-xs tracking-[0.3em] uppercase text-dim">Discovery Mode</div>
        </div>
        <p className="text-[11px] text-dim leading-relaxed mb-4 max-w-2xl">
          Instead of running predefined tests, BLACKBOX searches the input space for prompts that
          trigger unusual behavior — sudden confidence changes, contradictions, unexpected
          formatting, unusual refusals, performance cliffs, inconsistent tool selection.
        </p>
        <button
          className="btn-primary px-5 py-3 text-sm flex items-center gap-2"
          onClick={() => {
            setFound([]);
            setLog([]);
            setActive(true);
          }}
          disabled={active || running}
        >
          <Search size={14} /> {active ? "Searching..." : "Start Discovery Search"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="panel p-5">
          <div className="text-xs tracking-[0.3em] uppercase text-dim mb-3">Search Log</div>
          <div
            className="bg-[#050607] border border-[#14181c] rounded p-3 h-72 overflow-y-auto text-[11px] leading-relaxed"
          >
            {log.length === 0 && (
              <div className="text-dimmer">
                generate input → run model → measure behavior → interesting? → save / continue
              </div>
            )}
            {log.map((l, i) => (
              <div key={i} className="log-enter">
                <span className="text-dimmer">{String(i).padStart(4, "0")}</span>{" "}
                <span className="text-dim">{l}</span>
              </div>
            ))}
            {active && <div className="text-[var(--accent)]"><span className="blink">_</span></div>}
          </div>
        </div>

        <div className="panel p-5">
          <div className="text-xs tracking-[0.3em] uppercase text-dim mb-3">
            Discovered Boundaries ({found.length})
          </div>
          <div className="space-y-2">
            {found.length === 0 && (
              <div className="text-dimmer text-xs">
                Run a discovery search to automatically find behavioral anomalies.
              </div>
            )}
            {found.map((f, i) => (
              <div
                key={i}
                className="panel-bright p-3 border-l-2 text-xs"
                style={{
                  borderLeftColor:
                    f.severity === "critical"
                      ? "var(--danger)"
                      : f.severity === "warn"
                      ? "var(--warn)"
                      : "var(--info)",
                }}
              >
                <div
                  className="uppercase tracking-widest text-[10px] mb-1"
                  style={{
                    color:
                      f.severity === "critical"
                        ? "var(--danger)"
                        : f.severity === "warn"
                        ? "var(--warn)"
                        : "var(--info)",
                  }}
                >
                  {f.kind}
                </div>
                <div className="text-dim">{f.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel p-5">
        <div className="text-xs tracking-[0.3em] uppercase text-dim mb-3">Discovery Loop</div>
        <pre className="ascii-box text-[11px] text-dim">
{`             ┌─────────────────────┐
             │  GENERATE INPUT     │  ← mutations: wording · order · casing · typos
             └─────────┬───────────┘                  context · distractors · history
                       ↓
             ┌─────────────────────┐
             │     RUN MODEL       │
             └─────────┬───────────┘
                       ↓
             ┌─────────────────────┐
             │  MEASURE BEHAVIOR   │  confidence · latency · format · consistency
             └─────────┬───────────┘
                       ↓
                   INTERESTING?
                  ↙         ↘
               YES            NO
                ↓             ↓
          ┌───────────┐  ┌──────────────┐
          │   SAVE    │  │  MUTATE MORE  │
          │ + rank    │  └──────┬───────┘
          └───────────┘         │
                ↑               ↓
                └───────────────┘`}
        </pre>
      </div>
    </div>
  );
}

function ExperimentsView({ result }: { result: ExperimentResult }) {
  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[var(--accent)]" />
            <div className="text-xs tracking-[0.3em] uppercase text-dim">Experiment Log</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost px-3 py-1.5 text-[11px] flex items-center gap-1">
              <Save size={12} /> Save Report
            </button>
            <button className="btn-ghost px-3 py-1.5 text-[11px] flex items-center gap-1">
              <Send size={12} /> Export JSON
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="text-dimmer uppercase tracking-widest border-b border-[#1c2227]">
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left py-2 px-2">Model</th>
                <th className="text-left py-2 px-2">Prompt / Variant</th>
                <th className="text-left py-2 px-2">Config</th>
                <th className="text-left py-2 px-2">Evaluator</th>
                <th className="text-left py-2 px-2">Score</th>
                <th className="text-left py-2 px-2">Result</th>
                <th className="text-left py-2 px-2">Timestamp</th>
                <th className="text-left py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {result.experiments.map((e) => (
                <tr key={e.id} className="border-b border-[#0f1316] hover:bg-[#0a0c0e]">
                  <td className="py-2 px-2 text-dimmer">{e.id}</td>
                  <td className="py-2 px-2 text-[var(--text)]">{e.model}</td>
                  <td className="py-2 px-2">
                    <div className="text-[var(--text)] max-w-xs truncate">{e.prompt}</div>
                    {e.variation && (
                      <div className="text-dimmer text-[10px]">variant: {e.variation}</div>
                    )}
                  </td>
                  <td className="py-2 px-2 text-dim">{e.config}</td>
                  <td className="py-2 px-2 text-dim">{e.evaluator}</td>
                  <td className="py-2 px-2">
                    <span
                      style={{
                        color:
                          e.score >= 85
                            ? "var(--accent)"
                            : e.score >= 70
                            ? "var(--warn)"
                            : "var(--danger)",
                      }}
                    >
                      {e.score}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase tracking-widest ${
                        e.result === "PASS"
                          ? "text-[var(--accent)] border border-[var(--accent)]/40 bg-[rgba(0,255,156,0.08)]"
                          : e.result === "WARN"
                          ? "text-[var(--warn)] border border-[var(--warn)]/40 bg-[rgba(255,176,32,0.08)]"
                          : "text-[var(--danger)] border border-[var(--danger)]/40 bg-[rgba(255,68,85,0.08)]"
                      }`}
                    >
                      {e.result}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-dimmer">{e.timestamp.slice(11, 19)}</td>
                  <td className="py-2 px-2">
                    <button className="text-dim hover:text-[var(--accent)]">
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel p-5">
        <div className="text-xs tracking-[0.3em] uppercase text-dim mb-3">
          Reproducibility Manifest
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
          <ManifestItem label="Experiment ID" value={`EXP-${Math.floor(Date.now() / 1000).toString(16).toUpperCase()}`} />
          <ManifestItem label="Model" value={result.config.model} />
          <ManifestItem label="Temperature" value={String(result.config.temperature)} />
          <ManifestItem label="Runs per test" value={String(result.config.runsPerTest)} />
          <ManifestItem label="Categories" value={result.config.categories.length + " enabled"} />
          <ManifestItem label="Context windows" value={result.config.contextWindows.join(", ") + "K"} />
          <ManifestItem label="Started" value={new Date(result.startedAt).toISOString()} />
          <ManifestItem
            label="Finished"
            value={result.finishedAt ? new Date(result.finishedAt).toISOString() : "—"}
          />
          <ManifestItem
            label="Duration"
            value={
              result.finishedAt
                ? `${((result.finishedAt - result.startedAt) / 1000).toFixed(2)}s`
                : "—"
            }
          />
        </div>
        <div className="mt-5 pt-4 border-t border-[#1c2227]">
          <div className="text-[10px] uppercase tracking-widest text-dimmer mb-2">
            Rerun verbatim
          </div>
          <pre className="bg-[#050607] border border-[#14181c] rounded p-3 text-[11px] text-dim overflow-x-auto">
{`$ blackbox rerun ${result.config.model} \\
  --temp ${result.config.temperature} \\
  --runs ${result.config.runsPerTest} \\
  --cats ${result.config.categories.join(",")} \\
  --seed ${result.startedAt.toString(16).slice(-8)} \\
  --output report_${result.config.model}_${new Date(result.startedAt).toISOString().slice(0, 10)}.json`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function ManifestItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel-bright p-3">
      <div className="text-dimmer uppercase tracking-widest text-[10px] mb-1">{label}</div>
      <div className="text-[var(--text)] break-all">{value}</div>
    </div>
  );
}
