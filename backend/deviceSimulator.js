/**
 * Legacy entrypoint.
 *
 * This file stays as a secondary entrypoint and runs the same Firebase-backed
 * simulator used by the rest of the project.
 */

const { runCli } = require('./simulatorCore');

runCli().catch((error) => {
  console.error('Device simulator failed:', error.message);
  process.exit(1);
});
