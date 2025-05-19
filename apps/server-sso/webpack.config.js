const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/server-sso'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: [
        './src/assets',
        {
          glob: '**/*.json',
          input: '../../node_modules/class-validator-multi-lang/i18n/',
          output: './assets/i18n/class-validator-multi-lang-messages/',
        },
      ],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
  module: {
    rules: [
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
    ],
  },
};
