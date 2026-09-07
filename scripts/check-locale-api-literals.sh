#!/usr/bin/env sh
# API literals must survive translation. Run from the repository root:
#
#   sh scripts/check-locale-api-literals.sh
#
# .github/workflows/checks.yml runs this on every pull request. Run it locally
# too before a change to the localized trees, and after every translation sync.
#
# For every localized .mdx that has an English counterpart, this compares the
# identifiers used inside code fences and inline code:
#   1. missing API literal: the English page uses an API identifier inside a
#      code fence and the localized page has dropped it from its code.
#   2. translated API literal: the localized page uses an identifier-shaped
#      token inside code that no English page uses anywhere.
# Rule 1 draws its vocabulary from the OpenAPI specs, so it follows the API
# instead of a hand-written list. Rule 2 needs no vocabulary: an identifier
# that exists only in a translated tree was written by a translation pass.
set -eu

specs="api-reference/v2-openapi.json api-reference/v1-openapi.json api-reference/webhooks-openapi.json"
locales='^(es|fr|ja|pt-BR|zh)/'

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT INT TERM

# Strings that are genuinely localizable, or English prose that happens to be
# identifier-shaped. Extend this list rather than loosening the checks.
cat >"$work/allow" <<'ALLOWLIST'
exemplo.com
ejemplo.com
exemple.com
ALLOWLIST

# API vocabulary: enum values and schema property names, restricted to
# identifier-shaped names. Single English words such as "content" or "failed"
# are left out: they read as prose in inline code and their absence from a
# translated page says nothing about the code samples.
jq -r '[.. | objects | ((.enum? // empty)[] | select(type == "string")), ((.properties? // empty) | keys[])] | unique[]' \
  $specs |
  grep -E '^[a-z][a-z0-9]*([A-Z][a-zA-Z0-9]*)+$|^[a-z][a-z0-9]*([._][a-z][a-z0-9]*)+$' |
  sort -u >"$work/vocab"

git ls-files '*.mdx' >"$work/all-mdx"
grep -Ev "$locales" "$work/all-mdx" >"$work/english-mdx"

# Every token the English tree uses anywhere, code or prose. A token that never
# appears in English is the signature of a translated identifier.
xargs awk '
  {
    line = $0
    gsub(/\\[nrt]/, " ", line)
    while (match(line, /[A-Za-z_][A-Za-z0-9_.]*/)) {
      token = substr(line, RSTART, RLENGTH)
      sub(/\.+$/, "", token)
      if (token != "") print token
      line = substr(line, RSTART + RLENGTH)
    }
  }
' <"$work/english-mdx" | sort -u >"$work/english-tokens"

# One "file<TAB>token<TAB>fenced|inline" row per identifier that appears inside
# a code fence or inline code, deduplicated.
xargs awk '
  FNR == 1 { fenced = 0 }
  /^[[:space:]]*(```|~~~)/ { fenced = !fenced; next }
  {
    line = $0
    if (!fenced) {
      code = ""
      while (match(line, /`[^`]+`/)) {
        code = code " " substr(line, RSTART + 1, RLENGTH - 2)
        line = substr(line, RSTART + RLENGTH)
      }
      line = code
    }
    gsub(/\\[nrt]/, " ", line)
    while (match(line, /[A-Za-z_][A-Za-z0-9_.]*/)) {
      token = substr(line, RSTART, RLENGTH)
      sub(/\.+$/, "", token)
      if (token != "") print FILENAME "\t" token "\t" (fenced ? "fenced" : "inline")
      line = substr(line, RSTART + RLENGTH)
    }
  }
' <"$work/all-mdx" | sort -u >"$work/tokens"

awk -F'\t' -v locales="$locales" '
  FNR == NR { allow[$0] = 1; next }
  FILENAME == vocabfile { vocab[$0] = 1; next }
  FILENAME == englishfile { english[$0] = 1; next }
  {
    file = $1
    token = $2
    seen[file SUBSEP token] = 1
    if ($3 == "fenced") fenced[file] = fenced[file] " " token
    tokens[file] = tokens[file] " " token
    if (file ~ locales && !(file in listed)) { listed[file] = 1; ordered[++count] = file }
  }
  END {
    status = 0
    for (i = 1; i <= count; i++) {
      file = ordered[i]
      source = file
      sub(locales, "", source)
      if (!(source in tokens)) continue

      split(fenced[source], from_english, " ")
      for (k in from_english) {
        token = from_english[k]
        if (token == "" || !(token in vocab) || (token in allow)) continue
        if ((file SUBSEP token) in seen) continue
        if (reported[file SUBSEP token]++) continue
        print "missing API literal: " file " drops `" token "` used in code by " source
        status = 1
      }

      split(tokens[file], from_locale, " ")
      for (k in from_locale) {
        token = from_locale[k]
        if (token == "" || (token in allow) || (token in english)) continue
        if (length(token) < 5) continue
        if (token !~ /^[a-z][a-z0-9]*([A-Z][a-zA-Z0-9]*)+$/ && token !~ /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/) continue
        if (reported[file SUBSEP token]++) continue
        print "translated API literal: " file " uses `" token "`, which no English page uses"
        status = 1
      }
    }
    exit status
  }
' vocabfile="$work/vocab" englishfile="$work/english-tokens" \
  "$work/allow" "$work/vocab" "$work/english-tokens" "$work/tokens" >&2 || {
  echo "Localized code samples must keep API identifiers in English." >&2
  exit 1
}

echo "Locale API literal checks passed."
