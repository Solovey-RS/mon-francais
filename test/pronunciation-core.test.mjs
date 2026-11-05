import test from "node:test";
import assert from "node:assert/strict";

import { PRONUNCIATION_ITEMS, PRONUNCIATION_MODULES } from "../src/pronunciation.js";
import {
  createEmptyPronunciationProgress,
  ratePronunciation,
  selectNextPronunciationItemId,
  togglePronunciationBoost,
} from "../src/pronunciation-core.js";

test("Lesson 0 contains ten complete original pronunciation modules", () => {
  assert.equal(PRONUNCIATION_MODULES.length, 10);
  assert.deepEqual(
    PRONUNCIATION_MODULES.map((module) => module.id),
    ["vowels", "letter-e", "syllables", "digraphs", "ou-oi", "nasals", "combined-vowels", "changing-consonants", "advanced-combinations", "silent-endings"],
  );
  assert.ok(PRONUNCIATION_MODULES.every((module) => module.itemIds.length >= 2));
  assert.ok(PRONUNCIATION_MODULES.every((module) => module.bilan?.text && module.bilan?.audioText));
  assert.equal(new Set(PRONUNCIATION_ITEMS.map((item) => item.id)).size, PRONUNCIATION_ITEMS.length);
});

test("every pronunciation item has model audio and bounded practice words", () => {
  const moduleIds = new Set(PRONUNCIATION_MODULES.map((module) => module.id));
  assert.ok(PRONUNCIATION_ITEMS.length >= 20);
  assert.ok(PRONUNCIATION_ITEMS.every((item) => moduleIds.has(item.moduleId)));
  assert.ok(PRONUNCIATION_ITEMS.every((item) => item.pattern && item.explanation && item.modelWord && item.audioText));
  assert.ok(PRONUNCIATION_ITEMS.every((item) => item.practiceWords.length >= 3 && item.practiceWords.length <= 6));
  assert.ok(PRONUNCIATION_MODULES.every((module) =>
    module.itemIds.every((id) => PRONUNCIATION_ITEMS.some((item) => item.id === id)),
  ));
});

test("repeat schedules sooner than known and preserves Boost", () => {
  const empty = createEmptyPronunciationProgress();
  const boosted = togglePronunciationBoost(empty, "vowel-a");
  const repeat = ratePronunciation(boosted, "vowel-a", "repeat", 1_000);
  const known = ratePronunciation(boosted, "vowel-a", "known", 1_000);
  assert.ok(repeat.ratings["vowel-a"].dueAt < known.ratings["vowel-a"].dueAt);
  assert.equal(repeat.ratings["vowel-a"].streak, 0);
  assert.equal(known.ratings["vowel-a"].streak, 1);
  assert.deepEqual(known.boostedIds, ["vowel-a"]);
  assert.deepEqual(togglePronunciationBoost(known, "vowel-a").boostedIds, []);
});

test("pronunciation selection prioritizes Boost, then due items, then lesson order", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const progress = {
    ratings: {
      a: { dueAt: 10_000, lastRatedAt: 300 },
      b: { dueAt: 10_000, lastRatedAt: 100 },
      c: { dueAt: 500, lastRatedAt: 200 },
    },
    boostedIds: ["a", "b"],
  };
  assert.equal(selectNextPronunciationItemId(items, progress, "c", 1_000), "b");
  assert.equal(selectNextPronunciationItemId(items, progress, "b", 1_000), "a");
  assert.equal(selectNextPronunciationItemId(items, { ...progress, boostedIds: [] }, "a", 1_000), "c");
  assert.equal(selectNextPronunciationItemId(items, createEmptyPronunciationProgress(), "a", 1_000), "b");
  assert.equal(selectNextPronunciationItemId([{ id: "only" }], createEmptyPronunciationProgress(), "only", 1_000), "only");
});

test("pronunciation selection visits every item once before repeating Boost priorities", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
  const progress = { ratings: {}, boostedIds: ["a"] };
  const visited = new Set(["a"]);
  const sequence = [];
  let current = "a";
  while (visited.size < items.length) {
    current = selectNextPronunciationItemId(items, progress, current, 1_000, visited);
    visited.add(current);
    sequence.push(current);
  }
  assert.deepEqual(sequence, ["b", "c", "d"]);
});

test("gu before e or i uses examples where u remains silent", () => {
  const item = PRONUNCIATION_ITEMS.find((candidate) => candidate.id === "digraph-gu");
  assert.ok(item.practiceWords.includes("guerre"));
  assert.ok(!item.practiceWords.includes("virgule"));
});
