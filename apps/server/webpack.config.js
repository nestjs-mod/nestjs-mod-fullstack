const { composePlugins, withNx } = require('@nx/webpack');

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx({
    sourceMap: true,
    target: 'node',
  }),
  (config) => {
    // Update the webpack config as needed here.
    // e.g. `config.plugins.push(new MyPlugin())`

    config.module.rules = [
      ...config.module.rules,
      {
        test: /\.(ts)$/,
        loader: 'string-replace-loader',
        options: {
          search: `class-validator`,
          replace: `class-validator-multi-lang`,
          flags: 'g',
        },
      },
      {
        test: /\.(ts)$/,
        loader: 'string-replace-loader',
        options: {
          search: 'class-transformer',
          replace: 'class-transformer-global-storage',
          flags: 'g',
        },
      },
    ];
    return config;
  }
);
