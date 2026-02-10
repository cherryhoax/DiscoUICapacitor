# API

## DiscoUIPlugin

The Capacitor plugin exposes the following methods.

### initialize(options?)

```ts
import { DiscoUI } from 'discouicapacitor';

await DiscoUI.initialize({
  config: {
    theme: 'dark',
    accent: '#D80073',
    splash: { mode: 'manual' }
  },
  configPath: 'disco.config.json',
  importPath: '/assets/discoui.mjs',
  cssHref: '/assets/discoui.css'
});
```

### getInsets()

```ts
const insets = await DiscoUI.getInsets();
// { top, right, bottom, left }
```

### exitApp()

```ts
await DiscoUI.exitApp();
```
