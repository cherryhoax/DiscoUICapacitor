import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @typedef {Object} DiscoUIViteOptions
 * @property {string} [publicPath] Public path prefix for injected assets (default '/').
 */

/**
 * DiscoUI Vite plugin that builds DiscoUI, copies assets into dist, and injects CSS.
 * @param {DiscoUIViteOptions} [options]
 */
export const discoUIVitePlugin = (options = {}) => {
  const { publicPath = '/' } = options;
  let cssSource;
  let jsSource;

  const findDiscoUIRoot = (startDir) => {
    let current = startDir;
    while (true) {
      const candidate = path.resolve(current, 'node_modules', 'discoui');
      if (existsSync(candidate)) return candidate;
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
    return null;
  };

  return {
    name: 'discoui-capacitor',
    apply: 'build',
    config() {
      return {
        build: {
          rollupOptions: {
            external: ['/discoui.mjs'],
          },
        },
      };
    },
    buildStart() {
      const rootDir = process.cwd();
      const pluginDir = path.dirname(fileURLToPath(import.meta.url));
      const discouiRoot =
        findDiscoUIRoot(rootDir) ||
        findDiscoUIRoot(pluginDir) ||
        findDiscoUIRoot(path.resolve(pluginDir, '..'));
      if (!discouiRoot) {
        this.error('[discoui-capacitor] DiscoUI package not found. Install discoui dependency.');
      }
      const cssPath = path.resolve(discouiRoot, 'dist', 'discoui.css');
      const jsPath = path.resolve(discouiRoot, 'dist', 'discoui.mjs');
      const hasAssets = existsSync(cssPath) && existsSync(jsPath);
      if (!hasAssets) {
        this.error('[discoui-capacitor] DiscoUI assets missing. Build discoui (so dist/discoui.css and dist/discoui.mjs exist) or install a discoui package that ships prebuilt assets.');
      }
      cssSource = readFileSync(cssPath, 'utf8');
      jsSource = readFileSync(jsPath);
    },
    transformIndexHtml(html) {
      const href = `${publicPath}discoui.css`;
      if (html.includes(href)) return html;
      return html.replace('</head>', `  <link rel="stylesheet" href="${href}" />\n</head>`);
    },
    generateBundle() {
      if (cssSource) {
        this.emitFile({ type: 'asset', fileName: 'discoui.css', source: cssSource });
      }
      if (jsSource) {
        this.emitFile({ type: 'asset', fileName: 'discoui.mjs', source: jsSource });
      }
    },
  };
};
