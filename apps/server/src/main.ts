process.env.TZ = 'UTC';

import KeyvPostgres from '@keyv/postgres';
import { AUTH_FEATURE, AUTH_FOLDER } from '@nestjs-mod-fullstack/auth';
import { PrismaToolsModule } from '@nestjs-mod-fullstack/prisma-tools';
import { ValidationModule } from '@nestjs-mod-fullstack/validation';

import KeyvRedis, { createClient } from '@keyv/redis';
import {
  WEBHOOK_FEATURE,
  WEBHOOK_FOLDER,
  WebhookModule,
} from '@nestjs-mod-fullstack/webhook';
import { AUTHORIZER_ENV_PREFIX } from '@nestjs-mod/authorizer';
import {
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  InfrastructureMarkdownReportGenerator,
  PACKAGE_JSON_FILE,
  PROJECT_JSON_FILE,
  ProjectUtils,
  bootstrapNestApplication,
  isInfrastructureMode,
} from '@nestjs-mod/common';
import {
  DOCKER_COMPOSE_FILE,
  DockerCompose,
  DockerComposeAuthorizer,
  DockerComposeMinio,
  DockerComposePostgreSQL,
  DockerComposeRedis,
} from '@nestjs-mod/docker-compose';
import { KeyvModule } from '@nestjs-mod/keyv';
import { MinioModule } from '@nestjs-mod/minio';
import { PgFlyway } from '@nestjs-mod/pg-flyway';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
import { PRISMA_SCHEMA_FILE, PrismaModule } from '@nestjs-mod/prisma';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync, writeFileSync } from 'fs';
import { getText } from 'nestjs-translates';
import { join } from 'path';
import { APP_FEATURE } from './app/app.constants';
import { AuthorizerAppModule } from './app/authorizer-app.module';
import { SupabaseAppModule } from './app/supabase-app.module';
import { authProvider } from './environments/environment';
import { PrismaTerminusHealthCheckConfiguration } from './integrations/prisma-terminus-health-check.configuration';

let rootFolder = join(__dirname, '..', '..', '..');

if (
  !existsSync(join(rootFolder, PACKAGE_JSON_FILE)) &&
  existsSync(join(__dirname, PACKAGE_JSON_FILE))
) {
  rootFolder = join(__dirname);
}

let appFolder = join(rootFolder, 'apps', 'server');

if (!existsSync(join(appFolder, PACKAGE_JSON_FILE))) {
  appFolder = join(rootFolder, 'dist', 'apps', 'server');
}

if (
  !existsSync(join(appFolder, PACKAGE_JSON_FILE)) &&
  existsSync(join(__dirname, PACKAGE_JSON_FILE))
) {
  appFolder = join(__dirname);
}

bootstrapNestApplication({
  project: {
    name: 'server',
    description:
      'Boilerplate for creating a fullstack application on NestJS and Angular',
  },
  modules: {
    system: [
      ProjectUtils.forRoot({
        staticConfiguration: {
          applicationPackageJsonFile: join(appFolder, PACKAGE_JSON_FILE),
          packageJsonFile: join(rootFolder, PACKAGE_JSON_FILE),
          nxProjectJsonFile: join(appFolder, PROJECT_JSON_FILE),
          envFile: join(rootFolder, '.env'),
          printAllApplicationEnvs: true,
        },
      }),
      DefaultNestApplicationInitializer.forRoot({
        staticConfiguration: { bufferLogs: true },
      }),
      // NestjsPinoLoggerModule.forRoot(),
      TerminusHealthCheckModule.forRootAsync({
        imports: [
          PrismaModule.forFeature({
            featureModuleName: 'TerminusHealthCheckModule',
            contextName: APP_FEATURE,
          }),
          PrismaModule.forFeature({
            featureModuleName: 'TerminusHealthCheckModule',
            contextName: AUTH_FEATURE,
          }),
          PrismaModule.forFeature({
            featureModuleName: 'TerminusHealthCheckModule',
            contextName: WEBHOOK_FEATURE,
          }),
        ],
        configurationClass: PrismaTerminusHealthCheckConfiguration,
      }),
      DefaultNestApplicationListener.forRoot({
        staticConfiguration: {
          // When running in infrastructure mode, the backend server does not start.
          mode: isInfrastructureMode() ? 'silent' : 'listen',
          async preListen(options) {
            if (options.app) {
              options.app.setGlobalPrefix('api');

              const swaggerConf = new DocumentBuilder().addBearerAuth().build();
              const document = SwaggerModule.createDocument(
                options.app,
                swaggerConf
              );
              SwaggerModule.setup('swagger', options.app, document);

              options.app.useWebSocketAdapter(new WsAdapter(options.app));

              if (isInfrastructureMode()) {
                writeFileSync(
                  join(rootFolder, 'app-swagger.json'),
                  JSON.stringify(document)
                );
              }
            }
          },
        },
      }),
    ],
    core: [
      PrismaToolsModule.forRoot(),
      PrismaModule.forRoot({
        contextName: APP_FEATURE,
        staticConfiguration: {
          featureName: APP_FEATURE,
          schemaFile: join(
            appFolder,
            'src',
            'prisma',
            `${APP_FEATURE}-${PRISMA_SCHEMA_FILE}`
          ),
          prismaModule: isInfrastructureMode()
            ? import(`@nestjs-mod/prisma`)
            : import(`@prisma/app-client`),
          addMigrationScripts: false,
          binaryTargets: [
            'native',
            'rhel-openssl-3.0.x',
            'linux-musl-openssl-3.0.x',
          ],
        },
      }),
      PrismaModule.forRoot({
        contextName: WEBHOOK_FEATURE,
        staticConfiguration: {
          featureName: WEBHOOK_FEATURE,
          schemaFile: join(
            rootFolder,
            WEBHOOK_FOLDER,
            'src',
            'prisma',
            PRISMA_SCHEMA_FILE
          ),
          prismaModule: isInfrastructureMode()
            ? import(`@nestjs-mod/prisma`)
            : import(`@prisma/webhook-client`),
          addMigrationScripts: false,
          nxProjectJsonFile: join(
            rootFolder,
            WEBHOOK_FOLDER,
            PROJECT_JSON_FILE
          ),

          binaryTargets: [
            'native',
            'rhel-openssl-3.0.x',
            'linux-musl-openssl-3.0.x',
          ],
        },
      }),
      PrismaModule.forRoot({
        contextName: AUTH_FEATURE,
        staticConfiguration: {
          featureName: AUTH_FEATURE,
          schemaFile: join(
            rootFolder,
            AUTH_FOLDER,
            'src',
            'prisma',
            PRISMA_SCHEMA_FILE
          ),
          prismaModule: isInfrastructureMode()
            ? import(`@nestjs-mod/prisma`)
            : import(`@prisma/auth-client`),
          addMigrationScripts: false,
          nxProjectJsonFile: join(rootFolder, AUTH_FOLDER, PROJECT_JSON_FILE),

          binaryTargets: [
            'native',
            'rhel-openssl-3.0.x',
            'linux-musl-openssl-3.0.x',
          ],
        },
      }),
      KeyvModule.forRoot({
        staticConfiguration: {
          storeFactoryByEnvironmentUrl: (uri) => {
            return isInfrastructureMode()
              ? undefined
              : authProvider === 'authorizer'
              ? [new KeyvRedis(createClient({ url: uri }))]
              : [new KeyvPostgres({ uri }), { table: 'cache' }];
          },
        },
      }),
      MinioModule.forRoot(
        authProvider === 'authorizer'
          ? undefined
          : {
              staticConfiguration: { region: 'eu-central-1' },
              staticEnvironments: {
                minioUseSSL: 'true',
              },
            }
      ),
      ValidationModule.forRoot({ staticEnvironments: { usePipes: false } }),
    ],
    feature: [
      authProvider === 'authorizer'
        ? AuthorizerAppModule.forRoot()
        : SupabaseAppModule.forRoot(),
      WebhookModule.forRootAsync({
        staticEnvironments: { checkHeaders: false },
        configuration: {
          syncMode: authProvider === 'authorizer' ? false : true,
          events: [
            {
              eventName: 'app-demo.create',
              description: getText(
                'Event that will be triggered after creation'
              ),
              example: {
                id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
                name: 'demo name',
                createdAt: '2024-10-02T18:49:07.992Z',
                updatedAt: '2024-10-02T18:49:07.992Z',
              },
            },
            {
              eventName: 'app-demo.update',
              description: getText('Event that will trigger after the update'),
              example: {
                id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
                name: 'demo name',
                createdAt: '2024-10-02T18:49:07.992Z',
                updatedAt: '2024-10-02T18:49:07.992Z',
              },
            },
            {
              eventName: 'app-demo.delete',
              description: getText('Event that will fire after deletion'),
              example: {
                id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
                name: 'demo name',
                createdAt: '2024-10-02T18:49:07.992Z',
                updatedAt: '2024-10-02T18:49:07.992Z',
              },
            },
          ],
        },
      }),
    ],
    infrastructure: [
      InfrastructureMarkdownReportGenerator.forRoot({
        staticConfiguration: {
          markdownFile: join(appFolder, 'INFRASTRUCTURE.MD'),
          skipEmptySettings: true,
          style: 'pretty',
        },
      }),
      Pm2.forRoot({
        configuration: {
          ecosystemConfigFile: join(rootFolder, ECOSYSTEM_CONFIG_FILE),
          applicationScriptFile: join('dist/apps/server/main.js'),
        },
      }),
      DockerCompose.forRoot({
        configuration: {
          dockerComposeFileVersion: '3',
          dockerComposeFile: join(appFolder, DOCKER_COMPOSE_FILE),
        },
      }),
      DockerComposePostgreSQL.forRoot(),
      DockerComposePostgreSQL.forFeature({
        featureModuleName: APP_FEATURE,
      }),
      ...(authProvider === 'authorizer'
        ? [
            DockerComposePostgreSQL.forFeature({
              featureModuleName: AUTHORIZER_ENV_PREFIX,
            }),
            DockerComposeAuthorizer.forRoot({
              staticConfiguration: {
                image: 'lakhansamani/authorizer:1.4.4',
                disableStrongPassword: 'true',
                disableEmailVerification: 'true',
                featureName: AUTHORIZER_ENV_PREFIX,
                organizationName: 'NestJSModFullstack',
                dependsOnServiceNames: {
                  'postgre-sql': 'service_healthy',
                },
                isEmailServiceEnabled: 'true',
                isSmsServiceEnabled: 'false',
                env: 'development',
              },
            }),
          ]
        : []),
      DockerComposeRedis.forRoot({
        staticConfiguration: { image: 'bitnami/redis:7.4.1' },
      }),
      DockerComposeMinio.forRoot({
        staticConfiguration: { image: 'bitnami/minio:2024.11.7' },
      }),
      PgFlyway.forRoot({
        staticConfiguration: {
          featureName: APP_FEATURE,
          migrationsFolder: join(appFolder, 'src', 'migrations'),
        },
      }),
      DockerComposePostgreSQL.forFeatureAsync({
        featureModuleName: WEBHOOK_FEATURE,
        featureConfiguration: {
          nxProjectJsonFile: join(
            rootFolder,
            WEBHOOK_FOLDER,
            PROJECT_JSON_FILE
          ),
        },
      }),
      PgFlyway.forRoot({
        staticConfiguration: {
          featureName: WEBHOOK_FEATURE,
          migrationsFolder: join(
            rootFolder,
            WEBHOOK_FOLDER,
            'src',
            'migrations'
          ),
          nxProjectJsonFile: join(
            rootFolder,
            WEBHOOK_FOLDER,
            PROJECT_JSON_FILE
          ),
        },
      }),
      DockerComposePostgreSQL.forFeatureAsync({
        featureModuleName: AUTH_FEATURE,
        featureConfiguration: {
          nxProjectJsonFile: join(rootFolder, AUTH_FOLDER, PROJECT_JSON_FILE),
        },
      }),
      PgFlyway.forRoot({
        staticConfiguration: {
          featureName: AUTH_FEATURE,
          migrationsFolder: join(rootFolder, AUTH_FOLDER, 'src', 'migrations'),
          nxProjectJsonFile: join(rootFolder, AUTH_FOLDER, PROJECT_JSON_FILE),
        },
      }),
    ],
  },
});
