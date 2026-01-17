import { iceGuard, type IceGuard } from './guard';

/**
 * Utility to transform reactive dependencies into a new derived value under ICE custody.
 * 
 * Works like a memoized computation that automatically re-evaluates when 
 * any of its dependencies change. Unlike an ICE Guard, iceCompute is intended for 
 * pure transformations and does not have a failure reason by default.
 * 
 * @template T - The type of input values.
 * @template R - The type of the computed result.
 * @param name - A unique name for the computation (required for SSR).
 * @param dependencies - An array of sources or guards to observe.
 * @param processor - A function that derives the new value.
 * @returns An ICE Guard holding the computed result.
 * 
 * @example
 * ```ts
 * const fullName = iceCompute('full-name', [firstName, lastName], (f, l) => `${f} ${l}`);
 * ```
 */
export function iceCompute<R>(
  name: string,
  dependencies: any[],
  processor: (...args: any[]) => R
): IceGuard<R> {
  return iceGuard(name, () => {
    const values = dependencies.map(dep => (typeof dep === 'function' ? dep() : dep));
    return processor(...values);
  });
}
