"use client";

import { Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { TestCategory } from "../lib/types";
import { getCategoryLabel } from "../lib/simulation";

const ALL_CATS: TestCategory[] = [
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
  "discovery",
];

interface Step {
  id: number;
  kind: "input" | "variation" | "evaluator" | "analysis";
  label: string;
}

export default function ExperimentBuilder({
  onRun,
}: {
  onRun: (opts: { prompt: string; runs: number; categories: TestCategory[] }) => void;
}) {
  const [prompt, setPrompt] = useState("Return the answer as a JSON object with a single key 'result'.");
  const [runs, setRuns] = useState(100);
  const [variations, setVariations] = useState<string[]>([
    "Original prompt",
    "Rephrased politely",
    "Terse / imperative",
    "With typos",
    "With extra whitespace",
    "Prefixed with irrelevant context",
    "Wrapped in markdown",
    "UPPERCASE",
    "lowercase",
    "Asked twice",
  ]);
  const [cats, setCats] = useState<TestCategory[]>([
    "consistency",
    "prompt_sensitivity",
    "instruction",
    "robustness",
  ]);
  const [newVar, setNewVar] = useState("");

  const steps: Step[] = [
    { id: 1, kind: "input", label: "INPUT" },
    { id: 2, kind: "variation", label: `PROMPT VARIATION (${variations.length})` },
    { id: 3, kind: "variation", label: "MODEL" },
    { id: 4, kind: "evaluator", label: "EVALUATOR" },
    { id: 5, kind: "analysis", label: "STATISTICAL ANALYSIS" },
    { id: 6, kind: "analysis", label: "REPORT" },
  ];

  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <div className="text-xs tracking-[0.3em] text-dim uppercase mb-4">Experiment Builder</div>

        {/* Pipeline */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 shrink-0">
              <div
                className={`px-3 py-2 text-[10px] tracking-widest border rounded ${
                  s.kind === "input"
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : s.kind === "evaluator"
                    ? "border-[var(--info)] text-[var(--info)]"
                    : s.kind === "analysis"
                    ? "border-[var(--warn)] text-[var(--warn)]"
                    : "border-[#2a3238] text-dim"
                }`}
              >
                {s.label}
              </div>
              {i < steps.length - 1 && <span className="text-dimmer">→</span>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-dim uppercase tracking-widest">Base Prompt</label>
            <textarea
              className="w-full mt-1 p-3 bg-[#0a0c0e] border border-[#2a3238] rounded text-[var(--text)] text-sm font-mono resize-none h-36 focus:outline-none focus:border-[var(--accent)]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="text-[11px] text-dimmer mt-1">
              The canonical prompt; variations will be derived from it.
            </div>
          </div>

          <div>
            <label className="text-[11px] text-dim uppercase tracking-widest">Run Matrix</label>
            <div className="mt-1 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs w-32 text-dim">Runs per variant</span>
                <input
                  type="number"
                  className="flex-1"
                  value={runs}
                  min={1}
                  max={1000}
                  onChange={(e) => setRuns(parseInt(e.target.value || "1"))}
                />
              </div>
              <div className="text-[11px] text-dim">
                Total scheduled runs: <span className="text-[var(--accent)]">{runs * variations.length}</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-[11px] text-dim uppercase tracking-widest">Test Categories</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {ALL_CATS.map((c) => {
                  const on = cats.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() =>
                        setCats((cs) => (on ? cs.filter((x) => x !== c) : [...cs, c]))
                      }
                      className={`text-[11px] px-2 py-1 border rounded tracking-wider uppercase ${
                        on
                          ? "border-[var(--accent)] text-[var(--accent)] bg-[rgba(0,255,156,0.08)]"
                          : "border-[#2a3238] text-dim hover:text-[var(--text)]"
                      }`}
                    >
                      {getCategoryLabel(c)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Variations */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] text-dim uppercase tracking-widest">Prompt Variations</label>
            <span className="text-[11px] text-dimmer">{variations.length} variants</span>
          </div>
          <div className="space-y-1">
            {variations.map((v, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-dimmer w-6">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 panel-bright px-3 py-1.5 text-dim">{v}</span>
                <button
                  className="p-1 text-dim hover:text-[var(--danger)]"
                  onClick={() => setVariations(variations.filter((_, j) => j !== i))}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              className="flex-1 text-xs"
              placeholder="add a variation..."
              value={newVar}
              onChange={(e) => setNewVar(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newVar.trim()) {
                  setVariations([...variations, newVar.trim()]);
                  setNewVar("");
                }
              }}
            />
            <button
              className="btn-ghost px-3 py-2 text-xs"
              onClick={() => {
                if (newVar.trim()) {
                  setVariations([...variations, newVar.trim()]);
                  setNewVar("");
                }
              }}
            >
              <Plus size={14} className="inline mr-1" /> Add
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="btn-primary px-6 py-3 text-sm flex items-center gap-2"
            onClick={() => onRun({ prompt, runs, categories: cats })}
          >
            <Play size={14} /> Execute Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
