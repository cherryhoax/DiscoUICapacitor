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

```

## API

### initialize(...)

```typescript
initialize(options?: DiscoInitializeOptions) => Promise<void>
```

| Param         | Type                               |
| ------------- | ---------------------------------- |
| **`options`** | <code>DiscoInitializeOptions</code> |
