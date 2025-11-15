import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const files = [
  {
    path: "app/globals.css",
    tokens: [
      "--boteco-primary",
      "--boteco-secondary",
      "--boteco-neutral-0",
      "--depth-surface",
      "--depth-overlay",
      "--shadow-lg",
      "--container",
    ],
  },
  {
    path: "legacy/src/styles/globals.css",
    tokens: [
      "--boteco-primary",
      "--boteco-emerald",
      "--boteco-highlight",
      "--depth-elevated",
      "--sidebar-primary",
      "@theme inline",
    ],
  },
];

for (const file of files) {
  test(`design tokens available in ${file.path}`, async () => {
    const content = await readFile(file.path, "utf8");
    for (const token of file.tokens) {
      assert.ok(
        content.includes(token),
        `${token} should be defined in ${file.path}`
      );
    }
  });
}
