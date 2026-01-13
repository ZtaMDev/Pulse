import { useSyncExternalStore } from 'react';
import type { Guard, Source, GuardState } from '@pulse-js/core';

/**
 * Hook to consume a Pulse Unit (Source or Guard) in a React component.
 * 
 * - If passed a **Source**, it returns the current value and triggers a re-render when the value changes.
 * - If passed a **Guard**, it returns the current `GuardState` (ok, fail, pending, reason, value) 
 *   and triggers a re-render when the status or value changes.
 * 
 * @template T The underlying type of the reactive unit.
 * @param unit The Pulse Source or Guard to observe.
 * @returns The current value or guard state.
 * 
 * @example
 * ```tsx
 * // Using a Source
 * const count = usePulse(countSource);
 * 
 * // Using a Guard
 * const { status, reason, value } = usePulse(authGuard);
 * 
 * if (status === 'pending') return <Loading />;
 * if (status === 'fail') return <ErrorMessage message={reason} />;
 * return <Dashboard user={value} />;
 * ```
 */
export function usePulse<T>(unit: Source<T>): T;
export function usePulse<T>(unit: Guard<T>): GuardState<T>;
export function usePulse<T>(unit: Guard<T> | Source<T>): T | GuardState<T> {
  const isGuard = 'state' in unit;

  if (isGuard) {
    const g = unit as Guard<T>;
    return useSyncExternalStore(
      g.subscribe,
      g.state
    );
  } else {
    const s = unit as Source<T>;
    return useSyncExternalStore(
      s.subscribe,
      s
    );
  }
}
