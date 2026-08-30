# Third-Party Material and AI Disclosure

Material frameworks, libraries, tooling and assets used in this repository are listed below. Versions are the installed direct-dependency versions recorded by package-lock.json.

## Runtime and interface libraries

| Name | Version / source | Licence | Used for |
|---|---|---|---|
| React | 19.2.8 — <https://react.dev> | MIT | Client interface |
| React DOM | 19.2.8 | MIT | Browser rendering |
| Hono | 4.13.5 — <https://hono.dev> | MIT | Worker API routing |
| Zod | 4.5.4 — <https://zod.dev> | MIT | Fixture validation |
| AI SDK | 7.0.85 — <https://ai-sdk.dev> | Apache-2.0 | Streaming AI orchestration and UI message protocol |
| AI SDK Google provider | 4.0.58 | Apache-2.0 | Server-side Gemini API connection |
| AI SDK React | 4.0.88 | Apache-2.0 | Streaming chat state and transport |
| Streamdown | 2.6.0 — <https://streamdown.ai> | Apache-2.0 | Safe streaming Markdown responses |
| Radix UI Dialog | 1.1.23 | MIT | Accessible calculation-trace dialog |
| Radix UI Select | 2.3.7 | MIT | Accessible result and context selectors |
| Radix UI Tabs | 1.1.21 | MIT | Accessible workbench tabs |
| Radix UI Slot | 1.3.3 | MIT | Composable UI primitive |
| Radix UI Tooltip | 1.2.16 | MIT | Accessible collapsed-navigation labels |
| Tailwind CSS | 4.3.3 — <https://tailwindcss.com> | MIT | Interface styling |
| class-variance-authority | 0.7.1 | Apache-2.0 | UI component variants |
| clsx | 2.1.1 | MIT | Conditional class composition |
| tailwind-merge | 3.6.0 | MIT | Tailwind class conflict resolution |
| Lucide React | 1.37.0 — <https://lucide.dev> | ISC | Interface icons |
| Recharts | 3.10.1 — <https://recharts.org> | MIT | Accessible analytics visualizations |
| jsPDF | 4.2.1 — <https://github.com/parallax/jsPDF> | MIT | PDF report export |
| jsPDF AutoTable | 5.0.8 | MIT | Structured PDF result tables |
| write-excel-file | 4.1.1 — <https://gitlab.com/catamphetamine/write-excel-file> | MIT | Multi-sheet Excel export |

## Build, Cloudflare and test tooling

| Name | Version | Licence | Used for |
|---|---|---|---|
| Cloudflare Vite plugin | 1.54.2 | MIT | Single Worker + React Static Assets development and build |
| Wrangler | 4.127.1 | MIT OR Apache-2.0 | Worker, D1, migration and type-generation CLI |
| Vite | 8.2.2 | MIT | Client and Worker build |
| Vite React plugin | 6.1.1 | MIT | React transform and refresh |
| Tailwind Vite plugin | 4.3.3 | MIT | Tailwind build integration |
| TypeScript | 6.0.3 | Apache-2.0 | Static typing |
| Vitest | 4.1.11 | MIT | Domain tests |
| ESLint | 10.9.1 | MIT | Static analysis |
| typescript-eslint | 8.68.0 | MIT | TypeScript lint integration |
| eslint-plugin-react-hooks | 7.1.1 | MIT | React hook checks |
| eslint-plugin-react-refresh | 0.5.5 | MIT | React refresh checks |

Type declaration packages (@types/node, @types/react, @types/react-dom) and @eslint/js are MIT-licensed development dependencies.

## Data, fonts and assets

- The P08 sample fixture was supplied by the LofiStack Hackathon 2026 organizers and is included unchanged at public/P08_school_results_public.json.
- No external images, templates or web fonts are used.
- The interface uses system fonts only.
- The source layout was built during the event and did not start from a separate application template.

## AI tools

OpenAI Codex assisted with specification extraction, architecture, implementation, tests, interface construction, documentation and verification. The team verified the output against the supplied problem and clarifications, automated tests, all 25 fixture cases, lint, TypeScript, a production build, local Worker/D1 execution and browser checks.

## Original-work statement

Everything not declared in this file or EVENT.md was created by the registered team during the event window.
