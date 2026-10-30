# Horwell Auto Services

Landing page for Horwell Auto Services Limited, a family run garage at Unit 1, Wheelers Rise, Croughton, Brackley NN13 5ND.

Plain HTML and CSS with no build step, hosted on GitHub Pages at https://www.horwell.co.uk.

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

## Analytics

PostHog (EU cloud), in the Stapleton Enterprises Limited organisation, shared with edwardstapleton.co.uk; filter by the `site` property (`horwell`). The token and setup are in the last script in `index.html`. It runs cookieless, so there's no consent banner, and only on www.horwell.co.uk, so the preview and localhost don't count. Add `?posthog-debug` to the URL to send events from anywhere, with logging in the console.

To stop your own visits being counted, open https://www.horwell.co.uk/?posthog-exclude once in each browser you use. That browser stays excluded until you open https://www.horwell.co.uk/?posthog-include. `?posthog-debug` still sends events from an excluded browser.

Conversion events, each with a `placement` property (`status_bar`, `hero` or `find_us`):

| Event | When |
| --- | --- |
| `appointment_request_clicked` | The Request an Appointment button |
| `phone_call_clicked` | Any of the phone links |
| `directions_clicked` | The Google Maps link |
| `facebook_clicked` | The Facebook link |

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

The site is live at https://www.horwell.co.uk. Every push to `main` deploys it to GitHub Pages through `.github/workflows/deploy.yml`, which publishes only the site files (not `preview/`, `scripts/` or this README). If you add a new top-level file the page needs, add it to the `cp` line in that workflow.

The repo's Pages settings use **GitHub Actions** as the source, with `www.horwell.co.uk` as the custom domain and HTTPS enforced. DNS is managed at GoDaddy: `www` is a CNAME to `edward-stapleton.github.io`, and the bare domain has A records for `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`, so it redirects to www.

## Password-protected preview

A preview is live at https://edwardstapleton.co.uk/horwell/. It's served from the `personal-site` repo (`public/horwell/`), the same way as the Place pitch deck.

The whole site is encrypted (AES-GCM, with the key derived from the password using PBKDF2), so nothing readable is published without the password. `preview/index.html` is the Horwell-branded password screen. The password isn't case-sensitive, and each device remembers it after the first visit.

After any change to the site, rebuild and republish:

```bash
node scripts/build-preview.mjs
```

```bash
sh scripts/publish-preview.sh
```

The publish script works in a fresh temporary clone of `personal-site`, so it never touches your local copy. The build reads the password from `.preview-password` in the repo root. That file is gitignored, so the password is never committed; on a new machine, create it with the password on one line. Keep it in capitals, because the password screen converts whatever is typed to capitals before checking it.
