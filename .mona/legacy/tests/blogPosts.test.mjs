import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const loadBlog = (locale) => {
  const filePath = path.join(repoRoot, `src/content/${locale}/blog.json`);
  return JSON.parse(readFileSync(filePath, 'utf-8'));
};

const localesToCheck = ['pt', 'en'];

const expectedKeys = ['content', 'cover', 'date', 'excerpt', 'id', 'slug', 'tags', 'title'];

localesToCheck.forEach((locale) => {
  test(`blog posts for ${locale} include required fields`, () => {
    const blog = loadBlog(locale);
    assert.ok(Array.isArray(blog.posts), 'posts array should exist');
    assert.ok(blog.posts.length > 0, 'posts array should not be empty');

    blog.posts.forEach((post) => {
      const keys = Object.keys(post).sort();
      assert.deepStrictEqual(keys, expectedKeys, `${locale} post keys should match expected structure`);
      assert.ok(post.slug.length > 0, `${locale} post should have slug`);
      assert.ok(post.cover.startsWith('/images/blog/'), `${locale} post should include cover path`);
      assert.ok(post.tags.length > 0, `${locale} post should list at least one tag`);
      assert.ok(post.content.length > 50, `${locale} post should include markdown content`);
    });
  });
});

test('blog fallback metadata is present and missing posts return undefined', () => {
  const ptBlog = loadBlog('pt');
  const enBlog = loadBlog('en');

  const findPost = (blog, slug) => blog.posts.find((post) => post.slug === slug);

  assert.strictEqual(findPost(ptBlog, 'nao-existe'), undefined, 'PT should return undefined for missing slug');
  assert.strictEqual(findPost(enBlog, 'does-not-exist'), undefined, 'EN should return undefined for missing slug');

  ['title', 'message', 'cta'].forEach((key) => {
    assert.ok(ptBlog.notFound?.[key], `PT notFound.${key} should exist`);
    assert.ok(enBlog.notFound?.[key], `EN notFound.${key} should exist`);
  });
});
