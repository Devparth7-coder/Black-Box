```
╔══════════════════════════════════════════════════════════════╗
║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
║  ░░░░   ██████  ██       █████   ██████ ██   ██ ██████  ░░░░  ║
║  ░░░░   ██   ██ ██      ██   ██ ██      ██  ██  ██   ██ ░░░░  ║
║  ░░░░   ██████  ██      ███████ ██      █████   ██████  ░░░░  ║
║  ░░░░   ██   ██ ██      ██   ██ ██      ██  ██  ██   ██ ░░░░  ║
║  ░░░░   ██████  ███████ ██   ██  ██████ ██   ██ ██████  ░░░░  ║
║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
╚══════════════════════════════════════════════════════════════╝
       AI BEHAVIOR ANALYSIS & RELIABILITY LABORATORY
```

# BLACKBOX

> **Don't trust the model's description of itself. Probe it.**

BLACKBOX is an experimental research platform for treating large language models
as unknown systems and empirically discovering how they *actually* behave — under
stress, across rephrasings, inside long contexts, when tools fail, and when the
input distribution drifts from the training data.

You put an AI inside a black box. You give it the same inputs, repeatedly. You
push its limits. You measure.

No marketing copy. No self-reported benchmarks. No leaderboard mythology. Just
experiments, numbers, and reproducible evidence.

---

## What BLACKBOX does

BLACKBOX connects to a model endpoint, then automatically runs thousands of
controlled experiments across **eleven** test batteries:

| Battery | What it measures |
|---|---|
| **Consistency** | Semantic stability across repeated identical / near-identical inputs |
| **Prompt Sensitivity** | Drift under rephrasing, tone, formatting, order, politeness, capitalization |
| **Hallucination / Factuality** | Correct / incorrect / unsupported answers against ground truth |
| **Contradiction Detection** | Cross-response logical inconsistency; links conflicting answers |
| **Memory Behavior** | Retention, contamination, and conflict across multi-turn sessions |
| **Context Sensitivity** | Accuracy / latency / consistency degradation across 1K→128K tokens |
| **Instruction Following** | Schema adherence, format compliance, directive obedience |
| **Robustness** | Stability under typos, casing, whitespace, distractors, minor drift |
| **Refusal Calibration** | Appropriate refusal vs. over-refusal vs. under-refusal vs. inconsistency |
| **Tool-Use Behavior** | Tool selection, arguments, retries, repeated calls, failure recovery |
| **Failure Injection** | Behavior under timeouts, malformed responses, rate limits, outages |

It produces:

- **Behavioral Fingerprint** — eight scored dimensions (Reliability, Consistency,
  Instruction, Robustness, Factuality, Tool Selection, Recovery, Refusal) with
  both meter bars and the classic ASCII profile box
- **Behavioral Map** — a 2D scatter plot (robustness × reliability, point size =
  latency) where clusters reveal behavioral regimes: nominal, adversarial,
  high-context, tool-use, failure
- **Context sensitivity curve** — accuracy + consistency + latency degradation
  across context window lengths
- **Automated findings** — critical / warn / info findings tied back to the
  battery that exposed them
- **Model comparison** — two models, same test suite, side-by-side across every
  dimension plus latency (the honest answer: "better *for this workload*")
- **Experiment builder** — visual pipeline (INPUT → VARIATION → MODEL → EVALUATOR
  → ANALYSIS → REPORT) to construct custom test matrices
- **Discovery mode** — unsupervised fuzzing that searches the input space for
  unusual behavior (confidence shifts, contradictions, refusal boundaries,
  latency cliffs, inconsistent tool selection)
- **Reproducible experiments** — every run saved with full prompt, config,
  response, evaluator, timestamp, score, and a `blackbox rerun …` CLI command to
  replay it verbatim

---

## Watch the walkthrough

A 4:31 narrated walkthrough video is included:

```
public/blackbox_walkthrough.mp4   (1280×800, h264+AAC, 9.6 MB)
```

Or in the running app: click **▶ VIDEO (4:31)** in the footer, or navigate to
`/video`. An interactive self-advancing version is also available at
`/walkthrough`.

---

## The philosophy

Benchmarks lie. Models lie. Even *you* will lie to yourself about which model is
"better," because your sample size is five cherry-picked prompts and you
remember the wins and forget the failures.

BLACKBOX is built on three principles:

1. **The model is a black box.** No weights. No gradients. No internals.
   Everything is derived from observable input/output behavior. If you can't
   measure it from the outside, it doesn't go in the report.

2. **Single numbers are propaganda.** There is no "IQ" for an LLM. There is no
   one-number score. BLACKBOX shows eight dimensions, the behavioral map, the
   context curve, the contradiction links, and the per-category breakdowns. The
   composite score is a convenience; the dimensions are the truth.

3. **Experiments must be reproducible.** Every run is saved with a seed and a
   one-line replay command. If you can't rerun it, it's not research — it's
   anecdote.

---

## Architecture

```
                     BLACKBOX
                        │
                 Next.js Frontend
                        │
                   REST / SSE
                        ▼
                   API Gateway
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
     Experiment     Model        Evaluation
      Service       Service        Service
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                    Job Queue
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
         Worker      Worker      Worker
            │           │           │
            └───────────┼───────────┘
                        ▼
                   Model APIs
                        ▼
                   Result Store
                   ┌───┴───┐
                   ▼       ▼
              PostgreSQL  Object Store
```

This repository is the frontend — a Next.js + TypeScript + Tailwind application
with Recharts visualizations, a cinematic CRT/terminal aesthetic, and a seeded
simulation engine for offline demos. The simulator produces deterministic,
model-specific profiles (GPT-4o, Claude 3.5 Sonnet, Claude Opus, Gemini 1.5
Pro/Ultra, Llama 3.1 405B, Mistral Large 2) loosely grounded in public
benchmarks, so the UI is fully interactive without needing live API keys.

### Stack

**Frontend**
- Next.js (App Router) + TypeScript
- Tailwind CSS (custom terminal/CRT theme)
- Recharts (line, bar, radar, scatter)
- Lucide icons

**Reference backend (not included here)**
- Python / FastAPI / Pydantic / asyncio
- PostgreSQL, Redis + workers
- pandas, NumPy, scikit-learn for statistical analysis
- Evaluators: deterministic checks, statistical tests, optional calibrated
  LLM-as-judge

---

## Getting started

```bash
# install dependencies
npm install

# run the dev server (note: in sandboxed origins, use production build — see below)
npm run dev

# production build + server (recommended; avoids Next dev CORS issues in iframes)
npm run build
npm run start
```

Then open http://localhost:3000.

### Recording the walkthrough video

The MP4 was rendered headlessly with Playwright + ffmpeg:

```bash
# 1. download ffmpeg static binary and required Chromium .so debs into $HOME/lib
# 2. ensure the production server is running on :3000
# 3. run the recorder:
node record.mjs
# → outputs public/blackbox_walkthrough.mp4
```

`record.mjs` uses Playwright's headless shell, captures frames via sequential
`page.screenshot` calls, pipes jpeg frames to ffmpeg (libx264), pre-concatenates
the narration audio (delayed to match the lead-in), and muxes them into the
final MP4.

---

## Using BLACKBOX

1. **Pick a model.** Choose from the dropdown (GPT-4o, Claude, Gemini, Llama,
   Mistral). In production this wires up to real endpoints; in the demo it
   uses seeded simulated profiles.

2. **Configure the run.** Temperature, runs-per-test, enable tool sandbox,
   failure injection, and discovery mode. Toggle individual test batteries.

3. **Hit START ANALYSIS.** Watch the live ticker stream results in real time.
   The progress bar fills, battery badges flip from pending → running → done,
   logs scroll in the terminal.

4. **Read the report.**
   - Behavioral Fingerprint (8 dimensions + ASCII box)
   - Radar chart
   - Behavioral Map (scatter plot with 5 clusters)
   - Context sensitivity curve
   - Factuality / Refusal / Tool-use breakdowns
   - Recovery path after injected failures
   - Detected contradictions (linked Q→A pairs)
   - Automated findings (critical / warn / info)

5. **Compare.** Drop two models into the same suite. Get side-by-side bars.
   Stop saying "Model A is better" and start saying "Model A is better for
   *this* workload."

6. **Build your own.** Use the Experiment Builder to construct custom test
   matrices — base prompt, variations, evaluators, statistical analysis.

7. **Discover.** Enable Discovery Mode and let BLACKBOX fuzz the input space
   looking for behavioral boundaries on its own.

8. **Rerun.** Every experiment has a reproducibility manifest with seed and a
   replay command. Science, not vibes.

---

## Evaluators

BLACKBOX uses three tiers of evaluator, in order of trustworthiness:

1. **Deterministic** — exact match, schema validation, JSON parse checks,
   regex, string comparison. Ground truth only.
2. **Statistical** — embedding similarity across re-runs (consistency),
   significance tests, latency distributions, outlier detection.
3. **LLLM-as-judge** (calibrated, optional) — used only for open-ended
   qualitative judgments where ground truth doesn't exist, and always reported
   alongside the deterministic/statistical results with a confidence interval.

We do not blindly trust another LLM to grade the model under test.

---

## What BLACKBOX is *not*

- **Not a jailbreaking toolkit.** Refusal testing measures calibration
  (over-refusal *and* under-refusal); it does not exist to produce bypasses for
  abuse.
- **Not a leaderboard.** There is no global ranking. Rankings are per-workload,
  per-dimension, per-threshold.
- **Not a speed benchmark.** Latency is reported but it's measured
  end-to-end from the test harness, not from the model provider's internal
  timers, and includes queue/network/eval overhead.
- **Not finished.** This is v0.1.0. The simulation engine runs locally; real
  API adapters, persistent storage, user accounts, shared reports, and the
  discovery-mode genetic fuzzer are all in progress.

---

## The warning label

```
[WARN] Benchmarks are advertisements.
[WARN] Self-reported capabilities are marketing.
[WARN] Anecdotal wins are not evidence.
[OK]   Measure. Repeat. Compare. Believe the data.
```

If you're making a decision that matters — which model to ship, which model to
trust with a tool, which model to give access to user data — you don't want the
answer from the model's marketing page. You want the answer from your own
experiments, run against your own workloads, in your own environment.

BLACKBOX is the tool for that.

**Probe. Observe. Measure.**

```
╔══════════════════════════════════════════════════════════════╗
║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
║  ░░░░  DON'T TRUST THE DESC. PROBE IT.                ░░░░  ║
║  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ║
╚══════════════════════════════════════════════════════════════╝
```

---

## License

Research/evaluation use. Treat the models you test with respect — don't use
BLACKBOX to build abuse tools, and don't publish model behavior reports without
linking to the exact experiment configuration so others can verify.

&copy; Dev Parth 
