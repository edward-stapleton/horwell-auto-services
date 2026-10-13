# Horwell Auto Services

Landing page for Horwell Auto Services Limited, a family run garage at Unit 1 Wheelers Rise, Croughton, Brackley NN13 5ND.

Plain HTML and CSS with no build step. It's hosted on GitHub Pages.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page, plus a small script for the appointment email link and the open/closed badge |
| `styles.css` | All styles. Colours are set as variables at the top, with a dark-mode block underneath |
| `assets/logo.svg`, `assets/logo-dark.svg` | Logo rebuilt from the garage sign (lettering converted to outlines) |
| `assets/og-image.png` | Preview image shown when the link is shared |
| `assets/favicon.svg`, `apple-touch-icon.png` | Browser tab and home screen icons |
| `assets/fonts/` | Archivo (SIL Open Font License), served from the site |

## Common edits

- **Reviews:** in `index.html`, each review is a `<figure class="review">` inside `.reviews__list`. The first one gets `review--featured` and is shown large. Keep quotes to about 3 lines, and credit them with first name and surname initial only.
- **Opening hours:** update the table in `index.html`, the `OPEN` / `CLOSE` values in the script at the bottom, and `openingHoursSpecification` in the JSON-LD block in `<head>`.
- **Appointment email:** the recipient, subject and body template are set in the script at the bottom of `index.html`.

## Preview locally

```bash
python3 -m http.server 4321
```

Then open http://localhost:4321.

To see the badge at a different time, run this in the browser console:

```js
horwellRenderStatus(new Date('2026-10-17T10:00:00Z'))
```

## Deploy

In the repo settings, enable GitHub Pages with **Deploy from a branch**, set to `main` / root. To use a custom domain, add a `CNAME` file containing the domain and point its DNS at GitHub Pages.

## Password-protected preview

A preview is live at https://edwardstapleton.co.uk/horwell/. It's served from the `personal-site` repo (`public/horwell/`), the same way as the Place pitch deck.

The whole site is encrypted (AES-GCM, with the key derived from the password using PBKDF2), so nothing readable is published without the password. `preview/index.html` is the Horwell-branded password screen. The password isn't case-sensitive, and each device remembers it after the first visit.

After any change to the site, rebuild and republish:

```bash
HORWELL_PREVIEW_PASSWORD='the password' node scripts/build-preview.mjs
```

```bash
sh scripts/publish-preview.sh
```

The publish script works in a fresh temporary clone of `personal-site`, so it never touches your local copy. The password itself is never committed. Enter it in capitals when building, because the password screen converts whatever is typed to capitals before checking it.
