/* eslint-disable */

import axios from 'axios';
import { config } from 'dotenv';
module.exports = async function () {
  config();

  // Configure axios for tests to use.
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3000';
  //process.env.IS_DOCKER_COMPOSE = 'true';

  axios.defaults.baseURL = process.env['BASE_URL'] || `http://${host}:${port}`;
};
