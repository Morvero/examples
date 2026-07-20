# Morvero web-widget examples

The install is always the same one script tag — these examples show the idiomatic place to put it in each framework. SPA route changes are tracked automatically in all of them; tag features with `data-feedback-action="stable-name"` anywhere in your markup.

| Framework | Example |
|---|---|
| Plain HTML / server-rendered apps | [`vanilla-html/`](vanilla-html/) — includes feature tagging and the queue stub |
| React (Vite, CRA, anything client-side) | [`react/`](react/) — a `<MorveroWidget>` component |
| Next.js (App Router and Pages Router) | [`nextjs/`](nextjs/) — `next/script` in the root layout |
| Vue 3 | [`vue/`](vue/) — an install helper called from `main.js` |

Rules that apply everywhere:

- **Never initialize the widget twice** — one script tag (or one injector call) per page.
- The key (`fbk_…`) is a public collection key; pin it to your domains in the Morvero console for production.
- Do Not Track / Global Privacy Control disable tracking by design — don't work around them.
- Done means verified: connect `https://morvero.com/mcp` and run `verify_install`, or check for "receiving data ✓" on the product card.

Missing your framework? Angular, ASP.NET, Svelte, and friends are the same script tag in the app shell — PRs with idiomatic examples are welcome.
