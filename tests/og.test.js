// Link-preview check: og:video / twitter:player tags present, assets exist, MP4 under 5 MB.
// Run: node --test tests/og.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const ORIGIN = 'https://antigravity-explainer.vercel.app/';

const meta = (attr, key) => {
  const m = html.match(new RegExp(`<meta ${attr}="${key.replace(/[:.]/g, '\\$&')}" content="([^"]+)"`));
  return m && m[1];
};

test('og:video and twitter:player tags are present with absolute https URLs', () => {
  for (const key of ['og:video', 'og:video:secure_url', 'og:image']) {
    assert.ok(meta('property', key)?.startsWith(ORIGIN), `${key} must be an absolute URL on ${ORIGIN}`);
  }
  assert.strictEqual(meta('property', 'og:video:type'), 'video/mp4');
  assert.ok(meta('property', 'og:video:width'));
  assert.ok(meta('property', 'og:video:height'));
  assert.strictEqual(meta('name', 'twitter:card'), 'player');
  assert.ok(meta('name', 'twitter:player')?.startsWith(ORIGIN), 'twitter:player must be absolute https');
  assert.ok(meta('name', 'twitter:player:width'));
  assert.ok(meta('name', 'twitter:player:height'));
});

test('preview assets exist and the MP4 is under 5 MB', () => {
  for (const f of ['og/preview.mp4', 'og/preview.jpg', 'og/player.html']) {
    assert.ok(fs.existsSync(path.join(root, f)), `${f} missing`);
  }
  const size = fs.statSync(path.join(root, 'og/preview.mp4')).size;
  assert.ok(size > 0 && size < 5 * 1024 * 1024, `preview.mp4 is ${size} bytes, must be under 5 MB`);
});
