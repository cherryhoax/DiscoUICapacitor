# discoui-capacitor

DiscoUI Capacitor plugin for Android, Electron, and Web.

## Install

```bash
npm install discoui-capacitor
npx cap sync
```

## Usage

Create a disco.config.json in your app's public root (for example, www/disco.config.json):

```json
{
	"theme": "dark",
	"accent": "#D80073",
	"font": "SegoeUI",
	"splash": {
		"mode": "manual",
		"color": "#008a00",
		"icon": "./favicon.svg",
		"showProgress": true
	}
}
```

Then call initialize:

```ts
import { DiscoUI } from 'discoui-capacitor';

await DiscoUI.initialize({
	configPath: '/disco.config.json',
});

## Vite build integration

If you use Vite, include the plugin to inject DiscoUI CSS and emit DiscoUI assets into your build. This expects the DiscoUI package to ship (or generate on install) the prebuilt assets in `node_modules/discoui/dist`.

```ts
import { defineConfig } from 'vite';
import { discoUIVitePlugin } from 'discoui-capacitor/vite';

export default defineConfig({
  plugins: [discoUIVitePlugin()],
});
```
```

## API

### initialize(...)

```typescript
initialize(options?: DiscoInitializeOptions) => Promise<void>
```

| Param         | Type                               |
| ------------- | ---------------------------------- |
| **`options`** | <code>DiscoInitializeOptions</code> |
