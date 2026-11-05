# Exercices & Boost — design

## Intent

Extend the existing «Французский Соловья» PWA with written French exercises for Campus A1 Leçon 1. Learners type the answer, receive exact feedback, can correct it, and see a short explanation. Difficult items return until answered correctly. Boost pins a specific target to the priority queue until the learner turns Boost off.

## Goals

- Keep the existing flash-card flow and add an Exercises mode inside the same PWA.
- Cover pronouns, `être`, `s’appeler`, and basic adjective agreement with original examples.
- Accept explicitly authored correct alternatives while preserving important French accents and grammar.
- On an incorrect answer, keep the input editable, show the expected answer and explanation, and enqueue the item for repetition.
- Persist exercise attempts, retry queue, and Boost selections in local browser storage.
- Select Boost items first, then incorrect items, then normal lesson order, without trapping the learner on one item forever.

## Non-goals

- No AI grading, free-form semantic scoring, accounts, cloud sync, or API calls.
- No publication of the source Campus PDF, personal notes, or private lesson scans.
- No fuzzy acceptance of grammar errors; only authored alternatives are correct.

## Data model

Each public exercise has an ID, topic, Russian instruction, prompt, accepted French answers, canonical answer, and explanation. Local state extends the existing storage object with:

- `exerciseProgress.attempts[id]`: count, correct flag, last answer, and timestamp.
- `exerciseProgress.retryQueue`: IDs answered incorrectly and not yet corrected.
- `exerciseProgress.boostedIds`: IDs explicitly pinned by the learner.

Older local data loads with empty exercise defaults. Invalid exercise state is discarded without losing valid cards or flash-card progress.

## Selection rule

Pick the least recently attempted Boost item, excluding the just-completed item when another candidate exists. Then pick the oldest retry item. Then move through normal lesson order. A correct retry leaves the retry queue; Boost remains until manually toggled off.

## Success criteria

Pure tests prove answer normalization, alternative acceptance, retry behavior, Boost persistence, and selection priority. Static PWA tests prove the mode switch and accessible controls. The published HTTPS version is manually smoke-tested for wrong answer → explanation → correction → repeat, Boost on/off, reload persistence, and service-worker update.
