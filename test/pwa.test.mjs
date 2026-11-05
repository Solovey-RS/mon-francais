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
  assert.match(worker, /\.\/index\.html/);
  assert.match(worker, /\.\/src\/app\.js/);
  assert.doesNotMatch(worker, /localStorage|private\.v1|Campus|Ruslan/i);
});

test("public source contains no private lesson identifiers or API keys", async () => {
  const files = await Promise.all([
    read("index.html"),
    read("src/app.js"),
    read("src/core.js"),
    read("sw.js"),
  ]);
  const source = files.join("\n");
  assert.doesNotMatch(source, /Campus A1|Je m'appelle Ruslan/i);
  assert.doesNotMatch(source, /sk-[A-Za-z0-9_-]{20,}/);
});
