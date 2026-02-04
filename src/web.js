import { WebPlugin } from '@capacitor/core';

/** @typedef {import('./types').DiscoAppOptions} DiscoAppOptions */
/** @typedef {import('./types').DiscoInitializeOptions} DiscoInitializeOptions */

const DEFAULT_CSS_HREF = 'discoui.css';
const DEFAULT_IMPORT_PATH = 'discoui';
const DEFAULT_CONFIG_PATH = '/disco.config.json';

const mergeConfig = (base, overrides) => {
  if (!overrides) return { ...base };
  return {
    ...base,
    ...overrides,
    splash: {
      ...base.splash,
      ...overrides.splash,
    },
  };
};

const ensurePreloadCss = (cssHref) => {
  if (!document?.head) return;
  if (document.querySelector('link[data-disco-preload="true"]')) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = cssHref;
  link.setAttribute('data-disco-preload', 'true');
  document.head.appendChild(link);
};

const resolveDiscoAppConstructor = async (importPath) => {
  /** @type {Window & {discoApp?: unknown; DiscoApp?: new (options?: DiscoAppOptions)=>unknown; Disco?: { DiscoApp?: new (options?: DiscoAppOptions)=>unknown } }} */
  const win = window;
  if (win.DiscoApp) return win.DiscoApp;
  if (win.Disco?.DiscoApp) return win.Disco.DiscoApp;

  try {
    const mod = await import(/* @vite-ignore */ importPath);
    return mod.DiscoApp ?? mod.default;
  } catch {
    return undefined;
  }
};

const loadConfig = async (configPath) => {
  if (!configPath) return undefined;
  try {
    const res = await fetch(configPath, { cache: 'no-store' });
    if (!res.ok) return undefined;
    return await res.json();
  } catch {
    return undefined;
  }
};

export class DiscoUIWeb extends WebPlugin {
  /**
   * @param {DiscoInitializeOptions} [options]
   * @returns {Promise<void>}
   */
  async initialize(options) {
    const cssHref = options?.cssHref ?? DEFAULT_CSS_HREF;
    const importPath = options?.importPath ?? DEFAULT_IMPORT_PATH;
    const configPath = options?.configPath ?? DEFAULT_CONFIG_PATH;

    ensurePreloadCss(cssHref);

    /** @type {Window & {discoApp?: unknown}} */
    const win = window;
    if (win.discoApp) return;

    const configFromFile = await loadConfig(configPath);
    const mergedConfig = mergeConfig(configFromFile ?? {}, options?.config);

    const DiscoAppCtor = await resolveDiscoAppConstructor(importPath);
    if (DiscoAppCtor) {
      win.discoApp = new DiscoAppCtor(mergedConfig);
    }
  }
}
