"use client";

import { Activity, Cpu, Database, FlaskConical } from "lucide-react";

interface HeaderProps {
  connected: boolean;
  modelName: string;
  endpoint: string;
}

export default function Header({ connected, modelName, endpoint }: HeaderProps) {
  return (
    <header className="border-b border-[#1c2227] px-6 py-3 flex items-center justify-between bg-[#090b0d]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border border-[var(--accent)] rounded-sm flex items-center justify-center glow">
            <FlaskConical className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="flex flex-col leading-tight">
            <div className="text-sm tracking-[0.3em] font-semibold text-[var(--accent)]">BLACKBOX</div>
            <div className="text-[10px] tracking-widest text-dim uppercase">
              AI Behavior Analysis &amp; Reliability Laboratory
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-dim" />
          <span className="text-dim uppercase tracking-wider">Model:</span>
          <span className="text-[var(--text)]">{modelName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-dim" />
          <span className="text-dim uppercase tracking-wider">Endpoint:</span>
          <span className="flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full pulse-dot ${
                connected ? "bg-[var(--accent)] text-[var(--accent)]" : "bg-[var(--danger)] text-[var(--danger)]"
              }`}
            />
            <span className={connected ? "text-[var(--text)]" : "text-[var(--danger)]"}>
              {connected ? endpoint : "disconnected"}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-dim">
          <Activity className="w-3.5 h-3.5" />
          <span className="font-mono">v0.1.0</span>
        </div>
      </div>
    </header>
  );
}
