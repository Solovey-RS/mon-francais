# Optional protected TTS backend

The public PWA works without this backend. Native iOS speech is the default and free route.

## Client contract

When `TTS_BACKEND_URL` in `src/app.js` is set, the client sends:

```http
POST /tts
Content-Type: application/json
Cookie: authenticated session, if used

{
  "text": "Bonjour",
  "language": "fr-FR",
  "voiceStyle": "calm-male"
}
```

The server returns audio bytes (`audio/mpeg`, `audio/aac`, or another browser-playable type). Any failure falls back to the device voice.

## Security requirements

- Keep the API key only in server-side environment secrets.
- Never return the key, upstream request, or provider credentials to the browser.
- Allow only the production site origin with CORS; do not use `*` with credentials.
- Authenticate users before paid generation if the endpoint is not intentionally public.
- Rate-limit by user and IP, enforce a short text limit, and reject non-text payloads.
- Cache normalized phrases to avoid paying again for the same pronunciation.
- Log request metadata without retaining personal lesson text unless the user explicitly agrees.
- Display a clear notice when the played voice is AI-generated.

## Current OpenAI note

As of 5 November 2026, OpenAI's official text-to-speech guide says the existing Speech API TTS models are scheduled to shut down on 6 January 2027 and recommends the Realtime API path for new integrations. Select the current supported API only when the backend is implemented; do not hard-code a retiring model now.

Official guide: <https://developers.openai.com/api/docs/guides/text-to-speech>
