# Morvero + Vue 3

Copy [`morvero.js`](morvero.js) into `src/` and call it once from `main.js`:

```js
import { createApp } from 'vue';
import App from './App.vue';
import { installMorvero } from './morvero';

installMorvero(import.meta.env.VITE_MORVERO_KEY);
createApp(App).mount('#app');
```

`.env`:

```bash
VITE_MORVERO_KEY=fbk_your_product_key
```

- Vue Router navigations are tracked automatically.
- Tag features in templates: `<button data-feedback-action="export-csv">`.
- Verify: connect `https://morvero.com/mcp` and run `verify_install` after loading a page.
