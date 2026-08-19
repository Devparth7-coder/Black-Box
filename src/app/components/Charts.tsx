"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import type { DimensionScore } from "../lib/types";

const axisStyle = {
  fontSize: 11,
  fontFamily: "var(--mono)",
  fill: "#7a848c",
};

const tooltipStyle = {
  background: "#0d0f11",
  border: "1px solid #2a3238",
  borderRadius: 4,
  fontSize: 11,
  fontFamily: "var(--mono)",
  color: "#d9dde0",
};

export function ContextCurve({
  data,
}: {
  data: { tokens: number; accuracy: number; latency: number; consistency: number }[];
}) {
  const chartData = data.map((d) => ({
    name: `${d.tokens}K`,
    accuracy: d.accuracy,
    consistency: d.consistency,
    latency: Math.round(d.latency),
  }));
  return (
    <div className="panel p-5">
      <div className="text-xs tracking-[0.3em] text-dim uppercase mb-1">Context Sensitivity Curve</div>
      <div className="text-[11px] text-dimmer mb-4">
        Accuracy / Consistency / Latency vs. context window length
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#1c2227" strokeDasharray="2 4" />
          <XAxis dataKey="name" style={axisStyle} />
          <YAxis yAxisId="left" domain={[40, 100]} style={axisStyle} />
          <YAxis yAxisId="right" orientation="right" style={axisStyle} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--mono)", color: "#7a848c" }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="accuracy"
            stroke="#00ff9c"
            strokeWidth={2}
            dot={{ r: 3, fill: "#00ff9c" }}
            name="Accuracy %"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="consistency"
            stroke="#44aaff"
            strokeWidth={2}
            dot={{ r: 3, fill: "#44aaff" }}
            name="Consistency %"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="latency"
            stroke="#ffb020"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={{ r: 2, fill: "#ffb020" }}
            name="Latency ms"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FactualBar({
  data,
}: {
  data: { correct: number; incorrect: number; unsupported: number; total: number };
}) {
  const chartData = [
    { name: "Correct", value: data.correct, fill: "#00ff9c" },
    { name: "Incorrect", value: data.incorrect, fill: "#ff4455" },
    { name: "Unsupported", value: data.unsupported, fill: "#ffb020" },
  ];
  return (
    <div className="panel p-5">
      <div className="text-xs tracking-[0.3em] text-dim uppercase mb-1">Hallucination / Factuality</div>
      <div className="text-[11px] text-dimmer mb-2">
        {data.total} verifiable questions against ground truth
      </div>
      <div className="flex items-baseline gap-4 mb-3 text-sm">
        <div>
          <span className="text-[var(--accent)] text-2xl font-bold">
            {((data.correct / data.total) * 100).toFixed(1)}%
          </span>
          <span className="text-dim ml-2 text-xs">reliability</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#1c2227" strokeDasharray="2 4" />
          <XAxis dataKey="name" style={axisStyle} />
          <YAxis style={axisStyle} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#111417" }} />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {chartData.map((e, i) => (
              <Cell key={i} fill={e.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RefusalBar({
  data,
}: {
  data: { appropriate: number; inappropriate: number; overRefusal: number; inconsistent: number };
}) {
  const total = data.appropriate + data.inappropriate + data.overRefusal + data.inconsistent;
  const chartData = [
    { name: "Appropriate", value: data.appropriate, fill: "#00ff9c" },
    { name: "Over-refusal", value: data.overRefusal, fill: "#ffb020" },
    { name: "Inappropriate", value: data.inappropriate, fill: "#ff4455" },
    { name: "Inconsistent", value: data.inconsistent, fill: "#b57bff" },
  ];
  return (
    <div className="panel p-5">
      <div className="text-xs tracking-[0.3em] text-dim uppercase mb-1">Refusal Calibration</div>
      <div className="text-[11px] text-dimmer mb-3">{total} safety-sensitive prompts</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid stroke="#1c2227" strokeDasharray="2 4" />
          <XAxis type="number" style={axisStyle} />
          <YAxis dataKey="name" type="category" style={axisStyle} width={90} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#111417" }} />
          <Bar dataKey="value" radius={[0, 3, 3, 0]}>
            {chartData.map((e, i) => (
              <Cell key={i} fill={e.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ToolBar({
  data,
}: {
  data: { ok: number; unnecessary: number; wrong: number; invalidArgs: number; repeated: number; recovered: number };
}) {
  const total = data.ok + data.wrong + data.invalidArgs + data.unnecessary + data.repeated;
  const chartData = [
    { name: "Correct", value: data.ok, fill: "#00ff9c" },
    { name: "Wrong tool", value: data.wrong, fill: "#ff4455" },
    { name: "Invalid args", value: data.invalidArgs, fill: "#ffb020" },
    { name: "Unnecessary", value: data.unnecessary, fill: "#44aaff" },
    { name: "Repeated", value: data.repeated, fill: "#b57bff" },
  ];
  return (
    <div className="panel p-5">
      <div className="text-xs tracking-[0.3em] text-dim uppercase mb-1">Tool-Use Behavior</div>
      <div className="text-[11px] text-dimmer mb-3">{total} simulated tool calls in sandbox</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#1c2227" strokeDasharray="2 4" />
          <XAxis dataKey="name" style={axisStyle} fontSize={10} />
          <YAxis style={axisStyle} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#111417" }} />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {chartData.map((e, i) => (
              <Cell key={i} fill={e.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RadarProfile({ dimensions }: { dimensions: DimensionScore[] }) {
  const data = dimensions.map((d) => ({
    subject: d.label,
    score: d.score,
    fullMark: 100,
  }));
  return (
    <div className="panel p-5">
      <div className="text-xs tracking-[0.3em] text-dim uppercase mb-1">Radar Fingerprint</div>
      <div className="text-[11px] text-dimmer mb-3">Multi-dimensional behavior at a glance</div>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#2a3238" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#7a848c", fontFamily: "var(--mono)" }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#4a535a" }} />
          <Radar name="score" dataKey="score" stroke="#00ff9c" fill="#00ff9c" fillOpacity={0.25} strokeWidth={2} />
          <Tooltip contentStyle={tooltipStyle} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BehavioralMap({
  points,
}: {
  points: { x: number; y: number; z: number; cluster: number }[];
}) {
  const clusterColors = ["#00ff9c", "#ff4455", "#ffb020", "#44aaff", "#b57bff"];
  const data = points.map((p) => ({ ...p, c: clusterColors[p.cluster % clusterColors.length] }));
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs tracking-[0.3em] text-dim uppercase">Behavioral Map</div>
        <div className="flex items-center gap-3 text-[10px] text-dim">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 inline-block rounded-full" style={{ background: "#00ff9c" }} /> nominal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 inline-block rounded-full" style={{ background: "#ff4455" }} /> adversarial
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 inline-block rounded-full" style={{ background: "#ffb020" }} /> high-context
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 inline-block rounded-full" style={{ background: "#44aaff" }} /> tool-use
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 inline-block rounded-full" style={{ background: "#b57bff" }} /> failure
          </span>
        </div>
      </div>
      <div className="text-[11px] text-dimmer mb-3">
        Each point is one experiment — X = Robustness, Y = Reliability, size = latency
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid stroke="#1c2227" strokeDasharray="2 4" />
          <XAxis
            type="number"
            dataKey="x"
            name="Robustness"
            domain={[30, 100]}
            style={axisStyle}
            label={{ value: "Robustness →", position: "insideBottom", offset: -10, fill: "#7a848c", fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Reliability"
            domain={[30, 100]}
            style={axisStyle}
            label={{ value: "↑ Reliability", angle: -90, position: "insideLeft", fill: "#7a848c", fontSize: 11 }}
          />
          <ZAxis type="number" dataKey="z" range={[8, 60]} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: any, n: any) => (n === "z" ? `${Math.round(Number(v))}ms` : `${Math.round(Number(v))}%`)}
          />
          <Scatter data={data}>
            {data.map((p, i) => (
              <Cell key={i} fill={p.c} fillOpacity={0.55} stroke={p.c} strokeOpacity={0.9} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RecoveryBars({ data }: { data: { step: string; count: number }[] }) {
  const colors = ["#00ff9c", "#44aaff", "#ffb020", "#b57bff", "#ff4455"];
  return (
    <div className="panel p-5">
      <div className="text-xs tracking-[0.3em] text-dim uppercase mb-1">Failure Recovery Path</div>
      <div className="text-[11px] text-dimmer mb-3">Behavior after injected tool/API failures</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#1c2227" strokeDasharray="2 4" />
          <XAxis dataKey="step" style={axisStyle} fontSize={10} />
          <YAxis style={axisStyle} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#111417" }} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
