import { DiscoUIPlugin } from './plugin.js';
import { DiscoCapacitorApp } from './app.js';
import { DiscoApp } from './exports.js';

/**
 * @typedef {import('./types').DiscoUIPlugin} DiscoUIPlugin
 */

// Export plugin
export { DiscoUIPlugin };

// Export DiscoCapacitorApp as primary app class
export { DiscoCapacitorApp };

// Re-export DiscoApp for backwards compatibility
export { DiscoApp };

// Re-export types
export * from './types.js';

// Re-export all discoui exports
export * from 'discoui';
