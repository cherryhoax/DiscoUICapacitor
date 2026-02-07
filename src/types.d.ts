export type DiscoSplashMode = "none" | "auto" | "manual";

export interface DiscoSplashOptions {
  mode?: DiscoSplashMode;
  color?: string;
  icon?: string;
  showProgress?: boolean;
}

export interface DiscoInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DiscoAppOptions {
  theme?: string;
  accent?: string;
  font?: string;
  splash?: DiscoSplashOptions;
}

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

export interface DiscoUIPlugin {
  initialize(options?: DiscoInitializeOptions): Promise<void>;
  getInsets(): Promise<DiscoInsets>;
  exitApp(): Promise<void>;
}
