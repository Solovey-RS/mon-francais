const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

export function createEmptyPronunciationProgress() {
  return { ratings: {}, boostedIds: [] };
}

export function ratePronunciation(progress, itemId, rating, now = Date.now()) {
  if (!["repeat", "known"].includes(rating)) {
    throw new TypeError(`Unknown pronunciation rating: ${rating}`);
  }
  const previous = progress.ratings[itemId];
  const oldStreak = Number.isInteger(previous?.streak) ? previous.streak : 0;
  const streak = rating === "known" ? oldStreak + 1 : 0;
  const dueAt = rating === "repeat" ? now + MINUTE : now + Math.max(2, streak * 3) * DAY;
  return {
    ratings: {
      ...progress.ratings,
      [itemId]: { rating, streak, dueAt, lastRatedAt: now },
    },
    boostedIds: [...progress.boostedIds],
  };
}

export function togglePronunciationBoost(progress, itemId) {
  const isBoosted = progress.boostedIds.includes(itemId);
  return {
    ratings: { ...progress.ratings },
    boostedIds: isBoosted
      ? progress.boostedIds.filter((id) => id !== itemId)
      : [...progress.boostedIds, itemId],
  };
}

function oldestRatingFirst(progress) {
  return (left, right) =>
    (progress.ratings[left]?.lastRatedAt ?? 0) -
    (progress.ratings[right]?.lastRatedAt ?? 0);
}

export function selectNextPronunciationItemId(items, progress, currentId = null, now = Date.now(), visitedIds = new Set()) {
  if (!items.length) return null;
  const unvisited = items.filter((item) => !visitedIds.has(item.id));
  const candidates = unvisited.length ? unvisited : items;
  const validIds = new Set(candidates.map((item) => item.id));
  const avoidCurrent = candidates.length > 1;
  const eligible = (id) => validIds.has(id) && (!avoidCurrent || id !== currentId);

  const boosted = progress.boostedIds.filter(eligible).sort(oldestRatingFirst(progress));
  if (boosted.length) return boosted[0];

  const due = candidates.find((item) => {
    if (!eligible(item.id)) return false;
    const dueAt = progress.ratings[item.id]?.dueAt;
    return Number.isFinite(dueAt) && dueAt <= now;
  });
  if (due) return due.id;

  const currentIndex = items.findIndex((item) => item.id === currentId);
  for (let offset = 1; offset <= items.length; offset += 1) {
    const item = items[(currentIndex + offset + items.length) % items.length];
    if (eligible(item.id)) return item.id;
  }
  return items[0].id;
}
