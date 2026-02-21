---
name: notepad-mvp-workflow
description: Build and iterate the MVP of the pink habits and chores tracker in this repository. Use for tasks involving Next.js App Router, React and TypeScript code in src, Tailwind UI implementation, localStorage persistence, and mobile-first layout.
---

# Notepad MVP Workflow

## Core Rules
- Read `AGENTS.md` and `TASKS.md` before implementation.
- Keep application code only in `src/` (`src/app`, `src/components`, `src/lib`, `src/types`).
- Keep architecture simple and extensible for MVP.
- Preserve strict TypeScript compatibility.
- Avoid extra dependencies unless explicitly requested.
- Do not add backend, auth, or database in MVP tasks.

## Delivery Flow
1. Implement small vertical slices: screen or feature + types + storage + basic validation.
2. Reuse shared storage helpers and persist data in `localStorage`.
3. Keep naming and structure consistent with the project conventions.
4. Validate changed scope with project scripts.

## Product and UI Constraints
- Follow the pastel pink and rose visual direction with stickers and friendly mood.
- Prefer large cards, breathable spacing, and intentional lightweight animations.
- Keep interfaces mobile-first and verify desktop behavior.
- Use weekly tables and matrices where the product rules require them.
- Keep the sleep month-circle tracker as a core visual pattern.

## Quality Gates
- No runtime errors in `npm run dev` for changed functionality.
- No TypeScript or ESLint issues in changed files.
- Correct read and write behavior for `localStorage` data.
- Responsive behavior on mobile and desktop for affected screens.

