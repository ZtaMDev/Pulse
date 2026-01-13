
import { type Source } from './source';
import { type Guard } from './guard';

export type PulseUnit = Source<any> | Guard<any>;

/**
 * Root Registry for Pulse.
 * 
 * It tracks all registered Units (Sources and Guards) globally, providing 
 * the data source for DevTools and HMR stability.
 */
class Registry {
  private units = new Map<string | PulseUnit, PulseUnit>();
  private listeners = new Set<(unit: PulseUnit) => void>();

  /**
   * Registers a new unit (Source or Guard).
   * Uses the unit's name as a key to prevent duplicates during HMR.
   */
  register(unit: PulseUnit) {
    const key = (unit as any)._name || unit;
    this.units.set(key, unit);
    this.listeners.forEach(l => l(unit));
  }

  /**
   * Retrieves all registered units.
   */
  getAll(): PulseUnit[] {
    return Array.from(this.units.values());
  }

  /**
   * Subscribes to new unit registrations.
   * 
   * @param listener - Callback receiving the newly registered unit.
   * @returns Unsubscribe function.
   */
  onRegister(listener: (unit: PulseUnit) => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
}

export const PulseRegistry = new Registry();
