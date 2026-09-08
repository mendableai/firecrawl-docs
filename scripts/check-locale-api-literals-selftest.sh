#!/usr/bin/env sh
# Fixture for scripts/check-locale-api-literals.sh. Run from the repository
# root:
#
#   sh scripts/check-locale-api-literals-selftest.sh
#
# The check itself reads `git ls-files`, so its fixtures cannot live in this
# repository: a deliberately broken page would fail the real run. Instead this
# builds a throwaway git repository from the real OpenAPI specs plus a handful
# of tiny pages, and asserts both halves of the prose rule:
#
#   1. a translated API identifier in prose is reported, and
#   2. a localized filename in prose is not.
#
# Without case 2 the prose rule would fire on every `destino.mdx` in the
# localized snippet guides, and a check that cries wolf gets switched off.
set -eu

check="$(pwd)/scripts/check-locale-api-literals.sh"
specs="$(pwd)/api-reference"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT INT TERM

mkdir -p "$work/repo/api-reference" "$work/repo/features" "$work/repo/es/features"
cp "$specs/v2-openapi.json" "$specs/v1-openapi.json" "$specs/webhooks-openapi.json" \
  "$work/repo/api-reference/"

cat >"$work/repo/features/change-tracking.mdx" <<'PAGE'
---
title: "Change tracking"
---

Add `changeTracking` to your `formats` array. Change tracking compares pages
via their markdown content, and the snippet lives in snippets/custom.mdx.
PAGE

# Good: literals kept in English, the feature named as prose, a filename that
# happens to be identifier-shaped.
cat >"$work/repo/es/features/change-tracking.mdx" <<'PAGE'
---
title: "Seguimiento de cambios"
---

Agrega `changeTracking` a tu array `formats`. El seguimiento de cambios compara
las páginas por su contenido en markdown, y el fragmento vive en fragmento.mdx.
PAGE

run_check() (
  cd "$work/repo"
  git init -q .
  git add -A
  sh "$check" >"$work/out" 2>&1 && echo pass || echo fail
)

status=0

result="$(run_check)"
if [ "$result" != pass ]; then
  echo "selftest: clean fixture should pass, but the check reported:" >&2
  cat "$work/out" >&2
  status=1
fi

# Bad: the format name translated in prose, with no code fence anywhere.
cat >"$work/repo/es/features/change-tracking.mdx" <<'PAGE'
---
title: "Seguimiento de cambios"
---

Agrega seguimientoDeCambios a tu array de formatos. El seguimiento de cambios
compara las páginas por su contenido en markdown, y el fragmento vive en
fragmento.mdx.
PAGE
rm -rf "$work/repo/.git"

result="$(run_check)"
if [ "$result" != fail ]; then
  echo "selftest: a translated API identifier in prose was not reported" >&2
  status=1
elif ! grep -q 'seguimientoDeCambios' "$work/out"; then
  echo "selftest: the failure did not name the translated identifier:" >&2
  cat "$work/out" >&2
  status=1
elif grep -q 'fragmento.mdx' "$work/out"; then
  echo "selftest: a localized filename was reported as an API identifier:" >&2
  cat "$work/out" >&2
  status=1
fi

if [ "$status" -ne 0 ]; then
  exit 1
fi

echo "Locale API literal selftest passed."
