/* eslint-disable */

import axios from 'axios';
import { config } from 'dotenv';
import { join } from 'node:path';

module.exports = async function () {
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

  // Configure axios for tests to use.
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3000';
  //process.env.IS_DOCKER_COMPOSE = 'true';

  axios.defaults.baseURL = process.env['BASE_URL'] || `http://${host}:${port}`;
};
