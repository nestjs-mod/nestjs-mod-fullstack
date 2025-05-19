import KeyvRedis from '@keyv/redis';
import { SSO_FEATURE } from '@nestjs-mod/sso';
import {
  isInfrastructureMode,
  PACKAGE_JSON_FILE,
  PROJECT_JSON_FILE,
} from '@nestjs-mod/common';
import {
  DockerComposeSso,
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

let appFolder = join(rootFolder, 'apps', 'server-sso');

if (!existsSync(join(appFolder, PACKAGE_JSON_FILE))) {
  appFolder = join(rootFolder, 'dist', 'apps', 'server-sso');
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
  DockerComposeSso.forRoot({
    staticConfiguration: {
      featureName: SSO_FEATURE,
      dependsOnServiceNames: {
        'postgre-sql': 'service_healthy',
      },
    },
  }),
];
