import { registerPlugin } from '@capacitor/core';
import { DiscoApp } from './exports.js';

/**
 * @typedef {import('./types').DiscoUIPlugin} DiscoUIPlugin
 */

export const DiscoUI = registerPlugin('DiscoUI', {
  web: () => import('./web.js').then((m) => new m.DiscoUIWeb()),
  electron: () => import('./web.js').then((m) => new m.DiscoUIWeb()),
});

export { DiscoApp };
export * from './types.js';
