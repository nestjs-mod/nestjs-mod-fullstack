import { AUTH_FEATURE, AuthModule } from '@nestjs-mod-fullstack/auth';
import {
  FilesModule,
  FilesRequest,
  FilesRole,
} from '@nestjs-mod-fullstack/files';
import { PrismaToolsModule } from '@nestjs-mod-fullstack/prisma-tools';
import {
  WEBHOOK_FEATURE,
  WEBHOOK_FOLDER,
  WebhookModule,
  WebhookRequest,
  WebhookUsersService,
} from '@nestjs-mod-fullstack/webhook';
import {
  AUTHORIZER_ENV_PREFIX,
  AuthorizerModule,
  AuthorizerUser,
  CheckAccessOptions,
  defaultAuthorizerCheckAccessValidator,
} from '@nestjs-mod/authorizer';
import { CacheManagerModule } from '@nestjs-mod/cache-manager';
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
  DockerComposeAuthorizer,
  DockerComposeMinio,
  DockerComposePostgreSQL,
  DockerComposeRedis,
} from '@nestjs-mod/docker-compose';
import { FLYWAY_JS_CONFIG_FILE, Flyway } from '@nestjs-mod/flyway';
import { MinioModule } from '@nestjs-mod/minio';
import { NestjsPinoLoggerModule } from '@nestjs-mod/pino';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
import { PRISMA_SCHEMA_FILE, PrismaModule } from '@nestjs-mod/prisma';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { ExecutionContext } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MemoryHealthIndicator } from '@nestjs/terminus';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app/app.module';

console.log(process.env);
const appFeatureName = 'app';
const rootFolder = join(__dirname, '..', '..', '..');

let appFolder = join(rootFolder, 'apps', 'server');

if (!existsSync(join(appFolder, PACKAGE_JSON_FILE))) {
  appFolder = join(rootFolder, 'dist', 'apps', 'server');
}

bootstrapNestApplication({
  modules: {
    system: [
      ProjectUtils.forRoot({
        staticConfiguration: {
          applicationPackageJsonFile: join(appFolder, PACKAGE_JSON_FILE),
          packageJsonFile: join(rootFolder, PACKAGE_JSON_FILE),
          nxProjectJsonFile: join(appFolder, PROJECT_JSON_FILE),
          envFile: join(rootFolder, '.env'),
        },
      }),
      DefaultNestApplicationInitializer.forRoot({
        staticConfiguration: { bufferLogs: true },
      }),
      NestjsPinoLoggerModule.forRoot(),
      TerminusHealthCheckModule.forRootAsync({
        configurationFactory: (
          memoryHealthIndicator: MemoryHealthIndicator
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
          ],
        }),
        inject: [MemoryHealthIndicator],
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
      AuthorizerModule.forRootAsync({
        imports: [
          WebhookModule.forFeature({ featureModuleName: AUTH_FEATURE }),
        ],
        inject: [WebhookUsersService],
        configurationFactory: (webhookUsersService: WebhookUsersService) => {
          return {
            extraHeaders: {
              'x-authorizer-url': `http://localhost:${process.env.SERVER_AUTHORIZER_EXTERNAL_CLIENT_PORT}`,
            },
            checkAccessValidator: async (
              authorizerUser?: AuthorizerUser,
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

              const result = await defaultAuthorizerCheckAccessValidator(
                authorizerUser,
                options
              );

              if (ctx && authorizerUser?.id) {
                const req: WebhookRequest & FilesRequest =
                  getRequestFromExecutionContext(ctx);

                // webhook
                const webhookUser =
                  await webhookUsersService.createUserIfNotExists({
                    externalUserId: authorizerUser?.id,
                    externalTenantId: authorizerUser?.id,
                    userRole: authorizerUser.roles?.includes('admin')
                      ? 'Admin'
                      : 'User',
                  });
                if (webhookUser) {
                  req.externalTenantId = webhookUser.externalTenantId;
                }

                // files
                req.filesUser = {
                  userRole: authorizerUser.roles?.includes('admin')
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
        },
      }),
      CacheManagerModule.forRoot({
        staticConfiguration: {
          type: isInfrastructureMode() ? 'memory' : 'redis',
        },
      }),
      MinioModule.forRoot(),
      FilesModule.forRoot(),
    ],
    feature: [
      AppModule.forRoot(),
      AuthModule.forRootAsync({}),
      WebhookModule.forRootAsync({
        staticEnvironments: { checkHeaders: false },
        configuration: {
          events: ['create', 'update', 'delete'].map((key) => ({
            eventName: `app-demo.${key}`,
            description: `${key}`,
            example: {
              id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
              name: 'demo name',
              createdAt: '2024-10-02T18:49:07.992Z',
              updatedAt: '2024-10-02T18:49:07.992Z',
            },
          })),
        },
      }),
    ],
    infrastructure: [
      InfrastructureMarkdownReportGenerator.forRoot({
        staticConfiguration: {
          markdownFile: join(appFolder, 'INFRASTRUCTURE.MD'),
          skipEmptySettings: true,
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
      DockerComposeRedis.forRoot({
        staticConfiguration: { image: 'bitnami/redis:7.4.1' },
      }),
      DockerComposeMinio.forRoot({
        staticConfiguration: { image: 'bitnami/minio:2024.11.7' },
      }),
      Flyway.forRoot({
        staticConfiguration: {
          featureName: appFeatureName,
          migrationsFolder: join(appFolder, 'src', 'migrations'),
          configFile: join(rootFolder, FLYWAY_JS_CONFIG_FILE),
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
      Flyway.forRoot({
        staticConfiguration: {
          featureName: WEBHOOK_FEATURE,
          migrationsFolder: join(
            rootFolder,
            WEBHOOK_FOLDER,
            'src',
            'migrations'
          ),
          configFile: join(rootFolder, FLYWAY_JS_CONFIG_FILE),
          nxProjectJsonFile: join(
            rootFolder,
            WEBHOOK_FOLDER,
            PROJECT_JSON_FILE
          ),
        },
      }),
    ],
  },
});
