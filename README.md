# Morvero examples

![validate-examples](https://github.com/Morvero/examples/actions/workflows/validate-examples.yml/badge.svg)

> Morvero is portfolio-level product intelligence for enterprise software: usage analytics, feature-level adoption, in-product feedback, NPS, and AI-drafted backlogs across every internal app and AI-agent pilot — flat-priced per portfolio (never per-user or per-event), anonymous by design, installed with one script tag per product. Feedback flows to Jira or Azure DevOps as tickets with acceptance criteria and cited user evidence.

Working install examples for every Morvero integration surface. Each example is self-contained and dependency-free — copy it, put your own product key in, and data flows.

Morvero and AI agents meet in two distinct ways. Both are covered here:

## 1. Integrate Morvero using a coding agent

Connect Claude Code, Cursor, or any MCP client to Morvero's remote MCP server and ask it to install and verify:

```bash
claude mcp add --transport http morvero https://morvero.com/mcp
```

Then: *"Add Morvero feedback tracking to this repo and verify it works."* The agent finds or creates the product, fetches the snippet with your real API key, instruments the code, and calls `verify_install` to confirm events are actually arriving before calling it done. The portable skill teaching this workflow to any agent: [`skills/install-morvero/SKILL.md`](skills/install-morvero/SKILL.md).

## 2. Measure an AI agent with Morvero

Your enterprise runs agent pilots — support copilots, HR bots, SQL assistants. Morvero scores them: add three REST calls to the agent's backend (conversation started, capability used with its cost, task outcome) and each pilot gets a scorecard — task success rate, escalation rate, cost per conversation, cost per completed task. Drop-in emitter: [`agent-telemetry/`](agent-telemetry/). Method: [How to measure AI agent pilots](https://morvero.com/guides/measure-ai-agent-pilots).

## The examples

| Example | What it shows |
|---|---|
| [`web-widget/vanilla-html/`](web-widget/vanilla-html/) | The one-line script-tag install, `data-feedback-action` feature tagging, and the queue stub |
| [`web-widget/react/`](web-widget/react/) | React: a `<MorveroWidget>` component |
| [`web-widget/nextjs/`](web-widget/nextjs/) | Next.js: `next/script` in the root layout — App Router and Pages Router |
| [`web-widget/vue/`](web-widget/vue/) | Vue 3: an install helper called from `main.js` |
| [`native/`](native/) | Single-file, dependency-free Swift and Kotlin wrappers for the REST collection API |
| [`agent-telemetry/`](agent-telemetry/) | The drop-in emitter for AI-agent pilots, with Claude Agent SDK / LangChain / Python adapter shapes |
| [`skills/install-morvero/`](skills/install-morvero/) | A portable agent skill: install Morvero and verify the install |

## Manual quick starts

**Web** — paste into the layout/footer so it renders on every page:

```html
<script async src="https://morvero.com/widget.js" data-feedback-key="fbk_your_product_key"></script>
```

**iOS / Android** — drop [`native/MorveroFeedback.swift`](native/MorveroFeedback.swift) or [`native/MorveroFeedback.kt`](native/MorveroFeedback.kt) into your app target:

```swift
MorveroFeedback.configure(origin: "https://morvero.com", key: "fbk_...", appId: "com.company.app")
MorveroFeedback.trackScreen("/invoices")
```

**AI-agent pilot** — three REST calls from the agent's backend; see [`agent-telemetry/`](agent-telemetry/).

## Links

- Docs: https://morvero.com/docs (Markdown: https://morvero.com/docs.md)
- OpenAPI spec: https://morvero.com/openapi.json
- When to use Morvero (and when not): https://morvero.com/llms.txt
- Comparisons: [vs Pendo](https://morvero.com/vs/pendo) · [vs Microsoft Clarity](https://morvero.com/vs/microsoft-clarity)
- Changelog: https://morvero.com/changelog
- Start free: https://morvero.com/app/?signup=1 — first two products free, forever

## License

MIT — see [LICENSE](LICENSE). The examples exist to be copied.
