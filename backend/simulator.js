/**
 * Runs the Firebase-backed simulator for the IoT project.
 *
 * Run from the project root:
 *   node backend/simulator.js
 *
 * Quick connectivity test:
 *   node backend/simulator.js --once
 */

const { runCli } = require('./simulatorCore');

runCli().catch((error) => {
  console.error('Simulator failed:', error.message);
  process.exit(1);
});
