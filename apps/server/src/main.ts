import KeyvPostgres from '@keyv/postgres';
import {
  AUTH_FEATURE,
  AUTH_FOLDER,
  AuthEnvironments,
  AuthModule,
  AuthRequest,
} from '@nestjs-mod-fullstack/auth';
import {
  CheckAccessOptions,
  defaultSupabaseCheckAccessValidator,
  SupabaseModule,
  SupabaseUser,
} from '@nestjs-mod-fullstack/common';
import {
  FilesModule,
  FilesRequest,
  FilesRole,
} from '@nestjs-mod-fullstack/files';
import { PrismaToolsModule } from '@nestjs-mod-fullstack/prisma-tools';
import { ValidationModule } from '@nestjs-mod-fullstack/validation';
import {
  WEBHOOK_FEATURE,
  WEBHOOK_FOLDER,
  WebhookModule,
  WebhookRequest,
  WebhookUsersService,
} from '@nestjs-mod-fullstack/webhook';
import {
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  InfrastructureMarkdownReportGenerator,
  PACKAGE_JSON_FILE,
  PROJECT_JSON_FILE,
  ProjectUtils,
  bootstrapNestApplication,
  getRequestFromExecutionContext,
  isInfrastructureMode,
} from '@nestjs-mod/common';
import {
  DOCKER_COMPOSE_FILE,
  DockerCompose,
  DockerComposeMinio,
  DockerComposePostgreSQL,
  DockerComposeRedis,
} from '@nestjs-mod/docker-compose';
import { KeyvModule } from '@nestjs-mod/keyv';
import { MinioModule } from '@nestjs-mod/minio';
import { PgFlyway } from '@nestjs-mod/pg-flyway';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
import {
  PRISMA_SCHEMA_FILE,
  PrismaClient,
  PrismaModule,
  getPrismaClientToken,
} from '@nestjs-mod/prisma';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { ExecutionContext } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MemoryHealthIndicator, PrismaHealthIndicator } from '@nestjs/terminus';
import { existsSync, writeFileSync } from 'fs';
import { getText } from 'nestjs-translates';
import { join } from 'path';
import { AppModule } from './app/app.module';

const appFeatureName = 'app';
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
            contextName: 'app',
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
        configurationFactory: (
          memoryHealthIndicator: MemoryHealthIndicator,
          prismaHealthIndicator: PrismaHealthIndicator,
          appPrismaClient: PrismaClient,
          authPrismaClient: PrismaClient,
          webhookPrismaClient: PrismaClient
        ) => ({
          standardHealthIndicators: [
            {
              name: 'memory_heap',
              check: () =>
                memoryHealthIndicator.checkHeap(
                  'memory_heap',
                  150 * 1024 * 1024
                ),
            },
            {
              name: `database_${'app'}`,
              check: () =>
                prismaHealthIndicator.pingCheck(
                  `database_${'app'}`,
                  appPrismaClient,
                  { timeout: 60 * 1000 }
                ),
            },
            {
              name: `database_${AUTH_FEATURE}`,
              check: () =>
                prismaHealthIndicator.pingCheck(
                  `database_${AUTH_FEATURE}`,
                  authPrismaClient,
                  { timeout: 60 * 1000 }
                ),
            },
            {
              name: `database_${WEBHOOK_FEATURE}`,
              check: () =>
                prismaHealthIndicator.pingCheck(
                  `database_${WEBHOOK_FEATURE}`,
                  webhookPrismaClient,
                  { timeout: 60 * 1000 }
                ),
            },
          ],
        }),
        inject: [
          MemoryHealthIndicator,
          PrismaHealthIndicator,
          getPrismaClientToken('app'),
          getPrismaClientToken(AUTH_FEATURE),
          getPrismaClientToken(WEBHOOK_FEATURE),
        ],
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
      SupabaseModule.forRootAsync({
        imports: [
          WebhookModule.forFeature({ featureModuleName: AUTH_FEATURE }),
          AuthModule.forFeature({ featureModuleName: AUTH_FEATURE }),
        ],
        inject: [WebhookUsersService, AuthEnvironments],
        configurationFactory: (
          webhookUsersService: WebhookUsersService,
          authEnvironments: AuthEnvironments
        ) => {
          return {
            checkAccessValidator: async (
              supabaseUser?: SupabaseUser,
              options?: CheckAccessOptions,
              ctx?: ExecutionContext
            ) => {
              if (
                typeof ctx?.getClass === 'function' &&
                typeof ctx?.getHandler === 'function' &&
                ctx?.getClass().name === 'TerminusHealthCheckController' &&
                ctx?.getHandler().name === 'check'
              ) {
                return true;
              }

              const result = await defaultSupabaseCheckAccessValidator(
                supabaseUser,
                options
              );

              const req: WebhookRequest & FilesRequest & AuthRequest =
                ctx && getRequestFromExecutionContext(ctx);

              if (req?.supabaseUser?.id) {
                // webhook
                req.webhookUser =
                  await webhookUsersService.createUserIfNotExists({
                    externalUserId: req?.supabaseUser?.id,
                    externalTenantId: req?.supabaseUser?.id,
                    userRole:
                      req.authUser?.userRole === 'Admin' ? 'Admin' : 'User',
                  });

                if (req.authUser?.userRole === 'Admin') {
                  req.webhookUser.userRole = 'Admin';
                }

                if (req.webhookUser) {
                  req.externalTenantId = req.webhookUser.externalTenantId;
                }

                if (
                  authEnvironments.adminEmail &&
                  req.supabaseUser?.email === authEnvironments.adminEmail
                ) {
                  req.webhookUser.userRole = 'Admin';

                  req.supabaseUser.role = 'admin';
                }

                // files
                req.filesUser = {
                  userRole:
                    req.webhookUser?.userRole === 'Admin'
                      ? FilesRole.Admin
                      : FilesRole.User,
                };
              }

              return result;
            },
          };
        },
      }),
      PrismaToolsModule.forRoot(),
      PrismaModule.forRoot({
        contextName: appFeatureName,
        staticConfiguration: {
          featureName: appFeatureName,
          schemaFile: join(
            appFolder,
            'src',
            'prisma',
            `${appFeatureName}-${PRISMA_SCHEMA_FILE}`
          ),
          prismaModule: isInfrastructureMode()
            ? import(`@nestjs-mod/prisma`)
            : import(`@prisma/app-client`),
          addMigrationScripts: false,
          binaryTargets: [],
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
          binaryTargets: [],
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
          binaryTargets: [],
        },
      }),
      KeyvModule.forRoot({
        staticConfiguration: {
          storeFactoryByEnvironmentUrl: (uri) => {
            return isInfrastructureMode()
              ? undefined
              : [new KeyvPostgres({ uri }), { table: 'cache' }];
          },
        },
      }),
      MinioModule.forRoot({
        staticConfiguration: { region: 'eu-central-1' },
        staticEnvironments: {
          minioUseSSL: 'true',
        },
      }),
      FilesModule.forRoot(),
      ValidationModule.forRoot({ staticEnvironments: { usePipes: false } }),
    ],
    feature: [
      AppModule.forRoot(),
      AuthModule.forRootAsync({}),
      WebhookModule.forRootAsync({
        staticEnvironments: { checkHeaders: false },
        configuration: {
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
        featureModuleName: appFeatureName,
      }),
      DockerComposeRedis.forRoot({
        staticConfiguration: { image: 'bitnami/redis:7.4.1' },
      }),
      DockerComposeMinio.forRoot({
        staticConfiguration: { image: 'bitnami/minio:2024.11.7' },
      }),
      PgFlyway.forRoot({
        staticConfiguration: {
          featureName: appFeatureName,
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
