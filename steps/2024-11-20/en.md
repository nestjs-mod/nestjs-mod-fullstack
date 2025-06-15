## [2024-11-20] Caching information in Redis on NestJS

Each frontend request to the backend requests user profile information from the database, this creates an additional load on the database and increases the backend response time, to speed up such requests, you can cache the database response.

In this post, I will connect `Redis` to the project and set up data caching via `@nestjs-mod/cache-manager`.

The project can be run in `Docker Compose` and `Kubernetes`.

### 1. Install additional libraries

Install `JS`-client and `NestJS`-module for working with `cache-manager` and `Redis`.

_Commands_

```bash
npm install --save redis cache-manager-redis-yet cache-manager @nestjs-mod/cache-manager
```

{% spoiler Console output %}

```bash
$ npm install --save redis cache-manager-redis-yet cache-manager @nestjs-mod/cache-manager
npm warn deprecated cache-manager-redis-yet@5.1.5: With cache-manager v6 we now are using Keyv

added 17 packages, removed 2 packages, and audited 2934 packages in 19s

360 packages are looking for funding
  run `npm fund` for details

41 vulnerabilities (19 low, 7 moderate, 15 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
```

{% endspoiler %}

### 2. Connecting new modules to the backend

Updating the file _apps/server/src/main.ts_

```typescript

import {
  DOCKER_COMPOSE_FILE,
  DockerCompose,
  DockerComposeAuthorizer,
  DockerComposeMinio,
  DockerComposePostgreSQL,
} from '@nestjs-mod/docker-compose';
// ...
import { MinioModule } from '@nestjs-mod/minio';
// ...

import { ExecutionContext } from '@nestjs/common';
// ...
bootstrapNestApplication({
  modules: {
   // ...

    core: [
      CacheManagerModule.forRoot({
        staticConfiguration: {
          type: isInfrastructureMode() ? 'memory' : 'redis',
        },
      }),
    ],
    infrastructure: [
      DockerComposeMinio.forRoot({
        staticConfiguration: { image: 'bitnami/minio:2024.11.7' },
      }),
    ]}
    );
```

### 3. We are starting the generation of additional code for the infrastructure

_Commands_

```bash
npm run docs:infrastructure
```

After running, a new service `server-redis` will appear in the `docker-compose` file and a new environment variable `SERVER_REDIS_URL` will appear in the environment variable, which needs to be filled.

Updated file _apps/server/docker-compose-prod.yml_

```yaml
server-redis:
  image: 'bitnami/redis:7.4.1'
  container_name: 'server-redis'
  volumes:
    - 'server-redis-volume:/bitnami/redis/data'
  ports:
    - '6379:6379'
  networks:
    - 'server-network'
  environment:
    REDIS_DISABLE_COMMANDS: '${SERVER_REDIS_REDIS_DISABLE_COMMANDS}'
    REDIS_IO_THREADS: '${SERVER_REDIS_REDIS_IO_THREADS}'
    REDIS_IO_THREADS_DO_READS: '${SERVER_REDIS_REDIS_IO_THREADS_DO_READS}'
  healthcheck:
    test:
      - 'CMD-SHELL'
      - 'redis-cli ping | grep PONG'
    interval: '5s'
    timeout: '5s'
    retries: 5
  tty: true
  restart: 'always'
```

Updating the file _.env_

```bash
# ...
SERVER_REDIS_URL=redis://:CHmeOQrZWUHwgahrfzsrzuREOxgAENsC@localhost:6379
```

We re-run the generation of additional code for the infrastructure to generate additional environment variables.

_Commands_

```bash
npm run docs:infrastructure
```

Updated file _apps/server/docker-compose-prod.yml_

```yaml
server-redis:
  image: 'bitnami/redis:7.4.1'
  container_name: 'server-redis'
  volumes:
    - 'server-redis-volume:/bitnami/redis/data'
  ports:
    - '6379:6379'
  networks:
    - 'server-network'
  environment:
    REDIS_DATABASE: '${SERVER_REDIS_REDIS_DATABASE}'
    REDIS_PASSWORD: '${SERVER_REDIS_REDIS_PASSWORD}'
    REDIS_DISABLE_COMMANDS: '${SERVER_REDIS_REDIS_DISABLE_COMMANDS}'
    REDIS_IO_THREADS: '${SERVER_REDIS_REDIS_IO_THREADS}'
    REDIS_IO_THREADS_DO_READS: '${SERVER_REDIS_REDIS_IO_THREADS_DO_READS}'
  healthcheck:
    test:
      - 'CMD-SHELL'
      - 'redis-cli --no-auth-warning -a $$REDIS_PASSWORD ping | grep PONG'
    interval: '5s'
    timeout: '5s'
    retries: 5
  tty: true
  restart: 'always'
```

### 4. We launch the infrastructure with applications in development mode and check it through E2E tests

_Commands_

```bash
npm run pm2-full:dev:start
npm run pm2-full:dev:test:e2e
```

### 5. Adding a caching service to the WebhookModule

Creating a file _libs\feature\webhook\src\lib\services\webhook-cache.service.ts_

```typescript
import { CacheManagerService } from '@nestjs-mod/cache-manager';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient, WebhookUser } from '@prisma/webhook-client';
import { WEBHOOK_FEATURE } from '../webhook.constants';
import { WebhookConfiguration } from '../webhook.configuration';

@Injectable()
export class WebhookCacheService {
  constructor(
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly webhookConfiguration: WebhookConfiguration,
    private readonly cacheManagerService: CacheManagerService,
  ) {}

  async clearCacheByExternalUserId(externalUserId: string) {
    const webhookUsers = await this.prismaClient.webhookUser.findMany({
      where: { externalUserId },
    });
    for (const webhookUser of webhookUsers) {
      await this.cacheManagerService.del(this.getUserCacheKey(webhookUser));
    }
  }

  async getCachedUserByExternalUserId(externalUserId: string, externalTenantId?: string) {
    const cached = await this.cacheManagerService.get<WebhookUser | null>(
      this.getUserCacheKey({
        externalUserId,
        externalTenantId,
      }),
    );
    if (cached) {
      return cached;
    }
    const user = await this.prismaClient.webhookUser.findFirst({
      where: {
        externalUserId,
        ...(externalTenantId ? { externalTenantId } : {}),
      },
    });
    if (user) {
      await this.cacheManagerService.set(this.getUserCacheKey({ externalTenantId, externalUserId }), user, this.webhookConfiguration.cacheTTL);
      return user;
    }
    return null;
  }

  private getUserCacheKey({ externalTenantId, externalUserId }: { externalTenantId: string | undefined; externalUserId: string }): string {
    return `${externalTenantId}_${externalUserId}`;
  }
}
```

User data is cached for 15 seconds, the caching time is set through the module configuration.

Updating the file _libs\feature\webhook\src\lib\webhook.configuration.ts_

```typescript
import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';
import { WebhookEvent } from './types/webhook-event-object';

@ConfigModel()
export class WebhookConfiguration {
  @ConfigModelProperty({
    description: 'List of available events.',
  })
  events!: WebhookEvent[];

  @ConfigModelProperty({
    description: 'TTL for cached data.',
    default: 15_000,
  })
  cacheTTL?: number;
}

// ...
```

In `WebhookGuard` we replace receiving data via ORM with receiving data from the keying service.

Updating the file _libs\feature\webhook\src\lib\webhook.guard.ts_

```typescript
//...
import { WebhookCacheService } from './services/webhook-cache.service';

@Injectable()
export class WebhookGuard implements CanActivate {
  private logger = new Logger(WebhookGuard.name);

  constructor(
    //...
    private readonly webhookCacheService: WebhookCacheService,
  ) {}

  //...

  private async tryGetOrCreateCurrentUserWithExternalUserId(req: WebhookRequest, externalTenantId: string | undefined, externalUserId: string) {
    if (!req.webhookUser) {
      if (!externalTenantId || !isUUID(externalTenantId)) {
        throw new WebhookError(WebhookErrorEnum.EXTERNAL_TENANT_ID_NOT_SET);
      }
      if (this.webhookEnvironments.autoCreateUser) {
        req.webhookUser = await this.webhookCacheService.getCachedUserByExternalUserId(externalUserId, externalTenantId);

        if (!req.webhookUser) {
          await this.prismaClient.webhookUser.create({
            data: { externalTenantId, externalUserId, userRole: 'User' },
          });
        }
      }
      req.webhookUser = await this.webhookCacheService.getCachedUserByExternalUserId(externalUserId, externalTenantId);
    }
  }

  private async tryGetCurrentSuperAdminUserWithExternalUserId(req: WebhookRequest, externalUserId: string) {
    if (!req.webhookUser && this.webhookEnvironments.superAdminExternalUserId === externalUserId) {
      req.webhookUser = await this.webhookCacheService.getCachedUserByExternalUserId(externalUserId);
    }
  }
  //...
}
```

In the controller with user modification methods, we add a call to invalidate the cache when changing and deleting a user.

Updating the file _libs\feature\webhook\src\lib\controllers\webhook-users.controller.ts_

```typescript
//...
import { WebhookCacheService } from '../services/webhook-cache.service';

@ApiExtraModels(WebhookError)
@ApiBadRequestResponse({
  schema: { allOf: refs(WebhookError) },
})
@ApiTags('webhook')
@CheckWebhookRole([WebhookRole.Admin])
@Controller('/webhook/users')
export class WebhookUsersController {
  constructor(
    //...
    private readonly webhookCacheService: WebhookCacheService,
  ) {}

  //...

  @Put(':id')
  @ApiOkResponse({ type: WebhookUserObject })
  async updateOne(@CurrentWebhookExternalTenantId() externalTenantId: string, @CurrentWebhookUser() webhookUser: WebhookUser, @Param('id', new ParseUUIDPipe()) id: string, @Body() args: UpdateWebhookUserArgs) {
    const result = await this.prismaClient.webhookUser.update({
      data: { ...args },
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookUser.userRole === 'Admin' ? undefined : externalTenantId),
      },
    });
    await this.webhookCacheService.clearCacheByExternalUserId(webhookUser.externalUserId);
    return result;
  }

  @Delete(':id')
  @ApiOkResponse({ type: StatusResponse })
  async deleteOne(@CurrentWebhookExternalTenantId() externalTenantId: string, @CurrentWebhookUser() webhookUser: WebhookUser, @Param('id', new ParseUUIDPipe()) id: string) {
    await this.prismaClient.webhookUser.delete({
      where: {
        id,
        ...this.webhookToolsService.externalTenantIdQuery(webhookUser, webhookUser.userRole === 'Admin' ? undefined : externalTenantId),
      },
    });
    await this.webhookCacheService.clearCacheByExternalUserId(id);
    return { message: 'ok' };
  }
  //...
}
```

Connect the caching service to the `WebhookModule`.

Updating the file _libs/core/webhook/src/lib/webhook.module.ts_

```typescript
//...
import { CacheManagerModule } from '@nestjs-mod/cache-manager';
import { WebhookCacheService } from './services/webhook-cache.service';

export const { WebhookModule } = createNestModule({
  moduleName: WEBHOOK_MODULE,
  moduleCategory: NestModuleCategory.feature,
  staticEnvironmentsModel: WebhookEnvironments,
  staticConfigurationModel: WebhookStaticConfiguration,
  configurationModel: WebhookConfiguration,
  imports: [
    //...
    CacheManagerModule.forFeature({
      featureModuleName: WEBHOOK_FEATURE,
    }),
  ],
  providers: [
    //...
    WebhookCacheService,
  ],
  //...
});
```

### 6. Updates and adding new ones for running docker-compose and kubernetes

I will not fully describe the changes in all files, you can see them in the commit with changes for the current post, below I will simply add the updated `docker-compose-full.yml` and its file with environment variables.

Updating the file _.docker/docker-compose-full.yml_

```yaml
version: '3'
networks:
  nestjs-mod-fullstack-network:
    driver: 'bridge'
services:
  nestjs-mod-fullstack-postgre-sql:
    image: 'bitnami/postgresql:15.5.0'
    container_name: 'nestjs-mod-fullstack-postgre-sql'
    networks:
      - 'nestjs-mod-fullstack-network'
    healthcheck:
      test:
        - 'CMD-SHELL'
        - 'pg_isready -U postgres'
      interval: '5s'
      timeout: '5s'
      retries: 5
    tty: true
    restart: 'always'
    environment:
      POSTGRESQL_USERNAME: '${SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME}'
      POSTGRESQL_PASSWORD: '${SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD}'
      POSTGRESQL_DATABASE: '${SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE}'
    volumes:
      - 'nestjs-mod-fullstack-postgre-sql-volume:/bitnami/postgresql'
  nestjs-mod-fullstack-authorizer:
    image: 'lakhansamani/authorizer:1.4.4'
    container_name: 'nestjs-mod-fullstack-authorizer'
    ports:
      - '8000:8080'
    networks:
      - 'nestjs-mod-fullstack-network'
    environment:
      DATABASE_URL: '${SERVER_AUTHORIZER_DATABASE_URL}'
      DATABASE_TYPE: '${SERVER_AUTHORIZER_DATABASE_TYPE}'
      DATABASE_NAME: '${SERVER_AUTHORIZER_DATABASE_NAME}'
      ADMIN_SECRET: '${SERVER_AUTHORIZER_ADMIN_SECRET}'
      PORT: '${SERVER_AUTHORIZER_PORT}'
      AUTHORIZER_URL: '${SERVER_AUTHORIZER_URL}'
      COOKIE_NAME: '${SERVER_AUTHORIZER_COOKIE_NAME}'
      SMTP_HOST: '${SERVER_AUTHORIZER_SMTP_HOST}'
      SMTP_PORT: '${SERVER_AUTHORIZER_SMTP_PORT}'
      SMTP_USERNAME: '${SERVER_AUTHORIZER_SMTP_USERNAME}'
      SMTP_PASSWORD: '${SERVER_AUTHORIZER_SMTP_PASSWORD}'
      SENDER_EMAIL: '${SERVER_AUTHORIZER_SENDER_EMAIL}'
      SENDER_NAME: '${SERVER_AUTHORIZER_SENDER_NAME}'
      DISABLE_PLAYGROUND: '${SERVER_AUTHORIZER_DISABLE_PLAYGROUND}'
      ACCESS_TOKEN_EXPIRY_TIME: '${SERVER_AUTHORIZER_ACCESS_TOKEN_EXPIRY_TIME}'
      DISABLE_STRONG_PASSWORD: '${SERVER_AUTHORIZER_DISABLE_STRONG_PASSWORD}'
      DISABLE_EMAIL_VERIFICATION: '${SERVER_AUTHORIZER_DISABLE_EMAIL_VERIFICATION}'
      ORGANIZATION_NAME: '${SERVER_AUTHORIZER_ORGANIZATION_NAME}'
      IS_SMS_SERVICE_ENABLED: '${SERVER_AUTHORIZER_IS_SMS_SERVICE_ENABLED}'
      IS_EMAIL_SERVICE_ENABLED: '${SERVER_AUTHORIZER_IS_SMS_SERVICE_ENABLED}'
      ENV: '${SERVER_AUTHORIZER_ENV}'
      RESET_PASSWORD_URL: '${SERVER_AUTHORIZER_RESET_PASSWORD_URL}'
      ROLES: '${SERVER_AUTHORIZER_ROLES}'
      DEFAULT_ROLES: '${SERVER_AUTHORIZER_DEFAULT_ROLES}'
      JWT_ROLE_CLAIM: '${SERVER_AUTHORIZER_JWT_ROLE_CLAIM}'
      ORGANIZATION_LOGO: '${SERVER_AUTHORIZER_ORGANIZATION_LOGO}'
    tty: true
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: service_healthy
      nestjs-mod-fullstack-postgre-sql-migrations:
        condition: service_completed_successfully
  nestjs-mod-fullstack-minio:
    image: 'bitnami/minio:2024.11.7'
    container_name: 'nestjs-mod-fullstack-minio'
    volumes:
      - 'nestjs-mod-fullstack-minio-volume:/bitnami/minio/data'
    ports:
      - '9000:9000'
      - '9001:9001'
    networks:
      - 'nestjs-mod-fullstack-network'
    environment:
      MINIO_ROOT_USER: '${SERVER_MINIO_MINIO_ROOT_USER}'
      MINIO_ROOT_PASSWORD: '${SERVER_MINIO_MINIO_ROOT_PASSWORD}'
    healthcheck:
      test:
        - 'CMD-SHELL'
        - 'mc'
        - 'ready'
        - 'local'
      interval: '5s'
      timeout: '5s'
      retries: 5
    tty: true
    restart: 'always'
  nestjs-mod-fullstack-redis:
    image: 'bitnami/redis:7.4.1'
    container_name: 'nestjs-mod-fullstack-redis'
    volumes:
      - 'nestjs-mod-fullstack-redis-volume:/bitnami/redis/data'
    ports:
      - '6379:6379'
    networks:
      - 'nestjs-mod-fullstack-network'
    environment:
      REDIS_DATABASE: '${SERVER_REDIS_REDIS_DATABASE}'
      REDIS_PASSWORD: '${SERVER_REDIS_REDIS_PASSWORD}'
      REDIS_DISABLE_COMMANDS: '${SERVER_REDIS_REDIS_DISABLE_COMMANDS}'
      REDIS_IO_THREADS: '${SERVER_REDIS_REDIS_IO_THREADS}'
      REDIS_IO_THREADS_DO_READS: '${SERVER_REDIS_REDIS_IO_THREADS_DO_READS}'
    healthcheck:
      test:
        - 'CMD-SHELL'
        - 'redis-cli --no-auth-warning -a $$REDIS_PASSWORD ping | grep PONG'
      interval: '5s'
      timeout: '5s'
      retries: 5
    tty: true
    restart: 'always'
  nestjs-mod-fullstack-postgre-sql-migrations:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-migrations:${ROOT_VERSION}'
    container_name: 'nestjs-mod-fullstack-postgre-sql-migrations'
    networks:
      - 'nestjs-mod-fullstack-network'
    tty: true
    environment:
      NX_SKIP_NX_CACHE: 'true'
      SERVER_ROOT_DATABASE_URL: '${SERVER_ROOT_DATABASE_URL}'
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
      SERVER_WEBHOOK_DATABASE_URL: '${SERVER_WEBHOOK_DATABASE_URL}'
      SERVER_AUTHORIZER_DATABASE_URL: '${SERVER_AUTHORIZER_DATABASE_URL}'
    depends_on:
      nestjs-mod-fullstack-postgre-sql:
        condition: 'service_healthy'
    working_dir: '/usr/src/app'
    volumes:
      - './../apps:/usr/src/app/apps'
      - './../libs:/usr/src/app/libs'
  nestjs-mod-fullstack-server:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-server:${SERVER_VERSION}'
    container_name: 'nestjs-mod-fullstack-server'
    networks:
      - 'nestjs-mod-fullstack-network'
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    healthcheck:
      test: ['CMD-SHELL', 'npx -y wait-on --timeout= --interval=1000 --window --verbose --log http://localhost:${SERVER_PORT}/api/health']
      interval: 30s
      timeout: 10s
      retries: 10
    tty: true
    environment:
      NODE_TLS_REJECT_UNAUTHORIZED: '0'
      SERVER_PORT: '${SERVER_PORT}'
      SERVER_APP_DATABASE_URL: '${SERVER_APP_DATABASE_URL}'
      SERVER_WEBHOOK_DATABASE_URL: '${SERVER_WEBHOOK_DATABASE_URL}'
      SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID: '${SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID}'
      SERVER_AUTH_ADMIN_EMAIL: '${SERVER_AUTH_ADMIN_EMAIL}'
      SERVER_AUTH_ADMIN_USERNAME: '${SERVER_AUTH_ADMIN_USERNAME}'
      SERVER_AUTH_ADMIN_PASSWORD: '${SERVER_AUTH_ADMIN_PASSWORD}'
      SERVER_AUTHORIZER_URL: '${SERVER_AUTHORIZER_URL}'
      SERVER_AUTHORIZER_REDIRECT_URL: '${SERVER_AUTHORIZER_REDIRECT_URL}'
      SERVER_AUTHORIZER_AUTHORIZER_URL: '${SERVER_AUTHORIZER_AUTHORIZER_URL}'
      SERVER_AUTHORIZER_ADMIN_SECRET: '${SERVER_AUTHORIZER_ADMIN_SECRET}'
      SERVER_MINIO_SERVER_HOST: '${SERVER_MINIO_SERVER_HOST}'
      SERVER_MINIO_ACCESS_KEY: '${SERVER_MINIO_ACCESS_KEY}'
      SERVER_MINIO_SECRET_KEY: '${SERVER_MINIO_SECRET_KEY}'
      SERVER_REDIS_URL: '${SERVER_REDIS_URL}'
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-authorizer:
        condition: 'service_started'
      nestjs-mod-fullstack-minio:
        condition: 'service_started'
      nestjs-mod-fullstack-redis:
        condition: 'service_healthy'
      nestjs-mod-fullstack-postgre-sql:
        condition: service_healthy
      nestjs-mod-fullstack-postgre-sql-migrations:
        condition: service_completed_successfully
  nestjs-mod-fullstack-nginx:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-nginx:${CLIENT_VERSION}'
    container_name: 'nestjs-mod-fullstack-nginx'
    networks:
      - 'nestjs-mod-fullstack-network'
    healthcheck:
      test: ['CMD-SHELL', 'curl -so /dev/null http://localhost:${NGINX_PORT} || exit 1']
      interval: 30s
      timeout: 10s
      retries: 10
    environment:
      SERVER_PORT: '${SERVER_PORT}'
      NGINX_PORT: '${NGINX_PORT}'
      CLIENT_AUTHORIZER_URL: '${CLIENT_AUTHORIZER_URL}'
      CLIENT_MINIO_URL: '${CLIENT_MINIO_URL}'
      CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID: '${CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID}'
    restart: 'always'
    depends_on:
      nestjs-mod-fullstack-server:
        condition: service_healthy
    ports:
      - '${NGINX_PORT}:${NGINX_PORT}'
  nestjs-mod-fullstack-e2e-tests:
    image: 'ghcr.io/nestjs-mod/nestjs-mod-fullstack-e2e-tests:${ROOT_VERSION}'
    container_name: 'nestjs-mod-fullstack-e2e-tests'
    networks:
      - 'nestjs-mod-fullstack-network'
    environment:
      IS_DOCKER_COMPOSE: 'true'
      BASE_URL: 'http://nestjs-mod-fullstack-nginx:${NGINX_PORT}'
      SERVER_AUTHORIZER_URL: 'http://nestjs-mod-fullstack-authorizer:8080'
      SERVER_MINIO_URL: 'http://nestjs-mod-fullstack-minio:9000'
      SERVER_URL: 'http://nestjs-mod-fullstack-server:8080'
      SERVER_AUTH_ADMIN_EMAIL: '${SERVER_AUTH_ADMIN_EMAIL}'
      SERVER_AUTH_ADMIN_USERNAME: '${SERVER_AUTH_ADMIN_USERNAME}'
      SERVER_AUTH_ADMIN_PASSWORD: '${SERVER_AUTH_ADMIN_PASSWORD}'
      SERVER_AUTHORIZER_ADMIN_SECRET: '${SERVER_AUTHORIZER_ADMIN_SECRET}'
    depends_on:
      nestjs-mod-fullstack-nginx:
        condition: service_healthy
    working_dir: '/usr/src/app'
    volumes:
      - './../apps:/usr/src/app/apps'
      - './../libs:/usr/src/app/libs'
  nestjs-mod-fullstack-https-portal:
    image: steveltn/https-portal:1
    container_name: 'nestjs-mod-fullstack-https-portal'
    networks:
      - 'nestjs-mod-fullstack-network'
    ports:
      - '80:80'
      - '443:443'
    links:
      - nestjs-mod-fullstack-nginx
    restart: always
    environment:
      STAGE: '${HTTPS_PORTAL_STAGE}'
      DOMAINS: '${SERVER_DOMAIN} -> http://nestjs-mod-fullstack-nginx:${NGINX_PORT}'
    depends_on:
      nestjs-mod-fullstack-nginx:
        condition: service_healthy
    volumes:
      - nestjs-mod-fullstack-https-portal-volume:/var/lib/https-portal
volumes:
  nestjs-mod-fullstack-postgre-sql-volume:
    name: 'nestjs-mod-fullstack-postgre-sql-volume'
  nestjs-mod-fullstack-https-portal-volume:
    name: 'nestjs-mod-fullstack-https-portal-volume'
  nestjs-mod-fullstack-minio-volume:
    name: 'nestjs-mod-fullstack-minio-volume'
  nestjs-mod-fullstack-redis-volume:
    name: 'nestjs-mod-fullstack-redis-volume'
```

Updating the file _.docker/docker-compose-full.env_

```sh
SERVER_PORT=9090
NGINX_PORT=8080
SERVER_ROOT_DATABASE_URL=postgres://postgres:postgres_password@nestjs-mod-fullstack-postgre-sql:5432/postgres?schema=public
SERVER_APP_DATABASE_URL=postgres://app:app_password@nestjs-mod-fullstack-postgre-sql:5432/app?schema=public
SERVER_WEBHOOK_DATABASE_URL=postgres://webhook:webhook_password@nestjs-mod-fullstack-postgre-sql:5432/webhook?schema=public
SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME=postgres
SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD=postgres_password
SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE=postgres
SERVER_DOMAIN=example.com
HTTPS_PORTAL_STAGE=local # local|stage|production

CLIENT_AUTHORIZER_URL=http://localhost:8000
CLIENT_MINIO_URL=http://localhost:9000
SERVER_AUTHORIZER_REDIRECT_URL=http://localhost:8080
SERVER_AUTH_ADMIN_EMAIL=nestjs-mod-fullstack@site15.ru
SERVER_AUTH_ADMIN_USERNAME=admin
SERVER_AUTH_ADMIN_PASSWORD=SbxcbII7RUvCOe9TDXnKhfRrLJW5cGDA
SERVER_URL=http://localhost:9090/api
SERVER_AUTHORIZER_URL=http://localhost:8000
SERVER_MINIO_URL=http://localhost:9000
SERVER_AUTHORIZER_ADMIN_SECRET=VfKSfPPljhHBXCEohnitursmgDxfAyiD
SERVER_AUTHORIZER_DATABASE_TYPE=postgres
SERVER_AUTHORIZER_DATABASE_URL=postgres://Yk42KA4sOb:B7Ep2MwlRR6fAx0frXGWVTGP850qAxM6@nestjs-mod-fullstack-postgre-sql:5432/authorizer
SERVER_AUTHORIZER_DATABASE_NAME=authorizer
SERVER_AUTHORIZER_PORT=8080
SERVER_AUTHORIZER_AUTHORIZER_URL=http://nestjs-mod-fullstack-authorizer:8080
SERVER_AUTHORIZER_COOKIE_NAME=authorizer
SERVER_AUTHORIZER_DISABLE_PLAYGROUND=true
SERVER_AUTHORIZER_ACCESS_TOKEN_EXPIRY_TIME=30m
SERVER_AUTHORIZER_DISABLE_STRONG_PASSWORD=true
SERVER_AUTHORIZER_DISABLE_EMAIL_VERIFICATION=true
SERVER_AUTHORIZER_ORGANIZATION_NAME=NestJSModFullstack
SERVER_AUTHORIZER_IS_EMAIL_SERVICE_ENABLED=true
SERVER_AUTHORIZER_IS_SMS_SERVICE_ENABLED=false
SERVER_AUTHORIZER_RESET_PASSWORD_URL=/reset-password
SERVER_AUTHORIZER_ROLES=user,admin
SERVER_AUTHORIZER_DEFAULT_ROLES=user
SERVER_AUTHORIZER_JWT_ROLE_CLAIM=role

SERVER_MINIO_SERVER_HOST=nestjs-mod-fullstack-minio
SERVER_MINIO_ACCESS_KEY=FWGmrAGaeMKM
SERVER_MINIO_SECRET_KEY=QatVJuLoZRARlJguoZMpoKvZMJHzvuOR
SERVER_MINIO_ROOT_USER=FWGmrAGaeMKM
SERVER_MINIO_ROOT_PASSWORD=QatVJuLoZRARlJguoZMpoKvZMJHzvuOR
SERVER_MINIO_MINIO_ROOT_USER=FWGmrAGaeMKM
SERVER_MINIO_MINIO_ROOT_PASSWORD=QatVJuLoZRARlJguoZMpoKvZMJHzvuOR

SERVER_REDIS_REDIS_DATABASE=0
SERVER_REDIS_REDIS_PASSWORD=CHmeOQrZWUHwgahrfzsrzuREOxgAENsC
SERVER_REDIS_REDIS_DISABLE_COMMANDS=
SERVER_REDIS_REDIS_IO_THREADS=
SERVER_REDIS_REDIS_IO_THREADS_DO_READS=

SERVER_REDIS_URL=redis://:CHmeOQrZWUHwgahrfzsrzuREOxgAENsC@nestjs-mod-fullstack-redis:6379
```

### Conclusion

This post shows a simple way to cache and invalidate a cache. If there are more entities and data to cache, then you need to think of another way to cache and invalidate in order to write less code.

### Plans

In the next post I will add getting server time via `WebSockets` and displaying it in an `Angular` application...

### Links

- https://nestjs.com - the official website of the framework
- https://nestjs-mod.com - the official website of additional utilities
- https://fullstack.nestjs-mod.com - website from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/06f453a5d6350a562766216a4f87d70547af8292..82e050c24a0d1a2111f499460896c6d00e0f5af4 - current changes

#nestjs #redis #nestjsmod #fullstack
