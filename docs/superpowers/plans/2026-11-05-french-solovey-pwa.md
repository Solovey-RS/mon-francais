# French Solovey PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish an installable, privacy-preserving French flash-card PWA for Solavey RS.

**Architecture:** A dependency-free static site runs fully in Safari. Pure ES-module domain functions handle reveal state, scheduling, storage validation, and voice choice; UI code binds them to local-only persistence and PWA features.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Web Speech API, Service Worker, Web App Manifest, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-05-french-solovey-design.md`

## Global Constraints

- No secrets or personal lessons in source control.
- No client-side OpenAI API calls.
- The French answer, pronunciation, and ratings stay hidden until reveal.
- The public URL is shareable while each browser keeps separate local progress.
- GitHub work happens on `feature/pwa-launch`, not directly on `main`.

## Review Focus

- Corrupt local data resets safely without breaking the app.
- A device without a French voice still fails gracefully.
- GitHub Pages subpath assets resolve relatively.
- Offline cache updates without caching private local content.
- Imported or typed text is rendered as text, never executable HTML.

---

### Task 1: Domain behavior and privacy boundary

**Files:** Create `src/core.js`, `test/core.test.mjs`, `package.json`.

**Interfaces:** Produces `createSession`, `revealCard`, `rateCard`, `chooseFrenchVoice`, `loadPrivateState`, and `savePrivateState`.

- [ ] Write tests for hidden answers, rating intervals, voice choice, and invalid local data.
- [ ] Run `npm test` and verify failure because `src/core.js` is absent.
- [ ] Implement the minimal pure functions.
- [ ] Run `npm test` and verify all tests pass.
- [ ] Commit as `feat: add private flashcard domain`.

### Task 2: Branded PWA interface

**Files:** Create `index.html`, `styles.css`, `src/app.js`, `manifest.webmanifest`, `sw.js`, `icons/*`, `test/pwa.test.mjs`.

**Interfaces:** Consumes Task 1 functions; provides reveal, rating, speech, local card creation, install guidance, and offline shell.

- [ ] Write static contract tests for branding, hidden controls, relative asset URLs, manifest, and service worker.
- [ ] Run `npm test` and verify the new tests fail.
- [ ] Implement the responsive interface and offline shell.
- [ ] Run `npm test` and verify all tests pass.
- [ ] Commit as `feat: build French Solovey PWA`.

### Task 3: Secure optional TTS contract and deployment

**Files:** Create `docs/tts-backend-contract.md`, `README.md`; publish branch and configure GitHub Pages.

**Interfaces:** Defines `POST /tts` response behavior without shipping a secret; produces the public HTTPS URL.

- [ ] Document backend-only key handling, disclosure, auth, limits, and native fallback.
- [ ] Run the full test suite and a local HTTP smoke check.
- [ ] Commit documentation.
- [ ] Create/update the GitHub repository through an authorized external action, push the feature branch, open/merge through the permitted workflow, enable Pages, and verify the deployed URL.

## Self-review

The plan covers every requested v1 behavior. Photo import, accounts, and sync are intentionally deferred because they require a backend and change the privacy model. Tests cover the five review-focus risks through pure behavior or static contracts.
