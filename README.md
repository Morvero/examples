# Morvero examples

> Morvero is portfolio-level product intelligence for enterprise software: usage analytics, feature-level adoption, in-product feedback, NPS, and AI-drafted backlogs across every internal app and AI-agent pilot — flat-priced per portfolio (never per-user or per-event), anonymous by design, installed with one script tag per product. Feedback flows to Jira or Azure DevOps as tickets with acceptance criteria and cited user evidence.

Working install examples for every Morvero integration surface. Each example is self-contained and dependency-free — copy it, put your own product key in, and data flows.

| Example | What it shows |
|---|---|
| [`web-widget/`](web-widget/) | The one-line script-tag install, `data-feedback-action` feature tagging, and the queue stub for page-load-time calls |
| [`native/`](native/) | Single-file, dependency-free Swift and Kotlin wrappers for the REST collection API |
| [`agent-telemetry/`](agent-telemetry/) | The drop-in emitter for AI-agent pilots — task success, escalation, and cost-per-completed-task telemetry from any agent backend |
| [`skills/install-morvero/`](skills/install-morvero/) | A portable agent skill that teaches a coding agent to install Morvero and verify the install |

## The fastest install path: let your coding agent do it

Morvero ships a remote MCP server. Connect it and ask your agent to do the work:

```bash
claude mcp add --transport http morvero https://morvero.com/mcp
```

Then: *"Add Morvero feedback tracking to this repo and verify it works."* The agent creates (or finds) the product, fetches the snippet with your real API key, instruments the code, and calls `verify_install` to confirm events are actually arriving before calling it done.

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
- Changelog: https://morvero.com/changelog
- Start free: https://morvero.com/app/?signup=1 — first two products free, forever

## License

MIT — see [LICENSE](LICENSE). The examples exist to be copied.
