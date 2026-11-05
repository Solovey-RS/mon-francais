# Французский Соловья

Installable French flash cards and guided lessons by **Solavey RS**.

## Lesson 0 — Sounds and reading

Lesson 0 contains ten short pronunciation modules: simple vowels, the `e` family, syllables, common letter combinations, nasal vowels, changing consonants, advanced combinations, and silent endings. Each card provides an original Russian explanation, a French model word, practice words, a module Bilan, local review scheduling, and Boost.

The free device voice speaks complete French model words and phrases. It is not treated as an authoritative recording of an isolated phoneme: voice quality and exact output depend on the voices installed in iOS.

## Lesson 1 — Translation blocks

Lesson 1 groups the A1 practice into three blocks covering pronouns, `être`, `s’appeler`, and adjective agreement. Press **Enter** to mark one line red or green without revealing the answer. Press **Check all** (`Проверить всё`) after completing the block to reveal corrections and explanations for wrong lines.

Incorrect answers enter the retry-only view until corrected. Explicitly authored alternatives are accepted; accents and grammar still matter. **Boost** pins a sound or sentence to the priority queue and stays active until you turn it off yourself.

Lesson attempts, pronunciation ratings, retry items, Boost selections, and the last active lesson use the same device-only `localStorage` boundary as personal cards and review progress.

## What is public

- The application shell, original lesson content, and a small generic demo deck.
- The source code required for GitHub Pages.

## What stays private

Personal cards and review progress are stored in the browser's `localStorage`. They are not committed to GitHub, included in the URL, or transferred when somebody shares the public link.

There is no account or cloud sync. Clearing Safari website data or moving to another device removes the local cards and progress.

## Install on iPhone

1. Open the GitHub Pages URL in Safari.
2. Tap **Share**.
3. Choose **Add to Home Screen**, then **Add**.

## Voice behavior

By default the app uses the free French device voice through the Web Speech API. It prefers a likely male `fr-FR` voice where available and otherwise uses another French voice.

The optional paid-quality route is defined in [`docs/tts-backend-contract.md`](docs/tts-backend-contract.md). An API key must never be added to this repository or browser code.

## Local verification

```text
npm test
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Deployment

GitHub Pages serves the `main` branch from the repository root. All asset paths are relative so the PWA works under `/mon-francais/`.
