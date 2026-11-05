export function createEmptyExerciseProgress() {
  return { attempts: {}, retryQueue: [], boostedIds: [] };
}

export function normalizeFrenchAnswer(value) {
  return String(value ?? "")
    .normalize("NFC")
    .trim()
    .toLocaleLowerCase("fr")
    .replace(/[’‘`´]/g, "'")
    .replace(/\s*([-'])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/\s*[.!?…]+$/u, "");
}

export function checkExerciseAnswer(exercise, input) {
  const normalized = normalizeFrenchAnswer(input);
  const accepted = exercise.answers.map(normalizeFrenchAnswer);
  return {
    isCorrect: normalized.length > 0 && accepted.includes(normalized),
    canonicalAnswer: exercise.answer,
    explanation: exercise.explanation,
  };
}

export function gradeExerciseLine(exercise, input, reveal = false) {
  const isAnswered = String(input ?? "").trim().length > 0;
  const result = checkExerciseAnswer(exercise, input);
  const revealCorrection = reveal && !result.isCorrect;
  return {
    isAnswered,
    isCorrect: result.isCorrect,
    canonicalAnswer: revealCorrection ? result.canonicalAnswer : null,
    explanation: revealCorrection ? result.explanation : null,
  };
}

export function gradeExerciseBlock(block, exerciseMap, answers, reveal = false) {
  const rows = block.exerciseIds.map((id) => {
    const exercise = exerciseMap.get(id);
    if (!exercise) throw new TypeError(`Unknown exercise: ${id}`);
    return { id, ...gradeExerciseLine(exercise, answers[id] ?? "", reveal) };
  });
  const correctIds = rows.filter((row) => row.isCorrect).map((row) => row.id);
  const retryIds = rows.filter((row) => !row.isCorrect).map((row) => row.id);
  return {
    rows,
    correctIds,
    retryIds,
    isComplete: retryIds.length === 0,
  };
}

export function recordExerciseAttempt(progress, exerciseId, answer, isCorrect, now = Date.now()) {
  const previous = progress.attempts[exerciseId];
  const attempts = {
    ...progress.attempts,
    [exerciseId]: {
      count: (previous?.count ?? 0) + 1,
      correct: isCorrect,
      lastAnswer: answer,
      lastAttemptAt: now,
    },
  };
  const withoutCurrent = progress.retryQueue.filter((id) => id !== exerciseId);
  const retryQueue = isCorrect ? withoutCurrent : [...withoutCurrent, exerciseId];
  return {
    attempts,
    retryQueue,
    boostedIds: [...progress.boostedIds],
  };
}

export function toggleExerciseBoost(progress, exerciseId) {
  const isBoosted = progress.boostedIds.includes(exerciseId);
  return {
    attempts: { ...progress.attempts },
    retryQueue: [...progress.retryQueue],
    boostedIds: isBoosted
      ? progress.boostedIds.filter((id) => id !== exerciseId)
      : [...progress.boostedIds, exerciseId],
  };
}

function oldestAttemptFirst(progress) {
  return (left, right) =>
    (progress.attempts[left]?.lastAttemptAt ?? 0) -
    (progress.attempts[right]?.lastAttemptAt ?? 0);
}

export function selectNextExerciseId(exercises, progress, currentId = null) {
  if (!exercises.length) return null;
  const validIds = new Set(exercises.map((exercise) => exercise.id));
  const avoidCurrent = exercises.length > 1;
  const eligible = (id) => validIds.has(id) && (!avoidCurrent || id !== currentId);

  const boosted = progress.boostedIds.filter(eligible).sort(oldestAttemptFirst(progress));
  if (boosted.length) return boosted[0];

  const retry = progress.retryQueue.find(eligible);
  if (retry) return retry;

  const currentIndex = exercises.findIndex((exercise) => exercise.id === currentId);
  for (let offset = 1; offset <= exercises.length; offset += 1) {
    const index = (currentIndex + offset + exercises.length) % exercises.length;
    if (!avoidCurrent || exercises[index].id !== currentId) return exercises[index].id;
  }
  return exercises[0].id;
}

export function selectNextExerciseBlockId(blocks, progress, currentBlockId = null) {
  if (!blocks.length) return null;
  const avoidCurrent = blocks.length > 1;
  const eligible = (block) => !avoidCurrent || block.id !== currentBlockId;
  const candidates = blocks.filter(eligible);

  const boosted = candidates.find((block) =>
    block.exerciseIds.some((id) => progress.boostedIds.includes(id)),
  );
  if (boosted) return boosted.id;

  const retry = candidates.find((block) =>
    block.exerciseIds.some((id) => progress.retryQueue.includes(id)),
  );
  if (retry) return retry.id;

  const currentIndex = blocks.findIndex((block) => block.id === currentBlockId);
  for (let offset = 1; offset <= blocks.length; offset += 1) {
    const block = blocks[(currentIndex + offset + blocks.length) % blocks.length];
    if (eligible(block)) return block.id;
  }
  return blocks[0].id;
}
