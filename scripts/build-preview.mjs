// Builds the password-protected preview of the site into preview/.
//
//   HORWELL_PREVIEW_PASSWORD='the password' node scripts/build-preview.mjs
//
// The whole site (index.html with styles, font, logos and icons inlined) is
// encrypted with AES-GCM using a key derived from the password, and written to
// preview/site.enc.json. preview/index.html is the Horwell-branded password
// screen: it derives the same key from what the visitor types and decrypts in
// the browser. A wrong password fails AES-GCM authentication, and nothing
// readable is published without the password.

import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'preview');
const ITERATIONS = 600_000; // PBKDF2-SHA256, OWASP 2023 guidance

const b64 = (buf) => Buffer.from(buf).toString('base64');
const dataUri = async (file, mime) => `data:${mime};base64,${b64(await readFile(path.join(ROOT, file)))}`;

function replaceOnce(html, from, to) {
  if (!html.includes(from)) throw new Error(`Expected to find: ${from}`);
  return html.replace(from, to);
}

async function getPassword() {
  if (process.env.HORWELL_PREVIEW_PASSWORD) return process.env.HORWELL_PREVIEW_PASSWORD;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const pw = await rl.question('Preview password: ');
  rl.close();
  return pw;
}

// One self-contained HTML document: no requests back to the server for site files.
async function bundleSite() {
  let html = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  let css = await readFile(path.join(ROOT, 'styles.css'), 'utf8');

  css = replaceOnce(css, 'url("assets/fonts/archivo-latin-wght-normal.woff2")',
    `url("${await dataUri('assets/fonts/archivo-latin-wght-normal.woff2', 'font/woff2')}")`);

  html = replaceOnce(html, '<link rel="stylesheet" href="styles.css">', `<style>\n${css}\n</style>`);
  html = html.replace(/\s*<link rel="preload"[^>]*>/, '');
  html = html.replace(/\s*<meta property="og:image"[^>]*>/, '');
  html = replaceOnce(html, 'href="assets/favicon.svg"', `href="${await dataUri('assets/favicon.svg', 'image/svg+xml')}"`);
  html = replaceOnce(html, 'href="apple-touch-icon.png"', `href="${await dataUri('apple-touch-icon.png', 'image/png')}"`);
  html = replaceOnce(html, 'srcset="assets/logo-dark.svg"', `srcset="${await dataUri('assets/logo-dark.svg', 'image/svg+xml')}"`);
  html = replaceOnce(html, 'src="assets/logo.svg"', `src="${await dataUri('assets/logo.svg', 'image/svg+xml')}"`);
  html = replaceOnce(html, '<meta name="color-scheme"', '<meta name="robots" content="noindex, nofollow">\n  <meta name="color-scheme"');
  return html;
}

const password = await getPassword();
if (!password || password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const html = await bundleSite();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
  baseKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt'],
);
const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(html));

await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, 'site.enc.json'),
  JSON.stringify({ v: 1, kdf: 'PBKDF2-SHA256', iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), data: b64(ciphertext) }));

// Public files the password screen itself needs.
for (const f of ['assets/logo.svg', 'assets/logo-dark.svg', 'assets/favicon.svg', 'assets/fonts/archivo-latin-wght-normal.woff2']) {
  await copyFile(path.join(ROOT, f), path.join(OUT, path.basename(f)));
}
await copyFile(path.join(ROOT, 'apple-touch-icon.png'), path.join(OUT, 'apple-touch-icon.png'));

console.log(`Encrypted site written to preview/site.enc.json (${Math.round(ciphertext.byteLength / 1024)} KB).`);
