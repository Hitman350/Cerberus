/** @type {import('jest').Config} */
export default {
  // Use 'node' as the test environment. This provides a JSDOM-free, backend-focused
  // environment that correctly handles things like timers and globals.
  testEnvironment: 'node',

  // Clear mocks between every test. This is a best practice to ensure tests are
  // isolated and don't influence each other's outcomes.
  clearMocks: true,

  // A list of paths to directories that Jest should search for tests in.
  // This helps speed up test discovery.
  roots: ['<rootDir>/tests'],

  // The file patterns Jest uses to detect test files. We will look for files
  // ending in .test.js or .spec.js within our /tests directory.
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.spec.js'],

  // Stop running tests after the first `n` failures. Useful for CI environments
  // to fail fast. Can be set to 1 for quick feedback.
  bail: 1,

  // Enable verbose output to see each individual test result during the run.
  verbose: true,

  // By default, Jest will not transform any files from node_modules.
  // This empty transform configuration is sufficient for a pure ESM project like ours
  // that doesn't require transpilation (like with Babel or TypeScript).
  transform: {},
};