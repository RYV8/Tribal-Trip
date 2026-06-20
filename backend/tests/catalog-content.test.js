const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { pathToFileURL } = require("node:url");

async function loadCatalogContent() {
  const contentPath = path.join(__dirname, "..", "..", "src", "data", "content.js");
  return import(pathToFileURL(contentPath).href);
}

test("bundled artifact catalogue keeps distinct production images", async () => {
  const { artifacts } = await loadCatalogContent();
  const artifactImages = artifacts.map((artifact) => artifact.image).filter(Boolean);
  const uniqueImages = new Set(artifactImages);

  assert.equal(artifactImages.length, artifacts.length);
  assert.ok(uniqueImages.size >= 10);
  assert.ok(!uniqueImages.has("/hero-grand-bassam.jpg"));
});
