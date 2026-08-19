"use client";

import type { DimensionScore } from "../lib/types";

function scoreColor(s: number) {
  if (s >= 90) return "var(--accent)";
  if (s >= 80) return "#7ee787";
  if (s >= 70) return "var(--warn)";
  return "var(--danger)";
}

function AsciiBar({ value, width = 24 }: { value: number; width?: number }) {
  const filled = Math.round((value / 100) * width);
  return (
    <span className="text-[var(--accent)]">
      {"█".repeat(filled)}
      <span className="text-[#2a3238]">{"░".repeat(width - filled)}</span>
    </span>
  );
}

export default function BehaviorProfile({ dimensions }: { dimensions: DimensionScore[] }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs tracking-[0.3em] text-dim uppercase">╔══ Behavioral Fingerprint ══╗</div>
          <div className="text-[11px] text-dimmer mt-1">
            Composite profile synthesized across all experiment batteries.
          </div>
        </div>
        <div className="text-[10px] text-dimmer mono">ID: FP-{Math.floor(Math.random() * 90000) + 10000}</div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {dimensions.map((d) => (
          <div key={d.key} className="flex items-center gap-3 text-sm">
            <div className="w-44 text-[var(--text)] capitalize tracking-wider text-xs">{d.label}</div>
            <div className="flex-1">
              <div className="meter-track">
                <div
                  className="meter-fill"
                  style={{
                    width: `${d.score}%`,
                    background: `linear-gradient(90deg, ${scoreColor(d.score)}55, ${scoreColor(d.score)})`,
                  }}
                />
              </div>
            </div>
            <div className="w-14 text-right font-bold text-xs" style={{ color: scoreColor(d.score) }}>
              {d.score.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-[#1c2227]">
        <div className="text-[11px] text-dim mb-3 tracking-widest uppercase">── ASCII Summary ──</div>
        <pre className="ascii-box text-dim leading-tight">
{`╔══════════════════════════════════════════╗
║       MODEL BEHAVIOR PROFILE             ║
╠══════════════════════════════════════════╣`}
{dimensions.map((d) => {
  const label = d.label.padEnd(18, " ");
  const pct = d.score.toFixed(1).padStart(5, " ");
  return `\n║ ${label}  ${AsciiBar({ value: d.score })} ${pct}% ║`;
}).join("")}
{`
╚══════════════════════════════════════════╝`}
        </pre>
      </div>
    </div>
  );
}
