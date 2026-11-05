export const PRIVATE_STORAGE_KEY = "french-solovey.private.v1";

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

function emptyPrivateState() {
  return { cards: [], progress: {} };
}

export function loadPrivateState(storage) {
  try {
    const raw = storage.getItem(PRIVATE_STORAGE_KEY);
    if (!raw) return emptyPrivateState();
    const value = JSON.parse(raw);
    if (!Array.isArray(value.cards) || !value.progress || typeof value.progress !== "object") {
      return emptyPrivateState();
    }
    return { cards: value.cards, progress: value.progress };
  } catch {
    return emptyPrivateState();
  }
}

export function savePrivateState(storage, state) {
  storage.setItem(
    PRIVATE_STORAGE_KEY,
    JSON.stringify({ cards: state.cards, progress: state.progress }),
  );
}
