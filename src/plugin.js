import { registerPlugin } from '@capacitor/core';

/**
 * @typedef {import('./types').DiscoUIPlugin} DiscoUIPlugin
 */

/**
 * @type {DiscoUIPlugin}
 */
export const DiscoUIPlugin = registerPlugin('DiscoUI', {
  web: () => import('./web.js').then((m) => new m.DiscoUIWeb()),
  electron: () => import('./web.js').then((m) => new m.DiscoUIWeb()),
});
