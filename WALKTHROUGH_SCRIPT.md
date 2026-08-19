# BLACKBOX — Walkthrough Narration Script

This is the script for the auto-playing walkthrough at `/walkthrough`.

## Scene 1 — Intro (~8s)
> This is BLACKBOX — an AI behavior analysis and reliability laboratory.
> The idea is simple. You don't trust the model's description of itself.
> You treat the AI as an unknown system, put it inside a black box, give it
> the same inputs repeatedly, push its limits, and experimentally discover
> how it actually behaves.

## Scene 2 — Target Model (~8s)
> When you open BLACKBOX you're presented with the lab console. On the left
> you pick a target model — GPT-4o, Claude, Gemini, Llama, Mistral — and
> configure the run: temperature, how many times to repeat each test, and
> which test batteries to enable. Tool-use sandbox. Failure injection.
> Discovery mode.

## Scene 3 — Running Experiment (~8s)
> Hit Start Analysis. BLACKBOX queues up thousands of controlled experiments
> and begins running them across multiple worker processes. The live ticker
> on the right streams every test result in real time: test ID, latency,
> pass or fail, anomalies. The progress bar fills as each battery completes.

## Scene 4 — Batteries (1/2) (~9s)
> BLACKBOX runs eleven categories of test. Consistency — same question
> re-run, measuring semantic stability. Prompt sensitivity — polite, terse,
> formatted, ordered differently. Hallucination — five hundred questions
> with known ground truth, measuring correctness versus unsupported claims.
> Contradiction detection — linking responses that disagree with each other.

## Scene 5 — Batteries (2/2) (~13s)
> Memory behavior — retention, contamination and conflict across turns.
> Context sensitivity — accuracy and latency across one to a hundred and
> twenty-eight thousand tokens. Instruction following — schema, format and
> directive adherence. Robustness — typos, casing, whitespace, distractors.
> Refusal calibration — over-refusal and under-refusal. Tool-use in a
> sandbox. And failure injection — timeouts, malformed responses, rate
> limits — to see how the model recovers.

## Scene 6 — Behavioral Fingerprint (~12s)
> When the run finishes, BLACKBOX produces the behavioral fingerprint —
> eight dimensions scored from zero to one hundred: reliability, consistency,
> instruction following, robustness, factuality, tool selection, failure
> recovery, and refusal calibration. You get both meter bars and this
> classic ASCII summary. The composite score is a convenience — BLACKBOX
> always keeps the individual dimensions visible so you can see where each
> model actually excels and where it fails.

## Scene 7 — Behavioral Map (~11s)
> The signature visualization is the behavioral map. Every dot is one
> experiment plotted on two axes — robustness against reliability — with
> point size showing latency. Clusters form by test category. The green
> cloud is nominal behavior. The red cluster, over on the left, is
> adversarial probes — that's where the model starts to break. The orange
> cloud is long context. Blue is tool use. Purple is injected failures.

## Scene 8 — Curves & Breakdowns (~11s)
> The context curve shows how accuracy and consistency degrade as context
> grows from 1K to 128K tokens, alongside the latency cliff. Factuality
> breaks down correct, incorrect, and unsupported answers against ground
> truth. The refusal chart shows appropriate refusals versus over-refusal
> on benign prompts and under-refusal on unsafe ones. Tool-use charts show
> wrong tool picks, invalid arguments and unnecessary calls.

## Scene 9 — Automated Findings (~9s)
> Automated findings flag critical issues, warnings, and observations.
> For example: brittle failure recovery when timeouts are injected — the
> model gave up instead of retrying on 35 of 100 injected failures. Or
> notable response drift under paraphrase. Or memory contamination —
> incorrect facts planted in early turns were adopted as true later.

## Scene 10 — Model Comparison (~10s)
> This is where BLACKBOX becomes genuinely useful: model comparison. Drop
> two models into the same test suite. GPT-4o versus Claude Sonnet. Claude
> Opus versus Llama. You get a side-by-side bar chart across every
> dimension, plus latency. You're not saying "Model A is better." You're
> saying "Model A is better for this particular workload." That's a much
> more honest answer.

---

### Additional clips (not yet generated due to clip-per-turn limit):

#### Scene 11 — Experiment Builder (~10s)
> The experiment builder lets you construct tests visually. Lay out a
> pipeline: input, prompt variations, model, evaluator, statistical
> analysis, and report. Type a base prompt, pick how many variations to
> generate — polite, terse, typos, uppercase, with distractors — and
> choose which dimensions to measure. Click execute matrix and BLACKBOX
> runs the full Cartesian product automatically.

#### Scene 12 — Discovery Mode (~12s)
> Discovery mode is the most interesting feature. Instead of running
> predefined tests, BLACKBOX searches the input space on its own. It
> generates inputs, runs the model, measures behavior, and decides whether
> it saw something interesting. It hunts for sudden confidence changes,
> contradictions, unexpected formatting, unusual refusals, performance
> cliffs and inconsistent tool selection. Then it reports what it found —
> for instance, that an answer flipped when the prompt prefix changed from
> "Please" to "You must."

#### Scene 13 — Reproducibility (~10s)
> Every experiment is reproducible. The experiment log records the model,
> the exact prompt, the variation used, the configuration, evaluator,
> timestamp, score and result. You get a reproducibility manifest with the
> run seed, and a ready-to-copy command line to rerun the exact experiment.
> This turns BLACKBOX into a research laboratory, not just a testing UI.

#### Scene 14 — Outro (~10s)
> At the end you don't get a single score. You get a portrait of a model's
> behavior — where it's reliable, where it breaks, under what conditions it
> contradicts itself, how it recovers from failure, and how it compares to
> its peers. Don't trust the model's description of itself. Probe it.
> BLACKBOX, AI Behavior Analysis and Reliability Laboratory.

---

Total estimated runtime with all 14 clips: ~2 minutes.
Current walkthrough (10 clips): ~45–55 seconds.
