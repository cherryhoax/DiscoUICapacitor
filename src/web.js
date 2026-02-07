import { WebPlugin } from '@capacitor/core';
import { setDiscoAppExport } from './exports.js';

/** @typedef {import('./types').DiscoAppOptions} DiscoAppOptions */
/** @typedef {import('./types').DiscoInitializeOptions} DiscoInitializeOptions */

const DEFAULT_IMPORT_PATH = 'discoui';
const FALLBACK_IMPORT_PATHS = ['/discoui.mjs'];
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

const wrapDiscoAppConstructor = (DiscoAppCtor, defaultConfig) => {
  class WrappedDiscoApp extends DiscoAppCtor {
    constructor(options) {
      super(options ?? defaultConfig);
    }
  }
  try {
    Object.defineProperty(WrappedDiscoApp, 'name', {
      value: DiscoAppCtor.name,
      configurable: true,
    });
  } catch {
    // ignore
  }
  Object.assign(WrappedDiscoApp, DiscoAppCtor);
  return WrappedDiscoApp;
};

const resolveDiscoAppConstructor = async (importPath) => {
  /** @type {Window & {discoApp?: unknown; DiscoApp?: new (options?: DiscoAppOptions)=>unknown; Disco?: { DiscoApp?: new (options?: DiscoAppOptions)=>unknown } }} */
  const win = window;
  if (win.DiscoApp) return win.DiscoApp;
  if (win.Disco?.DiscoApp) return win.Disco.DiscoApp;

  const tryImport = async (pathToLoad) => {
    try {
      const mod = await import(/* @vite-ignore */ pathToLoad);
      return mod.DiscoApp ?? mod.default;
    } catch {
      return undefined;
    }
  };

  const fromPrimary = await tryImport(importPath);
  if (fromPrimary) return fromPrimary;

  for (const fallback of FALLBACK_IMPORT_PATHS) {
    const fromFallback = await tryImport(fallback);
    if (fromFallback) return fromFallback;
  }

  return undefined;
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
    const importPath = options?.importPath ?? DEFAULT_IMPORT_PATH;
    const configPath = options?.configPath ?? DEFAULT_CONFIG_PATH;

    /** @type {Window & {discoApp?: unknown}} */
    const win = window;
    if (win.discoApp) {
      if (!win.app) win.app = win.discoApp;
      return;
    }

    const configFromFile = await loadConfig(configPath);
    const mergedConfig = mergeConfig(configFromFile ?? {}, options?.config);

    const DiscoAppCtor = await resolveDiscoAppConstructor(importPath);
    if (DiscoAppCtor) {
      const Wrapped = wrapDiscoAppConstructor(DiscoAppCtor, mergedConfig);
      win.DiscoApp = Wrapped;
      setDiscoAppExport(Wrapped);
      win.discoApp = new Wrapped();
      win.app = win.discoApp;
    }
  }
}
