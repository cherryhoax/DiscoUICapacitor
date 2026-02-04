import { registerPlugin } from '@capacitor/core';

/**
 * @typedef {import('./types').DiscoUIPlugin} DiscoUIPlugin
 */

export const DiscoUI = registerPlugin('DiscoUI', {
  web: () => import('./web.js').then((m) => new m.DiscoUIWeb()),
  electron: () => import('./web.js').then((m) => new m.DiscoUIWeb()),
});

export * from './types.js';
