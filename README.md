# Французский Соловья

Installable French flash cards by **Solavey RS**.

## Exercices & Boost

The A1 Leçon 1 exercise mode covers pronouns, `être`, `s’appeler`, and adjective agreement. Learners type a French answer, see a clear correction and explanation, edit the answer, and check it again. Explicitly authored alternatives are accepted; accents and grammar still matter.

Incorrect answers return through the retry queue until they are corrected. **Boost** pins a word, form, or sentence to the priority queue and stays active until you turn it off yourself. Attempts, retry items, and Boost selections use the same device-only `localStorage` boundary as personal cards and review progress.

## What is public

- The application shell and a small generic demo deck.
- The source code required for GitHub Pages.

## What stays private

Personal cards and review progress are stored in the browser's `localStorage`. They are not committed to GitHub, included in the URL, or transferred when somebody shares the public link.

This v1 has no account or cloud sync. Clearing Safari website data or moving to another device removes the local cards and progress.

## Install on iPhone

1. Open the GitHub Pages URL in Safari.
2. Tap **Share**.
3. Choose **Add to Home Screen**, then **Add**.

## Pronunciation

By default the app uses the free French voice installed on the device through the Web Speech API. It prefers a likely male `fr-FR` voice where available and otherwise uses another French voice.

The optional paid-quality route is defined in [`docs/tts-backend-contract.md`](docs/tts-backend-contract.md). An API key must never be added to this repository or browser code.

## Local verification

```text
npm test
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Deployment

GitHub Pages serves the `main` branch from the repository root. All asset paths are relative so the PWA works under `/mon-francais/`.
