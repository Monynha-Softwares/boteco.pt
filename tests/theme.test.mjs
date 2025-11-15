import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const readSource = (relativePath) => {
  const filePath = path.join(repoRoot, relativePath);
  return readFileSync(filePath, 'utf-8');
};

const themeProviderSource = readSource('src/components/ThemeProvider.tsx');
const themeToggleSource = readSource('src/components/ThemeToggle.tsx');
const globalsCss = readSource('src/globals.css');

test('theme provider defaults to class-based theming with transitions', () => {
  assert.match(
    themeProviderSource,
    /attribute\s*=\s*"class"/,
    'ThemeProvider should default to using the class attribute',
  );
  assert.match(
    themeProviderSource,
    /disableTransitionOnChange\s*=\s*true/,
    'ThemeProvider should disable transition flashes when switching',
  );
  assert.match(
    themeProviderSource,
    /enableColorScheme\s*=\s*true/,
    'ThemeProvider should expose the active color scheme to the browser',
  );
});

test('theme toggle exposes radio options for light, dark and system', () => {
  assert.match(
    themeToggleSource,
    /DropdownMenuRadioGroup/,
    'ThemeToggle should group the theme options in a radio group',
  );
  ['light', 'dark', 'system'].forEach((option) => {
    assert.match(
      themeToggleSource,
      new RegExp(`DropdownMenuRadioItem\\s+value=\\"${option}\\"`),
      `ThemeToggle should include a radio item for ${option}`,
    );
  });
});

test('global body styles animate background and foreground changes', () => {
  assert.match(
    globalsCss,
    /body\s*\{[^}]*transition-colors[^}]*\}/s,
    'Body styles should include a transition for color changes',
  );
  assert.match(
    globalsCss,
    /body\s*\{[^}]*min-h-screen[^}]*\}/s,
    'Body styles should ensure the viewport stays filled in both themes',
  );
});
