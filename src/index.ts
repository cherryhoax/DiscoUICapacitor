import { registerPlugin } from '@capacitor/core';

import type { DiscoUIPlugin } from './definitions';

const DiscoUI = registerPlugin<DiscoUIPlugin>('DiscoUI', {
  web: () => import('./web').then((m) => new m.DiscoUIWeb()),
});

export * from './definitions';
export { DiscoUI };
