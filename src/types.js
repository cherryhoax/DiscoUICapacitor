/**
 * @typedef {"none" | "auto" | "manual"} DiscoSplashMode
 */

/**
 * @typedef {Object} DiscoSplashOptions
 * @property {DiscoSplashMode} [mode]
 * @property {string} [color]
 * @property {string} [icon]
 * @property {boolean} [showProgress]
 */

/**
 * @typedef {Object} DiscoAppOptions
 * @property {string} [theme]
 * @property {string} [accent]
 * @property {string} [font]
 * @property {DiscoSplashOptions} [splash]
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
 * @typedef {Object} DiscoUIPlugin
 * @property {(options?: DiscoInitializeOptions) => Promise<void>} initialize
 */

export {};
