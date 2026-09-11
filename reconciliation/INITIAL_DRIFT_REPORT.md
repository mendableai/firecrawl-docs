# Initial documentation drift report

Initial verification date: 2026-08-02<br />
Narrowed pull-request verification date: 2026-08-06<br />
Documentation scope: base English/source files<br />
Publication state: [PR #1195](https://github.com/firecrawl/firecrawl-docs/pull/1195) is open; the six documentation fixes are not active until merge. Reconciliation automation is deferred to a follow-up change.

## TL;DR

- The first reconciliation pass classified **26 candidates**: 11 confirmed drifts, 8 generated-source lags, 2 Cloud/open-source differences, 2 contradictory documentation cases, and 3 items requiring owner decisions.
- This change fixes six high-confidence mismatches across Node.js, Python, CLI, and MCP documentation.
- This report records the source revisions and evidence used to verify those fixes; executable reconciliation is intentionally deferred.
- The remaining 20 candidates stay open or decision-dependent and provide the initial coverage backlog.

## Classification totals

| Classification | Count |
| --- | ---: |
| Confirmed drift | 11 |
| Generated-source lag | 8 |
| Intentional Cloud/open-source difference | 2 |
| Duplicate or contradictory documentation | 2 |
| Requires owner input | 3 |

Severity totals are 6 high, 18 medium, and 2 low.

## Source revisions

- Docs base inspected during the initial pass: `firecrawl/firecrawl-docs@74685645ef42be41278f18278c708ab7547f3bb6`
- Product and bundled SDKs: `firecrawl/firecrawl@9554ad079840b0d405d5b1e5b1c57e577b4249cb`
- CLI: `firecrawl/cli@a151277b48a95f5728dc4dbc0dc7bd6d18709408`
- MCP: `firecrawl/firecrawl-mcp-server@41c257161d6b29a849fb66e097d5e5beccefdf2a`

These revisions are evidence snapshots for the initial classification, not a claim that the repositories have remained unchanged.

The six fixed findings were reverified against the published JavaScript SDK `4.32.0`, Python SDK `4.34.0`, CLI `1.19.29`, and MCP server `3.23.4` packages on 2026-08-06.

## Candidate index

| ID | Severity | Classification | Disposition | Affected documentation | Finding |
| --- | --- | --- | --- | --- | --- |
| API-001 | High | Requires owner input | Open | v2 OpenAPI | The configured product comparator is a v1 spec, so an owner-approved production v2 source is required before operation parity can be judged. |
| API-002 | High | Confirmed drift | Open | v1/v2 OpenAPI; failed webhook snippet | Crawl and batch webhook schemas advertise job-level `failed` events, while the inspected runtime completes with failed pages instead. |
| API-003 | Medium | Generated-source lag | Open | v2 OpenAPI; advanced Scrape guide | The public `attributes` format is implemented and documented in the guide but absent from the v2 request and response schemas. |
| API-004 | Medium | Generated-source lag | Open | v1 OpenAPI; account endpoint pages | Three documented account operations are registered in product routes but absent from the product v1 OpenAPI artifact. |
| API-005 | Medium | Contradictory documentation | Open | Webhook events guide; callback OpenAPI | The shared payload guide omits the always-emitted `webhookId` required by the callback schema. |
| API-006 | High | Cloud/open-source difference | Open | Webhook security; self-hosting | Self-hosted delivery is unsigned unless an HMAC secret is configured, while the security guide states signatures universally. |
| API-007 | Medium | Cloud/open-source difference | Open | Webhook overview; self-hosting | Direct self-hosted delivery is single-attempt, so the universal retry schedule does not apply to that path. |
| API-008 | Medium | Generated-source lag | Open | Webhook callback OpenAPI | The callback specification omits implemented Extract started, completed, and failed events. |
| API-009 | Low | Contradictory documentation | Open | Webhook overview and events guide | The overview omits implemented `monitor.page`, while the detailed guide and callback spec include it. |
| API-010 | Medium | Confirmed drift | Open | Webhook overview and testing | The docs require HTTPS, but the inspected request validation and delivery paths do not enforce the protocol. |
| JS-001 | High | Confirmed drift | **Fixed** | `quickstarts/nodejs.mdx` | The quickstart allowed Node.js 18+, while the pinned JavaScript SDK requires Node.js 22+. |
| JS-002 | Medium | Confirmed drift | **Fixed** | `sdks/node.mdx`; `migrate-to-v2.mdx` | V2 prose named the v1-only `crawlUrlAndWatch`; the v2 method is `watcher(jobId, options)`. |
| JS-003 | Medium | Generated-source lag | Open | Node agent source-of-truth page | The page version marker lags the pinned source manifest; published-package status was not queried. |
| JS-004 | Medium | Requires owner input | Open | Node install snippets and source-of-truth page | Workspace manifests do not unambiguously identify the canonical published package artifact. |
| PY-001 | Medium | Confirmed drift | **Fixed** | `quickstarts/python.mdx` | The quickstart used `metadata.sourceURL`, while the SDK normalizes it to `metadata.source_url`. |
| PY-002 | Medium | Generated-source lag | Open | Python agent source-of-truth page | The page version marker lags the pinned source declaration; published-package status was not queried. |
| CLI-001 | High | Confirmed drift | **Fixed** | `sdks/cli.mdx` | Single-format links output is newline-delimited, so the JSON pipeline must explicitly request JSON. |
| CLI-002 | Medium | Confirmed drift | Open | CLI Search page and snippets | Search `--pretty` is documented, but its option registration is disabled. |
| CLI-003 | Medium | Confirmed drift | Open | CLI option tables | Tables labeled “Available Options” omit implemented Scrape, Search, and Monitor flags. |
| CLI-004 | Low | Generated-source lag | Open | CLI status example | Illustrative output pins an older CLI version than the inspected source. |
| MCP-001 | High | Confirmed drift | **Fixed** | `mcp-server/tools.mdx` | `firecrawl_crawl` was described as asynchronous, but it polls to a terminal state before returning. |
| MCP-002 | Medium | Confirmed drift | **Fixed** | `mcp-server/tools.mdx` | The example showed `content[0].text` as an object, while the implementation returns a JSON-serialized string. |
| MCP-003 | Medium | Confirmed drift | Open | Local MCP guide | Local stdio supports bounded keyless Search and Scrape, although the guide states a key or self-hosted URL is always required. |
| DD-001 | Medium | Requires owner input | Open | Keyless Scrape snippets; v2 OpenAPI security | Docs and product support bounded keyless Scrape, while the OpenAPI operation declares bearer authentication. |
| DD-002 | Medium | Generated-source lag | Open | v2 OpenAPI `Formats`; Scrape snippet | The schema permits object formats only, while its description, default, docs, and verified runtime accept strings. |
| DD-003 | Medium | Generated-source lag | Open | v2 OpenAPI response metadata | `nullable` is combined with `oneOf` without a sibling `type`, preventing strict response-schema compilation. |

## Verification status

- JS-001 and JS-002 passed against JavaScript SDK `4.32.0`: its package requires Node.js 22 or newer, v2 exposes `watcher(jobId, opts)`, and `crawlUrlAndWatch` remains under v1.
- PY-001 passed against Python SDK `4.34.0`: v2 normalization maps `sourceURL` to `source_url`.
- CLI-001 passed against CLI `1.19.29`: single-format links output is newline-delimited, while `--json` returns a JSON object whose `links` field is an array.
- MCP-001 and MCP-002 passed against MCP server `3.23.4`: the crawl tool polls to a terminal state, and tool data is JSON-serialized into text.
- All six edited routes rendered the corrected content at 1440-by-900 desktop and 390-by-844 mobile viewports with visible main content and no horizontal overflow or browser errors.
- `mint validate` reported the same 17 pre-existing missing-import warnings as a clean checkout of current docs `main`; the narrowed change introduced no validation warning.
- `git diff --check` passed.
- No live request is required to verify the six documentation fixes in this change.

## Coverage boundaries

- The six fixes do not claim coverage of all 26 candidates or every documentation statement.
- Narrative claims outside the six fixed items were inventoried but are not verified by this pull request.
- Package-registry verification was limited to the four released artifacts supporting the six fixed findings; unresolved version candidates remain classified as generated-source lag rather than release verdicts.
- Cloud webhook retry behavior lives outside the pinned product repository.
- Localized documentation was not audited or edited.
- The dependency-free reconciler and any scheduling are deferred to a separately reviewed follow-up.
- Doc Detective and its npm dependency graph are deferred to a separate proposal.
- Broader semantic PR review, agent-proposed repairs, automatic branches, and automatic pull requests remain deferred to dependent changes with separate permission and security review.
