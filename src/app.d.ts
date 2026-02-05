import { DiscoApp } from 'discoui';
import { DiscoCapacitorAppConfig } from './types.js';

/**
 * DiscoCapacitorApp - DiscoUI app with Capacitor native integration
 * Extends DiscoApp with auto-initialization of native features
 */
export declare class DiscoCapacitorApp extends DiscoApp {
  /**
   * Create a new DiscoCapacitorApp instance
   * @param config - Optional configuration
   */
  constructor(config?: DiscoCapacitorAppConfig);

  /**
   * Set theme and sync to native bars
   * @param theme - Theme name ('light', 'dark', 'auto')
   */
  setTheme(theme: string): void;

  /**
   * Set accent color and sync to native navigation bar
   * @param color - Accent color (hex string)
   */
  setAccent(color: string): void;

  /**
   * Launch the app with a frame element
   * @param frame - The disco-frame element
   */
  launch(frame: HTMLElement): void;
}
