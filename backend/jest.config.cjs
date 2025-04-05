/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/dist/tests/**/*.test.js"], // Run compiled tests
  transformIgnorePatterns: ["node_modules/(?!(.pnpm/)?(uuid|@jest)/)"],
};
