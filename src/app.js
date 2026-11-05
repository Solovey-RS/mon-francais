import {
  chooseFrenchVoice,
  createSession,
  loadPrivateState,
  nextDueIndex,
  rateCard,
  revealCard,
  savePrivateState,
} from "./core.js";
import {
  checkExerciseAnswer,
  recordExerciseAttempt,
  selectNextExerciseId,
  toggleExerciseBoost,
} from "./exercise-core.js";
import { LESSON_ONE_EXERCISES } from "./exercises.js";

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
  exerciseMode: document.querySelector("#exercise-mode"),
  practicePanel: document.querySelector("#practice-panel"),
  exercisePanel: document.querySelector("#exercise-panel"),
  practiceActions: document.querySelector("#practice-actions"),
  exerciseCounter: document.querySelector("#exercise-counter"),
  exerciseCorrectCount: document.querySelector("#exercise-correct-count"),
  exerciseRetryCount: document.querySelector("#exercise-retry-count"),
  exerciseBoostCount: document.querySelector("#exercise-boost-count"),
  exerciseTopic: document.querySelector("#exercise-topic"),
  exerciseBoost: document.querySelector("#exercise-boost"),
  exerciseInstruction: document.querySelector("#exercise-instruction"),
  exercisePrompt: document.querySelector("#exercise-prompt"),
  exerciseForm: document.querySelector("#exercise-form"),
  exerciseAnswer: document.querySelector("#exercise-answer"),
  exerciseSubmit: document.querySelector("#exercise-submit"),
  exerciseFeedback: document.querySelector("#exercise-feedback"),
  exerciseFeedbackStatus: document.querySelector("#exercise-feedback-status"),
  exerciseCanonical: document.querySelector("#exercise-canonical"),
  exerciseExplanation: document.querySelector("#exercise-explanation"),
  exerciseNext: document.querySelector("#exercise-next"),
  exerciseSaveError: document.querySelector("#exercise-save-error"),
};

let privateState = loadPrivateState(window.localStorage);
let cards = [...publicCards, ...privateState.cards];
let currentIndex = 0;
let session = createSession(cards[currentIndex]);
let currentExerciseId = selectNextExerciseId(
  LESSON_ONE_EXERCISES,
  privateState.exerciseProgress,
  null,
);

function isDue(card, now = Date.now()) {
  const dueAt = privateState.progress[card.id]?.dueAt;
  return !Number.isFinite(dueAt) || dueAt <= now;
}

function updateStats() {
  elements.cardCount.textContent = String(cards.length);
  elements.knownCount.textContent = String(
    Object.values(privateState.progress).filter((item) => item.lastRating === "known").length,
  );
  elements.dueCount.textContent = String(cards.filter((card) => isDue(card)).length);
}

function render() {
  const card = session.card;
  elements.prompt.textContent = card.prompt;
  elements.deckLabel.textContent = (card.deck ?? "Мои карточки").toUpperCase();
  elements.cardCounter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
  elements.answer.textContent = session.visibleAnswer ?? "";
  elements.answerPanel.hidden = !session.isRevealed;
  elements.revealButton.hidden = session.isRevealed;
  updateStats();
}

function currentExercise() {
  return LESSON_ONE_EXERCISES.find((exercise) => exercise.id === currentExerciseId);
}

function updateExerciseStats() {
  const progress = privateState.exerciseProgress;
  elements.exerciseCorrectCount.textContent = String(
    Object.values(progress.attempts).filter((attempt) => attempt.correct).length,
  );
  elements.exerciseRetryCount.textContent = String(progress.retryQueue.length);
  elements.exerciseBoostCount.textContent = String(progress.boostedIds.length);
}

function updateBoostButton(exercise) {
  const isBoosted = privateState.exerciseProgress.boostedIds.includes(exercise.id);
  elements.exerciseBoost.setAttribute("aria-pressed", String(isBoosted));
  elements.exerciseBoost.textContent = isBoosted ? "★ Boost включён" : "☆ Boost";
}

function renderExercise() {
  const exercise = currentExercise();
  const index = LESSON_ONE_EXERCISES.findIndex((item) => item.id === exercise.id);
  elements.exerciseCounter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(LESSON_ONE_EXERCISES.length).padStart(2, "0")}`;
  elements.exerciseTopic.textContent = exercise.topic;
  elements.exerciseInstruction.textContent = exercise.instruction;
  elements.exercisePrompt.textContent = exercise.prompt;
  elements.exerciseAnswer.value = "";
  elements.exerciseAnswer.disabled = false;
  elements.exerciseSubmit.hidden = false;
  elements.exerciseSubmit.textContent = "Проверить";
  elements.exerciseFeedback.hidden = true;
  elements.exerciseFeedback.classList.remove("is-wrong");
  elements.exerciseNext.hidden = true;
  elements.exerciseSaveError.hidden = true;
  updateBoostButton(exercise);
  updateExerciseStats();
}

function saveExerciseProgress(exerciseProgress) {
  const nextState = { ...privateState, exerciseProgress };
  if (!savePrivateState(window.localStorage, nextState)) {
    elements.exerciseSaveError.hidden = false;
    return false;
  }
  privateState = nextState;
  elements.exerciseSaveError.hidden = true;
  updateExerciseStats();
  return true;
}

function setMode(mode) {
  const showExercises = mode === "exercises";
  elements.practiceMode.setAttribute("aria-selected", String(!showExercises));
  elements.exerciseMode.setAttribute("aria-selected", String(showExercises));
  elements.practicePanel.hidden = showExercises;
  elements.practiceActions.hidden = showExercises;
  elements.exercisePanel.hidden = !showExercises;
  if (showExercises) {
    renderExercise();
    elements.exerciseAnswer.focus();
  }
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
  render();
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
  render();
});

elements.practiceMode.addEventListener("click", () => setMode("practice"));
elements.exerciseMode.addEventListener("click", () => setMode("exercises"));

elements.exerciseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const exercise = currentExercise();
  const answer = elements.exerciseAnswer.value.trim();
  if (!answer) return;

  const result = checkExerciseAnswer(exercise, answer);
  const progress = recordExerciseAttempt(
    privateState.exerciseProgress,
    exercise.id,
    answer,
    result.isCorrect,
  );
  if (!saveExerciseProgress(progress)) return;

  elements.exerciseFeedback.hidden = false;
  elements.exerciseFeedback.classList.toggle("is-wrong", !result.isCorrect);
  elements.exerciseFeedbackStatus.textContent = result.isCorrect
    ? "Верно — très bien !"
    : "Пока нет. Исправьте ответ и проверьте ещё раз.";
  elements.exerciseCanonical.textContent = result.canonicalAnswer;
  elements.exerciseExplanation.textContent = result.explanation;

  if (result.isCorrect) {
    elements.exerciseAnswer.disabled = true;
    elements.exerciseSubmit.hidden = true;
    elements.exerciseNext.hidden = false;
  } else {
    elements.exerciseSubmit.textContent = "Проверить снова";
    elements.exerciseAnswer.focus();
    elements.exerciseAnswer.select();
  }
});

elements.exerciseBoost.addEventListener("click", () => {
  const exercise = currentExercise();
  const progress = toggleExerciseBoost(privateState.exerciseProgress, exercise.id);
  if (!saveExerciseProgress(progress)) return;
  updateBoostButton(exercise);
});

elements.exerciseNext.addEventListener("click", () => {
  currentExerciseId = selectNextExerciseId(
    LESSON_ONE_EXERCISES,
    privateState.exerciseProgress,
    currentExerciseId,
  );
  renderExercise();
  elements.exerciseAnswer.focus();
});

elements.speakButton.addEventListener("click", () => {
  if (session.canSpeak) speakFrench(session.card.answer);
});

elements.ratingButtons.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-rating]");
  if (!button || !session.canRate) return;
  const nextState = {
    ...privateState,
    progress: {
      ...privateState.progress,
      [session.card.id]: rateCard(privateState.progress[session.card.id], button.dataset.rating),
    },
  };
  if (!savePrivateState(window.localStorage, nextState)) {
    elements.practiceSaveError.hidden = false;
    return;
  }
  elements.practiceSaveError.hidden = true;
  privateState = nextState;
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
  const nextState = { ...privateState, cards: [...privateState.cards, newCard] };
  if (!savePrivateState(window.localStorage, nextState)) {
    elements.saveError.hidden = false;
    return;
  }
  privateState = nextState;
  elements.saveError.hidden = true;
  cards = [...publicCards, ...privateState.cards];
  currentIndex = cards.length - 1;
  session = createSession(newCard);
  elements.addCardForm.reset();
  elements.addCardDialog.close();
  render();
});

elements.shareButton.addEventListener("click", async () => {
  const shareData = {
    title: "Французский Соловья",
    text: "Карточки французского от Solavey RS",
    url: window.location.href,
  };
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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}

window.speechSynthesis?.addEventListener?.("voiceschanged", () => {
  chooseFrenchVoice(window.speechSynthesis.getVoices());
});

render();
