import test from "node:test";
import assert from "node:assert/strict";

import {
  chooseFrenchVoice,
  createSession,
  loadPrivateState,
  rateCard,
  revealCard,
  savePrivateState,
} from "../src/core.js";

const card = { id: "demo-1", prompt: "Добрый день", answer: "Bonjour" };

test("a new session does not expose the French answer", () => {
  const session = createSession(card);
  assert.equal(session.isRevealed, false);
  assert.equal(session.visibleAnswer, null);
  assert.equal(session.canRate, false);
  assert.equal(session.canSpeak, false);
});

test("revealing a card enables answer, speech, and rating", () => {
  const session = revealCard(createSession(card));
  assert.equal(session.visibleAnswer, "Bonjour");
  assert.equal(session.canRate, true);
  assert.equal(session.canSpeak, true);
});

test("rating schedules again sooner than hard and known", () => {
  const now = Date.parse("2026-11-05T12:00:00Z");
  const again = rateCard({}, "again", now);
  const hard = rateCard({}, "hard", now);
  const known = rateCard({}, "known", now);
  assert.ok(again.dueAt < hard.dueAt);
  assert.ok(hard.dueAt < known.dueAt);
  assert.equal(known.streak, 1);
});

test("voice choice prefers a likely male fr-FR voice", () => {
  const voices = [
    { name: "Amélie", lang: "fr-CA", voiceURI: "amelie" },
    { name: "Thomas", lang: "fr-FR", voiceURI: "thomas" },
    { name: "Samantha", lang: "en-US", voiceURI: "samantha" },
  ];
  assert.equal(chooseFrenchVoice(voices)?.voiceURI, "thomas");
  assert.equal(chooseFrenchVoice([]), null);
});

test("private state is stored only under the supplied local storage key", () => {
  const memory = new Map();
  const storage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  };
  const state = { cards: [card], progress: {} };
  savePrivateState(storage, state);
  assert.deepEqual(loadPrivateState(storage), state);
  assert.equal(memory.size, 1);
  memory.set("french-solovey.private.v1", "{broken");
  assert.deepEqual(loadPrivateState(storage), { cards: [], progress: {} });
});
