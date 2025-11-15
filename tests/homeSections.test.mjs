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

const readSource = (relativePath) => {
  const filePath = path.join(repoRoot, relativePath);
  return readFileSync(filePath, 'utf-8');
};

const ptHome = loadJson('src/content/pt/home.json');
const enHome = loadJson('src/content/en/home.json');

const sectionsDepthExpectations = [
  ['src/components/home/HeroSection.tsx', 'Hero', 'depth="overlay"'],
  ['src/components/home/FeaturesSection.tsx', 'FeatureGrid', 'depth="surface"'],
  ['src/components/home/HowItWorksSection.tsx', 'Stepper', 'depth="overlay"'],
  ['src/components/home/PlansSection.tsx', 'PricingTable', 'depth="surface"'],
  ['src/components/home/TestimonialsSection.tsx', 'TestimonialCarousel', 'depth="surface"'],
  ['src/components/home/FaqSection.tsx', 'Faq', 'depth="overlay"'],
  ['src/components/home/FinalCtaSection.tsx', 'AnimatedSection', 'depth="overlay"'],
];

test('home content has hero translations for pt and en', () => {
  assert.ok(ptHome.hero?.title?.length > 0, 'PT hero title should exist');
  assert.ok(enHome.hero?.title?.length > 0, 'EN hero title should exist');
  assert.notStrictEqual(ptHome.hero.title, enHome.hero.title, 'Hero titles should be localized');
  assert.ok(ptHome.hero?.cta, 'PT hero CTA exists');
  assert.ok(enHome.hero?.cta, 'EN hero CTA exists');
});

test('feature lists stay in sync across locales', () => {
  assert.strictEqual(ptHome.features?.length, enHome.features?.length, 'Feature arrays should match length');
  ptHome.features.forEach((feature, index) => {
    assert.ok(feature.title, `PT feature ${index} has title`);
    assert.ok(enHome.features[index].title, `EN feature ${index} has title`);
  });
});

test('plans options stay in sync across locales', () => {
  assert.strictEqual(ptHome.plans?.options?.length, enHome.plans?.options?.length, 'Plan counts should match');
  ptHome.plans.options.forEach((plan, index) => {
    assert.ok(plan.features?.length > 0, `PT plan ${plan.name} has features`);
    assert.strictEqual(
      plan.features.length,
      enHome.plans.options[index].features.length,
      `Plan ${plan.name} should match feature count`
    );
  });
});

test('Reactbits sections apply expected depth variants', () => {
  sectionsDepthExpectations.forEach(([relativePath, componentName, expectedDepth]) => {
    const source = readSource(relativePath);
    assert.match(
      source,
      new RegExp(expectedDepth.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')),
      `${componentName} should include ${expectedDepth}`
    );
  });
});

test('Reactbits components are used in each section', () => {
  // Exclude FinalCtaSection (AnimatedSection) as it uses a custom animated wrapper instead of a direct reactbits component
  sectionsDepthExpectations.slice(0, -1).forEach(([relativePath, componentName]) => {
    const source = readSource(relativePath);
    assert.match(
      source,
      new RegExp(`<${componentName}[^>]*>`),
      `${relativePath} should render ${componentName}`
    );
  });
});
