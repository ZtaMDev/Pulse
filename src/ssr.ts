
import { type Guard, type GuardState } from './guard';

/**
 * Serialized state of guards for transfer from server to client.
 */
export interface HydrationState {
  /** Map of guard names to their semantic states. */
  [key: string]: GuardState<any>;
}

/** 
 * Internal registry to map named guards for hydration.
 */
const guardRegistry = new Map<string, Guard<any>>();

/**
 * Registers a guard to be automatically hydrated when the client starts.
 * Guards with a 'name' are automatically registered upon creation.
 * 
 * @internal
 */
export function registerGuardForHydration(name: string, guard: Guard<any>) {
  guardRegistry.set(name, guard);
}

/**
 * Evaluates a list of Pulse Guards and returns a serializable snapshot of their states.
 * This is meant to be used on the server (SSR).
 * It waits for any 'pending' guards to resolve before taking the snapshot.
 * 
 * @param guards Array of guards to evaluate.
 * @returns A promise resolving to the hydration state.
 * 
 * @example
 * ```ts
 * // Server side
 * const state = await evaluate([isLoggedIn, userData]);
 * const html = renderToString(<App />);
 * res.send(`
 *   <script>window.__PULSE_STATE__ = ${JSON.stringify(state)}</script>
 *   <div id="root">${html}</div>
 * `);
 * ```
 */
export async function evaluate(guards: Guard<any>[]): Promise<HydrationState> {
  const state: HydrationState = {};
  
  // Wait for all guards to settle (no longer pending)
  await Promise.all(guards.map(async (g) => {
    while (g.pending()) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }));

  guards.forEach(g => {
    const name = (g as any)._name;
    if (name) {
      state[name] = g.state();
    }
  });

  return state;
}

/**
 * Hydrates client-side guards with the state captured on the server.
 * This should be called early in the client lifecycle, before rendering.
 * 
 * @param state The hydration state received from the server.
 * 
 * @example
 * ```ts
 * // Client side
 * import { hydrate } from '@pulse/core';
 * hydrate(window.__PULSE_STATE__);
 * ```
 */
export function hydrate(state: HydrationState) {
  Object.entries(state).forEach(([name, guardState]) => {
    const g = guardRegistry.get(name);
    if (g && (g as any)._hydrate) {
      (g as any)._hydrate(guardState);
    }
  });
}
