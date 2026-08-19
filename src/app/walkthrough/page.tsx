"use client";

import { useEffect, useRef, useState } from "react";
import "./walkthrough.css";

// Scenes keyed to the 10 narration clips. Each scene displays a stylized
// BLACKBOX UI mock animated via CSS while the corresponding audio plays.
const SCENES = [
  { id: 1, title: "BLACKBOX", subtitle: "AI Behavior Analysis & Reliability Laboratory" },
  { id: 2, title: "Target Model", subtitle: "Select the system under test" },
  { id: 3, title: "Running Experiment", subtitle: "Live ticker · Thousands of tests" },
  { id: 4, title: "Batteries (1/2)", subtitle: "Consistency · Prompt sensitivity · Hallucination · Contradiction" },
  { id: 5, title: "Batteries (2/2)", subtitle: "Memory · Context · Instruction · Robustness · Refusal · Tool-use · Failure" },
  { id: 6, title: "Behavioral Fingerprint", subtitle: "Eight dimensions · Measured, not self-reported" },
  { id: 7, title: "Behavioral Map", subtitle: "Every point is an experiment" },
  { id: 8, title: "Curves & Breakdowns", subtitle: "Context · Factuality · Refusal · Tools" },
  { id: 9, title: "Automated Findings", subtitle: "Critical · Warning · Info" },
  { id: 10, title: "Model Comparison", subtitle: "Same test suite · Side by side" },
];

export default function Walkthrough() {
  const [started, setStarted] = useState(false);
  const [scene, setScene] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!started) return;
    let idx = 0;
    setScene(0);

    function playNext() {
      if (idx >= audioRefs.current.length) {
        // end of walkthrough — show end card
        setScene(-1);
        return;
      }
      const a = audioRefs.current[idx];
      if (!a) {
        idx++;
        playNext();
        return;
      }
      setScene(idx);
      setProgress(0);
      startedAtRef.current = performance.now();
      a.currentTime = 0;
      a.play().catch(() => {});
      a.onended = () => {
        idx++;
        playNext();
      };
    }
    playNext();

    // progress updater
    const progId = setInterval(() => {
      const a = audioRefs.current[idx];
      if (a && a.duration) {
        setProgress((a.currentTime / a.duration) * 100);
      } else if (idx >= audioRefs.current.length) {
        setProgress(100);
      }
    }, 80);

    return () => {
      clearInterval(progId);
      audioRefs.current.forEach((a) => {
        if (a) {
          a.onended = null;
          a.pause();
        }
      });
    };
  }, [started]);

  return (
    <div className="wt-root">
      {/* Preload audio elements */}
      {SCENES.map((_, i) => (
        <audio
          key={i}
          ref={(el) => {
            audioRefs.current[i] = el;
          }}
          src={`/audio/${String(i + 1).padStart(2, "0")}_${[
            "intro",
            "setup",
            "start",
            "tests",
            "tests2",
            "profile",
            "map",
            "charts",
            "findings",
            "compare",
          ][i]}.mp3`}
          preload="auto"
        />
      ))}

      {/* Stage */}
      <div className="wt-stage">
        {/* Scanlines */}
        <div className="wt-scanlines" />
        <div className="wt-vignette" />

        {/* Start overlay */}
        {!started && (
          <div className="wt-start">
            <div className="wt-start-logo">
              <pre>{`   ╔══════════════════════════════════════╗
   ║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
   ║  ░░░░   BLACKBOX   LAB         ░░░░░  ║
   ║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
   ╚══════════════════════════════════════╝`}</pre>
            </div>
            <div className="wt-start-sub">
              AI Behavior Analysis &amp; Reliability Laboratory
            </div>
            <div className="wt-start-tag">Narrated walkthrough · ~55 seconds</div>
            <button
              className="wt-play-btn"
              onClick={() => setStarted(true)}
            >
              ▶  PLAY WALKTHROUGH
            </button>
            <div className="wt-start-hint">
              <a href="/">← back to the lab</a>
            </div>
          </div>
        )}

        {/* Scene container */}
        {started && (
          <>
            {/* Top bar */}
            <div className="wt-top">
              <div className="wt-brand">
                <span className="wt-brand-dot" />
                BLACKBOX
                <span className="wt-brand-sub">/ walkthrough</span>
              </div>
              <div className="wt-scene-label">
                {scene === -1 ? (
                  <>END<span className="wt-sep">·</span>walkthrough complete</>
                ) : (
                  <>
                    scene {String(scene + 1).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")}
                    <span className="wt-sep">·</span>
                    {SCENES[scene]?.title}
                  </>
                )}
              </div>
              <div className="wt-progress">
                <div className="wt-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Scene content — each scene is keyed to force remount for entrance anim */}
            <div key={scene} className="wt-scene">
              {scene === 0 && <Scene1 />}
              {scene === 1 && <Scene2 />}
              {scene === 2 && <Scene3 />}
              {scene === 3 && <Scene4 />}
              {scene === 4 && <Scene5 />}
              {scene === 5 && <Scene6 />}
              {scene === 6 && <Scene7 />}
              {scene === 7 && <Scene8 />}
              {scene === 8 && <Scene9 />}
              {scene === 9 && <Scene10 />}
              {scene === -1 && <SceneEnd />}
            </div>

            {/* Caption / end card */}
            <div className="wt-caption">
              {scene === -1 ? (
                <>
                  <div className="wt-caption-title">end of walkthrough</div>
                  <div className="wt-caption-sub">
                    <a href="/" style={{ color: "var(--wt-accent)", textDecoration: "none", borderBottom: "1px dashed var(--wt-accent)" }}>
                      → enter the lab
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="wt-caption-title">{SCENES[scene]?.title}</div>
                  <div className="wt-caption-sub">{SCENES[scene]?.subtitle}</div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────── SCENES ─────────────────── */

function Scene1() {
  return (
    <div className="s1">
      <pre className="s1-ascii">{`   ╔══════════════════════════════════════╗
   ║                                      ║
   ║          ░░░░ BLACKBOX ░░░░          ║
   ║                                      ║
   ║   AI BEHAVIOR ANALYSIS & RELIABILITY ║
   ║             LABORATORY               ║
   ║                                      ║
   ╚══════════════════════════════════════╝`}</pre>
      <div className="s1-tag">Don't trust the model's description of itself.</div>
      <div className="s1-sub">Probe. Observe. Measure.</div>
      <div className="s1-cursor">_</div>
    </div>
  );
}

function Scene2() {
  const models = [
    { name: "GPT-4o", provider: "OpenAI", on: true },
    { name: "Claude 3.5 Sonnet", provider: "Anthropic", on: false },
    { name: "Gemini 1.5 Pro", provider: "Google", on: false },
    { name: "Llama 3.1 405B", provider: "Meta", on: false },
    { name: "Mistral Large 2", provider: "Mistral", on: false },
  ];
  return (
    <div className="s2">
      <div className="s2-panel">
        <div className="s2-h">▌ TARGET MODEL</div>
        {models.map((m, i) => (
          <div key={i} className={`s2-row ${m.on ? "on" : ""}`} style={{ animationDelay: `${i * 0.25}s` }}>
            <span className={`s2-dot ${m.on ? "on" : ""}`} />
            <span className="s2-name">{m.name}</span>
            <span className="s2-prov">{m.provider}</span>
          </div>
        ))}
      </div>
      <div className="s2-panel">
        <div className="s2-h">▌ PARAMETERS</div>
        <div className="s2-slider">
          <span>temperature</span>
          <div className="s2-track"><div className="s2-fill" style={{ width: "35%" }} /></div>
          <span className="s2-val">0.70</span>
        </div>
        <div className="s2-slider">
          <span>runs / test</span>
          <div className="s2-track"><div className="s2-fill" style={{ width: "30%" }} /></div>
          <span className="s2-val">30</span>
        </div>
        <div className="s2-check"><span className="s2-box on">✓</span> tool-use sandbox</div>
        <div className="s2-check"><span className="s2-box on">✓</span> failure injection</div>
        <div className="s2-check"><span className="s2-box"> </span> discovery mode</div>
      </div>
    </div>
  );
}

function Scene3() {
  const lines = [
    "[INFO] BLACKBOX laboratory initializing",
    "[INFO] model = gpt-4o",
    "[OK]   handshake OK, latency 82ms",
    "[INFO] queued 2640 test cases across 11 categories",
    "[TST]  consistency-000-1          412ms  OK",
    "[TST]  consistency-000-2          388ms  OK",
    "[TST]  prompt_sens-001-0          507ms  OK",
    "[WARN] hallucination-022-1       1240ms  ANOMALY",
    "[TST]  memory-010-3              612ms  OK",
    "[TST]  context-1k-0               204ms  OK",
    "[TST]  context-128k-7            2840ms  OK",
    "[ERR]  instruction-031-2          740ms  ANOMALY",
    "[TST]  refusal-018-0              910ms  OK",
    "[TST]  tool_use-042-0             520ms  OK",
    "[TST]  failure_inj-007-1         1880ms  OK",
  ];
  return (
    <div className="s3">
      <div className="s3-progress">
        <div className="s3-bar"><div className="s3-fill" /></div>
        <div className="s3-pct">64%</div>
      </div>
      <div className="s3-terminal">
        {lines.map((l, i) => (
          <div key={i} className="s3-line" style={{ animationDelay: `${i * 0.15}s` }}>
            {l}
          </div>
        ))}
        <div className="s3-cursor">▊</div>
      </div>
      <div className="s3-badges">
        {["consistency", "prompt_sens", "hallucination", "memory", "context"].map((b, i) => (
          <span key={i} className="s3-badge done">{b}</span>
        ))}
        <span className="s3-badge running">instruction</span>
        {["robustness", "refusal", "tool_use", "failure_inj"].map((b, i) => (
          <span key={i} className="s3-badge">{b}</span>
        ))}
      </div>
    </div>
  );
}

function Scene4() {
  const cards = [
    { t: "CONSISTENCY", v: "86.2%", d: "semantic stability across re-runs", c: "ok" },
    { t: "PROMPT SENSITIVITY", v: "0.34Δ", d: "low drift under rephrase", c: "ok" },
    { t: "HALLUCINATION", v: "86.2%", d: "431 / 500 correct", c: "ok" },
    { t: "CONTRADICTION", v: "4 found", d: "linked response pairs", c: "warn" },
  ];
  return (
    <div className="s4">
      {cards.map((c, i) => (
        <div key={i} className={`s4-card ${c.c}`} style={{ animationDelay: `${i * 0.2}s` }}>
          <div className="s4-label">{c.t}</div>
          <div className="s4-value">{c.v}</div>
          <div className="s4-desc">{c.d}</div>
          <div className="s4-bar"><div style={{ width: `${60 + i * 8}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function Scene5() {
  return (
    <div className="s5">
      <div className="s5-grid">
        {[
          { i: "🧠", t: "Memory", d: "retention · contamination · conflict" },
          { i: "📚", t: "Context", d: "1K → 128K degradation curve" },
          { i: "⚙️", t: "Instruction", d: "schema · format · directives 94.8%" },
          { i: "🛡️", t: "Robustness", d: "typos · case · whitespace · distractors" },
          { i: "🚫", t: "Refusal", d: "over-refusal · under-refusal · calibration" },
          { i: "🔧", t: "Tool-use", d: "selection · args · retry in sandbox" },
          { i: "⚡", t: "Failure Inj.", d: "timeouts · malformed · rate limits" },
        ].map((c, i) => (
          <div key={i} className="s5-tile" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="s5-icon">{c.i}</div>
            <div className="s5-t">{c.t}</div>
            <div className="s5-d">{c.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Scene6() {
  const dims: [string, number][] = [
    ["Reliability", 91.4],
    ["Consistency", 87.2],
    ["Instruction", 94.8],
    ["Robustness", 79.6],
    ["Factuality", 89.1],
    ["Tool Selection", 93.7],
    ["Recovery", 71.4],
    ["Refusal", 82.0],
  ];
  return (
    <div className="s6">
      <pre className="s6-ascii">{`╔══════════════════════════════════════╗
║       MODEL BEHAVIOR PROFILE         ║
╠══════════════════════════════════════╣`}</pre>
      <div className="s6-list">
        {dims.map(([label, v], i) => (
          <div key={i} className="s6-row" style={{ animationDelay: `${i * 0.12}s` }}>
            <span className="s6-name">{label}</span>
            <span className="s6-bar">
              <span
                className="s6-fill"
                style={{
                  width: `${v}%`,
                  background:
                    v >= 90 ? "var(--accent)" : v >= 80 ? "#7ee787" : v >= 70 ? "var(--warn)" : "var(--danger)",
                }}
              />
            </span>
            <span
              className="s6-val"
              style={{
                color:
                  v >= 90 ? "var(--accent)" : v >= 80 ? "#7ee787" : v >= 70 ? "var(--warn)" : "var(--danger)",
              }}
            >
              {v.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
      <pre className="s6-ascii">{`╚══════════════════════════════════════╝`}</pre>
    </div>
  );
}

function Scene7() {
  // Generate deterministic scatter points
  const pts: { x: number; y: number; c: string; s: number }[] = [];
  const clusters = [
    { cx: 82, cy: 90, c: "#00ff9c", n: 40 },
    { cx: 68, cy: 76, c: "#ff4455", n: 30 },
    { cx: 72, cy: 62, c: "#ffb020", n: 25 },
    { cx: 88, cy: 86, c: "#44aaff", n: 25 },
    { cx: 58, cy: 60, c: "#b57bff", n: 20 },
  ];
  let seed = 1;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  clusters.forEach((cl) => {
    for (let i = 0; i < cl.n; i++) {
      pts.push({
        x: cl.cx + (rnd() - 0.5) * 16,
        y: cl.cy + (rnd() - 0.5) * 16,
        c: cl.c,
        s: 4 + rnd() * 8,
      });
    }
  });
  return (
    <div className="s7">
      <div className="s7-axes">
        {/* grid */}
        {[0, 25, 50, 75, 100].map((t) => (
          <div key={`gx${t}`} className="s7-gx" style={{ left: `${t}%` }} />
        ))}
        {[0, 25, 50, 75, 100].map((t) => (
          <div key={`gy${t}`} className="s7-gy" style={{ bottom: `${t}%` }} />
        ))}
        {/* axis labels */}
        <div className="s7-xlabel">Robustness →</div>
        <div className="s7-ylabel">↑ Reliability</div>
        {/* points */}
        {pts.map((p, i) => (
          <div
            key={i}
            className="s7-pt"
            style={{
              left: `${p.x}%`,
              bottom: `${p.y}%`,
              width: p.s,
              height: p.s,
              background: p.c,
              boxShadow: `0 0 8px ${p.c}`,
              animationDelay: `${i * 0.012}s`,
            }}
          />
        ))}
        {/* legend */}
        <div className="s7-legend">
          <span><i style={{ background: "#00ff9c" }} /> nominal</span>
          <span><i style={{ background: "#ff4455" }} /> adversarial</span>
          <span><i style={{ background: "#ffb020" }} /> high-context</span>
          <span><i style={{ background: "#44aaff" }} /> tool-use</span>
          <span><i style={{ background: "#b57bff" }} /> failure</span>
        </div>
      </div>
    </div>
  );
}

function Scene8() {
  // Mini line chart for context curve
  const w = 320,
    h = 120;
  const pts = [
    [0, 20],
    [17, 22],
    [33, 28],
    [50, 38],
    [66, 52],
    [83, 70],
    [100, 82],
  ];
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${(p[0] / 100) * w} ${(p[1] / 100) * h}`).join(" ");
  return (
    <div className="s8">
      <div className="s8-chart">
        <div className="s8-chart-title">context sensitivity (1K → 128K tokens)</div>
        <svg viewBox={`0 0 ${w} ${h + 20}`} className="s8-svg">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={0}
              x2={w}
              y1={t * h}
              y2={t * h}
              stroke="#1c2227"
              strokeDasharray="2 4"
            />
          ))}
          <path d={path} fill="none" stroke="#00ff9c" strokeWidth={2} />
          {pts.map((p, i) => (
            <circle key={i} cx={(p[0] / 100) * w} cy={(p[1] / 100) * h} r={3} fill="#00ff9c" />
          ))}
        </svg>
      </div>
      <div className="s8-bars">
        {[
          ["correct", 431, "#00ff9c"],
          ["incorrect", 42, "#ff4455"],
          ["unsupported", 27, "#ffb020"],
        ].map(([l, v, c]: any, i) => (
          <div key={i} className="s8-bar-row">
            <span className="s8-bar-label">{l}</span>
            <span className="s8-bar-track">
              <span
                className="s8-bar-fill"
                style={{ width: `${(v / 500) * 100}%`, background: c }}
              />
            </span>
            <span className="s8-bar-val" style={{ color: c }}>{v}</span>
          </div>
        ))}
        <div className="s8-bars-title">factuality · 500 questions</div>
      </div>
    </div>
  );
}

function Scene9() {
  const findings = [
    { sev: "critical", t: "Brittle failure recovery", d: "Model gave up instead of retrying on 35 of 100 injected failures." },
    { sev: "warn", t: "Response drift under paraphrase", d: "Semantic similarity dropped below 0.85 on 18% of rephrasings." },
    { sev: "warn", t: "Refusal calibration", d: "Over-refusal on 19 benign prompts; under-refusal on 10 unsafe prompts." },
    { sev: "info", t: "Memory contamination", d: "Incorrect facts planted in early turns adopted later 11% of the time." },
    { sev: "info", t: "Latency cliff", d: "Latency jumped 4× past ~64K tokens." },
  ];
  return (
    <div className="s9">
      {findings.map((f, i) => (
        <div key={i} className={`s9-f ${f.sev}`} style={{ animationDelay: `${i * 0.25}s` }}>
          <div className="s9-tag">{f.sev}</div>
          <div className="s9-t">{f.t}</div>
          <div className="s9-d">{f.d}</div>
        </div>
      ))}
    </div>
  );
}

function SceneEnd() {
  return (
    <div className="s-end">
      <pre className="s-end-ascii">{`   ╔══════════════════════════════════════╗
   ║       DON'T TRUST THE DESC.          ║
   ║                                      ║
   ║       PROBE  ·  OBSERVE  ·  MEASURE  ║
   ╚══════════════════════════════════════╝`}</pre>
      <div className="s-end-tag">BLACKBOX</div>
      <div className="s-end-sub">AI Behavior Analysis &amp; Reliability Laboratory</div>
      <a href="/" className="s-end-cta">ENTER THE LAB →</a>
    </div>
  );
}

function Scene10() {
  const dims: [string, number, number][] = [
    ["Reliability", 91, 94],
    ["Consistency", 87, 81],
    ["Instruction", 94, 96],
    ["Robustness", 79, 92],
    ["Factuality", 89, 92],
    ["Tool use", 94, 88],
    ["Recovery", 74, 80],
    ["Refusal", 82, 90],
  ];
  return (
    <div className="s10">
      <div className="s10-head">
        <div className="s10-a">GPT-4o</div>
        <div className="s10-vs">vs</div>
        <div className="s10-b">Claude 3.5 Sonnet</div>
      </div>
      <div className="s10-chart">
        {dims.map(([l, a, b]: any, i) => (
          <div key={i} className="s10-row">
            <div className="s10-label">{l}</div>
            <div className="s10-bars">
              <div className="s10-bar-a" style={{ width: `${a}%` }}>{a}%</div>
              <div className="s10-bar-b" style={{ width: `${b}%` }}>{b}%</div>
            </div>
          </div>
        ))}
      </div>
      <div className="s10-quote">
        "Model A isn't better. Model A is better for <em>this workload</em>."
      </div>
    </div>
  );
}
