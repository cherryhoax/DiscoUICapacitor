import { registerPlugin } from '@capacitor/core';
import { DiscoApp } from './exports.js';

/**
 * @typedef {import('./types').DiscoUIPlugin} DiscoUIPlugin
 */

export const DiscoUI = registerPlugin('DiscoUI', {
  web: () => import('./web.js').then((m) => new m.DiscoUIWeb()),
  electron: () => import('./web.js').then((m) => new m.DiscoUIWeb()),
});

const wireInsets = () => {
  if (typeof window === 'undefined') return;

  const applyInsets = (insets) => {
    if (!insets) return;
    const root = document.documentElement;
    if (typeof window !== 'undefined') {
      const ratio = window.devicePixelRatio || 1;
      root.setAttribute('disco-dpr', String(ratio));
    }
    const applyAttr = (name, value) => {
      if (value === null || value === undefined) {
        root.removeAttribute(name);
        return;
      }
      root.setAttribute(name, String(value));
    };

    applyAttr('disco-inset-top', insets.top ?? 0);
    applyAttr('disco-inset-right', insets.right ?? 0);
    applyAttr('disco-inset-bottom', insets.bottom ?? 0);
    applyAttr('disco-inset-left', insets.left ?? 0);

    const app = window.app || window.discoApp;
    if (app && typeof app.setInsets === 'function') {
      app.setInsets(insets);
    }
  };

  const handleBackButton = () => {
    const frame = window.frame;
    if (frame && typeof frame.goBack === 'function') {
      frame.goBack();
      return;
    }
  };

  if (typeof DiscoUI.addListener === 'function') {
    DiscoUI.addListener('insetsChange', (data) => applyInsets(data));
    DiscoUI.addListener('backButton', () => handleBackButton());
  }
  if (typeof DiscoUI.getInsets === 'function') {
    DiscoUI.getInsets().then(applyInsets).catch(() => {});
  }
};

wireInsets();

export { DiscoApp };
export * from './types.js';
