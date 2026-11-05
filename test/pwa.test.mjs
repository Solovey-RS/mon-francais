import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("page carries the French Solovey brand and starts with answer controls hidden", async () => {
  const html = await read("index.html");
  assert.match(html, /Французский Соловья/);
  assert.match(html, /SOLAVEY RS/);
  assert.match(html, /id="answer-panel"[^>]*hidden/);
  assert.match(html, /id="reveal-button"/);
  assert.match(html, /id="close-add-card"[^>]*type="button"/);
  assert.match(html, /id="save-error"[^>]*hidden/);
  assert.match(html, /id="practice-save-error"[^>]*hidden/);
});

test("page exposes three accessible learning modes", async () => {
  const html = await read("index.html");
  assert.match(html, /id="practice-mode"[^>]*aria-selected="true"/);
  assert.match(html, /id="pronunciation-mode"[^>]*aria-selected="false"/);
  assert.match(html, /id="exercise-mode"[^>]*aria-selected="false"/);
  assert.match(html, /id="pronunciation-panel"[^>]*hidden/);
  assert.match(html, /id="exercise-panel"[^>]*hidden/);
  assert.match(html, /Урок 0 <span class="mode-badge">Звуки<\/span>/);
  assert.match(html, /Урок 1 <span class="mode-badge">Перевод<\/span>/);
});

test("Lesson 1 shell supports block checking, retry, and per-row feedback", async () => {
  const html = await read("index.html");
  assert.match(html, /id="exercise-rows"[^>]*aria-live="polite"/);
  assert.match(html, /id="exercise-check-all"[^>]*>Проверить всё/);
  assert.match(html, /id="exercise-retry-wrong"[^>]*hidden/);
  assert.match(html, /id="exercise-next-block"[^>]*hidden/);
  assert.doesNotMatch(html, /Je suis français|Comment tu t’appelles/);
});

test("Lesson 0 shell exposes model audio, Bilan, ratings, and Boost", async () => {
  const html = await read("index.html");
  assert.match(html, /id="pronunciation-pattern"/);
  assert.match(html, /id="pronunciation-model-word"/);
  assert.match(html, /id="pronunciation-listen"/);
  assert.match(html, /id="pronunciation-practice-words"/);
  assert.match(html, /id="pronunciation-bilan"/);
  assert.match(html, /id="pronunciation-repeat"/);
  assert.match(html, /id="pronunciation-known"/);
  assert.match(html, /id="pronunciation-boost"/);
});

test("exercise modules are loaded without unsafe HTML rendering", async () => {
  const app = await read("src/app.js");
  assert.match(app, /from "\.\/exercise-core\.js"/);
  assert.match(app, /from "\.\/exercises\.js"/);
  assert.match(app, /from "\.\/pronunciation-core\.js"/);
  assert.match(app, /from "\.\/pronunciation\.js"/);
  assert.doesNotMatch(app, /\.innerHTML\s*=/);
});

test("all deployable asset references are relative for GitHub Pages subpaths", async () => {
  const html = await read("index.html");
  assert.doesNotMatch(html, /(?:src|href)="\/(?!\/)/);
  assert.match(html, /href="\.\/manifest\.webmanifest"/);
  assert.match(html, /src="\.\/src\/app\.js"/);
});

test("manifest is installable and branded", async () => {
  const manifest = JSON.parse(await read("manifest.webmanifest"));
  assert.equal(manifest.name, "Французский Соловья");
  assert.equal(manifest.short_name, "Соловей FR");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.ok(manifest.icons.some((icon) => icon.purpose.includes("maskable")));
});

test("service worker caches only the public application shell", async () => {
  const worker = await read("sw.js");
  assert.match(worker, /french-solovey-v3/);
  assert.match(worker, /\.\/index\.html/);
  assert.match(worker, /\.\/src\/app\.js/);
  assert.match(worker, /\.\/src\/exercise-core\.js/);
  assert.match(worker, /\.\/src\/exercises\.js/);
  assert.match(worker, /\.\/src\/pronunciation-core\.js/);
  assert.match(worker, /\.\/src\/pronunciation\.js/);
  assert.doesNotMatch(worker, /localStorage|private\.v1|Campus|Ruslan/i);
});

test("README documents both lessons, block checks, TTS limits, and local persistence", async () => {
  const readme = await read("README.md");
  assert.match(readme, /Lesson 0|Урок 0/);
  assert.match(readme, /Lesson 1|Урок 1/);
  assert.match(readme, /Enter.*without.*answer/is);
  assert.match(readme, /Check all|Проверить всё/i);
  assert.match(readme, /device.*voice|голос.*устройств/is);
  assert.match(readme, /isolated phoneme|изолированн.*фонем/is);
  assert.match(readme, /incorrect.*retry|ошиб.*повтор/is);
  assert.match(readme, /Boost.*until.*turn.*off/is);
  assert.match(readme, /localStorage/);
});

test("public source contains no private lesson identifiers or API keys", async () => {
  const files = await Promise.all([
    read("index.html"),
    read("src/app.js"),
    read("src/core.js"),
    read("src/exercises.js"),
    read("src/pronunciation.js"),
    read("sw.js"),
  ]);
  const source = files.join("\n");
  assert.doesNotMatch(source, /Campus A1|Je m'appelle Ruslan/i);
  assert.doesNotMatch(source, /A0\.pdf|drive\.google\.com|source(?:File|Document)Id/i);
  assert.doesNotMatch(source, /sk-[A-Za-z0-9_-]{20,}/);
});
