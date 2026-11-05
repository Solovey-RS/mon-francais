# «Французский Соловья» — design

## Intent

Create a free, installable iPhone PWA under the Solavey RS brand for French flash-card practice. The answer must remain hidden until the learner chooses to reveal it; only then may pronunciation and rating controls appear.

## Goals

- Publish a public GitHub Pages URL and make the PWA installable from Safari.
- Keep personal cards and progress in browser-local storage, never in the public repository or URL.
- Use free iOS French speech synthesis by default, preferring a male French voice when available.
- Leave a secure, optional backend contract for higher-quality API TTS without putting a key in the client.
- Brand the product as «Французский Соловья» / Solavey RS.

## Non-goals

- No account, cloud sync, photo recognition, payments, or private lesson publication in v1.
- No impersonation of a real actor's voice.
- No OpenAI API call from the browser.

## Approach

Use a dependency-free static PWA: HTML, CSS, ES modules, manifest, and service worker. This is preferable to a framework because GitHub Pages can host it for free, the app remains small, and there is no server to maintain. Public code includes only a generic demo deck. Personal cards, review schedule, and settings live under versioned `localStorage` keys on each device.

## Privacy and sharing

Sharing the site URL shares only the public app and generic demo cards. It does not transfer the current device's `localStorage`. Clearing Safari site data or changing devices removes local content until a future export/sync feature is added.

## TTS

`speechSynthesis` with `lang = fr-FR` is the default. Voice selection prefers French voices whose names are commonly male, then any French voice. An optional same-origin/backend URL may return audio bytes; it receives only the phrase requested by the learner and must hold its API key server-side, authenticate users, rate-limit requests, and disclose AI-generated speech.

## Success criteria

Tests prove the hidden-answer state, rating schedule, voice preference, private storage boundary, and required PWA metadata. A browser smoke test proves card interaction and local add flow. The deployed HTTPS URL returns the app and manifest.
