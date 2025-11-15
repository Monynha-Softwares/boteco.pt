import assert from 'node:assert/strict';
import test from 'node:test';

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const ptContact = require('../src/content/pt/contact.json');
const enContact = require('../src/content/en/contact.json');
const esContact = require('../src/content/es/contact.json');
const frContact = require('../src/content/fr/contact.json');

const locales = {
  pt: ptContact,
  en: enContact,
  es: esContact,
  fr: frContact,
};

const requiredFormKeys = ['successDescription', 'errorDescription', 'submitting'];
const validationFields = {
  name: ['min', 'max'],
  email: ['invalid'],
  message: ['min', 'max'],
};

test('contact form translations expose complete validation messages', () => {
  for (const [locale, content] of Object.entries(locales)) {
    assert.ok(content?.form, `form block missing for locale ${locale}`);
    const { form } = content;

    for (const key of requiredFormKeys) {
      const value = form[key];
      assert.equal(typeof value, 'string', `${key} must be a string for locale ${locale}`);
      assert.ok(value.trim().length > 0, `${key} cannot be empty for locale ${locale}`);
    }

    const validation = form.validation;
    assert.ok(validation, `validation block missing for locale ${locale}`);

    for (const [field, rules] of Object.entries(validationFields)) {
      const fieldMessages = validation[field];
      assert.ok(fieldMessages, `validation messages missing for field ${field} in locale ${locale}`);

      for (const rule of rules) {
        const message = fieldMessages[rule];
        assert.equal(typeof message, 'string', `validation message for ${field}.${rule} must be string in locale ${locale}`);
        assert.ok(message.trim().length > 0, `validation message for ${field}.${rule} cannot be empty in locale ${locale}`);
      }
    }
  }
});
