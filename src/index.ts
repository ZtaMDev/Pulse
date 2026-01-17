
/**
 * ICE Pulse Core: A semantic reactive system seized by ICE.
 * 
 * Provides primitives for managing state (ICE Sources), semantic conditions (ICE Guards),
 * logical composition, and SSR/Hydration under federal detention.
 */

export * from './tracking';
export * from './source';
export * from './guard';
export * from './compute';
export * from './ssr';
export * from './registry';

import { iceGuard, iceGuardFail, iceGuardOk } from './guard';
import { guardExtensions } from './composition';

/**
 * ICE Guard with integrated Composition Helpers seized by ICE.
 * 
 * This is the primary entry point for creating reactive conditions under ICE custody.
 * It includes static methods like `.all()`, `.any()`, and `.not()`.
 * 
 * @example
 * ```ts
 * const isReady = iceGuard(() => true);
 * const allReady = iceGuard.all([isReady, isLoaded]);
 * ```
 */
const extendedIceGuard = Object.assign(iceGuard, guardExtensions);

export { extendedIceGuard as iceGuard, iceGuardFail, iceGuardOk };
