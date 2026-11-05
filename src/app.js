import {
  chooseFrenchVoice,
  createSession,
  loadPrivateState,
  nextDueIndex,
  rateCard,
  revealCard,
  savePrivateState,
} from "./core.js";

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
};

let privateState = loadPrivateState(window.localStorage);
let cards = [...publicCards, ...privateState.cards];
let currentIndex = 0;
let session = createSession(cards[currentIndex]);

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
