#!/bin/sh
# Publishes the password-protected preview to edwardstapleton.co.uk/horwell/.
#
#   HORWELL_PREVIEW_PASSWORD='the password' node scripts/build-preview.mjs
#   sh scripts/publish-preview.sh
#
# The preview is served by the personal-site repo (an Astro site: files in
# public/ are deployed as-is by its GitHub Actions workflow). This script works
# in a fresh temporary clone of that repo, so any unpushed or uncommitted work
# in your own local copy is never touched or pushed.
#
# Only the password screen, its logo/font/icons and the ENCRYPTED site are
# copied. Run build-preview.mjs first whenever the site changes.

set -eu

REPO="https://github.com/edward-stapleton/personal-site.git"
DEST="public/horwell"
FILES="index.html site.enc.json logo.svg logo-dark.svg favicon.svg apple-touch-icon.png archivo-latin-wght-normal.woff2"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

for f in $FILES; do
  [ -f "$ROOT/preview/$f" ] || { echo "Missing preview/$f (run scripts/build-preview.mjs first)"; exit 1; }
done

git clone --quiet --depth 1 "$REPO" "$WORK/site"
rm -rf "$WORK/site/$DEST"
mkdir -p "$WORK/site/$DEST"
for f in $FILES; do
  cp "$ROOT/preview/$f" "$WORK/site/$DEST/$f"
done

cd "$WORK/site"
git add -A "$DEST"
if git diff --cached --quiet; then
  echo "Nothing to publish: the live preview already matches."
  exit 0
fi
git commit --quiet -m "Publish Horwell Auto Services preview"
git push --quiet origin HEAD:main
echo "Pushed. The site redeploys in a minute or two: https://edwardstapleton.co.uk/horwell/"
