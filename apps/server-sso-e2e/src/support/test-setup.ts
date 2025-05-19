/* eslint-disable */

import axios from 'axios';
import { config } from 'dotenv';
import { join } from 'node:path';

module.exports = async function () {
  const serverUrl = process.env['E2E_SERVER_URL'];
  const parsed = config(
    process.env['ENV_FILE']
      ? {
          path: join(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            process.env['ENV_FILE']
          ),
          override: true,
        }
      : { override: true }
  );

  if (parsed.error) {
    throw parsed.error;
  }
};
