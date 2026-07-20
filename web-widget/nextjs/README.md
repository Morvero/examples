# Morvero + Next.js

One `next/script` tag in the root layout is the whole integration.

- **App Router** — [`app/layout.tsx`](app/layout.tsx)
- **Pages Router** — [`pages/_app.tsx`](pages/_app.tsx)

Copy [`.env.example`](.env.example) to `.env.local` and set your key.

- Client-side navigations are tracked automatically — no router events to wire.
- Tag features anywhere in your JSX: `<button data-feedback-action="export-csv">`.
- The key is `NEXT_PUBLIC_` because the widget runs in the browser; it's a public collection key by design — pin it to your domains in the Morvero console for production.
- Verify: connect `https://morvero.com/mcp` and run `verify_install` after loading a page.
