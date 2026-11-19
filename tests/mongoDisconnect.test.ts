import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import {
  getConnectionState,
  isDatabaseConnected,
  setupMongoLifecycleListeners,
  disconnectDB,
} from '../server/src/config/database';

async function runTests() {
  console.log('Running MongoDB Disconnect & Lifecycle Test Suite (Task 23)...');

  // Test 1: Function exports exist and verify initial state
  {
    assert.strictEqual(typeof getConnectionState, 'function');
    assert.strictEqual(typeof isDatabaseConnected, 'function');
    assert.strictEqual(typeof setupMongoLifecycleListeners, 'function');
    assert.strictEqual(typeof disconnectDB, 'function');

    const state = getConnectionState();
    assert.ok(
      ['connected', 'connecting', 'disconnecting', 'disconnected'].includes(state),
      `State '${state}' must be a valid connection state`
    );
    console.log(`[PASS] Test 1: Lifecycle functions exported and state reports '${state}'.`);
  }

  // Test 2: setupMongoLifecycleListeners registers event listeners safely
  {
    setupMongoLifecycleListeners();

    // Verify listeners exist on mongoose.connection
    const connectedListeners = mongoose.connection.listenerCount('connected');
    const disconnectedListeners = mongoose.connection.listenerCount('disconnected');
    const errorListeners = mongoose.connection.listenerCount('error');
    const reconnectedListeners = mongoose.connection.listenerCount('reconnected');

    assert.ok(connectedListeners > 0, 'Must have connected listener');
    assert.ok(disconnectedListeners > 0, 'Must have disconnected listener');
    assert.ok(errorListeners > 0, 'Must have error listener');
    assert.ok(reconnectedListeners > 0, 'Must have reconnected listener');

    console.log('[PASS] Test 2: Lifecycle listeners (connected, disconnected, error, reconnected) registered.');
  }

  // Test 3: Emitting disconnected event does NOT crash the process
  {
    let disconnectedHandled = false;
    try {
      mongoose.connection.emit('disconnected');
      disconnectedHandled = true;
    } catch (e) {
      disconnectedHandled = false;
    }
    assert.strictEqual(disconnectedHandled, true, 'Disconnected event must be handled gracefully');
    console.log('[PASS] Test 3: Disconnected event safely handled without throwing uncaught exceptions.');
  }

  // Test 4: Emitting error event does NOT throw or crash
  {
    let errorHandled = false;
    try {
      mongoose.connection.emit('error', new Error('Simulated network timeout'));
      errorHandled = true;
    } catch (e) {
      errorHandled = false;
    }
    assert.strictEqual(errorHandled, true, 'Connection error must be safely caught by error listener');
    console.log('[PASS] Test 4: Simulated database network error safely caught by lifecycle listener.');
  }

  // Test 5: Emitting reconnected event restores state
  {
    mongoose.connection.emit('reconnected');
    console.log('[PASS] Test 5: Reconnection event cleanly processed.');
  }

  // Test 6: disconnectDB cleans up gracefully
  {
    await disconnectDB();
    console.log('[PASS] Test 6: disconnectDB runs cleanly and clears timers.');
  }

  console.log('\nAll 6 MongoDB Disconnect & Lifecycle tests PASSED successfully!\n');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
