declare module 'discoui' {
  export class DiscoApp {
    constructor(config?: any);
    launch(frame: HTMLElement): void;
    dismissSplash(): Promise<void>;
    setupSplash(): void;
  }
  export class DiscoAppDelegate {}
}