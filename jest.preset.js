const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    ...(nxPreset.moduleNameMapper || {}),
    '^flat': 'node_modules/flat/index.js',
    '@jsverse/transloco-keys-manager/marker': 'libs/testing/marker.js',
  },
};
