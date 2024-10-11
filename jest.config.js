/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": "ts-jest", // Use ts-jest to handle TypeScript files
  },
  extensionsToTreatAsEsm: [".ts"], // Treat .ts files as ES modules
  testMatch: ["**/*.test.ts"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    // Fix imports for ES modules that use .js extension
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
