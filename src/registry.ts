
import { type Source } from './source';
import { type Guard } from './guard';

export type PulseUnit = Source<any> | Guard<any>;

/**
 * Root Registry for Pulse.
 * 
 * Tracks all registered Units (Sources and Guards) globally for DevTools.
 * 
 * **IMPORTANT**: Only units with explicit names are registered and visible in DevTools.
 * Unnamed units work perfectly but are not tracked to avoid HMR instability.
 * 
 * @example
 * ```ts
 * // ✅ Visible in DevTools
 * const count = source(0, { name: 'count' });
 * 
 * // ❌ Not visible in DevTools (but works fine)
 * const temp = source(0);
 * ```
 */
class Registry {
  private units = new Map<string, PulseUnit>();
  private listeners = new Set<(unit: PulseUnit) => void>();
  private currentGeneration = 0;
  private cleanupScheduled = false;

  /**
   * Schedules cleanup of units that weren't re-registered (deleted from code).
   */
  private scheduleCleanup() {
    if (this.cleanupScheduled) return;
    
    this.cleanupScheduled = true;
    
    // Wait for all units to re-register, then cleanup the ones that didn't
    setTimeout(() => {
      this.cleanupDeadUnits();
      this.cleanupScheduled = false;
    }, 100);
  }

  /**
   * Removes units that weren't re-registered in the current generation.
   * Uses mark-and-sweep: units that were re-registered have current generation,
   * units that weren't are from old generation and should be removed.
   */
  private cleanupDeadUnits() {
    const toDelete: string[] = [];
    
    this.units.forEach((unit, key) => {
      const gen = (unit as any)._generation;
      // If unit is from previous generation, it wasn't re-registered (deleted from code)
      if (gen !== undefined && gen < this.currentGeneration) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => this.units.delete(key));
    
    if (toDelete.length > 0) {
      console.log(`[Pulse] Cleaned up ${toDelete.length} deleted units after HMR`);
    }
  }

  /**
   * Registers a unit (only if it has an explicit name).
   */
  register(unit: PulseUnit) {
    const unitWithMetadata = unit as any;
    const name = unitWithMetadata._name;
    
    // Only register units with explicit names
    if (!name) {
      return;
    }

    // Check if this is an HMR reload (unit with same name exists)
    const existingUnit = this.units.get(name);
    if (existingUnit) {
      const existingGen = (existingUnit as any)?._generation;
      
      // If existing unit is from current generation, just update it
      if (existingGen === this.currentGeneration) {
        unitWithMetadata._generation = this.currentGeneration;
        this.units.set(name, unit);
        this.listeners.forEach(l => l(unit));
        return;
      }
      
      // Existing unit is from old generation - this is HMR
      // Increment generation (mark phase) and schedule cleanup (sweep phase)
      this.currentGeneration++;
      this.scheduleCleanup();
    }

    // Register/update unit with current generation (marking it as "alive")
    unitWithMetadata._generation = this.currentGeneration;
    this.units.set(name, unit);
    this.listeners.forEach(l => l(unit));
  }

  getAll(): PulseUnit[] {
    return Array.from(this.units.values());
  }

  onRegister(listener: (unit: PulseUnit) => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  reset() {
    this.units.clear();
    this.currentGeneration = 0;
  }
}

const GLOBAL_KEY = '__PULSE_REGISTRY__';
const globalSymbols = (globalThis as any);

if (!globalSymbols[GLOBAL_KEY]) {
  globalSymbols[GLOBAL_KEY] = new Registry();
}

export const PulseRegistry = globalSymbols[GLOBAL_KEY] as Registry;
