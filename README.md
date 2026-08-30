# ShikkhaCheck

Solution for **LofiStack Hackathon 2026 — P08: School Result Processing and GPA Engine**

## Project information

- **Team:** Automagic
- **Team ID:** LSH26-T005
- **Problem:** P08 — School Result Processing and GPA Engine
- **Repository:** <https://github.com/abmprottoy/lsh26-t005-p08>
- **Live application:** <https://lsh26-t005-p08.abmlabs.workers.dev>
- **Demo video:** Not supplied

> Judges evaluate only the exact 40-character commit SHA entered in the Final Submission Form.

## Solution summary

ShikkhaCheck is a result-verification workbench for a secondary-school office. It accepts the published P08 JSON shape, validates every row, calculates subject grade points and final GPA deterministically, and exposes the exact rule and numbers behind every decision. It also produces the three clarified pre-publication checking lists, visual class analytics, PDF/Excel/JSON exports, cloud snapshots, and a multilingual assistant grounded in the verified result set.

The frontend and Hono API deploy together as one Cloudflare Worker. The core grading engine is pure TypeScript and does not depend on React, Hono, D1 or Cloudflare, so hidden judge fixtures can be evaluated consistently and independently.

## Requirements

| Requirement | Status | Where to verify |
|---|---|---|
| R1 — 60+ students, two classes, six compulsory plus one optional subject, practical components and hard cases | Complete | The app loads all 25 published cases from public/P08_school_results_public.json; choose PUB-01 to process 80 students across Class 9 and Class 10. Upload accepts the same JSON shape. |
| R2 — Subject GP, final GPA and letter grade using the supplied rules | Complete | Results tab and src/domain/evaluate-*.ts; automated boundary and fixture coverage is in src/domain/__tests__/engine.test.ts. |
| R3 — Per-student calculation trace using actual numbers and failure cause | Complete | Results → **Inspect**. PUB-01 / S004 shows uncancelled GPA 4.67, Mathematics 32 → GP 0, and final override 0.00 / F. |
| R4 — Optional, practical-fail and absent checking lists | Complete | **Checking lists** tab. Lists are independent and a student can appear in more than one. |

## How to test the application

1. Open the application. It validates and processes PUB-01 automatically.
2. Confirm the summary shows 80 students across Class 9 and Class 10.
3. In **Results**, inspect S004 — Imran Sultana. Confirm Mathematics 32 produces GP 0, the uncancelled GPA remains 4.67, and the compulsory-failure override produces final GPA 0.00 / F.
4. Inspect a practical boundary case such as S010 and confirm theory and practical decisions are shown separately.
5. Open **Checking lists**. For PUB-01, the lists contain 25 optional checks, 10 practical-component failures and 2 absences, covering 27 unique students.
6. Open **Analytics** to see grade distribution, class pass rates and failure counts by subject.
7. Choose another result set, select **Verify results**, and confirm the result count changes.
8. After applying the D1 migration, choose **Save results to cloud**, then open **Cloud saves** and reload the source/result snapshot.

### Test or sample data

- The authoritative fixture is bundled at public/P08_school_results_public.json.
- **Restore built-in sample** restores all 25 published cases and processes PUB-01.
- **Import result file** accepts either the full fixture wrapper with a cases array or one individual P08 case.
- Invalid rows are rejected with field paths such as students / 13 / marks / PHY.
- A practical subject requires separate theory 0..75 and practical 0..25 values; a non-practical subject requires one integer from 0 to 100; absence is the literal string AB.

## Run locally

### Requirements

- Node.js 20.19+ (Node.js 22 or 24 also works)
- npm
- A Google AI Studio API key is optional for the ShikkhaCheck AI workspace

### Setup

    git clone https://github.com/abmprottoy/lsh26-t005-p08.git
    cd lsh26-t005-p08
    npm ci
    npm run db:migrate:local
    # Optional AI: copy .env.example to .env.local and add GEMINI_API_KEY
    npm run dev

Open the URL printed by Vite (normally <http://localhost:5173>).

### Verification

    npm run lint
    npm test
    npm run typecheck
    npm run build

The domain test suite covers 32 cases, including every grade boundary, theory 24/25, practical 7/8, compulsory and optional absence, optional GP 0/2/3/5, multiple component failures, overlapping checking lists, the 5.00 cap, schema rejection and all 25 published fixtures. The complete suite currently contains 45 automated tests.

## Bonus features

| Published bonus | Status | Where to verify |
|---|---|---|
| Paste or upload a marks sheet and explain rejected rows | Complete | **Import result file** accepts the published wrapper or one case; invalid fields are reported with precise paths and reasons. |
| Class summary with pass rate, grade distribution and highest-failure subject | Complete | **Analytics** provides visual class comparison, grade distribution, subject pressure and review composition. |
| Printable individual marksheet | Not implemented | The export workspace produces full result-set PDF, Excel and JSON files, but not a one-student marksheet. |

Additional stretch features include accessible shadcn-style controls, dark mode, a guided walkthrough, browser-local AI chat history, multilingual result questions, pagination, cloud result snapshots, and PDF/Excel/JSON export.

### Deploy to Cloudflare

    npx wrangler login
    npm run build
    npx wrangler deploy --secrets-file .env.local
    npm run db:migrate:remote

Wrangler deploys the React static assets and Hono API as one Worker and automatically provisions the D1 binding. The migration command then prepares the remote database. Deployment requires the operator to be authenticated with Cloudflare; `.env.local` is ignored by Git and no credential belongs in this repository.

For an existing Worker, the Google API key can instead be updated interactively as an encrypted Worker secret:

    npx wrangler secret put GEMINI_API_KEY

The configured model is `gemma-4-31b-it`. The browser never receives the API key; AI requests stream through the Worker.

## Problem-solving approach

We translated the problem statement and published P08 clarifications into executable acceptance tests before building the interface. The most important architectural decision was a functional core: src/domain accepts plain fixture objects and returns complete result, trace, checking-list and analytics objects without importing runtime or UI code.

Zod validates the fixture boundary and preserves absence as a distinct state instead of converting AB to numeric zero. The Hono layer exposes a small /api/evaluate API and optional D1 run persistence. React renders the engine output directly, so the frontend does not contain a second, potentially divergent grading implementation.

The result was verified with automated tests, TypeScript, ESLint, a production build, local D1 migration, direct Worker requests, and browser checks at desktop and 390-pixel mobile widths.

## Technology used

- **Frontend:** React 19, Vite 8, Tailwind CSS 4, shadcn-style Radix UI primitives
- **Backend:** Hono on Cloudflare Workers
- **Validation:** Zod
- **Database:** Cloudflare D1 for immutable evaluation-run snapshots
- **Testing:** Vitest
- **Deployment:** One Cloudflare Worker with Static Assets via the Cloudflare Vite plugin
- **Icons:** Lucide React

See [LICENSES.md](LICENSES.md) for third-party material and AI disclosure.

## Team contributions

| Registered member | GitHub username | Major contribution | Evidence |
|---|---|---|---|
| Ammar Bin Mahmud | abmprottoy | Team lead; problem analysis, implementation direction, integration and verification | EVENT.md, application source, Git history |
| Md. Tahsin Hasib | tahsinhasib | Led the team's P02 solution, including the pharmacy workflow, dashboard and Cloudflare deployment | [P02 repository](https://github.com/abmprottoy/lsh26-t005-p02) |

Commit count alone does not represent contribution.

## AI usage

OpenAI Codex assisted with specification extraction, implementation, tests, UI construction, documentation and verification. Its output was checked against the supplied P08 problem and clarifications, 32 automated domain tests, all 25 published fixture cases, ESLint, TypeScript, a production build, local Worker/D1 execution and browser interaction.

## Major design decisions

- **Functional core, imperative shell:** grading logic stays independent of React, Hono, HTTP, D1 and Cloudflare.
- **Explanations are engine output:** every subject result includes actual inputs, component checks, grade band and an explanation; React only renders that trace.
- **Absence is not zero:** AB remains a distinct input and display state while still producing the clarified GP/overall behavior.
- **Published clarifications control R4:** optional GP ≤ 2, practical component < 8, and any absence are separate, overlapping lists.
- **One deploy:** React static assets and the Hono API share one Worker and one URL.
- **Lightweight persistence:** D1 stores original source and evaluated result JSON together for reproducible audits; it is not a school CRUD database.

## Known limitations

- The printable individual marksheet bonus is not implemented.
- Uploaded rows are validated and reported, but there is no in-app mark editor; users correct the JSON and upload again.

## Repository records

- [EVENT.md](EVENT.md) — event start code and pre-event-material declaration
- [evaluation-manifest.json](evaluation-manifest.json) — structured judging evidence
- [LICENSES.md](LICENSES.md) — frameworks, libraries, tooling and AI disclosure
