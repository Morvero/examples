# Morvero + React

Copy [`MorveroWidget.tsx`](MorveroWidget.tsx) into your app and mount it once at the root:

```tsx
import { MorveroWidget } from './MorveroWidget';

export default function App() {
  return (
    <>
      <Routes>…</Routes>
      <MorveroWidget feedbackKey={import.meta.env.VITE_MORVERO_KEY} />
    </>
  );
}
```

`.env`:

```bash
VITE_MORVERO_KEY=fbk_your_product_key
```

- Route changes (React Router or any history-based router) are tracked automatically — no router hook needed.
- Tag features in JSX: `<button data-feedback-action="export-csv">` — clicks appear under "Most used functions".
- From code: `window.MorveroFeedback?.track('name')` (optional chaining covers the pre-load window, or use the queue stub from [`../vanilla-html/`](../vanilla-html/index.html)).
- Verify: connect `https://morvero.com/mcp` and run `verify_install` after loading a page.
