<div align="center">
	<img src="assets/duic.svg" alt="DiscoUI logo" width="120" />
	<h1>DiscoUI Capacitor</h1>
	<p>Capacitor plugin for DiscoUI: Metro-inspired UI primitives with splash, frame navigation, and pivot pages across Android, Electron, and Web.</p>
</div>

## Quick Start
```bash
npm install discoui-capacitor
npx cap sync
```

## Usage (Phase 1)

DiscoUI-Capacitor provides **DiscoCapacitorApp**, an enhanced version of DiscoApp with native Android integration.

### Basic Setup

Create a `disco.config.json` in your app public root (for example, `www/disco.config.json`):

```json
{
	"theme": "dark",
	"accent": "#D80073",
	"font": "SegoeUI",
	"splash": {
		"mode": "manual",
		"color": "#008a00",
		"icon": "./favicon.svg",
		"showProgress": true,
		"native": true
	}
}
```

Then create and launch the app:
```js
import { DiscoCapacitorApp } from 'discoui-capacitor';

const app = new DiscoCapacitorApp();
app.launch(document.querySelector('disco-frame'));
```

### Phase 1 Features

**DiscoCapacitorApp** automatically handles:
- ✅ **Transparent status & navigation bars** — Edge-to-edge display on Android
- ✅ **Native splash control** — Configure via `splash.native` in disco.config.json
- ✅ **System insets** — Safe area attributes (`disco-inset-top/bottom/left/right`) on `<html>`
- ✅ **Back button** — Subscribe via `app.on('backButton', handler)` with `preventDefault()` support
- ✅ **Theme & accent sync** — Native bars follow app theme and accent color
- ✅ **Auto-init** — All native features initialize asynchronously without blocking UI

### Splash Behavior

The `splash.native` property controls splash screen behavior:

**`splash.native: true` (default)**
- Native Android splash stays visible during startup
- DiscoCapacitorApp waits for DiscoUI 'ready' event, then fades out native splash
- Use this for a seamless native experience

**`splash.native: false`**
- Native splash is hidden immediately
- DiscoUI web splash takes over (configure via `splash.mode`)
- Use this to fully control splash with DiscoUI

### Back Button Handling

```js
app.on('backButton', (event) => {
  // Custom back handling
  event.preventDefault(); // Prevents default back navigation
});
```

Default behavior (when not prevented):
- Navigates back in the frame if possible
- Otherwise, no action

### Theming
Set theme and accent on the `<html>` tag:
```html
<html disco-theme="auto" disco-accent="#d80073" disco-font="Segoe UI">
```

Or programmatically:
```js
app.setTheme('dark'); // Syncs to native bars automatically
app.setAccent('#D80073'); // Syncs to navigation bar color
```

## Project Structure
- `src/` — Capacitor plugin implementation
- `example-app/` — Android demo app (Vite)
- `android/` — Native Android plugin

## Development
- `npm run build` — build the plugin bundle
- `npm run watch` — watch and rebuild on changes
- `npm run build:android` — build debug APK for the example app

## License
This project is licensed under the [MIT License](LICENSE).

## Contact

For any inquiries or feedback, feel free to reach out!

<a href="https://www.buymeacoffee.com/cherryhoax" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>