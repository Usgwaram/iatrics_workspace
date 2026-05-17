module.exports = {
  testEnvironment: "node",

  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  testMatch: ["**/tests/**/*.test.js"],

  collectCoverageFrom: [
    "src/controllers/**/*.js",
    "src/routes/**/*.js",
    "src/services/**/*.js",
  ],

  coverageDirectory: "coverage",

  forceExit: true,

  detectOpenHandles: true,

  verbose: true,
};