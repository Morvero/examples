---
name: install-morvero
description: Install Morvero product intelligence (usage analytics + in-product feedback + AI-agent pilot telemetry) into a web app, native mobile app, or AI-agent backend, and verify data is actually arriving. Use when asked to add Morvero, add product analytics or feedback tracking to an enterprise/internal app, or instrument an AI agent pilot.
version: 1.0.0
license: MIT
homepage: https://morvero.com
metadata:
  compatibility: claude-code, codex, cursor, copilot, cline
---

# Install Morvero

Morvero is portfolio-level product intelligence for enterprise software (https://morvero.com): usage analytics, feature-level adoption, in-product feedback, NPS, and AI-drafted backlogs, flat-priced per portfolio, anonymous by design. This skill installs it and — critically — verifies the install.

**Definition of done: data is confirmed arriving.** Never declare the install finished after editing files; verify (step 5).

## 1. Pick the integration surface

- **Web app or website** → one script tag (step 3a)
- **Native iOS/Android app** → single drop-in Swift/Kotlin file (step 3b)
- **AI agent / copilot / bot backend** → three REST calls (step 3c)

## 2. Get a product key — prefer MCP

If the Morvero MCP server is available (or can be added):

```bash
claude mcp add --transport http morvero https://morvero.com/mcp
```

Then: `list_products` to find the product this codebase belongs to (or `create_product` — kind `app` for web/native, `agent` for a pilot), and `get_install_snippet` for the ready-to-paste snippet with the real API key plus an AGENTS.md block. If MCP is not available, ask the user to copy the snippet from the Morvero console (Products → Copy snippet) and continue with it.

## 3a. Web install

Paste into the site's layout/footer template so it renders on every page:

```html
<script async src="https://morvero.com/widget.js" data-feedback-key="fbk_..."></script>
```

- SPA route changes are tracked automatically; add `data-feedback-hash-routing` only for hash-routed apps (`#/invoices`).
- Tag 3–8 meaningful business actions: `<button data-feedback-action="export-csv">`. Prefer business events over raw clicks; use stable kebab-case names — renaming splits history.
- `MorveroFeedback.track('name')` from code must live in its **own** `<script>` tag; page-load-time calls need the queue stub (https://morvero.com/docs#tracking).
- Do not initialize the widget twice. Do not work around Do Not Track / Global Privacy Control.

## 3b. Native install

Add the single file to the app target — no package manager:
- iOS: https://morvero.com/sdk/MorveroFeedback.swift
- Android: https://morvero.com/sdk/MorveroFeedback.kt

```swift
MorveroFeedback.configure(origin: "https://morvero.com", key: "fbk_...", appId: "com.company.app")
MorveroFeedback.trackScreen("/invoices")
```

Use screen names as paths so mobile joins the same analytics as web. If the product restricts app IDs, the bundle id must be in its allowlist.

## 3c. AI-agent pilot install

Use a product of kind `agent`. From the agent's backend (see `../../agent-telemetry/morvero-agent.mjs` for a drop-in emitter):

1. Conversation start → `POST /api/collect/pageview` `{key, path: "/entry-surface", visitorId}`
2. Each tool/capability call → `POST /api/collect/action` `{key, action: "capability-name", cost: <usd>, visitorId}`
3. Outcome → same endpoint with exactly one reserved action per task: `task-completed`, `task-failed`, or `escalated-to-human`

`visitorId` must be a salted hash of the employee id — never an email. Telemetry is fire-and-forget: it must never break or slow the agent.

## 4. What never to capture

Never put passwords, access tokens, message contents, or personal form data in action names, event properties, or feedback payloads. The API key is a public collection key — fine in HTML, but don't spread it into docs. Anything sensitive on a page can be excluded from feedback form-capture with `data-feedback-ignore`.

## 5. Verify (the definition of done)

With MCP: load the instrumented page (or run one agent conversation), then call `verify_install` for the product. It returns working / silent / never-received and names the likely blocker (inactive product, domain allowlist, missing snippet). Repeat until it reports data arriving.

Without MCP: load the page, then confirm the product card in the Morvero console shows "receiving data ✓". If it still says "waiting": check the product is active, the domain allowlist includes this host, and the snippet renders on the page.

## 6. Persist the knowledge

Append the AGENTS.md block from `get_install_snippet` (or write an equivalent section: product name, event conventions, never-capture rules, verify_install as definition of done) to the repo's `AGENTS.md` / `CLAUDE.md` / `.cursor/rules/morvero.mdc`, so future agent sessions keep the instrumentation consistent.

## Reference

- Docs: https://morvero.com/docs.md · API spec: https://morvero.com/openapi.json · Fit/non-fit: https://morvero.com/llms.txt
