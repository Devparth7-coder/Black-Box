"use client";

import { AVAILABLE_MODELS } from "../lib/simulation";
import type { DimensionScore, ExperimentResult } from "../lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState } from "react";

// Deterministic-ish dim score generator for a model id (so comparisons are stable)
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rngFromSeed(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const BASE_PROFILES: Record<string, [number, number, number, number, number, number, number, number]> = {
  "gpt-4o": [91, 86, 94, 83, 89, 93, 74, 82],
  "gpt-4.5": [93, 89, 96, 86, 91, 95, 78, 84],
  "claude-3.5": [94, 91, 96, 88, 92, 90, 80, 90],
  "claude-opus": [95, 92, 95, 90, 93, 88, 82, 92],
  "gemini-1.5": [89, 82, 90, 85, 87, 86, 72, 78],
  "gemini-ultra": [92, 85, 92, 87, 90, 88, 75, 81],
  "llama-3.1": [86, 80, 88, 82, 83, 79, 68, 75],
  "mistral-large": [88, 83, 90, 84, 86, 84, 70, 77],
};

const DIM_KEYS = [
  "reliability",
  "consistency",
  "instruction",
  "robustness",
  "factuality",
  "tool",
  "recovery",
  "refusal",
] as const;

const DIM_LABELS: Record<string, string> = {
  reliability: "Reliability",
  consistency: "Consistency",
  instruction: "Instruction",
  robustness: "Robustness",
  factuality: "Factuality",
  tool: "Tool Use",
  recovery: "Recovery",
  refusal: "Refusal",
};

function profileFor(id: string): DimensionScore[] {
  const base = BASE_PROFILES[id] ?? BASE_PROFILES["gpt-4o"];
  const r = rngFromSeed(hashString(id + "-compare"));
  return DIM_KEYS.map((k, i) => ({
    key: k,
    label: DIM_LABELS[k],
    score: Math.max(60, Math.min(99, base[i] + (r() - 0.5) * 3)),
    description: "",
  }));
}

export default function Comparison({ current }: { current?: ExperimentResult }) {
  const connected = AVAILABLE_MODELS.filter((m) => m.connected).map((m) => m.id);
  const [a, setA] = useState<string>(current?.config.model ?? connected[0]);
  const [b, setB] = useState<string>(
    connected.find((id) => id !== a) ?? connected[0]
  );

  const profA = a === current?.config.model ? current.dimensions : profileFor(a);
  const profB = b === current?.config.model ? current.dimensions : profileFor(b);

  const chartData = DIM_KEYS.map((k) => {
    const da = profA.find((d) => d.key === k);
    const db = profB.find((d) => d.key === k);
    return {
      dim: DIM_LABELS[k],
      [a]: da?.score ?? 0,
      [b]: db?.score ?? 0,
    };
  });

  // Simulated latency
  function latencyFor(id: string) {
    const base: Record<string, number> = {
      "gpt-4o": 820,
      "gpt-4.5": 1200,
      "claude-3.5": 1150,
      "claude-opus": 1850,
      "gemini-1.5": 950,
      "gemini-ultra": 1400,
      "llama-3.1": 720,
      "mistral-large": 900,
    };
    return base[id] ?? 1000;
  }

  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <div className="text-xs tracking-[0.3em] text-dim uppercase mb-3">Model Comparison</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-dim uppercase tracking-widest">Model A</label>
            <select
              className="w-full mt-1"
              value={a}
              onChange={(e) => setA(e.target.value)}
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.connected ? "" : "(offline)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-dim uppercase tracking-widest">Model B</label>
            <select
              className="w-full mt-1"
              value={b}
              onChange={(e) => setB(e.target.value)}
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.connected ? "" : "(offline)"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid stroke="#1c2227" strokeDasharray="2 4" />
              <XAxis dataKey="dim" tick={{ fontSize: 11, fill: "#7a848c", fontFamily: "var(--mono)" }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "#7a848c", fontFamily: "var(--mono)" }} />
              <Tooltip
                contentStyle={{
                  background: "#0d0f11",
                  border: "1px solid #2a3238",
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: "var(--mono)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--mono)" }} />
              <Bar dataKey={a} fill="#00ff9c" radius={[3, 3, 0, 0]} />
              <Bar dataKey={b} fill="#44aaff" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel p-5">
        <div className="text-xs tracking-[0.3em] text-dim uppercase mb-3">Side-by-side</div>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 text-sm">
          <div>
            <div className="text-[var(--accent)] font-bold tracking-wider">{a}</div>
            <div className="text-[11px] text-dim mb-2">
              {AVAILABLE_MODELS.find((m) => m.id === a)?.provider}
            </div>
          </div>
          <div />
          <div>
            <div className="text-[var(--info)] font-bold tracking-wider">{b}</div>
            <div className="text-[11px] text-dim mb-2">
              {AVAILABLE_MODELS.find((m) => m.id === b)?.provider}
            </div>
          </div>

          {DIM_KEYS.map((k) => {
            const da = profA.find((d) => d.key === k)?.score ?? 0;
            const db = profB.find((d) => d.key === b)?.score ?? 0;
            const winnerA = da > db;
            const winnerB = db > da;
            return (
              <div key={k} className="contents">
                <div className={`text-right px-2 py-1 ${winnerA ? "text-[var(--accent)]" : "text-[var(--text-dim)]"}`}>
                  {da.toFixed(1)}%
                </div>
                <div className="text-[11px] uppercase tracking-widest text-dim px-2 py-1 text-center whitespace-nowrap">
                  {DIM_LABELS[k]}
                </div>
                <div className={`px-2 py-1 ${winnerB ? "text-[var(--info)]" : "text-[var(--text-dim)]"}`}>
                  {db.toFixed(1)}%
                </div>
              </div>
            );
          })}
          <div className="text-right px-2 py-1 text-[var(--text-dim)]">{(latencyFor(a) / 1000).toFixed(2)}s</div>
          <div className="text-[11px] uppercase tracking-widest text-dim px-2 py-1 text-center">Latency</div>
          <div className="px-2 py-1 text-[var(--text-dim)]">{(latencyFor(b) / 1000).toFixed(2)}s</div>
        </div>
        <div className="mt-4 text-[11px] text-dimmer leading-relaxed border-t border-[#1c2227] pt-3">
          Note: these scores reflect synthetic benchmark results against BLACKBOX's standard test suite.
          A model can lead on some dimensions and trail on others — the right choice depends on workload.
        </div>
      </div>
    </div>
  );
}
