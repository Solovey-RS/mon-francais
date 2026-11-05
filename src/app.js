import {
  chooseFrenchVoice,
  createSession,
  loadPrivateState,
  nextDueIndex,
  rateCard,
  revealCard,
  savePrivateState,
} from "./core.js?v=5";
import {
  describeExerciseRow,
  gradeExerciseBlock,
  gradeExerciseLine,
  recordExerciseAttempt,
  selectNextExerciseBlockId,
  shouldInitializeExerciseView,
  toggleExerciseBoost,
} from "./exercise-core.js?v=5";
import { LESSON_ONE_BLOCKS, LESSON_ONE_EXERCISES } from "./exercises.js?v=5";
import {
  ratePronunciation,
  selectNextPronunciationItemId,
  togglePronunciationBoost,
} from "./pronunciation-core.js?v=5";
import { PRONUNCIATION_ITEMS, PRONUNCIATION_MODULES } from "./pronunciation.js?v=5";

const publicCards = [
  { id: "public-bonjour", prompt: "Добрый день", answer: "Bonjour", deck: "Демо-урок" },
  { id: "public-merci", prompt: "Спасибо большое", answer: "Merci beaucoup", deck: "Демо-урок" },
  { id: "public-name", prompt: "Как тебя зовут?", answer: "Comment tu t’appelles ?", deck: "Демо-урок" },
  { id: "public-please", prompt: "Пожалуйста", answer: "S’il vous plaît", deck: "Демо-урок" },
  { id: "public-see-you", prompt: "До скорого", answer: "À bientôt", deck: "Демо-урок" },
  { id: "public-understand", prompt: "Я понимаю", answer: "Je comprends", deck: "Демо-урок" },
];

// Set this to a protected server endpoint only. Never place an API key in this file.
const TTS_BACKEND_URL = "";
const exerciseMap = new Map(LESSON_ONE_EXERCISES.map((exercise) => [exercise.id, exercise]));
const pronunciationModuleMap = new Map(PRONUNCIATION_MODULES.map((module) => [module.id, module]));

const elements = {
  prompt: document.querySelector("#card-prompt"),
  answer: document.querySelector("#card-answer"),
  answerPanel: document.querySelector("#answer-panel"),
  revealButton: document.querySelector("#reveal-button"),
  speakButton: document.querySelector("#speak-button"),
  ratingButtons: document.querySelector("#rating-buttons"),
  cardCounter: document.querySelector("#card-counter"),
  deckLabel: document.querySelector("#deck-label"),
  cardCount: document.querySelector("#card-count"),
  knownCount: document.querySelector("#known-count"),
  dueCount: document.querySelector("#due-count"),
  addCardButton: document.querySelector("#add-card-button"),
  addCardDialog: document.querySelector("#add-card-dialog"),
  addCardForm: document.querySelector("#add-card-form"),
  newPrompt: document.querySelector("#new-prompt"),
  newAnswer: document.querySelector("#new-answer"),
  installButton: document.querySelector("#install-button"),
  installDialog: document.querySelector("#install-dialog"),
  shareButton: document.querySelector("#share-button"),
  closeAddCard: document.querySelector("#close-add-card"),
  saveError: document.querySelector("#save-error"),
  practiceSaveError: document.querySelector("#practice-save-error"),
  practiceMode: document.querySelector("#practice-mode"),
  pronunciationMode: document.querySelector("#pronunciation-mode"),
  exerciseMode: document.querySelector("#exercise-mode"),
  practicePanel: document.querySelector("#practice-panel"),
  pronunciationPanel: document.querySelector("#pronunciation-panel"),
  exercisePanel: document.querySelector("#exercise-panel"),
  practiceActions: document.querySelector("#practice-actions"),
  pronunciationCounter: document.querySelector("#pronunciation-counter"),
  pronunciationKnownCount: document.querySelector("#pronunciation-known-count"),
  pronunciationDueCount: document.querySelector("#pronunciation-due-count"),
  pronunciationBoostCount: document.querySelector("#pronunciation-boost-count"),
  pronunciationModule: document.querySelector("#pronunciation-module"),
  pronunciationBoost: document.querySelector("#pronunciation-boost"),
  pronunciationPattern: document.querySelector("#pronunciation-pattern"),
  pronunciationExplanation: document.querySelector("#pronunciation-explanation"),
  pronunciationModelWord: document.querySelector("#pronunciation-model-word"),
  pronunciationListen: document.querySelector("#pronunciation-listen"),
  pronunciationPracticeWords: document.querySelector("#pronunciation-practice-words"),
  pronunciationBilan: document.querySelector("#pronunciation-bilan"),
  pronunciationListenBilan: document.querySelector("#pronunciation-listen-bilan"),
  pronunciationRepeat: document.querySelector("#pronunciation-repeat"),
  pronunciationKnown: document.querySelector("#pronunciation-known"),
  pronunciationSaveError: document.querySelector("#pronunciation-save-error"),
  exerciseCounter: document.querySelector("#exercise-counter"),
  exerciseCorrectCount: document.querySelector("#exercise-correct-count"),
  exerciseRetryCount: document.querySelector("#exercise-retry-count"),
  exerciseBoostCount: document.querySelector("#exercise-boost-count"),
  exerciseBlockTitle: document.querySelector("#exercise-block-title"),
  exerciseInstruction: document.querySelector("#exercise-instruction"),
  exerciseRows: document.querySelector("#exercise-rows"),
  exerciseCheckAll: document.querySelector("#exercise-check-all"),
  exerciseRetryWrong: document.querySelector("#exercise-retry-wrong"),
  exerciseNextBlock: document.querySelector("#exercise-next-block"),
  exerciseSaveError: document.querySelector("#exercise-save-error"),
};

const modes = [
  { id: "cards", tab: elements.practiceMode, panel: elements.practicePanel },
  { id: "pronunciation", tab: elements.pronunciationMode, panel: elements.pronunciationPanel },
  { id: "exercises", tab: elements.exerciseMode, panel: elements.exercisePanel },
];

let privateState = loadPrivateState(window.localStorage);
let cards = [...publicCards, ...privateState.cards];
let currentIndex = 0;
let session = createSession(cards[currentIndex]);
let currentExerciseBlockId = selectNextExerciseBlockId(LESSON_ONE_BLOCKS, privateState.exerciseProgress, null);
let exerciseVisibleIds = null;
let currentPronunciationId = selectNextPronunciationItemId(PRONUNCIATION_ITEMS, privateState.pronunciationProgress, null);
let visitedExerciseBlockIds = new Set([currentExerciseBlockId]);
let visitedPronunciationIds = new Set([currentPronunciationId]);

function persistPrivateState(patch, errorElement) {
  const nextState = { ...privateState, ...patch };
  if (!savePrivateState(window.localStorage, nextState)) {
    if (errorElement) errorElement.hidden = false;
    return false;
  }
  privateState = nextState;
  if (errorElement) errorElement.hidden = true;
  return true;
}

function isDue(card, now = Date.now()) {
  const dueAt = privateState.progress[card.id]?.dueAt;
  return !Number.isFinite(dueAt) || dueAt <= now;
}

function updateStats() {
  elements.cardCount.textContent = String(cards.length);
  elements.knownCount.textContent = String(Object.values(privateState.progress).filter((item) => item.lastRating === "known").length);
  elements.dueCount.textContent = String(cards.filter((card) => isDue(card)).length);
}

function renderCard() {
  const card = session.card;
  elements.prompt.textContent = card.prompt;
  elements.deckLabel.textContent = (card.deck ?? "Мои карточки").toUpperCase();
  elements.cardCounter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
  elements.answer.textContent = session.visibleAnswer ?? "";
  elements.answerPanel.hidden = !session.isRevealed;
  elements.revealButton.hidden = session.isRevealed;
  updateStats();
}

function currentExerciseBlock() {
  return LESSON_ONE_BLOCKS.find((block) => block.id === currentExerciseBlockId);
}

function updateExerciseStats() {
  const progress = privateState.exerciseProgress;
  elements.exerciseCorrectCount.textContent = String(Object.values(progress.attempts).filter((attempt) => attempt.correct).length);
  elements.exerciseRetryCount.textContent = String(progress.retryQueue.length);
  elements.exerciseBoostCount.textContent = String(progress.boostedIds.length);
}

function showExerciseRowResult(row, result, reveal) {
  row.classList.toggle("is-correct", result.isCorrect);
  row.classList.toggle("is-wrong", !result.isCorrect);
  row.querySelector(".exercise-row-status").textContent = result.isCorrect ? "Верно ✓" : result.isAnswered ? "Пока нет ✕" : "Введите ответ ✕";
  const correction = row.querySelector(".exercise-row-correction");
  const showCorrection = reveal && !result.isCorrect;
  correction.hidden = !showCorrection;
  if (showCorrection) {
    correction.querySelector("strong").textContent = `Правильный ответ: ${result.canonicalAnswer}`;
    correction.querySelector("p").textContent = result.explanation;
  }
}

function createExerciseRow(exercise, position) {
  const row = document.createElement("div");
  row.className = "exercise-row";
  row.dataset.exerciseId = exercise.id;
  const heading = document.createElement("div");
  heading.className = "exercise-row-heading";
  const copy = describeExerciseRow(exercise, position);
  const copyPanel = document.createElement("div");
  copyPanel.className = "exercise-row-copy";
  const prompt = document.createElement("label");
  const inputId = `exercise-answer-${exercise.id}`;
  prompt.htmlFor = inputId;
  prompt.textContent = copy.label;
  const instruction = document.createElement("span");
  instruction.className = "exercise-row-instruction";
  instruction.textContent = copy.instruction;
  copyPanel.append(prompt, instruction);
  const boost = document.createElement("button");
  boost.type = "button";
  boost.className = "boost-button row-boost";
  const isBoosted = privateState.exerciseProgress.boostedIds.includes(exercise.id);
  boost.setAttribute("aria-pressed", String(isBoosted));
  boost.setAttribute("aria-label", `${isBoosted ? "Отключить" : "Включить"} Boost: ${exercise.prompt}`);
  boost.textContent = isBoosted ? "★" : "☆";
  heading.append(copyPanel, boost);
  const input = document.createElement("input");
  input.id = inputId;
  input.lang = "fr";
  input.autocomplete = "off";
  input.setAttribute("autocapitalize", "sentences");
  input.spellcheck = true;
  input.maxLength = 180;
  const status = document.createElement("p");
  status.className = "exercise-row-status";
  status.setAttribute("aria-live", "polite");
  const correction = document.createElement("div");
  correction.className = "exercise-row-correction";
  correction.hidden = true;
  correction.append(document.createElement("strong"), document.createElement("p"));
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    showExerciseRowResult(row, gradeExerciseLine(exercise, input.value, false), false);
    const inputs = [...elements.exerciseRows.querySelectorAll("input")];
    inputs[inputs.indexOf(input) + 1]?.focus();
  });
  boost.addEventListener("click", () => {
    const exerciseProgress = toggleExerciseBoost(privateState.exerciseProgress, exercise.id);
    if (!persistPrivateState({ exerciseProgress }, elements.exerciseSaveError)) return;
    const enabled = exerciseProgress.boostedIds.includes(exercise.id);
    boost.setAttribute("aria-pressed", String(enabled));
    boost.setAttribute("aria-label", `${enabled ? "Отключить" : "Включить"} Boost: ${exercise.prompt}`);
    boost.textContent = enabled ? "★" : "☆";
    updateExerciseStats();
  });
  row.append(heading, input, status, correction);
  return row;
}

function renderExerciseBlock() {
  const block = currentExerciseBlock();
  const blockIndex = LESSON_ONE_BLOCKS.findIndex((item) => item.id === block.id);
  const visibleIds = exerciseVisibleIds ?? block.exerciseIds;
  elements.exerciseCounter.textContent = `${String(blockIndex + 1).padStart(2, "0")} / ${String(LESSON_ONE_BLOCKS.length).padStart(2, "0")}`;
  elements.exerciseBlockTitle.textContent = exerciseVisibleIds ? "Исправляем ошибки" : block.title;
  elements.exerciseInstruction.textContent = exerciseVisibleIds ? "Оставлены только строки, которые нужно исправить" : block.instruction;
  elements.exerciseRows.replaceChildren();
  visibleIds.forEach((id, index) => elements.exerciseRows.append(createExerciseRow(exerciseMap.get(id), index + 1)));
  elements.exerciseCheckAll.hidden = false;
  elements.exerciseRetryWrong.hidden = true;
  elements.exerciseNextBlock.hidden = true;
  elements.exerciseSaveError.hidden = true;
  updateExerciseStats();
}

function checkExerciseBlock() {
  const block = currentExerciseBlock();
  const visibleIds = exerciseVisibleIds ?? block.exerciseIds;
  const answers = {};
  for (const row of elements.exerciseRows.querySelectorAll(".exercise-row")) {
    answers[row.dataset.exerciseId] = row.querySelector("input").value.trim();
  }
  const result = gradeExerciseBlock({ ...block, exerciseIds: visibleIds }, exerciseMap, answers, true);
  let exerciseProgress = privateState.exerciseProgress;
  for (const rowResult of result.rows) {
    exerciseProgress = recordExerciseAttempt(exerciseProgress, rowResult.id, answers[rowResult.id], rowResult.isCorrect);
    const row = elements.exerciseRows.querySelector(`[data-exercise-id="${rowResult.id}"]`);
    showExerciseRowResult(row, rowResult, true);
    if (rowResult.isCorrect) row.querySelector("input").disabled = true;
  }
  if (!persistPrivateState({ exerciseProgress }, elements.exerciseSaveError)) return;
  updateExerciseStats();
  elements.exerciseCheckAll.hidden = true;
  elements.exerciseRetryWrong.hidden = result.isComplete;
  elements.exerciseNextBlock.hidden = !result.isComplete;
}

function currentPronunciationItem() {
  return PRONUNCIATION_ITEMS.find((item) => item.id === currentPronunciationId);
}

function updatePronunciationStats() {
  const progress = privateState.pronunciationProgress;
  elements.pronunciationKnownCount.textContent = String(Object.values(progress.ratings).filter((rating) => rating.rating === "known").length);
  elements.pronunciationDueCount.textContent = String(Object.values(progress.ratings).filter((rating) => rating.rating === "repeat" || rating.dueAt <= Date.now()).length);
  elements.pronunciationBoostCount.textContent = String(progress.boostedIds.length);
}

function renderPronunciation() {
  const item = currentPronunciationItem();
  const module = pronunciationModuleMap.get(item.moduleId);
  const index = PRONUNCIATION_ITEMS.findIndex((candidate) => candidate.id === item.id);
  const isBoosted = privateState.pronunciationProgress.boostedIds.includes(item.id);
  elements.pronunciationCounter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(PRONUNCIATION_ITEMS.length).padStart(2, "0")}`;
  elements.pronunciationModule.textContent = module.title;
  elements.pronunciationPattern.textContent = item.pattern;
  elements.pronunciationExplanation.textContent = item.explanation;
  elements.pronunciationModelWord.textContent = item.modelWord;
  elements.pronunciationPracticeWords.replaceChildren();
  item.practiceWords.forEach((word) => {
    const entry = document.createElement("li");
    entry.textContent = word;
    elements.pronunciationPracticeWords.append(entry);
  });
  elements.pronunciationBilan.textContent = module.bilan.text;
  elements.pronunciationBoost.setAttribute("aria-pressed", String(isBoosted));
  elements.pronunciationBoost.textContent = isBoosted ? "★ Boost включён" : "☆ Boost";
  elements.pronunciationSaveError.hidden = true;
  updatePronunciationStats();
}

function setMode(mode, { focus = false, persist = true } = {}) {
  const selected = modes.find((item) => item.id === mode) ?? modes[0];
  modes.forEach((item) => {
    const isSelected = item.id === selected.id;
    item.tab.setAttribute("aria-selected", String(isSelected));
    item.tab.tabIndex = isSelected ? 0 : -1;
    item.panel.hidden = !isSelected;
  });
  elements.practiceActions.hidden = selected.id !== "cards";
  if (selected.id === "pronunciation") renderPronunciation();
  if (selected.id === "exercises" && shouldInitializeExerciseView(elements.exerciseRows.childElementCount)) renderExerciseBlock();
  if (persist) {
    const error = selected.id === "pronunciation" ? elements.pronunciationSaveError : selected.id === "exercises" ? elements.exerciseSaveError : elements.practiceSaveError;
    persistPrivateState({ preferences: { ...privateState.preferences, activeMode: selected.id } }, error);
  }
  if (focus) selected.tab.focus();
}

function moveToNextCard() {
  const nextIndex = nextDueIndex(cards, privateState.progress, currentIndex);
  if (nextIndex === -1) {
    elements.deckLabel.textContent = "ЗАНЯТИЕ ЗАВЕРШЕНО";
    document.querySelector("#practice-title").textContent = "На сегодня всё";
    elements.prompt.textContent = "Отличная работа. Карточки вернутся, когда подойдёт время повторения.";
    elements.answerPanel.hidden = true;
    elements.revealButton.hidden = true;
    elements.cardCounter.textContent = "✓";
    updateStats();
    return;
  }
  currentIndex = nextIndex;
  session = createSession(cards[currentIndex]);
  renderCard();
}

async function speakWithBackend(text) {
  if (!TTS_BACKEND_URL) return false;
  const response = await fetch(TTS_BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ text, language: "fr-FR", voiceStyle: "calm-male" }),
  });
  if (!response.ok) throw new Error(`TTS backend failed: ${response.status}`);
  const blob = await response.blob();
  await new Audio(URL.createObjectURL(blob)).play();
  return true;
}

function speakWithDevice(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = 0.88;
  utterance.pitch = 0.92;
  const voice = chooseFrenchVoice(window.speechSynthesis.getVoices());
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

async function speakFrench(text) {
  try {
    if (await speakWithBackend(text)) return;
  } catch (error) {
    console.warn("Protected TTS unavailable; using the device voice.", error);
  }
  speakWithDevice(text);
}

elements.revealButton.addEventListener("click", () => {
  session = revealCard(session);
  renderCard();
});
modes.forEach((mode) => mode.tab.addEventListener("click", () => setMode(mode.id)));
document.querySelector(".mode-switch").addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const current = modes.findIndex((mode) => mode.tab === document.activeElement);
  let next = current;
  if (event.key === "ArrowLeft") next = (current - 1 + modes.length) % modes.length;
  if (event.key === "ArrowRight") next = (current + 1) % modes.length;
  if (event.key === "Home") next = 0;
  if (event.key === "End") next = modes.length - 1;
  setMode(modes[next].id, { focus: true });
});

elements.exerciseCheckAll.addEventListener("click", checkExerciseBlock);
elements.exerciseRetryWrong.addEventListener("click", () => {
  const block = currentExerciseBlock();
  exerciseVisibleIds = block.exerciseIds.filter((id) => privateState.exerciseProgress.retryQueue.includes(id));
  renderExerciseBlock();
  elements.exerciseRows.querySelector("input")?.focus();
});
elements.exerciseNextBlock.addEventListener("click", () => {
  if (visitedExerciseBlockIds.size >= LESSON_ONE_BLOCKS.length) visitedExerciseBlockIds.clear();
  currentExerciseBlockId = selectNextExerciseBlockId(
    LESSON_ONE_BLOCKS,
    privateState.exerciseProgress,
    currentExerciseBlockId,
    visitedExerciseBlockIds,
  );
  visitedExerciseBlockIds.add(currentExerciseBlockId);
  exerciseVisibleIds = null;
  renderExerciseBlock();
  elements.exerciseRows.querySelector("input")?.focus();
});

elements.pronunciationListen.addEventListener("click", () => speakFrench(currentPronunciationItem().audioText));
elements.pronunciationListenBilan.addEventListener("click", () => speakFrench(pronunciationModuleMap.get(currentPronunciationItem().moduleId).bilan.audioText));
elements.pronunciationBoost.addEventListener("click", () => {
  const pronunciationProgress = togglePronunciationBoost(privateState.pronunciationProgress, currentPronunciationId);
  if (!persistPrivateState({ pronunciationProgress }, elements.pronunciationSaveError)) return;
  renderPronunciation();
});

function rateCurrentPronunciation(rating) {
  const pronunciationProgress = ratePronunciation(privateState.pronunciationProgress, currentPronunciationId, rating);
  if (!persistPrivateState({ pronunciationProgress }, elements.pronunciationSaveError)) return;
  if (visitedPronunciationIds.size >= PRONUNCIATION_ITEMS.length) visitedPronunciationIds.clear();
  currentPronunciationId = selectNextPronunciationItemId(
    PRONUNCIATION_ITEMS,
    privateState.pronunciationProgress,
    currentPronunciationId,
    Date.now(),
    visitedPronunciationIds,
  );
  visitedPronunciationIds.add(currentPronunciationId);
  renderPronunciation();
}

elements.pronunciationRepeat.addEventListener("click", () => rateCurrentPronunciation("repeat"));
elements.pronunciationKnown.addEventListener("click", () => rateCurrentPronunciation("known"));
elements.speakButton.addEventListener("click", () => {
  if (session.canSpeak) speakFrench(session.card.answer);
});
elements.ratingButtons.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-rating]");
  if (!button || !session.canRate) return;
  const progress = { ...privateState.progress, [session.card.id]: rateCard(privateState.progress[session.card.id], button.dataset.rating) };
  if (!persistPrivateState({ progress }, elements.practiceSaveError)) return;
  moveToNextCard();
});

elements.addCardButton.addEventListener("click", () => elements.addCardDialog.showModal());
elements.installButton.addEventListener("click", () => elements.installDialog.showModal());
elements.closeAddCard.addEventListener("click", () => {
  elements.saveError.hidden = true;
  elements.addCardDialog.close();
});
elements.addCardForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = elements.newPrompt.value.trim();
  const answer = elements.newAnswer.value.trim();
  if (!prompt || !answer) return;
  const id = `private-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
  const newCard = { id, prompt, answer, deck: "Мои карточки" };
  if (!persistPrivateState({ cards: [...privateState.cards, newCard] }, elements.saveError)) return;
  cards = [...publicCards, ...privateState.cards];
  currentIndex = cards.length - 1;
  session = createSession(newCard);
  elements.addCardForm.reset();
  elements.addCardDialog.close();
  renderCard();
});

elements.shareButton.addEventListener("click", async () => {
  const shareData = { title: "Французский Соловья", text: "Карточки и уроки французского от Solavey RS", url: window.location.href };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch (error) {
      if (error.name !== "AbortError") console.warn(error);
    }
  } else {
    await navigator.clipboard?.writeText(window.location.href);
    elements.shareButton.textContent = "✓";
    window.setTimeout(() => { elements.shareButton.textContent = "↗"; }, 1500);
  }
});

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
window.speechSynthesis?.addEventListener?.("voiceschanged", () => chooseFrenchVoice(window.speechSynthesis.getVoices()));

renderCard();
setMode(privateState.preferences.activeMode, { persist: false });
