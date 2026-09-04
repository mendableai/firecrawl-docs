# DRAFT — Licensing (BLOCKED ON LEGAL — DO NOT PUBLISH)

Status: **blocked**. This section was removed from `capabilities.mdx` before that page shipped.
It is preserved here as a plain `.md` file in a non-navigated directory: it is not listed in
`docs.json`, so Mintlify does not build it as a page. Do not add it to navigation, do not rename it
to `.mdx`, and do not quote it in customer-facing material until Legal has signed off on every row
marked below.

Two things must be resolved before any of this can be published:

1. **Legal must confirm the SDK licence position.** Two rows below are unverifiable from files in
   the repository, and one repository file actively contradicts the intended licence.
2. **Core must fix the underlying defects.** See "Proposed Core PR" at the bottom. Publishing docs
   that describe the intended state while the repository declares something else is worse than
   publishing nothing.

Facts below were transcribed from the licence and manifest files in the Firecrawl repositories on
2026-09-04. Re-verify before publishing; the manifests may have changed.

## Draft table

| Component | Licence | Verified from |
| --- | --- | --- |
| Firecrawl core (`firecrawl/firecrawl`) | GNU Affero General Public License v3.0 (AGPL-3.0) | Repository root `LICENSE` (AGPL-3.0 text); repository `README.md`: "This project is primarily licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). The SDKs and some UI components are licensed under the MIT License." |
| Python SDK (`apps/python-sdk`) | MIT License — **BLOCKED** | `apps/python-sdk/LICENSE` (MIT) and `pyproject.toml` (`license = {text = "MIT License"}`). The legacy `apps/python-sdk/setup.py:67` still declares `license="GNU General Public License v3 (GPLv3)"`, contradicting both. Confirm the intended licence and fix the stale declaration in Core before this row is published. |
| Node.js / TypeScript SDK (`apps/js-sdk`) | MIT License | `apps/js-sdk/LICENSE`, `apps/js-sdk/firecrawl/LICENSE`, and `apps/js-sdk/firecrawl/package.json` (`"license": "MIT"`) |
| Ruby SDK (`apps/ruby-sdk`) | MIT License | `apps/ruby-sdk/LICENSE` |
| Elixir SDK (`apps/elixir-sdk`) | MIT License | `apps/elixir-sdk/LICENSE` |
| Ingestion UI component (`apps/ui/ingestion-ui`) | MIT License | `apps/ui/ingestion-ui/LICENSE` |
| Go, Rust, PHP, Java, and .NET SDKs | **BLOCKED — unverifiable** | No `LICENSE` file is present in `apps/go-sdk`, `apps/rust-sdk`, `apps/php-sdk`, `apps/java-sdk`, or `apps/dot-net-sdk`. The core `README.md` describes the SDKs collectively as MIT, but that is not verifiable per package from a file in the repository. Confirm and add per-package `LICENSE` files. |
| MCP server (`firecrawl/firecrawl-mcp-server`) | MIT License | `LICENSE` (MIT License, Copyright (c) 2025 vrknetha) and `package.json` (`"license": "MIT"`) |

## Draft note — what AGPL-3.0 requires of you (BLOCKED)

Any statement about when AGPL-3.0 obligations are triggered — for example whether calling the hosted
Firecrawl API, or running a self-hosted instance for internal use, creates a source-disclosure
obligation — requires Legal-reviewed wording and is deliberately not asserted. This is a placeholder
until Legal supplies that text.

## Draft misconception row (BLOCKED)

Removed from the published misconceptions table because it depends on the licence facts above:

| Claim seen elsewhere | Correct statement | Where it is documented |
| --- | --- | --- |
| Firecrawl's core is Apache 2.0 licensed. | Firecrawl's core is licensed under AGPL-3.0. The SDKs and some UI components are MIT-licensed, and the MCP server is MIT-licensed. | The Licensing table above |

## What must not be said until Legal signs off

- Any unconditional "all Firecrawl SDKs are MIT-licensed" claim. Five SDKs carry no `LICENSE` file
  and one manifest declares GPLv3.
- Any characterisation of what AGPL-3.0 obliges an API caller or a self-hoster to do.

## Proposed Core PR (not filed; Core repo was not modified)

Title: `chore(licensing): fix stale GPLv3 declaration and add missing SDK LICENSE files`

1. `apps/python-sdk/setup.py:67` — `license="GNU General Public License v3 (GPLv3)"` contradicts
   `apps/python-sdk/LICENSE` (MIT) and `apps/python-sdk/pyproject.toml:22`
   (`license = {text = "MIT License"}`). Change to MIT, or delete the legacy `setup.py` if
   `pyproject.toml` is now authoritative. The GPLv3 string is what ends up in PyPI package metadata.
2. Add per-package `LICENSE` files to `apps/go-sdk`, `apps/rust-sdk`, `apps/php-sdk`,
   `apps/java-sdk`, and `apps/dot-net-sdk`. `README.md:905` describes the SDKs collectively as MIT,
   but a collective statement in a root README is not a per-package grant, and these five packages
   ship without one.
3. Once (1) and (2) land, unblock the docs licensing section and republish it from this draft.
