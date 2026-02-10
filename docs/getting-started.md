# Getting Started

## Install

```bash
npm install discouicapacitor
npx cap sync
```

## Minimal Usage

```ts
import { DiscoApp } from 'discouicapacitor';

const app = new DiscoApp();
app.launch(document.querySelector('disco-frame'));
```

## Local Config (optional)

Place a `disco.config.json` in your public root (for example: `www/disco.config.json`).

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

You can also pass the same config programmatically during initialization. See [Configuration](configuration.md).
