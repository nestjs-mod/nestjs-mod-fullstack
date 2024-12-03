## [2024-11-24] Валидация REST-запросов в NestJS-приложении и отображение ошибок в формах Angular-приложения

Предыдущая статья: [Получение серверного времени через WebSockets и отображение его в Angular-приложении](https://habr.com/ru/articles/862986/)

В этом посте я добавлю в `NestJS`-приложении валидацию `REST`-запросов и их отображение в формах `Angular`-приложения.

### 1. Устанавливаем новый генератор кода

Устанавливаем новый генератор `DTO` из `Prisma`-схемы и удаляем старый, так как в старом нет добавления декораторов валидации с помощью `class-validator`.

_Команды_

```bash
npm install --save-dev @brakebein/prisma-generator-nestjs-dto@1.24.0-beta5
npm uninstall --save-dev prisma-class-generator
```

Удаляем старый сгенерированный код и создаем новый.

_Команды_

```bash
rm -rf libs/feature/webhook/src/lib/generated
rm -rf apps/server/src/app/generated
npm run prisma:generate
```

### 2. Создаем NestJS-модуль для хранения кода необходимого при валидации

_Команды_

```bash
./node_modules/.bin/nx g @nestjs-mod/schematics:library validation --buildable --publishable --directory=libs/core/validation --simpleName=true --projectNameAndRootFormat=as-provided --strict=true
```

<spoiler title="Вывод консоли">

```bash
$ ./node_modules/.bin/nx g @nestjs-mod/schematics:library validation --buildable --publishable --directory=libs/core/validation --simpleName=true --projectNameAndRootFormat=as-provided --strict=true

 NX  Generating @nestjs-mod/schematics:library

CREATE libs/core/validation/tsconfig.json
CREATE libs/core/validation/src/index.ts
CREATE libs/core/validation/tsconfig.lib.json
CREATE libs/core/validation/README.md
CREATE libs/core/validation/package.json
CREATE libs/core/validation/project.json
CREATE libs/core/validation/.eslintrc.json
CREATE libs/core/validation/jest.config.ts
CREATE libs/core/validation/tsconfig.spec.json
UPDATE tsconfig.base.json
CREATE libs/core/validation/src/lib/validation.configuration.ts
CREATE libs/core/validation/src/lib/validation.constants.ts
CREATE libs/core/validation/src/lib/validation.environments.ts
CREATE libs/core/validation/src/lib/validation.module.ts
```

</spoiler>

**Переменные окружения модуля**

Добавляем переменную окружения для включения и выключения глобальной проверки входных данных.

Так как поля в базе данных имеют собственную валидацию и если мы хотим проверить корректность валидации на уровне базы данных, то проверка входных в бэкенд данных не даст нам это сделать, для такой проверки при разработке и тестировании функционала нужно уметь временно отключать валидацию на входе в бэкенд.

Модуль идет вместе с встроенным фильтром для корректного отображения ошибок, если вам нужно кастомизировать его, вы можете создать свой вариант и при этом отключить встроенный в модуль фильтр.

Обновляем файл _libs/core/validation/src/lib/validation.environments.ts_

```typescript
import { BooleanTransformer, EnvModel, EnvModelProperty } from '@nestjs-mod/common';

@EnvModel()
export class ValidationEnvironments {
  @EnvModelProperty({
    description: 'Use pipes.',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  usePipes?: boolean;

  @EnvModelProperty({
    description: 'Use filters.',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useFilters?: boolean;
}
```

Пример переменных окружения:

| Key          | Description  | Sources                                                             | Constraints  | Default | Value  |
| ------------ | ------------ | ------------------------------------------------------------------- | ------------ | ------- | ------ |
| `usePipes`   | Use pipes.   | `obj['usePipes']`, `process.env['SERVER_VALIDATION_USE_PIPES']`     | **optional** | `true`  | `true` |
| `useFilters` | Use filters. | `obj['useFilters']`, `process.env['SERVER_VALIDATION_USE_FILTERS']` | **optional** | `true`  | `true` |

**Конфигурация модуля**

В данный момент тут только один параметр, это конфигурация для создания `ValidationPipe`.

Обновляем файл _libs/core/validation/src/lib/validation.configuration.ts_

```typescript
import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';
import { ValidationPipeOptions } from '@nestjs/common';

@ConfigModel()
export class ValidationConfiguration {
  @ConfigModelProperty({
    description: 'Validation pipe options',
  })
  pipeOptions?: ValidationPipeOptions;
}
```

**Класс с ошибками модуля**

Так как на данном этапе проект разрабатывается в виде`REST`-бэкенда, который доступен на фронтенде в виде `OpenApi`-библиотеки, то класс с ошибками также публикуется в `Swagger`-схему.

Для того чтобы описание ошибки было более подробным в нем используется декораторы добавляющие мета информацию которая будет выведена в `Swagger`-схему.

Создаем файл _libs/core/validation/src/lib/validation.errors.ts_

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidationError as CvValidationError } from 'class-validator';

export enum ValidationErrorEnum {
  COMMON = 'VALIDATION-000',
}

export const VALIDATION_ERROR_ENUM_TITLES: Record<ValidationErrorEnum, string> = {
  [ValidationErrorEnum.COMMON]: 'Validation error',
};

export class ValidationErrorMetadataConstraint {
  @ApiProperty({
    type: String,
  })
  name!: string;

  @ApiProperty({
    type: String,
  })
  description!: string;

  constructor(options?: ValidationErrorMetadataConstraint) {
    Object.assign(this, options);
  }
}

export class ValidationErrorMetadata {
  @ApiProperty({
    type: String,
  })
  property!: string;

  @ApiProperty({
    type: () => ValidationErrorMetadataConstraint,
    isArray: true,
  })
  constraints!: ValidationErrorMetadataConstraint[];

  @ApiPropertyOptional({
    type: () => ValidationErrorMetadata,
    isArray: true,
  })
  children?: ValidationErrorMetadata[];

  constructor(options?: ValidationErrorMetadata) {
    Object.assign(this, options);
  }

  static fromClassValidatorValidationErrors(errors?: CvValidationError[]): ValidationErrorMetadata[] | undefined {
    return errors?.map(
      (error) =>
        new ValidationErrorMetadata({
          property: error.property,
          constraints: Object.entries(error.constraints || {}).map(
            ([key, value]) =>
              new ValidationErrorMetadataConstraint({
                name: key,
                description: value,
              })
          ),
          ...(error.children?.length
            ? {
                children: this.fromClassValidatorValidationErrors(error.children),
              }
            : {}),
        })
    );
  }
}

export class ValidationError extends Error {
  @ApiProperty({
    type: String,
    description: Object.entries(VALIDATION_ERROR_ENUM_TITLES)
      .map(([key, value]) => `${value} (${key})`)
      .join(', '),
    example: VALIDATION_ERROR_ENUM_TITLES[ValidationErrorEnum.COMMON],
  })
  override message: string;

  @ApiProperty({
    enum: ValidationErrorEnum,
    enumName: 'ValidationErrorEnum',
    example: ValidationErrorEnum.COMMON,
  })
  code = ValidationErrorEnum.COMMON;

  @ApiPropertyOptional({ type: ValidationErrorMetadata, isArray: true })
  metadata?: ValidationErrorMetadata[];

  constructor(message?: string | ValidationErrorEnum, code?: ValidationErrorEnum, metadata?: CvValidationError[]) {
    const messageAsCode = Boolean(message && Object.values(ValidationErrorEnum).includes(message as ValidationErrorEnum));
    const preparedCode = messageAsCode ? (message as ValidationErrorEnum) : code;
    const preparedMessage = preparedCode ? VALIDATION_ERROR_ENUM_TITLES[preparedCode] : message;

    code = preparedCode || ValidationErrorEnum.COMMON;
    message = preparedMessage || VALIDATION_ERROR_ENUM_TITLES[code];

    super(message);

    this.code = code;
    this.message = message;
    this.metadata = ValidationErrorMetadata.fromClassValidatorValidationErrors(metadata);
  }
}
```

**Фильтр для ошибок модуля**

Для преобразования ошибок модуля в `Http`-ошибку создаем `ValidationExceptionsFilter`.

Создаем файл _libs/core/validation/src/lib/validation.filter.ts_

```typescript
import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ValidationError } from './validation.errors';

@Catch(ValidationError)
export class ValidationExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(ValidationExceptionsFilter.name);

  override catch(exception: ValidationError, host: ArgumentsHost) {
    if (exception instanceof ValidationError) {
      this.logger.error(exception, exception.stack);
      super.catch(
        new HttpException(
          {
            code: exception.code,
            message: exception.message,
            metadata: exception.metadata,
          },
          HttpStatus.BAD_REQUEST
        ),
        host
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.logger.error(exception, (exception as any)?.stack);
      super.catch(exception, host);
    }
  }
}
```

**NestJS-mod модуль**

Создаем файл _libs/core/validation/src/lib/validation.module.ts_

```typescript
import { createNestModule, getFeatureDotEnvPropertyNameFormatter, NestModuleCategory } from '@nestjs-mod/common';
import { Provider, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationConfiguration } from './validation.configuration';
import { VALIDATION_FEATURE, VALIDATION_MODULE } from './validation.constants';
import { ValidationEnvironments } from './validation.environments';
import { ValidationExceptionsFilter } from './validation.filter';
import { ValidationError, ValidationErrorEnum } from './validation.errors';

export const { ValidationModule } = createNestModule({
  moduleName: VALIDATION_MODULE,
  moduleCategory: NestModuleCategory.feature,
  configurationModel: ValidationConfiguration,
  staticEnvironmentsModel: ValidationEnvironments,
  providers: ({ staticEnvironments }) => {
    const providers: Provider[] = [];
    if (staticEnvironments.usePipes) {
      providers.push({
        provide: APP_PIPE,
        useValue: new ValidationPipe({
          transform: true,
          whitelist: true,
          validationError: {
            target: false,
            value: false,
          },
          exceptionFactory: (errors) => new ValidationError(ValidationErrorEnum.COMMON, undefined, errors),
        }),
      });
    }
    if (staticEnvironments.useFilters) {
      providers.push({
        provide: APP_FILTER,
        useClass: ValidationExceptionsFilter,
      });
    }
    return providers;
  },
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass = getFeatureDotEnvPropertyNameFormatter(VALIDATION_FEATURE);
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: VALIDATION_FEATURE,
      },
    });

    return { asyncModuleOptions };
  },
});
```

### 3. По всему проекту исправляем типы, так как новый генератор создает типы с другими названиями и содержимым

Запускаем перегенерацию всех сдк и другого дополнительного кода, при генерации будут отображаться ошибки типов, необходимо все исправить и повторно запустить перегенерацию и так до тех пор пока все ошибки не будут исправлены.

_Команды_

```bash
npm run manual:prepare
```

### 4. В форме создания и редактирования веб-хуков отображаем серверные ошибки

Для отображения ошибок в `Formly`-форме используем динамическое создание валидаторов которые всегда возвращают ошибку и в текст ошибки пишем то что мы получили с бэкенда.

Пример серверного ответа с ошибками:

```json
{
  "code": "VALIDATION-000",
  "message": "Validation error",
  "metadata": [
    {
      "property": "eventName",
      "constraints": [
        {
          "name": "isNotEmpty",
          "description": "eventName should not be empty"
        }
      ]
    },
    {
      "property": "endpoint",
      "constraints": [
        {
          "name": "isNotEmpty",
          "description": "endpoint should not be empty"
        }
      ]
    }
  ]
}
```

Обновляем файл _libs/feature/webhook-angular/src/lib/forms/webhook-form/webhook-form.component.ts_

```typescript
import {
  //...
  ValidationErrorEnumInterface,
  ValidationErrorInterface,
  ValidationErrorMetadataInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';

//...

@UntilDestroy()
@Component({
  standalone: true,
  imports: [FormlyModule, NzFormModule, NzInputModule, NzButtonModule, FormsModule, ReactiveFormsModule, AsyncPipe],
  selector: 'webhook-form',
  templateUrl: './webhook-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhookFormComponent implements OnInit {
  //...

  constructor(
    @Optional()
    @Inject(NZ_MODAL_DATA)
    private readonly nzModalData: WebhookFormComponent,
    private readonly webhookService: WebhookService,
    private readonly webhookEventsService: WebhookEventsService,
    private readonly nzMessageService: NzMessageService
  ) {}

  //...

  createOne() {
    return this.webhookService.createOne(this.toJson(this.form.value)).pipe(catchError((err) => this.catchAndProcessServerError(err)));
  }

  updateOne() {
    if (!this.id) {
      throw new Error('id not set');
    }
    return this.webhookService.updateOne(this.id, this.toJson(this.form.value)).pipe(catchError((err) => this.catchAndProcessServerError(err)));
  }

  private setFormlyFields(errors?: ValidationErrorMetadataInterface[]) {
    this.formlyFields$.next(
      this.appendServerErrorsAsValidatorsToFields(
        [
          //...
          {
            key: 'requestTimeout',
            type: 'input',
            validation: {
              show: true,
            },
            props: {
              type: 'number',
              label: `webhook.form.requestTimeout`,
              placeholder: 'requestTimeout',
              required: false,
            },
          },
        ],
        errors
      )
    );
  }

  private appendServerErrorsAsValidatorsToFields(fields: FormlyFieldConfig[], errors?: ValidationErrorMetadataInterface[]) {
    return (fields || []).map((f: FormlyFieldConfig) => {
      const error = errors?.find((e) => e.property === f.key);
      if (error) {
        f.validators = Object.fromEntries(
          error.constraints.map((c) => {
            return [
              c.name === 'isNotEmpty' ? 'required' : c.name,
              {
                expression: () => false,
                message: () => c.description,
              },
            ];
          })
        );
      }
      return f;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private catchAndProcessServerError(err: any) {
    const error = err.error as ValidationErrorInterface;
    if (error.code.includes(ValidationErrorEnumInterface.VALIDATION_000)) {
      this.setFormlyFields(error.metadata);
      return of(null);
    }
    return throwError(() => err);
  }

  //...
}
```

### 5. Создаем серверный E2E-тест для проверки работы валидации

Создаем файл _apps/server-e2e/src/server/validation.spec.ts_

```typescript
import { RestClientHelper } from '@nestjs-mod-fullstack/testing';
import { AxiosError } from 'axios';

describe('Validation', () => {
  jest.setTimeout(60000);

  const user1 = new RestClientHelper();

  beforeAll(async () => {
    await user1.createAndLoginAsUser();
  });

  it('should catch error on create new webhook as user1', async () => {
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
                description: 'eventName should not be empty',
              },
            ],
          },
          {
            property: 'endpoint',
            constraints: [
              {
                name: 'isNotEmpty',
                description: 'endpoint should not be empty',
              },
            ],
          },
        ],
      });
    }
  });
});
```

### 6. Создаем клиентский E2E-тест для проверки работы валидации

Создаем файл _apps/client-e2e/src/validation.spec.ts_

```typescript
import { faker } from '@faker-js/faker';
import { expect, Page, test } from '@playwright/test';
import { get } from 'env-var';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

test.describe('Validation', () => {
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

    await expect(page.locator('nz-header').locator('[nz-submenu]')).toContainText(`You are logged in as ${user.email.toLowerCase()}`);
  });

  test('should catch error on create new webhook', async () => {
    await page.locator('webhook-grid').locator('button').first().click();

    await setTimeout(7000);

    await page.locator('[nz-modal-footer]').locator('button').last().click();

    await setTimeout(4000);

    await expect(page.locator('webhook-form').locator('formly-validation-message').first()).toContainText('endpoint should not be empty');
    await expect(page.locator('webhook-form').locator('formly-validation-message').last()).toContainText('eventName should not be empty');
  });
});
```

### 7. Запускаем инфраструктуру с приложениями в режиме разработки и проверяем работу через E2E-тесты

_Команды_

```bash
npm run pm2-full:dev:start
npm run pm2-full:dev:test:e2e
```

### Заключение

В текущем посте я добавил модуль в бэкенд для включения сериализации и валидации входных `REST`-данных.

Код на фронте не унифицирован и внедрен конкретно в одной форме, при большом количестве форм с такими обработками, необходимо будет вынести общий код в отдельный файл.

Выбранный мною способ создания динамических ошибок для `Formly`-форм на основе ответов с бэкенда, может показаться не очень красивым решением, но я не смог придумать более простого и рабочего решения, возможно по мере развития проекта появится иной способ.

### Планы

В следующем посте я добавлю поддержку нескольких языков для бэкенд и фронтенд приложений...

### Ссылки

- https://nestjs.com - официальный сайт фреймворка
- https://nestjs-mod.com - официальный сайт дополнительных утилит
- https://fullstack.nestjs-mod.com - сайт из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/a5efa43f571a7b48402275e1ee6a9b1e325d0eb0..2c14d02af439c0884a4052a3b0197a9ee94c571d - изменения

#angular #validation #nestjsmod #fullstack
