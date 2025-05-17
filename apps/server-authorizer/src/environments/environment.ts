import KeyvRedis from '@keyv/redis';
import { AUTHORIZER_ENV_PREFIX } from '@nestjs-mod/authorizer';
import {
  isInfrastructureMode,
  PACKAGE_JSON_FILE,
  PROJECT_JSON_FILE,
} from '@nestjs-mod/common';
import {
  DockerComposeAuthorizer,
  DockerComposePostgreSQL,
} from '@nestjs-mod/docker-compose';
import { KeyvModule } from '@nestjs-mod/keyv';
import { MinioModule } from '@nestjs-mod/minio';
import { existsSync } from 'fs';
import { join } from 'path';
import { createClient } from 'redis';
import { AppModule } from '../app/app.module';

let rootFolder = join(__dirname, '..', '..', '..');

if (
  !existsSync(join(rootFolder, PACKAGE_JSON_FILE)) &&
  existsSync(join(__dirname, PACKAGE_JSON_FILE))
) {
  rootFolder = join(__dirname);
}

let appFolder = join(rootFolder, 'apps', 'server-authorizer');

if (!existsSync(join(appFolder, PACKAGE_JSON_FILE))) {
  appFolder = join(rootFolder, 'dist', 'apps', 'server-authorizer');
}

if (
  !existsSync(join(appFolder, PACKAGE_JSON_FILE)) &&
  existsSync(join(__dirname, PACKAGE_JSON_FILE))
) {
  appFolder = join(__dirname);
}

export { appFolder, rootFolder };

export const MainAppModule = AppModule.forRoot();

export const MainKeyvModule = KeyvModule.forRoot({
  staticConfiguration: {
    storeFactoryByEnvironmentUrl: (uri) => {
      return isInfrastructureMode()
        ? undefined
        : [new KeyvRedis(createClient({ url: uri }))];
    },
  },
});

export const MainMinioModule = MinioModule.forRoot({
  staticConfiguration: { region: 'eu-central-1' },
  staticEnvironments: {
    minioUseSSL: 'false',
  },
});

export const MAIN_INFRASTRUCTURE_MODULES = [
  //
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
];
