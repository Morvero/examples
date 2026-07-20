// Morvero widget for React apps. Renders nothing — it injects the widget
// script once. Mount it once, near the root of the app.
//
//   <MorveroWidget feedbackKey={import.meta.env.VITE_MORVERO_KEY} />
//
// SPA route changes are tracked automatically by the widget itself; you do
// not need to hook your router.
import { useEffect } from 'react';

export function MorveroWidget({ feedbackKey }: { feedbackKey: string }) {
  useEffect(() => {
    if (!feedbackKey) return;
    // never initialize the widget twice (StrictMode double-effects, remounts)
    if (document.querySelector('script[data-feedback-key]')) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://morvero.com/widget.js';
    s.dataset.feedbackKey = feedbackKey;
    document.body.appendChild(s);
  }, [feedbackKey]);
  return null;
}
