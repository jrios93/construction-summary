# Responsive layout hardening

## Objective
Improve narrow-screen usability in the public and admin UI while preserving page structure, providers, data contracts, and existing interactions.

## Problem and why
Source inspection found public headings that prevent wrapping, admin milestone controls and attachment actions that may not wrap on narrow screens, and dense budget summaries. These are source-based risks; rendered behavior still needs viewport validation.

## Scope and constraints
- Make targeted presentational changes for headings, milestone editor rows, contract attachment actions, and budget summary spacing/typography.
- Keep existing translated text, component callbacks, provider placement, hooks, API contracts, and sidebar behavior unchanged.
- Avoid broad redesign, data-flow changes, dependency additions, and unrelated cleanup.
- Preserve untracked `.atl/`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`; use npm only.
- Treat visual responsiveness as unverified unless a browser/device check is actually run.

## Task checklist
- [x] RESP-1 — Make identified public/admin layouts adapt safely to narrow viewports.
  - Authorized scope: `components/ConstructionProgress.tsx`, `app/components/RegisterSpentSection.tsx`, `app/components/ProgressSection.tsx`, `app/components/NewSection.tsx`, `app/components/ContractSection.tsx`, `app/admin/components/AdminContractSection.tsx`, and `app/components/BudgetSection.tsx`.
  - Route: delegated direct. Trigger: seven non-trivial UI files and cross-component preparation.
  - Acceptance: long headings can wrap or size responsively; milestone controls and attachment actions fit narrow widths without horizontal overflow; budget labels/amounts remain legible at phone sizes; existing integrations, text, interactions, and desktop layouts remain intact.
  - Checks: `npm run lint`; `npm run build`; source inspection of targeted responsive classes. If browser automation is unavailable, do not claim visual device validation.

## Delivery and progress
- Forecast: under 200 authored changed lines.
- Delivery strategy: ask-on-risk.
- Progress: RESP-1 implemented on branch `fix/budget-request-duplication`; source changes are not yet committed. Preserved user-untracked `.atl/`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`; latest commit is `96f1672`.
- Verification evidence: structural readback completed for all seven authorized UI files; `npm run build` passed; `npm run lint` reported 4 errors and 50 warnings, with errors only in unchanged `app/components/Header.tsx`, `app/components/ImageGallery.tsx`, and `app/components/LazySection.tsx` (the latter two report one error each). Browser viewport verification was not performed, so rendered responsiveness remains unverified.
- Next step: parent completes structural review and creates a local work-unit commit. Before any push, obtain explicit remote destination and credential/session authorization; do not inspect remotes to guess.
