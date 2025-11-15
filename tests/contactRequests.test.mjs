import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const loadJson = (relativePath) => {
  const filePath = path.join(repoRoot, relativePath);
  return JSON.parse(readFileSync(filePath, 'utf-8'));
};

const locales = ['pt', 'en', 'es', 'fr'];
const painelContent = Object.fromEntries(locales.map((locale) => [locale, loadJson(`src/content/${locale}/painel.json`)]));
const contactRequests = loadJson('public/data/contact-requests.json');

const uniqueChannels = new Set(contactRequests.map((request) => request.channel));
const uniqueStatuses = new Set(contactRequests.map((request) => request.status));

const isValidIsoDate = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
};

test('contact requests mock contains structured entries', () => {
  assert.ok(Array.isArray(contactRequests), 'contact requests should be an array');
  assert.ok(contactRequests.length > 0, 'contact requests array should not be empty');

  contactRequests.forEach((request, index) => {
    assert.ok(typeof request.id === 'string' && request.id.length > 0, `request ${index} should have an id`);
    assert.ok(typeof request.name === 'string' && request.name.length > 0, `request ${index} should have a name`);
    assert.ok(typeof request.email === 'string' && request.email.includes('@'), `request ${index} should have an email`);
    assert.ok(typeof request.channel === 'string' && request.channel.length > 0, `request ${index} should have a channel`);
    assert.ok(typeof request.status === 'string' && request.status.length > 0, `request ${index} should have a status`);
    assert.ok(isValidIsoDate(request.createdAt), `request ${index} should have a valid createdAt date`);

    if (request.respondedAt) {
      assert.ok(isValidIsoDate(request.respondedAt), `request ${index} should have a valid respondedAt date when present`);
    }
  });
});

test('painel cards stay aligned across locales', () => {
  const referenceCards = painelContent.pt.cards;
  locales.forEach((locale) => {
    const cards = painelContent[locale].cards;
    assert.ok(Array.isArray(cards), `${locale} cards should be an array`);
    assert.strictEqual(cards.length, referenceCards.length, `${locale} should have ${referenceCards.length} cards`);

    cards.forEach((card, index) => {
      assert.ok(card.id, `${locale} card ${index} should declare an id`);
      assert.ok(card.title, `${locale} card ${card.id} should have a title`);
      assert.ok(card.description, `${locale} card ${card.id} should have a description`);
      assert.strictEqual(card.id, referenceCards[index].id, `${locale} card order should match reference`);
    });
  });
});

test('painel translations cover contact request channels and statuses', () => {
  locales.forEach((locale) => {
    const { leadInsights } = painelContent[locale];
    const channelLabels = leadInsights?.channels?.labels ?? {};
    const statusLabels = leadInsights?.status?.labels ?? {};

    uniqueChannels.forEach((channel) => {
      assert.ok(channelLabels[channel], `${locale} should translate channel ${channel}`);
    });

    uniqueStatuses.forEach((status) => {
      assert.ok(statusLabels[status], `${locale} should translate status ${status}`);
    });
  });
});
