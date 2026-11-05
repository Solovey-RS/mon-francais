import { createEmptyExerciseProgress } from "./exercise-core.js";
import { LESSON_ONE_EXERCISES } from "./exercises.js";
import { createEmptyPronunciationProgress } from "./pronunciation-core.js";
import { PRONUNCIATION_ITEMS } from "./pronunciation.js";

export const PRIVATE_STORAGE_KEY = "french-solovey.private.v1";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const EXERCISE_IDS = new Set(LESSON_ONE_EXERCISES.map(({ id }) => id));
const PRONUNCIATION_IDS = new Set(PRONUNCIATION_ITEMS.map(({ id }) => id));
const ACTIVE_MODES = new Set(["cards", "pronunciation", "exercises"]);

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
  return {
    cards: [],
    progress: {},
    exerciseProgress: createEmptyExerciseProgress(),
    pronunciationProgress: createEmptyPronunciationProgress(),
    preferences: { activeMode: "cards" },
  };
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
      EXERCISE_IDS.has(id) &&
      attempt && typeof attempt === "object" &&
      Number.isInteger(attempt.count) && attempt.count >= 1 &&
      typeof attempt.correct === "boolean" &&
      typeof attempt.lastAnswer === "string" &&
      Number.isFinite(attempt.lastAttemptAt),
    ),
  );
  const validIds = (items) => [...new Set(items.filter((id) => EXERCISE_IDS.has(id)))];
  return {
    attempts,
    retryQueue: validIds(value.retryQueue).filter((id) => attempts[id]?.correct === false),
    boostedIds: validIds(value.boostedIds),
  };
}

function sanitizePronunciationProgress(value) {
  const empty = createEmptyPronunciationProgress();
  if (!value || typeof value !== "object") return empty;
  if (!value.ratings || typeof value.ratings !== "object" || Array.isArray(value.ratings)) return empty;
  if (!Array.isArray(value.boostedIds)) return empty;

  const ratings = Object.fromEntries(
    Object.entries(value.ratings).filter(([id, rating]) =>
      PRONUNCIATION_IDS.has(id) &&
      rating && typeof rating === "object" &&
      ["repeat", "known"].includes(rating.rating) &&
      Number.isInteger(rating.streak) && rating.streak >= 0 &&
      Number.isFinite(rating.dueAt) &&
      Number.isFinite(rating.lastRatedAt),
    ),
  );
  const boostedIds = [...new Set(value.boostedIds.filter((id) => PRONUNCIATION_IDS.has(id)))];
  return { ratings, boostedIds };
}

function sanitizePreferences(value) {
  const activeMode = ACTIVE_MODES.has(value?.activeMode) ? value.activeMode : "cards";
  return { activeMode };
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
    const pronunciationProgress = sanitizePronunciationProgress(value.pronunciationProgress);
    const preferences = sanitizePreferences(value.preferences);
    return { cards, progress, exerciseProgress, pronunciationProgress, preferences };
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
        pronunciationProgress: state.pronunciationProgress ?? createEmptyPronunciationProgress(),
        preferences: sanitizePreferences(state.preferences),
      }),
    );
    return true;
  } catch {
    return false;
  }
}
