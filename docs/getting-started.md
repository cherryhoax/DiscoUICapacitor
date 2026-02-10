# Getting Started

## Install

```bash
npm install discouicapacitor
npx cap sync
```

## Create App (CLI)

```bash
npx discouicapacitor create-app
```

If you install the package globally, you can also use:

```bash
dui create-app
```

The CLI will prompt for app name, icon, theme, accent color, and a starter page template.

You can also run unattended with flags:

```bash
npx discouicapacitor create-app \
  --name "Disco App" \
  --dir disco-app \
  --app-id com.disco.app \
  --theme auto \
  --accent "#D80073" \
  --page "single page" \
  --icon ./icon.svg \
  --yes \
  --no-install
```

Use `--yes` to skip prompts and accept defaults for missing values.

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
