## [2024-12-16] Integrating and storing the selected user language into the database in a full-stack application on "Angular" and "NestJS"

This post does not pretend to be large-scale, but since I consistently document all stages of boilerplate development in the article format, I decided to describe this task as well.

Here I will give an example of a database migration for adding a new field, and also show how to implement the corresponding functionality on the backend and frontend to change this value.

The user language, like the time zone, will be stored in the `Auth` database.

### 1. Creating a migration to add a new field

At this stage, we will migrate the database, adding a new field to store the selected information.

_Commands_

```bash
# Create empty migration
npm run flyway:create:auth --args=AddFieldLangToAuthUser
```

Fill the migration file with `SQL` script needed to create new column.

Update the file _libs/core/auth/src/migrations/V202412141339\_\_AddFieldLangToAuthUser.sql_

```sql
DO $$
BEGIN
    ALTER TABLE "AuthUser"
        ADD "lang" varchar(2);
EXCEPTION
    WHEN duplicate_column THEN
        NULL;
END
$$;
```

### 2. Applying the generated migrations and updating the Prisma schemas

After you have finished creating the migrations, you need to apply them, update the `Prisma` schemas for all databases and restart the `Prisma` generators.

_Commands_

```bash
npm run db:create-and-fill
npm run prisma:pull
npm run generate
```

Schema file for the new database _libs/core/auth/src/prisma/schema.prisma_

```prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../../../../../node_modules/@prisma/auth-client"
  binaryTargets = ["native", "linux-musl", "debian-openssl-1.1.x", "linux-musl-openssl-3.0.x"]
  engineType    = "binary"
}

generator prismaClassGenerator {
  provider                        = "prisma-generator-nestjs-dto"
  output                          = "../lib/generated/rest/dto"
  flatResourceStructure           = "false"
  dtoSuffix                       = "Dto"
  entityPrefix                    = ""
  prettier                        = "true"
  annotateAllDtoProperties        = "true"
  fileNamingStyle                 = "kebab"
  noDependencies                  = "false"
  updateDtoPrefix                 = "Update"
  exportRelationModifierClasses   = "true"
  entitySuffix                    = ""
  outputToNestJsResourceStructure = "false"
  reExport                        = "false"
  definiteAssignmentAssertion     = "true"
  createDtoPrefix                 = "Create"
  classValidation                 = "true"
}

datasource db {
  provider = "postgres"
  url      = env("SERVER_AUTH_DATABASE_URL")
}

model AuthUser {
  id             String   @id(map: "PK_AUTH_USER") @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  externalUserId String   @unique(map: "UQ_AUTH_USER") @db.Uuid
  userRole       AuthRole
  timezone       Float?
  /// @DtoCreateHidden
  /// @DtoUpdateHidden
  createdAt      DateTime @default(now()) @db.Timestamp(6)
  /// @DtoCreateHidden
  /// @DtoUpdateHidden
  updatedAt      DateTime @default(now()) @db.Timestamp(6)
  lang           String?  @db.VarChar(2)  // <--updates

  @@index([userRole], map: "IDX_AUTH_USER__USER_ROLE")
}

model migrations {
  installed_rank Int      @id(map: "__migrations_pk")
  version        String?  @db.VarChar(50)
  description    String   @db.VarChar(200)
  type           String   @db.VarChar(20)
  script         String   @db.VarChar(1000)
  checksum       Int?
  installed_by   String   @db.VarChar(100)
  installed_on   DateTime @default(now()) @db.Timestamp(6)
  execution_time Int
  success        Boolean

  @@index([success], map: "__migrations_s_idx")
  @@map("__migrations")
}

enum AuthRole {
  Admin
  User
}

```

After a successful restart of the generators, all `DTO`s associated with the `AuthUser` table will have a new `lang` field.

Updated file _libs/core/auth/src/lib/generated/rest/dto/auth-user.entity.ts_

```typescript
import { AuthRole } from '../../../../../../../../node_modules/@prisma/auth-client';
import { ApiProperty } from '@nestjs/swagger';

export class AuthUser {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  externalUserId!: string;
  @ApiProperty({
    enum: AuthRole,
    enumName: 'AuthRole',
  })
  userRole!: AuthRole;
  @ApiProperty({
    type: 'number',
    format: 'float',
    nullable: true,
  })
  timezone!: number | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt!: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt!: Date;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  lang!: string | null; // <--updates
}
```

### 3. Changes in DTO and methods for getting and updating the user profile

To update the new `lang` field, you can create a separate method or adapt the existing methods for getting and updating the profile. In this article, we will choose the second option - modifying the existing methods.

Updating the DTO file _libs/core/auth/src/lib/types/auth-profile.dto.ts_

```typescript
import { PickType } from '@nestjs/swagger';
import { CreateAuthUserDto } from '../generated/rest/dto/create-auth-user.dto';

export class AuthProfileDto extends PickType(CreateAuthUserDto, ['timezone', 'lang']) {}
```

Since the allowed languages ​​are limited to a certain set of values, it is necessary to check the correctness of the incoming data on the server.

There are several approaches to implementing such a check. In this case, I will perform the check inside the method and throw a validation error, similar to how the validation pipe does it. This approach will help to unify the handling of field errors on the client side.

Now let's update the controller _libs/core/auth/src/lib/controllers/auth.controller.ts_

```typescript
import { StatusResponse } from '@nestjs-mod-fullstack/common';
import { ValidationError, ValidationErrorEnum } from '@nestjs-mod-fullstack/validation';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExtraModels, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { AuthRole, PrismaClient } from '@prisma/auth-client';
import { InjectTranslateFunction, TranslateFunction, TranslatesService, TranslatesStorage } from 'nestjs-translates';
import { AUTH_FEATURE } from '../auth.constants';
import { CheckAuthRole, CurrentAuthUser } from '../auth.decorators';
import { AuthError } from '../auth.errors';
import { AuthUser } from '../generated/rest/dto/auth-user.entity';
import { AuthEntities } from '../types/auth-entities';
import { AuthProfileDto } from '../types/auth-profile.dto';
import { AuthCacheService } from '../services/auth-cache.service';

@ApiExtraModels(AuthError, AuthEntities, ValidationError)
@ApiBadRequestResponse({
  schema: { allOf: refs(AuthError, ValidationError) },
})
@ApiTags('Auth')
@CheckAuthRole([AuthRole.User, AuthRole.Admin])
@Controller('/auth')
export class AuthController {
  constructor(
    @InjectPrismaClient(AUTH_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly authCacheService: AuthCacheService,
    private readonly translatesStorage: TranslatesStorage
  ) {}

  @Get('profile')
  @ApiOkResponse({ type: AuthProfileDto })
  async profile(@CurrentAuthUser() authUser: AuthUser): Promise<AuthProfileDto> {
    return {
      lang: authUser.lang, // <--updates
      timezone: authUser.timezone,
    };
  }

  @Post('update-profile')
  @ApiOkResponse({ type: StatusResponse })
  async updateProfile(@CurrentAuthUser() authUser: AuthUser, @Body() args: AuthProfileDto, @InjectTranslateFunction() getText: TranslateFunction) {
    if (args.lang && !this.translatesStorage.locales.includes(args.lang)) {
      // <--updates
      throw new ValidationError(undefined, ValidationErrorEnum.COMMON, [
        {
          property: 'lang',
          constraints: {
            isNotEmpty: getText('lang must have one of the values: {{values}}', this.translatesStorage.locales.join(', ')),
          },
        },
      ]);
    }
    await this.prismaClient.authUser.update({
      where: { id: authUser.id },
      data: {
        ...(args.lang === undefined // <--updates
          ? {}
          : {
              lang: args.lang,
            }),
        ...(args.timezone === undefined // <--updates
          ? {}
          : {
              timezone: args.timezone,
            }),
        updatedAt: new Date(),
      },
    });
    await this.authCacheService.clearCacheByExternalUserId(authUser.externalUserId);
    return { message: getText('ok') };
  }
}
```

### 4. Adapting "AuthGuard" to get the user's language from the database

Now let's change the behavior of `AuthGuard` so that the user's language value is retrieved not from the frontend request, but from the settings stored in the database.

To do this, update the file _libs/core/auth/src/lib/auth.guard.ts_

```typescript
// ...

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  constructor(
    // ...
    private readonly translatesStorage: TranslatesStorage
  ) {}

  // ...

  private async tryGetOrCreateCurrentUserWithExternalUserId(req: AuthRequest, externalUserId: string) {
    if (!req.authUser && externalUserId) {
      const authUser = await this.authCacheService.getCachedUserByExternalUserId(externalUserId);
      req.authUser =
        authUser ||
        (await this.prismaClient.authUser.upsert({
          create: { externalUserId, userRole: 'User' },
          update: {},
          where: { externalUserId },
        }));

      if (req.authUser.lang) {
        req.headers[ACCEPT_LANGUAGE] = req.authUser.lang;
      }
    }

    if (req.headers[ACCEPT_LANGUAGE] && !this.translatesStorage.locales.includes(req.headers[ACCEPT_LANGUAGE])) {
      req.headers[ACCEPT_LANGUAGE] = this.translatesStorage.defaultLocale;
    }
  }
  // ...
}
```

### 5. Updating "SDK" for interaction with the backend

Now we need to recreate all `SDK`s that provide interaction with our server.

_Commands_

```bash
npm run manual:prepare
```

### 6. Developing a new test for the backend for changing and using the language from the database

To check the correctness of the functionality, we will create a special test scenario that will confirm that the change of language and its subsequent extraction from the database occur without errors.

Create the file _apps/server-e2e/src/server/store-lang-in-db.spec.ts_

```typescript
import { RestClientHelper } from '@nestjs-mod-fullstack/testing';
import { AxiosError } from 'axios';

describe('Store lang in db', () => {
  jest.setTimeout(60000);

  const user1 = new RestClientHelper();

  beforeAll(async () => {
    await user1.createAndLoginAsUser();
  });

  it('should catch error on try use not exists language code', async () => {
    try {
      await user1.getAuthApi().authControllerUpdateProfile({ lang: 'tt' });
    } catch (err) {
      expect((err as AxiosError).response?.data).toEqual({
        code: 'VALIDATION-000',
        message: 'Validation error',
        metadata: [
          {
            property: 'lang',
            constraints: [
              {
                name: 'isWrongEnumValue',
                description: 'lang must have one of the values: en, ru',
              },
            ],
          },
        ],
      });
    }
  });

  it('should catch error in Russian language on create new webhook as user1', async () => {
    await user1.getAuthApi().authControllerUpdateProfile({ lang: 'ru' });
    try {
      await user1.getWebhookApi().webhookControllerCreateOne({
        enabled: false,
        endpoint: '',
        eventName: '',
      });
    } catch (err) {
      expect((err as AxiosError).response?.data).toEqual({
        code: 'VALIDATION-000',
        message: 'Validation error',
        metadata: [
          {
            property: 'eventName',
            constraints: [
              {
                name: 'isNotEmpty',
                description: 'eventName не может быть пустым',
              },
            ],
          },
          {
            property: 'endpoint',
            constraints: [
              {
                name: 'isNotEmpty',
                description: 'endpoint не может быть пустым',
              },
            ],
          },
        ],
      });
    }
  });
});
```

### 7. Running all server "E2E" tests

Let's run all `E2E` level tests for the server to make sure that all functionality works correctly and without failures.

_Commands_

```bash
npm run nx -- run server-e2e:e2e
```

### 8. Creating a service to manage the user's active language in the frontend

In the frontend application, we will create a service that will manage the active language for both authorized and unauthorized users.

The logic for working with the active language for unauthorized users will remain the same: it will use `localStorage`.

However, after authorization, the active language will be saved in the user profile.

Create the file _libs/core/auth-angular/src/lib/services/auth-active-lang.service.ts_

```typescript
import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { AuthErrorEnumInterface, AuthErrorInterface, AuthRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { catchError, map, of, tap, throwError } from 'rxjs';

const AUTH_ACTIVE_LANG_LOCAL_STORAGE_KEY = 'activeLang';

@Injectable({ providedIn: 'root' })
export class AuthActiveLangService {
  constructor(private readonly authRestService: AuthRestService, private readonly translocoService: TranslocoService) {}

  getActiveLang() {
    return this.authRestService.authControllerProfile().pipe(
      map((profile) => {
        return profile.lang || this.translocoService.getDefaultLang();
      }),
      catchError((err) => {
        if ('error' in err && (err.error as AuthErrorInterface).code === AuthErrorEnumInterface._001) {
          return of(localStorage.getItem(AUTH_ACTIVE_LANG_LOCAL_STORAGE_KEY) || this.translocoService.getDefaultLang());
        }
        return throwError(() => err);
      })
    );
  }

  setActiveLang(lang: string) {
    return this.authRestService.authControllerUpdateProfile({ lang }).pipe(
      tap(() => {
        this.translocoService.setActiveLang(lang);
      }),
      catchError((err) => {
        if ('error' in err && (err.error as AuthErrorInterface).code === AuthErrorEnumInterface._001) {
          localStorage.setItem(AUTH_ACTIVE_LANG_LOCAL_STORAGE_KEY, lang);
          this.translocoService.setActiveLang(lang);
          return of(null);
        }
        return throwError(() => err);
      })
    );
  }
}
```

Now let's replace all usages of `localStorage` for storing language with `AuthActiveLangService` throughout the frontend code.

### 9. Developing a new frontend test for changing and using language from the database

As part of the test, we will perform the following steps: register, change the language to Russian, then change the language in `localStorage` from Russian to English and try to create a new webhook with empty fields. The expected result is getting a validation error in Russian.

Create a file _apps/client-e2e/src/ru-validation-with-store-lang-in-db.spec.ts_

```typescript
import { faker } from '@faker-js/faker';
import { expect, Page, test } from '@playwright/test';
import { get } from 'env-var';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('Validation with store lang in db (ru)', () => {
  test.describe.configure({ mode: 'serial' });

  const user = {
    email: faker.internet.email({
      provider: 'example.fakerjs.dev',
    }),
    password: faker.internet.password({ length: 8 }),
    site: `http://${faker.internet.domainName()}`,
  };
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: join(__dirname, 'video'),
        size: { width: 1920, height: 1080 },
      },
    });
    await page.goto('/', {
      timeout: 7000,
    });
    await page.evaluate((authorizerURL) => localStorage.setItem('authorizerURL', authorizerURL), get('SERVER_AUTHORIZER_URL').required().asString());
    await page.evaluate((minioURL) => localStorage.setItem('minioURL', minioURL), get('SERVER_MINIO_URL').required().asString());
  });

  test.afterAll(async () => {
    await setTimeout(1000);
    await page.close();
  });

  test('sign up as user', async () => {
    await page.goto('/sign-up', {
      timeout: 7000,
    });

    await page.locator('auth-sign-up-form').locator('[placeholder=email]').click();
    await page.keyboard.type(user.email.toLowerCase(), {
      delay: 50,
    });
    await expect(page.locator('auth-sign-up-form').locator('[placeholder=email]')).toHaveValue(user.email.toLowerCase());

    await page.locator('auth-sign-up-form').locator('[placeholder=password]').click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(page.locator('auth-sign-up-form').locator('[placeholder=password]')).toHaveValue(user.password);

    await page.locator('auth-sign-up-form').locator('[placeholder=confirm_password]').click();
    await page.keyboard.type(user.password, {
      delay: 50,
    });
    await expect(page.locator('auth-sign-up-form').locator('[placeholder=confirm_password]')).toHaveValue(user.password);

    await expect(page.locator('auth-sign-up-form').locator('button[type=submit]')).toHaveText('Sign-up');

    await page.locator('auth-sign-up-form').locator('button[type=submit]').click();

    await setTimeout(5000);

    await expect(page.locator('nz-header').locator('[nz-submenu]').first()).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
  });

  test('should change language to RU', async () => {
    await expect(page.locator('nz-header').locator('[nz-submenu]').last()).toContainText(`EN`);
    await page.locator('nz-header').locator('[nz-submenu]').last().click();

    await expect(page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').last()).toContainText(`Russian`);

    await page.locator('[nz-submenu-none-inline-child]').locator('[nz-menu-item]').last().click();

    await setTimeout(4000);
    //

    await expect(page.locator('nz-header').locator('[nz-submenu]').last()).toContainText(`RU`);
  });

  test('change lang to en in localStorage', async () => {
    await page.evaluate(() => localStorage.setItem('activeLang', 'en'));

    const activeLang = await page.evaluate(() => localStorage.getItem('activeLang'));

    expect(activeLang).toEqual('en');
  });

  test('should catch error on create new webhook', async () => {
    await page.locator('webhook-grid').locator('button').first().click();

    await setTimeout(7000);

    await page.locator('[nz-modal-footer]').locator('button').last().click();

    await setTimeout(4000);

    await expect(page.locator('webhook-form').locator('formly-validation-message').first()).toContainText('поле "адрес" не может быть пустым');
    await expect(page.locator('webhook-form').locator('formly-validation-message').last()).toContainText('поле "событие" не может быть пустым');
  });
});
```

### 10. Run all "E2E" level tests for both server and client

Let's run all `E2E` level tests for both server and client to make sure all functionality works correctly and without errors.

_Commands_

```bash
npm run pm2-full:dev:test:e2e
```

### Conclusion

Despite the apparent simplicity of the task, its solution required a significant amount of time and writing a considerable amount of code.

However, even for such minimal changes it is extremely important to ensure `E2E` test coverage, which was demonstrated in this post.

### Plans

In the previous article, I implemented the function of automatic conversion of output data containing fields of type `Date` or strings in `ISOString` format. However, I have not yet implemented automatic conversion of input data. In the next post, I will deal with this issue.

### Links

- https://nestjs.com - the official website of the framework
- https://nestjs-mod.com - the official website of additional utilities
- https://fullstack.nestjs-mod.com - website from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/3019d982ca9605479a8b917f71a8ae268f3582bc..4f495dbd6b9b4efd8d8e13a60c5f66b895c483af - current changes
- https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/12347665539/artifacts/2324579763 - video from E2E frontend tests

#angular #translates #nestjsmod #fullstack
