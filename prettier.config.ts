// Legacy entrypoint kept to avoid tooling that auto-detects `prettier.config.ts`.
// Prefer `prettier.config.cjs` for a warning-free, Node-native config.
module.exports = require('./prettier.config.cjs')
