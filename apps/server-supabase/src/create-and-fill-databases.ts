import { isInfrastructureMode } from '@nestjs-mod/common';
import { Logger } from '@nestjs/common';
import { setTimeout } from 'node:timers/promises';
import {
  createDatabaseHandler,
  PG_CREATE_DB_DEFAULT_CONFIG,
} from 'pg-create-db';
import { migrateHandler, PG_FLYWAY_DEFAULT_MIGRATE_CONFIG } from 'pg-flyway';

const debugDbToolsIsEnable = Boolean(process.env['DEBUG_DB_TOOLS']);
const logger = new Logger('DbTools');

const appEnvKeys = ['SERVER_AUTHORIZER_WEBHOOK_DATABASE_URL'];
const appKeys = ['webhook'];
const appHistoryTables = ['__migrations_webhook'];
const rootEnvKey = 'SERVER_AUTHORIZER_ROOT_DATABASE_URL';
const mainEnvKey = 'SERVER_AUTHORIZER_POSTGRES_URL';
const alterMainEnvKey = 'DATABASE_URL';
const alterMainEnvKey2 = 'POSTGRES_URL';

export function fillAllNeedDatabaseEnvsFromOneMain() {
  const mainDatabaseUrl =
    process.env[mainEnvKey] ||
    process.env[alterMainEnvKey] ||
    process.env[alterMainEnvKey2];

  if (debugDbToolsIsEnable) {
    logger.debug(
      {
        mainEnvKey,
        mainEnvKeyValue: process.env[mainEnvKey],
        alterMainEnvKey,
        alterMainEnvKeyValue: process.env[alterMainEnvKey],
        alterMainEnvKey2,
        alterMainEnvKey2Value: process.env[alterMainEnvKey2],
        rootEnvKey,
        rootEnvKeyValue: process.env[rootEnvKey],
        mainDatabaseUrl,
      },
      'fillAllNeedDatabaseEnvsFromOneMain'
    );
  }

  if (!process.env[rootEnvKey] && mainDatabaseUrl) {
    process.env[rootEnvKey] = mainDatabaseUrl;
  }

  for (let index = 0; index < appEnvKeys.length; index++) {
    const appEnvKey = appEnvKeys[index];
    if (debugDbToolsIsEnable) {
      logger.debug(
        {
          appEnvKey,
          appEnvKeyValue: process.env[appEnvKey],
        },
        'fillAllNeedDatabaseEnvsFromOneMain'
      );
    }
    if (!process.env[appEnvKey] && mainDatabaseUrl) {
      process.env[appEnvKey] = mainDatabaseUrl;
    }
  }
}

export async function createAndFillDatabases() {
  if (process.env.CREATE_AND_FILL_DATABASES === 'false') {
    return;
  }

  if (debugDbToolsIsEnable) {
    logger.debug(
      {
        isInfrastructureMode: isInfrastructureMode(),
      },
      'createAndFillDatabases'
    );
  }
  if (isInfrastructureMode()) {
    return;
  }

  for (let index = 0; index < appEnvKeys.length; index++) {
    const appEnvKey = appEnvKeys[index];
    const appKey = appKeys[index];
    const appHistoryTable = appHistoryTables[index];

    if (debugDbToolsIsEnable) {
      logger.debug(
        {
          index,
          appEnvKey,
          appEnvKeyValue: process.env[appEnvKey],
          appKey,
          appKeyValue: process.env[appKey],
          appHistoryTable,
          rootEnvKey,
          rootEnvKeyValue: process.env[rootEnvKey],
        },
        'createAndFillDatabases'
      );
    }
    if (process.env[appEnvKey]) {
      if (
        process.env[rootEnvKey] &&
        process.env[appEnvKey] !== process.env[rootEnvKey]
      ) {
        await createDatabaseHandler({
          ...PG_CREATE_DB_DEFAULT_CONFIG,
          appDatabaseUrl: process.env[appEnvKey],
          rootDatabaseUrl: process.env[rootEnvKey],
        });
      }

      await migrateHandler({
        ...PG_FLYWAY_DEFAULT_MIGRATE_CONFIG,
        databaseUrl: process.env[appEnvKey],
        historyTable: appHistoryTable,
        locations: `./libs/feature/${appKey}/src/migrations,./dist/libs/feature/${appKey}/migrations,./node_modules/@nestjs-mod/${appKey}/migrations`,
      });

      // delay
      await setTimeout(2000);
    }
  }
}
