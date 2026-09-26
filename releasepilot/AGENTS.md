# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project

Next.js 14 (App Router) + TypeScript + Prisma + Tailwind. Single package, no monorepo.
All commands must be run from `autonomous-software-engineer/releasepilot/`.

## Critical: PostCSS Config Must Be `.js` (not `.mjs`)

Next.js 14.1.0's internal `findConfigPath` only looks for `postcss.config.json`, `postcss.config.js`, and `postcss.config.cjs`. It **never** finds `postcss.config.mjs`. A `.mjs` file will be silently ignored, causing Tailwind directives to be emitted literally into the CSS bundle instead of being compiled — resulting in completely unstyled output. Always use `postcss.config.js` with `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }`.

## Build / Lint / Test Commands

```bash
npm run dev          # Next.js dev server
npm run build        # Production build (TS errors and ESLint errors fail the build)
npm run lint         # ESLint via next lint
npm test             # Runs tests/unit.test.ts AND tests/phase6.test.ts together
```

**To run a single test file** (there is no test framework with native single-test filtering — use ts-node directly):
```bash
npx ts-node --project tsconfig.test.json -r tsconfig-paths/register tests/unit.test.ts
npx ts-node --project tsconfig.test.json -r tsconfig-paths/register tests/phase6.test.ts
```

Tests use **Node.js built-in `assert`** only — no Jest/Vitest. Test files define their own inline `test()` and `describe()` helpers.
`tsconfig.test.json` is required (uses `commonjs` + `node` resolution; main `tsconfig.json` excludes the `tests/` dir).

## Path Aliases

`@/*` resolves to `src/*`. Use `@/lib/types` etc. in `src/` files. Test files use the same alias via `tsconfig-paths/register`.

## Data Persistence

**No real database is used at runtime.** All state is stored in `.releasepilot-db.json` in the project root via `src/lib/db/persistence.ts`. The Prisma schema exists for future use but is not connected. The `APPROVAL_STORE` in `src/lib/approvalStore.ts` is a module-level `Map` (in-memory only, not persisted).

When writing tests for persistence, call `_resetCacheForTests()` from `src/lib/db/persistence.ts` before each test to clear the in-memory cache.

## Design Tokens

Do **not** hardcode colors or spacing. Import from `src/styles/design-tokens.ts` for programmatic use; Tailwind classes for JSX. The tokens file is the single source of truth and mirrors `tailwind.config.ts`.

## Type Conventions

- All domain types live in `src/lib/types.ts`. Do not declare duplicate types elsewhere.
- `ApprovalStatus` is defined in **both** `src/lib/types.ts` and `src/lib/approvalStore.ts` — use the one from `src/lib/types.ts` for new code (the `approvalStore` copy is a legacy local duplicate).
- Status/severity enums are `string` union types (not TypeScript `enum`), matching the pattern throughout `src/lib/types.ts`.

## Sandbox / Security Constraint

`src/lib/sandbox/executor.ts` uses a strict command allowlist and must never use `shell: true`. Allowed command keys are: `run-tests`, `type-check`, `analyze-deps`. The sandbox only operates on `fixtures/ecommerce-platform/`.

## Workflow State Machine

Valid workflow state transitions are defined in `src/lib/workflow/stateMachine.ts`. Attempting an invalid transition returns `null` (not an exception). Terminal states are `COMPLETED`, `FAILED`, `CANCELLED`.

## Health Score Deductions

`src/lib/analysis/repositoryAnalyzer.ts` deducts from 100: CRITICAL −15, HIGH −8, MEDIUM −4, LOW −2. Score is clamped to 0.
