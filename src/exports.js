import { DiscoApp as BaseDiscoApp } from 'discoui';

const DEFAULT_CONFIG_PATH = 'disco.config.json';

const loadConfig = async () => {
  try {
    const res = await fetch(DEFAULT_CONFIG_PATH);
    if (!res.ok) return {};
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        return {};
    }
  } catch {
    return {};
  }
};

const configPromise = loadConfig();

class DiscoApp extends BaseDiscoApp {
  constructor(options = {}) {
    const userProvidedSplash = !!options.splash;
    const initialOptions = { ...options };
    
    if (!userProvidedSplash) {
      initialOptions.splash = { ...initialOptions.splash, mode: 'none' };
    }

    super(initialOptions);

    configPromise.then((fileConfig) => {
        this._applyConfig(fileConfig, userProvidedSplash);
    });
  }

  _applyConfig(fileConfig, userProvidedSplash) {
    if (!fileConfig) return;

    if (fileConfig.theme) {
        this._theme = fileConfig.theme;
        this.initTheme();
    }
    if (fileConfig.accent) {
        this._accent = fileConfig.accent;
        this.initTheme();
    }
    if (fileConfig.font) {
        this._font = fileConfig.font;
        this.initTheme();
    }
    
    if (fileConfig.splash) {
        const mergedSplash = { ...this.splashConfig, ...fileConfig.splash };
        this.splashConfig = mergedSplash;

        if (this.splash) {
            if (mergedSplash.color) this.splash.setAttribute('color', mergedSplash.color);
            if (mergedSplash.icon) this.splash.setAttribute('logo', mergedSplash.icon);
            if (mergedSplash.showProgress) {
                this.splash.setAttribute('show-progress', '');
                if (mergedSplash.progressColor) this.splash.setAttribute('progress-color', mergedSplash.progressColor);
            } else {
                this.splash.removeAttribute('show-progress');
            }
            
            if (mergedSplash.mode === 'auto') {
                 requestAnimationFrame(() => {
                     this.setupSplash();
                     this.dismissSplash();
                 });
            }
        }
    }
  }
}

/** @type {import('./types').DiscoAppConstructor | undefined} */
export { DiscoApp };

/**
 * @param {import('./types').DiscoAppConstructor | undefined} ctor
 */
export const setDiscoAppExport = (ctor) => {
  DiscoApp = ctor;
};