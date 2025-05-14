module.exports = {
  entry: ['src/server.ts'], // Main entry point based on project structure
  project: ['src/**/*.ts'],
  ignore: ['**/*.test.ts', '**/tests/**'],
  ignoreDependencies: ['eslint', 'typescript']
}; 