# Exercices & Boost Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent written exercises and a user-controlled Boost priority queue to the existing PWA.

**Architecture:** Keep public lesson content in a focused ES module and pure grading/queue logic in another module. Extend the existing local storage schema compatibly, then bind the new domain functions to a second UI mode in `index.html` and `src/app.js`.

**Tech Stack:** Existing dependency-free HTML/CSS/ES modules, Web Storage, Service Worker, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-05-exercises-boost-design.md`

## Global Constraints

- Continue `Solovey-RS/mon-francais`; do not create another repository or app.
- Use original exercise examples only; do not publish the Campus PDF or private notes.
- No secrets, APIs, accounts, or cloud storage.
- Boost remains active until the learner explicitly disables it.
- Work through `feature/exercises-boost`, PR, review, merge, and Pages verification.

## Review Focus

- Apostrophe, whitespace, case, and optional terminal punctuation normalize safely; accents remain significant.
- Authored alternatives are accepted but grammar mistakes are not.
- Corrupt or older local storage migrates without losing existing flash-card progress.
- A single Boost item does not permanently block all normal/retry exercises.
- Service-worker cache version updates so returning users receive the new modules.

---

### Task 1: Exercise domain and Leçon 1 content

**Files:** Create `src/exercises.js`, `src/exercise-core.js`, `test/exercise-core.test.mjs`; modify `src/core.js`, `test/core.test.mjs`.

**Interfaces:** Produce `LESSON_ONE_EXERCISES`, `checkExerciseAnswer`, `recordExerciseAttempt`, `toggleExerciseBoost`, and `selectNextExerciseId`; extend private state with `exerciseProgress`.

- [ ] Write failing tests for normalization, alternatives, explanations, retry queue, correct retry removal, Boost persistence, selection priority, and old-storage migration.
- [ ] Run `npm test` and confirm expected failures.
- [ ] Implement the smallest pure domain and lesson modules.
- [ ] Run the full suite and commit `feat: add exercise and boost domain`.

### Task 2: Exercises interface

**Files:** Modify `index.html`, `styles.css`, `src/app.js`, `test/pwa.test.mjs`.

**Interfaces:** Consume Task 1 modules; provide mode switch, input, feedback, correction, next action, Boost toggle, and progress counters.

- [ ] Write failing static contracts for the mode switch, French input, feedback region, and Boost button.
- [ ] Implement accessible responsive UI using `textContent` for dynamic lesson data.
- [ ] Run syntax checks and full tests; commit `feat: add Exercices and Boost interface`.

### Task 3: Offline update, review, and deployment

**Files:** Modify `sw.js`, `README.md`, `test/pwa.test.mjs`.

**Interfaces:** Cache new public modules with a bumped cache key and document behavior.

- [ ] Write a failing cache contract test, update the service worker, and document the feature.
- [ ] Run full verification and commit `docs: document exercises and boost`.
- [ ] Push the feature branch, open a PR, run an independent read-only review, fix Important findings with tests, merge, and verify GitHub Pages end to end.

## Self-review

The plan covers all approved behaviors without adding a backend. The selection rule makes Boost meaningfully persistent while still allowing variety. The only intentionally deferred capability is cross-device sync.
