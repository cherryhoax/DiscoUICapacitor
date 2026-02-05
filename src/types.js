/**
 * @typedef {"none" | "auto" | "manual"} DiscoSplashMode
 */

/**
 * @typedef {Object} DiscoSplashOptions
 * @property {DiscoSplashMode} [mode]
 * @property {string} [color]
 * @property {string} [icon]
 * @property {boolean} [showProgress]
 * @property {boolean} [native] - Whether to use native splash (true) or web splash (false)
 */

/**
 * @typedef {Object} DiscoAppOptions
 * @property {string} [theme]
 * @property {string} [accent]
 * @property {string} [font]
 * @property {DiscoSplashOptions} [splash]
 */

/**
 * @typedef {DiscoAppOptions} DiscoCapacitorAppConfig
 */

/**
 * @typedef {Object} DiscoInitializeOptions
 * @property {DiscoAppOptions} [config]
 * @property {string} [cssHref]
 * @property {string} [importPath]
 * @property {string} [configPath]
 */

/**
 * @typedef {typeof import('discoui').DiscoApp} DiscoAppInstanceConstructor
 */

/**
 * @typedef {DiscoAppInstanceConstructor & { ready?: (cb: () => void) => void | Promise<void> }} DiscoAppConstructor
 */

/**
 * @typedef {Object} Insets
 * @property {number} top
 * @property {number} bottom
 * @property {number} left
 * @property {number} right
 */

/**
 * @typedef {Object} DiscoUIPlugin
 * @property {(options?: DiscoInitializeOptions) => Promise<void>} initialize
 * @property {() => Promise<Insets>} getInsets
 * @property {(options?: {fadeOutDuration?: number}) => Promise<void>} hideSplash
 * @property {(options: {style: 'light' | 'dark'}) => Promise<void>} setStatusBarStyle
 * @property {(options: {style: 'light' | 'dark'}) => Promise<void>} setNavigationBarStyle
 * @property {(options: {color: string}) => Promise<void>} setNavigationBarColor
 * @property {(eventName: string, listenerFunc: (event: any) => void) => Promise<any>} addListener
 * @property {(listenerHandle: any) => Promise<void>} [removeListener]
 */

export {};
