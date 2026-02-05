import { DiscoApp } from './exports.js';
import { DiscoUIPlugin } from './plugin.js';

/**
 * @typedef {import('./types').DiscoAppOptions} DiscoAppOptions
 * @typedef {import('./types').DiscoCapacitorAppConfig} DiscoCapacitorAppConfig
 */

const DEFAULT_CONFIG_PATH = '/disco.config.json';

/**
 * Load configuration from JSON file
 * @param {string} configPath
 * @returns {Promise<DiscoCapacitorAppConfig | undefined>}
 */
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

/**
 * Merge configurations with precedence to constructor config
 * @param {DiscoCapacitorAppConfig} [fileConfig]
 * @param {DiscoCapacitorAppConfig} [ctorConfig]
 * @returns {DiscoCapacitorAppConfig}
 */
const mergeConfigs = (fileConfig, ctorConfig) => {
  const base = fileConfig || {};
  const override = ctorConfig || {};
  return {
    ...base,
    ...override,
    splash: {
      ...base.splash,
      ...override.splash,
    },
  };
};

/**
 * DiscoCapacitorApp - DiscoUI app with Capacitor native integration
 * Extends DiscoApp with auto-initialization of native features
 */
export class DiscoCapacitorApp extends DiscoApp {
  /**
   * @param {DiscoCapacitorAppConfig} [config]
   */
  constructor(config) {
    super(config);

    /** @type {DiscoCapacitorAppConfig} */
    this._config = config || {};

    /** @type {boolean} */
    this._initialized = false;

    // Start async initialization without blocking
    this._initialize().catch((err) => {
      console.error('[DiscoCapacitorApp] Initialization error:', err);
    });
  }

  /**
   * Internal async initialization
   * @private
   * @returns {Promise<void>}
   */
  async _initialize() {
    try {
      // Load config from file and merge with constructor config
      const fileConfig = await loadConfig(DEFAULT_CONFIG_PATH);
      const mergedConfig = mergeConfigs(fileConfig, this._config);
      this._config = mergedConfig;

      // Get initial insets and set attributes
      await this._updateInsets();

      // Subscribe to insets changes
      DiscoUIPlugin.addListener('insetsChanged', async () => {
        await this._updateInsets();
        this.emit('insetsChanged');
      });

      // Subscribe to back button events
      DiscoUIPlugin.addListener('backButton', (event) => {
        this._handleBackButton(event);
      });

      // Subscribe to system theme changes
      DiscoUIPlugin.addListener('systemThemeChanged', (event) => {
        this._handleSystemThemeChanged(event);
      });

      // Handle splash behavior based on config
      await this._configureSplash();

      // Sync initial theme and accent to native
      await this._syncTheme();
      await this._syncAccent();

      this._initialized = true;
    } catch (err) {
      console.error('[DiscoCapacitorApp] Failed to initialize:', err);
    }
  }

  /**
   * Update insets from native and set HTML attributes
   * @private
   * @returns {Promise<void>}
   */
  async _updateInsets() {
    try {
      const insets = await DiscoUIPlugin.getInsets();
      const root = document.documentElement;
      if (root) {
        root.setAttribute('disco-inset-top', String(insets.top));
        root.setAttribute('disco-inset-bottom', String(insets.bottom));
        root.setAttribute('disco-inset-left', String(insets.left));
        root.setAttribute('disco-inset-right', String(insets.right));
      }
    } catch (err) {
      // Swallow errors for web fallback
    }
  }

  /**
   * Configure splash screen behavior
   * @private
   * @returns {Promise<void>}
   */
  async _configureSplash() {
    const splashNative = this._config.splash?.native;

    if (splashNative === false) {
      // Hide native splash immediately to show web splash
      try {
        await DiscoUIPlugin.hideSplash({ fadeOutDuration: 0 });
      } catch (err) {
        // Swallow errors for web fallback
      }
    } else if (splashNative === true) {
      // Native splash stays visible - hide after DiscoUI ready event
      this.on('ready', async () => {
        try {
          await DiscoUIPlugin.hideSplash({ fadeOutDuration: 300 });
        } catch (err) {
          // Swallow errors for web fallback
        }
      });
    }
  }

  /**
   * Handle back button event from native
   * @private
   * @param {any} nativeEvent
   */
  _handleBackButton(nativeEvent) {
    let defaultPrevented = false;

    const event = {
      preventDefault: () => {
        defaultPrevented = true;
      },
      get defaultPrevented() {
        return defaultPrevented;
      },
    };

    // Emit to JavaScript consumers
    this.emit('backButton', event);

    // If not prevented, run default back flow
    if (!defaultPrevented) {
      this._defaultBackFlow();
    }
  }

  /**
   * Default back button flow
   * @private
   */
  _defaultBackFlow() {
    // Default back flow: navigate back in frame if possible
    const frame = this._frame;
    if (frame && frame.canGoBack && frame.canGoBack()) {
      frame.goBack();
    }
  }

  /**
   * Handle system theme change from native
   * @private
   * @param {any} event
   */
  _handleSystemThemeChanged(event) {
    // If app theme is 'auto', sync to native theme
    const currentTheme = this.getTheme();
    if (currentTheme === 'auto') {
      this._syncTheme();
    }
  }

  /**
   * Sync theme to native status/navigation bars
   * @private
   * @returns {Promise<void>}
   */
  async _syncTheme() {
    try {
      const theme = this.getTheme();
      const resolvedTheme = this._resolveTheme(theme);
      const style = resolvedTheme === 'dark' ? 'dark' : 'light';

      await DiscoUIPlugin.setStatusBarStyle({ style });
      await DiscoUIPlugin.setNavigationBarStyle({ style });
    } catch (err) {
      // Swallow errors for web fallback
    }
  }

  /**
   * Resolve 'auto' theme to 'light' or 'dark'
   * @private
   * @param {string} theme
   * @returns {string}
   */
  _resolveTheme(theme) {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return theme;
  }

  /**
   * Sync accent color to native navigation bar
   * @private
   * @returns {Promise<void>}
   */
  async _syncAccent() {
    try {
      const accent = this.getAccent();
      if (accent) {
        await DiscoUIPlugin.setNavigationBarColor({ color: accent });
      }
    } catch (err) {
      // Swallow errors for web fallback
    }
  }

  /**
   * Override setTheme to sync to native
   * Note: Native sync happens asynchronously and is not awaited
   * @param {string} theme
   */
  setTheme(theme) {
    super.setTheme(theme);
    this._syncTheme();
  }

  /**
   * Override setAccent to sync to native
   * Note: Native sync happens asynchronously and is not awaited
   * @param {string} color
   */
  setAccent(color) {
    super.setAccent(color);
    this._syncAccent();
  }

  /**
   * Launch the app with a frame
   * @param {HTMLElement} frame
   */
  launch(frame) {
    this._frame = frame;
    super.launch(frame);
  }
}
