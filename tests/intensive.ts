/**
 * Intensive Integration Test for Pulse
 * 
 * This test demonstrates complex dependency tracking, error handling,
 * and reason propagation in a realistic scenario.
 */

import { source, guard, guardFail } from '../src';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Simulates an async API call that may fail
 */
async function fetchUser(id: number): Promise<{ id: number; name: string; role: string } | null> {
  await delay(10);
  if (id === 0) return null;
  if (id === 999) throw new Error('User service unavailable');
  return { id, name: `User ${id}`, role: id === 1 ? 'admin' : 'user' };
}

/**
 * Simulates checking permissions
 */
async function checkPermission(userId: number, resource: string): Promise<boolean> {
  await delay(5);
  if (userId === 1) return true; // Admin has all permissions
  if (resource === 'public') return true;
  return false;
}

/**
 * Simple delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Logs guard state with color coding
 */
function logGuardState(name: string, g: any) {
  const state = g.state();
  const status = state.status;
  const emoji = status === 'ok' ? '✅' : status === 'fail' ? '❌' : '⏳';
  
  console.log(`${emoji} ${name}:`, {
    status,
    value: state.value,
    reason: state.reason?.toString?.() || state.reason,
  });
}

// ============================================================================
// STATE SETUP
// ============================================================================

console.log('\n🚀 Starting Intensive Pulse Test\n');

// User state
const userId = source<number>(0, { name: 'userId' });
const currentResource = source<string>('dashboard', { name: 'currentResource' });
const isOnline = source<boolean>(true, { name: 'isOnline' });

// Feature flags
const enableAdvancedFeatures = source<boolean>(false, { name: 'enableAdvancedFeatures' });
const maintenanceMode = source<boolean>(false, { name: 'maintenanceMode' });

// ============================================================================
// GUARDS - Complex Dependency Chain
// ============================================================================

// Level 1: Basic guards
const hasUserId = guard('has-user-id', () => {
  const id = userId();
  if (id === 0) {
    return guardFail('No user ID provided');
  }
  return true;
});

const isSystemOnline = guard('is-system-online', () => {
  if (!isOnline()) {
    return guardFail('System is offline');
  }
  if (maintenanceMode()) {
    return guardFail('System is in maintenance mode');
  }
  return true;
});

// Level 2: Async guards with dependencies
const userProfile = guard('user-profile', async () => {
  if (!hasUserId.ok()) {
    return guardFail('Cannot fetch user: ' + hasUserId.state().reason);
  }
  
  const id = userId();
  const user = await fetchUser(id);
  
  if (!user) {
    return guardFail(`User ${id} not found`);
  }
  
  return user;
});

const hasPermission = guard('has-permission', async () => {
  if (!userProfile.ok()) {
    return guardFail('Cannot check permission: user not loaded');
  }
  
  const user = userProfile();
  if (!user) {
    return guardFail('User data unavailable');
  }
  
  const resource = currentResource();
  const allowed = await checkPermission(user.id, resource);
  
  if (!allowed) {
    return guardFail(
      `Access denied to ${resource} (user: ${user.id}, role: ${user.role})`
    );
  }
  
  return true;
});

// Level 3: Composed guards
const canAccessResource = guard.all('can-access-resource', [
  isSystemOnline,
  hasUserId,
  userProfile,
  hasPermission
]);

const isAdmin = guard('is-admin', () => {
  if (!userProfile.ok()) {
    return guardFail('Cannot determine admin status: user not loaded');
  }
  
  const user = userProfile();
  if (!user) return false;
  
  return user.role === 'admin';
});

const canUseAdvancedFeatures = guard.all('can-use-advanced-features', [
  canAccessResource,
  isAdmin,
  guard('features-enabled', () => {
    if (!enableAdvancedFeatures()) {
      return guardFail('Advanced features are disabled');
    }
    return true;
  })
]);

// ============================================================================
// TEST SCENARIOS
// ============================================================================

async function runScenario(name: string, setup: () => void) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 SCENARIO: ${name}`);
  console.log('='.repeat(60));
  
  setup();
  
  // Wait for async guards to settle
  await delay(50);
  
  // Log all guard states
  logGuardState('hasUserId', hasUserId);
  logGuardState('isSystemOnline', isSystemOnline);
  logGuardState('userProfile', userProfile);
  logGuardState('hasPermission', hasPermission);
  logGuardState('canAccessResource', canAccessResource);
  logGuardState('isAdmin', isAdmin);
  logGuardState('canUseAdvancedFeatures', canUseAdvancedFeatures);
  
  // Show dependency tree for complex guard
  const explanation = canUseAdvancedFeatures.explain();
  console.log('\n🌳 Dependency Tree for canUseAdvancedFeatures:');
  console.log(JSON.stringify(explanation, null, 2));
}

// ============================================================================
// RUN SCENARIOS
// ============================================================================

(async () => {
  try {
    // Scenario 1: No user logged in
    await runScenario('No User Logged In', () => {
      userId.set(0);
      currentResource.set('dashboard');
      isOnline.set(true);
      maintenanceMode.set(false);
      enableAdvancedFeatures.set(false);
    });

    // Scenario 2: Regular user accessing public resource
    await runScenario('Regular User - Public Resource', () => {
      userId.set(2);
      currentResource.set('public');
      isOnline.set(true);
      maintenanceMode.set(false);
      enableAdvancedFeatures.set(false);
    });

    // Scenario 3: Regular user accessing protected resource (should fail)
    await runScenario('Regular User - Protected Resource (FAIL)', () => {
      userId.set(2);
      currentResource.set('admin-panel');
      isOnline.set(true);
      maintenanceMode.set(false);
      enableAdvancedFeatures.set(false);
    });

    // Scenario 4: Admin user with all permissions
    await runScenario('Admin User - Full Access', () => {
      userId.set(1);
      currentResource.set('admin-panel');
      isOnline.set(true);
      maintenanceMode.set(false);
      enableAdvancedFeatures.set(true);
    });

    // Scenario 5: System offline
    await runScenario('System Offline', () => {
      userId.set(1);
      currentResource.set('dashboard');
      isOnline.set(false);
      maintenanceMode.set(false);
      enableAdvancedFeatures.set(true);
    });

    // Scenario 6: Maintenance mode
    await runScenario('Maintenance Mode', () => {
      userId.set(1);
      currentResource.set('dashboard');
      isOnline.set(true);
      maintenanceMode.set(true);
      enableAdvancedFeatures.set(true);
    });

    // Scenario 7: Service error (user 999 triggers error)
    await runScenario('Service Error (User 999)', () => {
      userId.set(999);
      currentResource.set('dashboard');
      isOnline.set(true);
      maintenanceMode.set(false);
      enableAdvancedFeatures.set(false);
    });

    // Scenario 8: Complex success case
    await runScenario('Complex Success - Admin with Advanced Features', () => {
      userId.set(1);
      currentResource.set('analytics');
      isOnline.set(true);
      maintenanceMode.set(false);
      enableAdvancedFeatures.set(true);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ All scenarios completed successfully!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
})();
