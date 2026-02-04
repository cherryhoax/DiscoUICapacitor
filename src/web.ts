import { WebPlugin } from '@capacitor/core';

import type { DiscoUIPlugin } from './definitions';

export class DiscoUIWeb extends WebPlugin implements DiscoUIPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
