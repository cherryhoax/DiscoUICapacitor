import { DiscoApp as BaseDiscoApp } from 'discoui';

/** @type {import('./types').DiscoAppConstructor | undefined} */
export let DiscoApp = BaseDiscoApp;

/**
 * @param {import('./types').DiscoAppConstructor | undefined} ctor
 */
export const setDiscoAppExport = (ctor) => {
  DiscoApp = ctor;
};
