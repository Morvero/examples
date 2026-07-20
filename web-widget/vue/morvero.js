// Morvero widget for Vue 3 (or any SPA): call once from main.js.
//
//   import { installMorvero } from './morvero';
//   installMorvero(import.meta.env.VITE_MORVERO_KEY);
//
// Route changes (Vue Router) are tracked automatically by the widget.
export function installMorvero(feedbackKey) {
  if (!feedbackKey) return;
  if (document.querySelector('script[data-feedback-key]')) return; // never initialize twice
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://morvero.com/widget.js';
  s.dataset.feedbackKey = feedbackKey;
  document.body.appendChild(s);
}
