import KeyvPostgres from '@keyv/postgres';
import {
  AUTH_ADMIN_ROLE,
  AUTH_FEATURE,
  AUTH_FOLDER,
  AuthEnvironments,
  AuthError,
  AuthModule,
  AuthRequest,
} from '@nestjs-mod-fullstack/auth';
import {
  FilesModule,
  FilesPresignedUrls,
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
import { MinioFilesService, MinioModule } from '@nestjs-mod/minio';
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
import { defaultSupabaseCheckAccessValidator } from './app/supabase/supabase.configuration';
import { SupabaseModule } from './app/supabase/supabase.module';
import { SupabaseService } from './app/supabase/supabase.service';
import {
  CheckAccessOptions,
  SupabaseRequest,
  SupabaseUser,
} from './app/supabase/supabase.types';

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
      PrismaToolsModule.forRoot(),
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
              const req: WebhookRequest &
                FilesRequest &
                AuthRequest &
                SupabaseRequest = ctx && getRequestFromExecutionContext(ctx);

              if (
                typeof ctx?.getClass === 'function' &&
                typeof ctx?.getHandler === 'function' &&
                ctx?.getClass().name === 'TerminusHealthCheckController' &&
                ctx?.getHandler().name === 'check'
              ) {
                req.skippUserNotFoundError = true;
                return true;
              }

              const result = await defaultSupabaseCheckAccessValidator(
                supabaseUser,
                options
              );

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

                  req.supabaseUser.role = AUTH_ADMIN_ROLE;
                }

                // files
                req.filesUser = {
                  userRole:
                    req.webhookUser?.userRole === 'Admin'
                      ? FilesRole.Admin
                      : FilesRole.User,
                };

                if (supabaseUser?.email && supabaseUser?.role) {
                  req.externalUser = {
                    email: supabaseUser?.email,
                    role: supabaseUser?.role,
                  };
                }
              }

              if (result) {
                req.skippUserNotFoundError = true;
              }

              return result;
            },
          };
        },
      }),
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
          binaryTargets: ['native', 'rhel-openssl-3.0.x'],
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

          binaryTargets: ['native', 'rhel-openssl-3.0.x'],
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

          binaryTargets: ['native', 'rhel-openssl-3.0.x'],
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
      FilesModule.forRootAsync({
        imports: [SupabaseModule.forFeature(), MinioModule.forFeature()],
        inject: [SupabaseService, MinioFilesService],
        configurationFactory: (
          supabaseService: SupabaseService,
          minioFilesService: MinioFilesService
        ) => {
          return {
            getFromDownloadUrlWithoutBucketNames(downloadUrl) {
              return minioFilesService.getFromDownloadUrlWithoutBucketNames(
                downloadUrl
              );
            },
            async deleteFile({ bucketName, objectName }) {
              const result = await supabaseService
                .getSupabaseClient()
                .storage.from(bucketName)
                .remove([objectName]);
              if (result.error?.message) {
                throw new AuthError(result.error?.message);
              }
              return null;
            },
            getPresignedUrls: async ({
              bucketName,
              fullObjectName,
            }: {
              bucketName: string;
              fullObjectName: string;
            }) => {
              const result = await supabaseService
                .getSupabaseClient()
                .storage.from(bucketName)
                .createSignedUploadUrl(fullObjectName, { upsert: true });
              if (result.error?.message) {
                throw new AuthError(result.error?.message);
              }
              if (!result?.data) {
                throw new AuthError('createSignedUploadUrlResult not set');
              }

              return {
                downloadUrl: supabaseService
                  .getSupabaseClient()
                  .storage.from(bucketName)
                  .getPublicUrl(fullObjectName).data.publicUrl,
                uploadUrl: result.data.signedUrl,
              } as FilesPresignedUrls;
            },
          };
        },
      }),
      ValidationModule.forRoot({ staticEnvironments: { usePipes: false } }),
    ],
    feature: [
      AppModule.forRoot(),
      AuthModule.forRootAsync({
        imports: [SupabaseModule.forFeature()],
        inject: [SupabaseService],
        configurationFactory: (supabaseService: SupabaseService) => ({
          createAdmin: async (user: {
            username?: string;
            password: string;
            email: string;
          }): Promise<void | null> => {
            const signupUserResult = await supabaseService
              .getSupabaseClient()
              .auth.signUp({
                password: user.password,
                email: user.email.toLowerCase(),
                options: {
                  data: {
                    nickname: user.username,
                    roles: ['admin'],
                  },
                },
              });
            if (signupUserResult.error) {
              if (
                signupUserResult.error.message !== 'User already registered'
              ) {
                throw new AuthError(signupUserResult.error.message);
              }
            } else {
              if (!signupUserResult.data?.user) {
                throw new AuthError('Failed to create a user');
              }
              if (!signupUserResult.data.user.email) {
                throw new AuthError('signupUserResult.data.user.email not set');
              }

              if (Object.keys(user).length > 0) {
                const updateUserResult = await supabaseService
                  .getSupabaseClient()
                  .auth.updateUser({
                    email: user['email'],
                  });

                if (updateUserResult.error) {
                  throw new AuthError(updateUserResult.error.message);
                }
              }
            }
          },
        }),
      }),
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
