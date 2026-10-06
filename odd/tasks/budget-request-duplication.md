# Budget request latency and deduplication

## Objective
Remove the failing external exchange-rate dependency and duplicate `/api/budget` work on the public home page while keeping the admin budget editor behavior intact.

## Problem and why
The budget GET awaits Frankfurter even when a stored manual rate will be used. Local logs show Frankfurter failing after 43–66 seconds, while expenses still calculate. The home page mounts multiple independent `useBudget` consumers, each of which fetches the same endpoint. Browser observations showed three budget requests taking 3.97–5.33 seconds while other endpoints took 225–524 ms.

## Scope and constraints
- Remove the Frankfurter request and its process-local cache entirely; use the stored positive manual rate, falling back to the existing `3.70` value.
- Share one budget fetch/realtime subscription among the public home page consumers without changing the admin's isolated usage.
- Preserve the existing API response shape and budget calculations.
- Use npm as the project package manager, matching the committed `package-lock.json`.
- Do not change auth, receipt storage, expense aggregation, database schema, or unrelated APIs.
- Preserve the pre-existing untracked `.atl/` directory.

## Task checklist
- [x] BUDGET-1 — Avoid unnecessary exchange-rate wait and deduplicate home-page budget loading.
  - Authorized scope: `app/api/budget/route.ts`, `app/page.tsx`, `app/components/BudgetSection.tsx`, `app/components/ExchangeRateDisplay.tsx`, `app/components/RegisterSpentSection.tsx`, `app/admin/components/AdminBudgetSection.tsx`, `lib/hooks/useBudget.ts`, and `components/providers/BudgetProvider.tsx` if a shared provider is warranted.
  - Route: delegated direct. Trigger: multiple non-trivial files and reading/preparation needed before implementation.
  - Acceptance: `/api/budget` makes no external exchange-rate request; it uses a stored positive manual rate or `3.70`; response keys remain unchanged and `exchange_rate_source` accurately reports `manual` or `default`; public home page issues one initial budget fetch and shares realtime updates; admin continues to use its existing hook and accurately labels the fallback.
  - Checks: `npm run lint`; `npm run build`; inspect for an existing focused regression test runner. `package.json` has no test script or test dependency; if none exists, document this test-first exception rather than adding a framework for this bounded fix.

## Delivery and progress
- Forecast: under 200 authored changed lines.
- Delivery strategy: ask-on-risk.
- Progress: Implemented BUDGET-1. `/api/budget` no longer calls Frankfurter or keeps a process-local rate cache; a finite positive stored rate is reported as `manual`, otherwise the response uses `3.70` and reports `default`. Added a page-scoped budget provider shared by the three public consumers and an isolated provider for the admin editor, preserving budget/expense realtime refreshes and update methods. Admin text now describes the manual/default rate.
- Verification evidence: The required Route Handler docs were read at `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`. `package.json` has no test script/dependency and repository discovery found no existing test files, so behavior-level RED/GREEN testing was not applicable without introducing a test framework. `npm run lint` completed with four pre-existing errors in `app/components/Header.tsx`, `app/components/ImageGallery.tsx`, and `app/components/LazySection.tsx`; the initial run also exposed a TypeScript-file JSX parse error in the new hook, which was corrected before the successful rerun. `npm run build` passed, including TypeScript and static page generation. No source changes were made after these checks; only this task evidence/checklist was updated.
- Next step: Parent-owned review and delivery lifecycle; do not include the unrelated untracked `.atl/`, `pnpm-lock.yaml`, or `pnpm-workspace.yaml` files.
