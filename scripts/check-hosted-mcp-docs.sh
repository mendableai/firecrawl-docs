#!/usr/bin/env sh
# Static truth checks for hosted-MCP docs. Run from the repository root.
set -eu

chooser_page="mcp-server.mdx"
agent_page="mcp-server/keyless.mdx"
human_page="mcp-server/oauth.mdx"
tools_page="mcp-server/tools.mdx"
local_page="mcp-server/local.mdx"
rate_limits="rate-limits.mdx"
ai_onboarding="ai-onboarding.mdx"
selector="snippets/shared/agent-first-onboarding.jsx"
reviewed_mcp_version="3.23.7"

require() {
  file="$1"
  text="$2"
  if ! grep -Fq -- "$text" "$file"; then
    echo "expected $file to contain: $text" >&2
    exit 1
  fi
}

forbid() {
  file="$1"
  text="$2"
  if grep -Fq -- "$text" "$file"; then
    echo "did not expect $file to contain: $text" >&2
    exit 1
  fi
}

# The marketplace-only search profile is not a general Firecrawl setup surface.
if [ -e "mcp-server/search-only.mdx" ]; then
  echo "mcp-server/search-only.mdx must not be published as a general setup page" >&2
  exit 1
fi

# /mcp-server stays a real page: it is the canonical, highest-traffic MCP URL and
# must never become a redirect. Setup itself is split by audience underneath it.
if [ ! -e "$chooser_page" ]; then
  echo "$chooser_page must exist so the canonical MCP URL keeps rendering a real page" >&2
  exit 1
fi
if [ -e "developer-guides/mcp-setup-guides/oauth.mdx" ]; then
  echo "the old OAuth guide must remain folded into $human_page" >&2
  exit 1
fi
# Outcome-named setup pages are retired in favor of the audience split.
for retired_page in mcp-server/keyless-api-key.mdx \
  mcp-server/agent-mcp.mdx mcp-server/human-mcp.mdx \
  mcp-server/connect.mdx mcp-server/clients.mdx mcp-server/development.mdx; do
  if [ -e "$retired_page" ]; then
    echo "$retired_page must stay consolidated into the audience setup pages" >&2
    exit 1
  fi
done

# The entry page routes by credential mode, then by client. It stays a chooser,
# not a setup manual.
require "$chooser_page" "sidebarTitle: 'Get Started'"
require "$chooser_page" "title: Get Started"
require "$chooser_page" '<CardGroup cols={3}>'
require "$chooser_page" 'title="Try Instantly"'
require "$chooser_page" 'title="Sign in"'
require "$chooser_page" 'title="Use an API key"'
forbid "$chooser_page" 'title="Sign in with your account"'
require "$chooser_page" 'href="/mcp-server/keyless#try-keyless"'
require "$chooser_page" 'href="/mcp-server/oauth"'
# API key setup lives on For Agents (/v2/mcp). The chooser card routes there.
require "$chooser_page" 'href="/mcp-server/keyless#add-an-api-key"'
require "$chooser_page" "## Add an API key"
require "$chooser_page" "Authorization: Bearer <FIRECRAWL_API_KEY>"
forbid "$chooser_page" 'href="/mcp-server#add-an-api-key"'
# Both full client walkthroughs stay reachable from the entry page.
require "$chooser_page" 'title="For Agents"'
require "$chooser_page" 'title="For Humans"'
require "$chooser_page" 'href="/mcp-server/keyless"'
require "$chooser_page" "Sign in via browser."
forbid "$chooser_page" "Sign in via browser or use an API key."
forbid "$chooser_page" "## Fix a broken connection"
# Tools and Run locally are deliberately out of the primary nav, so the chooser
# and both audience pages have to keep them reachable.
require "$chooser_page" "/mcp-server/tools"
require "$chooser_page" "/mcp-server/local"
# Agent-readable setup: the client selector is JSX and does not survive the
# Markdown/llms exports, so both hosted URLs must be plain text on this page.
# Callout bodies do survive that export, so the sign-in URL may live in the note.
require "$chooser_page" "https://mcp.firecrawl.dev/v2/mcp"
require "$chooser_page" "https://mcp.firecrawl.dev/v2/mcp-oauth"
require "$chooser_page" "not a page to open directly in a browser"

# For Agents owns keyless plus API key on /v2/mcp.
# The selector is JSX and does not survive Markdown/llms exports, so agents need
# a plain-text Visibility block with the same commands as the intro.
require "$agent_page" "sidebarTitle: 'For Agents'"
require "$agent_page" 'variant="agent"'
require "$agent_page" '<Visibility for="humans">'
require "$agent_page" '<Visibility for="agents">'
require "$agent_page" 'codex mcp add firecrawl --url https://mcp.firecrawl.dev/v2/mcp'
require "$agent_page" "## Try keyless"
require "$agent_page" "## Add an API key"
require "$agent_page" "URL: https://mcp.firecrawl.dev/v2/mcp"
require "$agent_page" "Authorization: Bearer <FIRECRAWL_API_KEY>"
require "$agent_page" "Keyless MCP is rate limited and exposes Search, Scrape, and Parse."
require "$agent_page" "/mcp-server/tools"
require "$agent_page" "/mcp-server/local"
forbid "$agent_page" "mcp-search"
forbid "$agent_page" "/v2/mcp-search"

# For Humans owns sign-in on /v2/mcp-oauth. API key setup stays on /v2/mcp
# (chooser + For Agents); this page only hands off with a link.
require "$human_page" "sidebarTitle: 'For Humans'"
require "$human_page" 'variant="human"'
require "$human_page" '<Visibility for="humans">'
require "$human_page" '<Visibility for="agents">'
require "$human_page" 'https://mcp.firecrawl.dev/v2/mcp-oauth'
require "$human_page" 'codex mcp add firecrawl --url https://mcp.firecrawl.dev/v2/mcp-oauth'
require "$human_page" "## Sign in"
require "$human_page" "## Add an API key"
require "$human_page" 'href="/mcp-server/keyless#add-an-api-key"'
forbid "$human_page" "<Tip>"
forbid "$human_page" "Authorization: Bearer <FIRECRAWL_API_KEY>"
forbid "$human_page" 'cta="Go to For Agents"'
require "$human_page" "https://www.firecrawl.dev/app/settings?tab=mcp"
require "$human_page" "https://chatgpt.com/plugins?q=firecrawl"
require "$human_page" "https://claude.ai/directory/connectors/firecrawl"
require "$human_page" "## ChatGPT and Claude"
require "$human_page" "/images/agent-clients/chatgpt.svg"
require "$human_page" "/images/agent-clients/claude-ai.svg"
forbid "$human_page" 'icon="sparkles"'
forbid "$human_page" "Short walkthroughs"
require "$human_page" "/mcp-server/tools"
require "$human_page" "/mcp-server/local"
forbid "$human_page" "to the same endpoint"
forbid "$human_page" "Supported standards"
forbid "$human_page" "RFC 8414"

# The key-in-URL form is phased out silently: it stays supported for existing
# configurations but must not be advertised anywhere in the English docs.
for page in "$chooser_page" "$agent_page" "$human_page" "$tools_page" "$local_page"; do
  forbid "$page" 'https://mcp.firecrawl.dev/<FIRECRAWL_API_KEY>/v2/mcp'
done

# The selector keeps the two hosted URLs distinct by variant.
require "$selector" 'https://mcp.firecrawl.dev/v2/mcp-oauth'
require "$selector" 'https://mcp.firecrawl.dev/v2/mcp'
require "$selector" 'variant === "human"'
require "$selector" 'useState(clients[0].id)'
require "$selector" 'codex mcp add firecrawl --url ${mcpUrl} && codex mcp login firecrawl'
# The card lists exactly the four developer clients, in this order. ChatGPT and
# Claude.ai are reached from the guide links on For Humans, not from a tab here:
# a tab would have to configure a different endpoint than the card's own URL.
expected_clients='codex claude-code cursor opencode'
actual_clients="$(grep -oE '^      id: "[a-z-]+"' "$selector" | sed 's/.*"\(.*\)"/\1/' | tr '\n' ' ' | sed 's/ $//')"
if [ "$actual_clients" != "$expected_clients" ]; then
  echo "expected selector clients to be exactly: $expected_clients" >&2
  echo "found: $actual_clients" >&2
  exit 1
fi
# Every tab carries a sublabel under the client name; a missing one renders an
# empty cell and misaligns the tab strip.
for client_name in 'name: "Codex"' 'name: "Claude Code"' 'name: "Cursor"' 'name: "OpenCode"'; do
  if ! grep -A1 -F -- "$client_name" "$selector" | grep -Fq 'detail:'; then
    echo "expected a detail sublabel directly after $client_name in $selector" >&2
    exit 1
  fi
done
# The endpoint fallback row stays inside the card, not as a callout beneath it.
if ! grep -q 'fc-agent-first-footer"' "$selector"; then
  echo "expected the endpoint fallback row inside the selector card in $selector" >&2
  exit 1
fi
forbid "$selector" 'fc-footer-outside'
forbid style.css 'fc-footer-outside'
# For Humans is sign-in only; API key stays on the chooser and For Agents.
require "$selector" 'Sign in via browser.'
require "$selector" 'No API key required. Add an API key to unlock more usage.'
forbid "$selector" 'Sign in via browser, or add an API key.'
# See-all points at the audience page for the variant on screen.
require "$selector" '"/mcp-server/oauth" : "/mcp-server/keyless"'
forbid "$selector" 'codexKeylessConfig'

# /mcp-server renders the chooser. Every MCP path that resolves on the base
# branch keeps resolving here, whether it does so today as a page or as a
# redirect, so merging this cannot turn a working URL into a 404.
root_redirect_count="$(jq '[.redirects[] | select(.source == "/mcp-server")] | length' docs.json)"
if [ "$root_redirect_count" -ne 0 ]; then
  echo "/mcp-server must render the chooser instead of redirecting" >&2
  exit 1
fi
# A live page cannot also be a redirect source. /mcp-server/oauth shipped as a
# redirect before it became this page, so guard every published English MCP path.
for page_path in /mcp-server /mcp-server/keyless /mcp-server/oauth /mcp-server/tools /mcp-server/local; do
  shadowed="$(jq --arg p "$page_path" '[.redirects[] | select(.source == $p)] | length' docs.json)"
  if [ "$shadowed" -ne 0 ]; then
    echo "$page_path is a real page and must not also be a redirect source" >&2
    exit 1
  fi
done
check_redirect() {
  source="$1"
  expected="$2"
  found="$(jq -r --arg source "$source" '.redirects[] | select(.source == $source) | .destination' docs.json)"
  if [ "$found" != "$expected" ]; then
    echo "$source must redirect to $expected, found: ${found:-none}" >&2
    exit 1
  fi
}
check_redirect /mcp-server/connect /mcp-server
check_redirect /mcp-server/clients /mcp-server
check_redirect /mcp-server/development /mcp-server
check_redirect /developer-guides/mcp-setup-guides/oauth /mcp-server/oauth
# Cutover: these resolve on the base branch, keyless-api-key as a page and the
# other two as redirects, so each needs an entry here to survive the merge.
check_redirect /mcp-server/keyless-api-key /mcp-server/keyless
check_redirect /mcp-server/agent-mcp /mcp-server/keyless
check_redirect /mcp-server/human-mcp /mcp-server/oauth

# English nav is Get Started, then For Agents, then For Humans. The group root
# is the chooser so clicking MCP expands and opens Get Started.
english_pages='["mcp-server","mcp-server/keyless","mcp-server/oauth"]'
english_count="$(jq --argjson pages "$english_pages" '[.navigation.languages[] | select(.language == "en") | .. | objects | select(.group? == "MCP" and .root? == "mcp-server" and (has("icon") | not) and .pages == $pages)] | length' docs.json)"
if [ "$english_count" -ne 2 ]; then
  echo "expected two icon-free English MCP nav groups rooted at Get Started; found $english_count" >&2
  exit 1
fi
# Tools and Run locally stay out of the primary nav and are reached from the pages.
nav_leaf_count="$(jq '[.navigation.languages[] | select(.language == "en") | .. | strings | select(. == "mcp-server/tools" or . == "mcp-server/local")] | length' docs.json)"
if [ "$nav_leaf_count" -ne 0 ]; then
  echo "mcp-server/tools and mcp-server/local must stay out of the English MCP nav, found $nav_leaf_count entries" >&2
  exit 1
fi
# Localized files are translation-managed, so localized groups keep indexing the
# existing translated leaves until the pipeline syncs the audience slugs.
for language in es fr ja pt-BR zh; do
  expected="[\"${language}/mcp-server\",\"${language}/mcp-server/oauth\",\"${language}/mcp-server/keyless-api-key\",\"${language}/mcp-server/tools\",\"${language}/mcp-server/local\"]"
  count="$(jq --arg language "$language" --arg root "${language}/mcp-server" --argjson pages "$expected" '[.navigation.languages[] | select(.language == $language) | .. | objects | select(.group? == "MCP" and .root? == $root and .pages == $pages)] | length' docs.json)"
  if [ "$count" -ne 2 ]; then
    echo "expected two translation-managed MCP nav groups for $language, found $count" >&2
    exit 1
  fi
done

# Agent-readable fallback: the selector is progressive enhancement, so the
# introduction must also carry plain-markdown setup for Markdown/llms exports.
require introduction.mdx '<Visibility for="agents">'
require introduction.mdx '<Visibility for="humans">'
require introduction.mdx 'codex mcp add firecrawl --url https://mcp.firecrawl.dev/v2/mcp'
# Mintlify markdown-export URLs for agents (append .md). Do not "normalize" these away.
require introduction.mdx '/mcp-server.md'
require introduction.mdx '/mcp-server/keyless.md'
require introduction.mdx '/mcp-server/oauth.md'
require introduction.mdx '<McpClientSelector variant="human" />'
forbid introduction.mdx '<McpClientSelector />'

# Client configuration fields verified against official client documentation.
require quickstarts/gemini-cli.mdx '"httpUrl": "https://mcp.firecrawl.dev/v2/mcp"'
forbid quickstarts/gemini-cli.mdx '"url": "https://mcp.firecrawl.dev/v2/mcp"'
require quickstarts/antigravity.mdx '"serverUrl": "https://mcp.firecrawl.dev/v2/mcp"'
require quickstarts/windsurf.mdx '~/.codeium/windsurf/mcp_config.json'

# The Cursor deeplink must install the hosted keyless server, never a local
# command with an API-key placeholder.
require ai-onboarding.mdx 'config=eyJ1cmwiOiJodHRwczovL21jcC5maXJlY3Jhd2wuZGV2L3YyL21jcCJ9'
forbid ai-onboarding.mdx 'RklSRUNSQVdMX0FQSV9LRVk'

# Tool behavior and package requirements must match the implementation and npm.
require "$tools_page" "Start with [Get Started](/mcp-server)"
require "$tools_page" "The former Extract MCP tool is deprecated"
require "$tools_page" '`firecrawl_crawl` normally starts a crawl and polls it to a terminal state before returning.'
require "$tools_page" '`firecrawl_agent` is asynchronous'
require "$tools_page" 'If the configured URL is `/v2/mcp-oauth`, sign in again through the client.'
require "$local_page" "Node.js 22 or newer"
require "$local_page" "npx -y firecrawl-mcp@${reviewed_mcp_version}"
require "$local_page" "start with [Get Started](/mcp-server)"

# Keyless stays the fixed three-tool hosted surface everywhere it is presented.
require "$rate_limits" "exactly **Search, Scrape, and Parse** without an API key"
require "$ai_onboarding" "Hosted MCP exposes the narrower keyless Search, Scrape, and Parse surface"
require developer-guides/llm-sdks-and-frameworks/elevenagents.mdx "Keyless MCP exposes exactly Search, Scrape, and Parse, with shared limits."
for quickstart in amp antigravity cursor gemini-cli opencode windsurf; do
  file="quickstarts/${quickstart}.mdx"
  require "$file" "keyless Search, Scrape, and Parse"
  require "$file" "/mcp-server/oauth"
  require "$file" "/mcp-server/keyless#add-an-api-key"
  forbid "$file" "FIRECRAWL_API_KEY"
done
for quickstart in claude-code codex-cli; do
  file="quickstarts/${quickstart}.mdx"
  require "$file" "/mcp-server/keyless#try-keyless"
  require "$file" "/mcp-server/keyless#add-an-api-key"
done
require quickstarts/claude-code.mdx "claude mcp add --transport http firecrawl https://mcp.firecrawl.dev/v2/mcp-oauth"
require quickstarts/codex-cli.mdx "codex mcp login firecrawl"
forbid quickstarts/claude-code.mdx "-e FIRECRAWL_API_KEY="
forbid quickstarts/codex-cli.mdx 'FIRECRAWL_API_KEY = "'

# Generic English links enter through the canonical MCP URL rather than silently
# choosing one audience.
require introduction.mdx "[Model Context Protocol](/mcp-server)"
require introduction.mdx '## Get started'
require introduction.mdx 'No account or API key is required for this request.'
require introduction.mdx '<ScrapeCURL />'
require introduction.mdx "[llms-full.txt](https://docs.firecrawl.dev/llms-full.txt)"
require "$agent_page" 'id="try-instantly"'
require "$human_page" 'mcp.firecrawl.dev/v2/mcp-oauth'
# Harness-first funnel: the MCP client selector leads, the direct API example follows.
selector_line="$(grep -nF '<McpClientSelector variant="human" />' introduction.mdx | head -1 | cut -d: -f1)"
curl_line="$(grep -nF '<ScrapeCURL />' introduction.mdx | head -1 | cut -d: -f1)"
if [ "$selector_line" -ge "$curl_line" ]; then
  echo "Introduction must show the MCP client selector before the direct API example" >&2
  exit 1
fi
agent_index_line="$(grep -nF '**For AI agents:**' introduction.mdx | cut -d: -f1)"
if [ "$selector_line" -ge "$agent_index_line" ]; then
  echo "Introduction must show harness setup before the AI-agent index note" >&2
  exit 1
fi
require integrations.mdx "[MCP server](/mcp-server)"
require docs.json '"href": "https://docs.firecrawl.dev/mcp-server"'

# Scan tracked source files only. Untracked worktrees and experiment artifacts must not
# affect the release gate, while JSX and docs.json remain covered.
tracked_docs="$(git ls-files '*.mdx' '*.jsx' 'docs.json')"
english_docs="$(printf '%s\n' "$tracked_docs" | grep -Ev '^(es|fr|ja|pt-BR|zh)/' || true)"

raw_key_paths="$(printf '%s\n' "$english_docs" | xargs grep -nE 'mcp\.firecrawl\.dev/(fc-|YOUR|your-|\$\{|\{\{)' 2>/dev/null || true)"
if [ -n "$raw_key_paths" ]; then
  echo "English docs must not emit credential-bearing hosted MCP URLs:" >&2
  echo "$raw_key_paths" >&2
  exit 1
fi

versioned_mcp_docs="$(printf '%s\n' "$english_docs" | grep -E '^(mcp-server/local\.mdx|developer-guides/llm-sdks-and-frameworks/google-adk\.mdx|quickstarts/(amp|antigravity|claude-code|codex-cli|cursor|gemini-cli|opencode|windsurf)\.mdx)$' || true)"
wrong_mcp_versions="$(printf '%s\n' "$versioned_mcp_docs" | xargs grep -nE 'firecrawl-mcp@[0-9]+\.[0-9]+\.[0-9]+' 2>/dev/null | grep -v "firecrawl-mcp@${reviewed_mcp_version}" || true)"
if [ -n "$wrong_mcp_versions" ]; then
  echo "English docs contain an unreviewed firecrawl-mcp version:" >&2
  echo "$wrong_mcp_versions" >&2
  exit 1
fi

bare_mcp_npx="$(printf '%s\n' "$english_docs" | xargs grep -nE 'npx[[:space:]]+-y[[:space:]]+firecrawl-mcp($|[^@])' 2>/dev/null || true)"
if [ -n "$bare_mcp_npx" ]; then
  echo "English docs must pin npx firecrawl-mcp examples:" >&2
  echo "$bare_mcp_npx" >&2
  exit 1
fi

echo "Hosted MCP documentation truth checks passed."
