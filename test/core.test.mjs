import test from "node:test";
import assert from "node:assert/strict";

import {
  chooseFrenchVoice,
  createSession,
  loadPrivateState,
  nextDueIndex,
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
  assert.equal(savePrivateState(storage, state), true);
  assert.deepEqual(loadPrivateState(storage), state);
  assert.equal(memory.size, 1);
  memory.set("french-solovey.private.v1", "{broken");
  assert.deepEqual(loadPrivateState(storage), { cards: [], progress: {} });
});

test("invalid cards and progress entries are discarded without breaking valid data", () => {
  const valid = { id: "private-1", prompt: "Дом", answer: "Maison", deck: "Мои карточки" };
  const storage = {
    getItem: () => JSON.stringify({
      cards: [null, { id: 3, prompt: "x", answer: "y" }, valid, { id: "bad", prompt: "", answer: "Vide" }],
      progress: {
        "private-1": { dueAt: 100, streak: 2, lastRating: "known" },
        broken: null,
      },
    }),
  };
  assert.deepEqual(loadPrivateState(storage), {
    cards: [valid],
    progress: { "private-1": { dueAt: 100, streak: 2, lastRating: "known" } },
  });
});

test("storage write failure is reported without throwing", () => {
  const storage = { setItem: () => { throw new Error("quota"); } };
  assert.equal(savePrivateState(storage, { cards: [], progress: {} }), false);
});

test("next due card skips cards scheduled for the future", () => {
  const cards = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const now = 1_000;
  const progress = {
    a: { dueAt: 20_000 },
    b: { dueAt: 500 },
    c: { dueAt: 30_000 },
  };
  assert.equal(nextDueIndex(cards, progress, 0, now), 1);
  progress.b.dueAt = 40_000;
  assert.equal(nextDueIndex(cards, progress, 1, now), -1);
});
