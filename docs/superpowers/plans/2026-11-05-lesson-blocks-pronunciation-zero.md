# Lesson Blocks and Pronunciation Zero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace single-item Leçon 1 exercises with multi-line translation blocks and add a private-progress A0 pronunciation lesson based on original public-safe content.

**Architecture:** Keep the current dependency-free PWA and its single localStorage record. Add pure domain modules for block grading and pronunciation scheduling, keep stable Leçon 1 exercise IDs for migration, and let `src/app.js` coordinate the three panels: cards, Lesson 0, and Lesson 1. Dynamic lesson content must be built with DOM APIs and `textContent`, never `innerHTML`.

**Tech Stack:** HTML, CSS, browser ES modules, Web Speech API, localStorage, service worker, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-11-05-lesson-blocks-pronunciation-zero-design.md`

## Global Constraints

- Work only on `feature/lesson-blocks-pronunciation-zero`; never push directly to `main`.
- Preserve existing cards, card progress, Leçon 1 attempts, retry IDs, and Boost IDs.
- Do not commit the supplied PDF, page images, Drive URLs, private lesson identifiers, or secrets.
- All published pronunciation explanations and examples must be newly authored; use the PDF only as curriculum evidence.
- Enter may mark a line correct or incorrect but must not reveal its canonical answer or explanation.
- Only «Проверить всё» may reveal canonical answers and explanations for wrong lines.
- Use device `fr-FR` TTS for complete model words or phrases; do not claim isolated-phoneme accuracy.
- New progress remains local to the browser and the public URL never contains it.

## Review Focus

- Pressing Enter on a wrong line must not leak the answer in visible text or accessible hidden content; pin this in Task 1 and the static UI test in Task 4.
- Empty block rows at final check must remain wrong and enter the retry set, rather than being silently skipped; pin this in Task 1.
- A block containing Boost and retry items must be selected once without trapping the user on the same block forever; pin this in Task 1.
- Old localStorage with no pronunciation state or preferences must retain all valid cards and exercise attempts; pin this in Task 3.
- TTS buttons must speak only authored public model text and work without a backend URL; pin content shape in Task 2 and verify live in Task 5.

---

### Task 1: Leçon 1 block domain

**Files:**
- Modify: `src/exercises.js`
- Modify: `src/exercise-core.js`
- Modify: `test/exercise-core.test.mjs`

**Interfaces:**
- Consumes: existing `LESSON_ONE_EXERCISES`, `checkExerciseAnswer`, `recordExerciseAttempt`, and Boost state.
- Produces: `LESSON_ONE_BLOCKS`, `gradeExerciseLine(exercise, input, reveal)`, `gradeExerciseBlock(block, exerciseMap, answers, reveal)`, and `selectNextExerciseBlockId(blocks, progress, currentBlockId)`.

- [ ] **Step 1: Write failing tests for the three approved 5/6/5 blocks**

Assert block IDs are unique, every existing exercise ID occurs exactly once, block sizes are `[5, 6, 5]`, and the original 16 stable exercise IDs are unchanged.

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `node --test test/exercise-core.test.mjs`

Expected: FAIL because `LESSON_ONE_BLOCKS` does not exist.

- [ ] **Step 3: Add `LESSON_ONE_BLOCKS` to `src/exercises.js`**

Use these blocks:

- `introductions`: `appel-je`, `appel-tu`, `appel-question`, `appel-il`, `etre-je`.
- `pronouns-and-etre`: `pronoun-nous`, `pronoun-elles`, `pronoun-vous`, `etre-nous`, `etre-vous`, `etre-ils`.
- `describing-people`: `etre-elle`, `adj-gentille`, `adj-francaise`, `adj-plural`, `adj-assemble`.

- [ ] **Step 4: Write failing tests for concealed line grading and final block grading**

Assert:

```js
gradeExerciseLine(exercise, "wrong", false)
// => { isAnswered: true, isCorrect: false, canonicalAnswer: null, explanation: null }

gradeExerciseLine(exercise, "wrong", true)
// exposes canonicalAnswer and explanation
```

Also assert final block grading marks empty rows incorrect, reports only incorrect IDs in `retryIds`, and never changes accepted-alternative behavior.

- [ ] **Step 5: Run the targeted test and verify RED**

Run: `node --test test/exercise-core.test.mjs`

Expected: FAIL because the block grading functions do not exist.

- [ ] **Step 6: Implement minimal block grading in `src/exercise-core.js`**

`gradeExerciseBlock` returns `{ rows, correctIds, retryIds, isComplete }`; each row has `id`, `isAnswered`, `isCorrect`, `canonicalAnswer`, and `explanation`.

- [ ] **Step 7: Write failing priority tests for block selection**

Assert Boost-containing block precedes retry-containing block, retry precedes lesson order, current block is avoided when another eligible block exists, and a single eligible block remains selectable.

- [ ] **Step 8: Implement `selectNextExerciseBlockId` and run the full suite**

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 9: Commit the domain unit**

```bash
git add src/exercises.js src/exercise-core.js test/exercise-core.test.mjs
git commit -m "feat: group lesson one exercises into blocks"
```

### Task 2: Original Lesson 0 curriculum and scheduling

**Files:**
- Create: `src/pronunciation.js`
- Create: `src/pronunciation-core.js`
- Create: `test/pronunciation-core.test.mjs`

**Interfaces:**
- Consumes: no browser APIs; all functions are pure.
- Produces: `PRONUNCIATION_MODULES`, `PRONUNCIATION_ITEMS`, `createEmptyPronunciationProgress()`, `ratePronunciation(progress, itemId, rating, now)`, `togglePronunciationBoost(progress, itemId)`, and `selectNextPronunciationItemId(items, progress, currentId)`.

- [ ] **Step 1: Write failing curriculum-shape tests**

Assert there are exactly 10 ordered modules matching the spec, every module has at least two sound items and one `bilan`, every ID is unique, and every sound item has `pattern`, `explanation`, `modelWord`, `audioText`, and 3–6 original practice words.

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `node --test test/pronunciation-core.test.mjs`

Expected: FAIL because the pronunciation modules do not exist.

- [ ] **Step 3: Author `src/pronunciation.js`**

Create original concise Russian explanations and French examples for the ten approved modules. `audioText` must be a complete French word, word sequence, or short phrase suitable for device TTS. Do not reproduce full PDF word lists or handwritten page text.

- [ ] **Step 4: Write failing scheduling tests**

Assert `repeat` schedules sooner than `known`, Boost survives ratings until toggled off, selection prioritizes Boost then due/repeat items then normal order, and immediate repetition is avoided when another item exists.

- [ ] **Step 5: Run the targeted test and verify RED**

Run: `node --test test/pronunciation-core.test.mjs`

Expected: FAIL because progress and scheduling functions do not exist.

- [ ] **Step 6: Implement `src/pronunciation-core.js` and run the full suite**

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 7: Commit the Lesson 0 domain unit**

```bash
git add src/pronunciation.js src/pronunciation-core.js test/pronunciation-core.test.mjs
git commit -m "feat: add lesson zero pronunciation curriculum"
```

### Task 3: Backward-compatible private state

**Files:**
- Modify: `src/core.js`
- Modify: `test/core.test.mjs`

**Interfaces:**
- Consumes: pronunciation IDs and `createEmptyPronunciationProgress()` from Task 2.
- Produces: `loadPrivateState()` and `savePrivateState()` with `pronunciationProgress` and `preferences.activeMode` while preserving the existing storage key.

- [ ] **Step 1: Write failing migration tests**

An old valid value containing only `cards`, `progress`, and `exerciseProgress` must load with:

```js
pronunciationProgress: { ratings: {}, boostedIds: [] },
preferences: { activeMode: "cards" }
```

It must retain all prior valid values unchanged.

- [ ] **Step 2: Write failing sanitation tests**

Unknown pronunciation IDs, malformed ratings, invalid Boost IDs, and an unsupported active mode must be removed or reset without resetting cards or Leçon 1 progress.

- [ ] **Step 3: Run the targeted test and verify RED**

Run: `node --test test/core.test.mjs`

Expected: FAIL because the new state fields are missing.

- [ ] **Step 4: Implement migration and sanitation in `src/core.js`**

Allowed active modes are `cards`, `pronunciation`, and `exercises`. Keep `PRIVATE_STORAGE_KEY` unchanged.

- [ ] **Step 5: Run the full suite**

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 6: Commit the storage unit**

```bash
git add src/core.js test/core.test.mjs
git commit -m "feat: persist lesson zero progress"
```

### Task 4: Three-mode mobile interface

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `src/app.js`
- Modify: `test/pwa.test.mjs`

**Interfaces:**
- Consumes: block APIs from Task 1, pronunciation APIs and data from Task 2, migrated state from Task 3, and existing `speakFrench(text)`.
- Produces: accessible `cards`, `pronunciation`, and `exercises` panels with one shared local-state save path.

- [ ] **Step 1: Write failing static UI tests**

Assert HTML exposes three tabs and three labelled panels; Leçon 1 contains a block list container, «Проверить всё», retry-only action, and per-row feedback region; Lesson 0 contains pattern, model word, TTS, practice words, Bilan, rating, and Boost controls. Assert no canonical answers are hard-coded into the Leçon 1 HTML.

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `node --test test/pwa.test.mjs`

Expected: FAIL because the new panels and controls do not exist.

- [ ] **Step 3: Replace the two-mode shell in `index.html`**

Add the three approved labels: «Карточки», «Урок 0 · Звуки», and «Урок 1 · Перевод». Keep all asset URLs relative.

- [ ] **Step 4: Implement Leçon 1 block rendering and interaction in `src/app.js`**

Build rows with `document.createElement()` and `textContent`. Enter grades only that row with `reveal=false` and focuses the next row. «Проверить всё» grades with `reveal=true`, persists all rows, reveals corrections only for errors, and enables retry-only rendering. Per-row Boost uses the stable exercise ID.

- [ ] **Step 5: Implement Lesson 0 rendering and interaction in `src/app.js`**

Render module title, pattern, explanation, model word, practice list, Bilan text, TTS button, `repeat`/`known` actions, and item Boost. Pass only `audioText` to `speakFrench`.

- [ ] **Step 6: Implement three-tab keyboard behavior and active-mode persistence**

Click, ArrowLeft, ArrowRight, Home, and End must update `aria-selected`, roving `tabindex`, visible panel, focus, and `preferences.activeMode`.

- [ ] **Step 7: Add responsive block and pronunciation styles in `styles.css`**

At iPhone width, every row remains single-column, inputs are at least 44 px high, corrections wrap without horizontal scrolling, and the three-mode selector remains usable.

- [ ] **Step 8: Run tests and syntax checks**

Run:

```bash
npm test
node --check src/app.js
node --check src/core.js
node --check src/exercise-core.js
node --check src/exercises.js
node --check src/pronunciation-core.js
node --check src/pronunciation.js
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 9: Commit the interface unit**

```bash
git add index.html styles.css src/app.js test/pwa.test.mjs
git commit -m "feat: add lesson blocks and pronunciation interface"
```

### Task 5: Offline shell, documentation, review, and publication

**Files:**
- Modify: `sw.js`
- Modify: `README.md`
- Modify: `test/pwa.test.mjs`

**Interfaces:**
- Consumes: final deployable module list from Tasks 1–4.
- Produces: GitHub Pages-ready cache `french-solovey-v3`, updated public documentation, PR, and verified live deployment.

- [ ] **Step 1: Write failing PWA and privacy tests**

Assert the service worker caches `pronunciation.js` and `pronunciation-core.js`, cache name is `french-solovey-v3`, README explains both lessons and local privacy, and deployable source contains no Drive file ID, PDF title, signed URL, API key, or private lesson name.

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `node --test test/pwa.test.mjs`

Expected: FAIL because cache and documentation are still v2.

- [ ] **Step 3: Update `sw.js` and `README.md`**

Cache every public module and document the Enter/final-check behavior, retry-only flow, Lesson 0 device TTS, Boost, local progress, iPhone installation, and TTS limitations.

- [ ] **Step 4: Run fresh full verification**

Run the complete command set from Task 4 and require zero failures.

- [ ] **Step 5: Commit the release unit**

```bash
git add sw.js README.md test/pwa.test.mjs
git commit -m "docs: publish lesson zero and block exercise guidance"
```

- [ ] **Step 6: Request independent whole-branch review**

Review against the approved spec, storage migration, French accuracy, accessibility, public-data boundary, and GitHub Pages behavior. Fix every Critical or Important finding through a new failing test before continuing.

- [ ] **Step 7: Push the feature branch and open a pull request**

Use a PR; never update `main` directly. Include test evidence and the explicit statement that the PDF is not in the public repository.

- [ ] **Step 8: Merge only the reviewed head SHA and wait for GitHub Pages**

Use the exact reviewed commit SHA as the merge lease.

- [ ] **Step 9: Perform the live smoke test**

On the published URL verify:

1. Three-mode navigation and reload restoration.
2. Wrong Enter status without an answer reveal.
3. Final check reveals corrections.
4. Retry view contains only errors.
5. Per-row Boost persists and can be disabled.
6. Lesson 0 model word speaks with device TTS.
7. Pronunciation rating and Boost persist after reload.
8. Manifest and service worker load on the GitHub Pages subpath.

- [ ] **Step 10: Report the exact live URL, PR, evidence, and limits**

State that physical-iPhone voice quality and installation still require Ruslan's device check.
