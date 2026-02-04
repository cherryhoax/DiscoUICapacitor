export interface DiscoUIViteOptions {
  buildDiscoUI?: boolean;
  publicPath?: string;
}

export function discoUIVitePlugin(options?: DiscoUIViteOptions): import('vite').Plugin;
