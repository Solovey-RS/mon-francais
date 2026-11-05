import test from "node:test";
import assert from "node:assert/strict";

import {
  checkExerciseAnswer,
  createEmptyExerciseProgress,
  normalizeFrenchAnswer,
  recordExerciseAttempt,
  selectNextExerciseId,
  toggleExerciseBoost,
} from "../src/exercise-core.js";
import { LESSON_ONE_EXERCISES } from "../src/exercises.js";

test("answer normalization ignores case, spacing, apostrophe style, and terminal punctuation", () => {
  assert.equal(normalizeFrenchAnswer("  COMMENT   TU T’APPELLES ? "), "comment tu t'appelles");
  assert.equal(normalizeFrenchAnswer("Je suis française."), "je suis française");
  assert.notEqual(normalizeFrenchAnswer("francaise"), normalizeFrenchAnswer("française"));
});

test("grading accepts authored alternatives and rejects grammar errors", () => {
  const exercise = {
    answer: "Comment tu t’appelles ?",
    answers: ["Comment tu t’appelles ?", "Comment t’appelles-tu ?"],
    explanation: "Two accepted question forms.",
  };
  assert.equal(checkExerciseAnswer(exercise, "comment t'appelles-tu").isCorrect, true);
  const wrong = checkExerciseAnswer(exercise, "Comment tu appelle ?");
  assert.equal(wrong.isCorrect, false);
  assert.equal(wrong.canonicalAnswer, "Comment tu t’appelles ?");
  assert.equal(wrong.explanation, "Two accepted question forms.");
});

test("an incorrect answer enters retry queue and a later correction removes it", () => {
  const empty = createEmptyExerciseProgress();
  const wrong = recordExerciseAttempt(empty, "etre-je", "Je es", false, 100);
  assert.deepEqual(wrong.retryQueue, ["etre-je"]);
  assert.deepEqual(wrong.attempts["etre-je"], {
    count: 1,
    correct: false,
    lastAnswer: "Je es",
    lastAttemptAt: 100,
  });

  const corrected = recordExerciseAttempt(wrong, "etre-je", "Je suis", true, 200);
  assert.deepEqual(corrected.retryQueue, []);
  assert.equal(corrected.attempts["etre-je"].count, 2);
  assert.equal(corrected.attempts["etre-je"].correct, true);
});

test("Boost stays enabled across attempts until manually toggled off", () => {
  const enabled = toggleExerciseBoost(createEmptyExerciseProgress(), "appel-question");
  assert.deepEqual(enabled.boostedIds, ["appel-question"]);
  const attempted = recordExerciseAttempt(enabled, "appel-question", "correct", true, 50);
  assert.deepEqual(attempted.boostedIds, ["appel-question"]);
  const disabled = toggleExerciseBoost(attempted, "appel-question");
  assert.deepEqual(disabled.boostedIds, []);
});

test("selection prioritizes Boost, then retry, then lesson order without immediate repetition", () => {
  const exercises = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const progress = {
    attempts: {
      a: { lastAttemptAt: 300 },
      b: { lastAttemptAt: 100 },
      c: { lastAttemptAt: 200 },
    },
    retryQueue: ["c"],
    boostedIds: ["a", "b"],
  };
  assert.equal(selectNextExerciseId(exercises, progress, "c"), "b");
  assert.equal(selectNextExerciseId(exercises, progress, "b"), "a");

  const retryOnly = { ...progress, boostedIds: [] };
  assert.equal(selectNextExerciseId(exercises, retryOnly, "a"), "c");
  assert.equal(selectNextExerciseId(exercises, createEmptyExerciseProgress(), null), "a");
  assert.equal(selectNextExerciseId(exercises, createEmptyExerciseProgress(), "a"), "b");
});

test("Leçon 1 covers all approved topics with authored explanations", () => {
  const topics = new Set(LESSON_ONE_EXERCISES.map((item) => item.topic));
  assert.deepEqual(topics, new Set(["Местоимения", "Être", "S’appeler", "Прилагательные"]));
  assert.ok(LESSON_ONE_EXERCISES.length >= 12);
  assert.ok(LESSON_ONE_EXERCISES.every((item) => item.answers.length >= 1 && item.explanation.length > 20));
});
