# Configuration

DiscoUI Capacitor supports configuration through either a JSON file or `initialize()` options.

## disco.config.json

Create a `disco.config.json` in your public root (for example: `www/disco.config.json`).

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

## Programmatic Initialize

```ts
import { DiscoUI } from 'discouicapacitor';

await DiscoUI.initialize({
  config: {
    theme: 'dark',
    accent: '#D80073',
    font: 'SegoeUI',
    splash: {
      mode: 'manual',
      color: '#008a00',
      icon: './favicon.svg',
      showProgress: true
    }
  },
  configPath: 'disco.config.json',
  importPath: '/assets/discoui.mjs',
  cssHref: '/assets/discoui.css'
});
```

## Config Schema

`DiscoAppOptions`:
- `theme` (string): Theme mode or named theme.
- `accent` (string): Accent color.
- `font` (string): Font family.
- `splash` (object): Splash configuration.

`DiscoSplashOptions`:
- `mode` (`none` | `auto` | `manual`): Splash mode.
- `color` (string): Background color.
- `icon` (string): Icon path or URL.
- `showProgress` (boolean): Show progress bar.

`DiscoInitializeOptions`:
- `config` (`DiscoAppOptions`): Inline config.
- `cssHref` (string): Path to DiscoUI CSS bundle.
- `importPath` (string): Path to DiscoUI JS bundle.
- `configPath` (string): Path to config JSON file.
