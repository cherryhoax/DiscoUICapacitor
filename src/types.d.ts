export type DiscoSplashMode = "none" | "auto" | "manual";

export interface DiscoSplashOptions {
  mode?: DiscoSplashMode;
  color?: string;
  icon?: string;
  showProgress?: boolean;
  native?: boolean;
}

export interface DiscoAppOptions {
  theme?: string;
  accent?: string;
  font?: string;
  splash?: DiscoSplashOptions;
}

export type DiscoCapacitorAppConfig = DiscoAppOptions;

export interface DiscoInitializeOptions {
  config?: DiscoAppOptions;
  cssHref?: string;
  importPath?: string;
  configPath?: string;
}

import { DiscoApp as DiscoAppValue } from "discoui";

export type DiscoAppConstructor = typeof DiscoAppValue & {
  ready?: (cb: () => void) => void | Promise<void>;
};

export interface Insets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface DiscoUIPlugin {
  initialize(options?: DiscoInitializeOptions): Promise<void>;
  getInsets(): Promise<Insets>;
  hideSplash(options?: { fadeOutDuration?: number }): Promise<void>;
  setStatusBarStyle(options: { style: 'light' | 'dark' }): Promise<void>;
  setNavigationBarStyle(options: { style: 'light' | 'dark' }): Promise<void>;
  setNavigationBarColor(options: { color: string }): Promise<void>;
  addListener(eventName: string, listenerFunc: (event: any) => void): Promise<any>;
  removeListener?(listenerHandle: any): Promise<void>;
}
