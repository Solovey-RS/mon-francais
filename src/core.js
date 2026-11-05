export const PRIVATE_STORAGE_KEY = "french-solovey.private.v1";

import { createEmptyExerciseProgress } from "./exercise-core.js";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

export function createSession(card) {
  return {
    card,
    isRevealed: false,
    visibleAnswer: null,
    canRate: false,
    canSpeak: false,
  };
}

export function revealCard(session) {
  return {
    ...session,
    isRevealed: true,
    visibleAnswer: session.card.answer,
    canRate: true,
    canSpeak: true,
  };
}

export function rateCard(previous = {}, rating, now = Date.now()) {
  const oldStreak = Number.isFinite(previous.streak) ? previous.streak : 0;
  const intervals = {
    again: MINUTE,
    hard: DAY,
    known: Math.max(3, (oldStreak + 1) * 3) * DAY,
  };

  if (!(rating in intervals)) {
    throw new TypeError(`Unknown rating: ${rating}`);
  }

  return {
    dueAt: now + intervals[rating],
    streak: rating === "known" ? oldStreak + 1 : rating === "again" ? 0 : oldStreak,
    lastRating: rating,
  };
}

export function chooseFrenchVoice(voices) {
  if (!Array.isArray(voices) || voices.length === 0) return null;

  const french = voices.filter((voice) => /^fr(?:-|$)/i.test(voice.lang ?? ""));
  if (french.length === 0) return null;

  const maleNames = /\b(thomas|paul|daniel|hugo|nicolas|henri|jacques|louis|remy|rémi)\b/i;
  return (
    french.find((voice) => /^fr-FR$/i.test(voice.lang ?? "") && maleNames.test(voice.name ?? "")) ??
    french.find((voice) => maleNames.test(voice.name ?? "")) ??
    french.find((voice) => /^fr-FR$/i.test(voice.lang ?? "")) ??
    french[0]
  );
}

export function nextDueIndex(cards, progress, currentIndex, now = Date.now()) {
  for (let offset = 1; offset <= cards.length; offset += 1) {
    const index = (currentIndex + offset) % cards.length;
    const dueAt = progress[cards[index].id]?.dueAt;
    if (!Number.isFinite(dueAt) || dueAt <= now) return index;
  }
  return -1;
}

function emptyPrivateState() {
  return { cards: [], progress: {}, exerciseProgress: createEmptyExerciseProgress() };
}

function isValidCard(card) {
  return Boolean(
    card &&
    typeof card === "object" &&
    typeof card.id === "string" && card.id.trim() &&
    typeof card.prompt === "string" && card.prompt.trim() &&
    typeof card.answer === "string" && card.answer.trim() &&
    (card.deck === undefined || typeof card.deck === "string"),
  );
}

function isValidProgressEntry(entry) {
  return Boolean(
    entry &&
    typeof entry === "object" &&
    Number.isFinite(entry.dueAt) &&
    Number.isFinite(entry.streak) && entry.streak >= 0 &&
    ["again", "hard", "known"].includes(entry.lastRating),
  );
}

function sanitizeExerciseProgress(value) {
  const empty = createEmptyExerciseProgress();
  if (!value || typeof value !== "object") return empty;
  if (!value.attempts || typeof value.attempts !== "object" || Array.isArray(value.attempts)) return empty;
  if (!Array.isArray(value.retryQueue) || !Array.isArray(value.boostedIds)) return empty;

  const attempts = Object.fromEntries(
    Object.entries(value.attempts).filter(([id, attempt]) =>
      typeof id === "string" &&
      attempt && typeof attempt === "object" &&
      Number.isInteger(attempt.count) && attempt.count >= 1 &&
      typeof attempt.correct === "boolean" &&
      typeof attempt.lastAnswer === "string" &&
      Number.isFinite(attempt.lastAttemptAt),
    ),
  );
  const validIds = (items) => [...new Set(items.filter((id) => typeof id === "string" && id.trim()))];
  return {
    attempts,
    retryQueue: validIds(value.retryQueue),
    boostedIds: validIds(value.boostedIds),
  };
}

export function loadPrivateState(storage) {
  try {
    const raw = storage.getItem(PRIVATE_STORAGE_KEY);
    if (!raw) return emptyPrivateState();
    const value = JSON.parse(raw);
    if (!Array.isArray(value.cards) || !value.progress || typeof value.progress !== "object") {
      return emptyPrivateState();
    }
    const cards = value.cards.filter(isValidCard);
    const progress = Object.fromEntries(
      Object.entries(value.progress).filter(([, entry]) => isValidProgressEntry(entry)),
    );
    const exerciseProgress = sanitizeExerciseProgress(value.exerciseProgress);
    return { cards, progress, exerciseProgress };
  } catch {
    return emptyPrivateState();
  }
}

export function savePrivateState(storage, state) {
  try {
    storage.setItem(
      PRIVATE_STORAGE_KEY,
      JSON.stringify({
        cards: state.cards,
        progress: state.progress,
        exerciseProgress: state.exerciseProgress ?? createEmptyExerciseProgress(),
      }),
    );
    return true;
  } catch {
    return false;
  }
}
