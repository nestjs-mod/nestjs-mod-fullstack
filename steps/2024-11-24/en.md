## [2024-11-24] Validating REST requests in a NestJS application and displaying errors in Angular application forms

In this post I will add validation of REST requests in NestJS application and their display in forms of Angular application.

### 1. Install a new code generator

Install a new `DTO` generator from the `Prisma` schema and remove the old one, since the old one does not add validation decorators using `class-validator`.

_Commands_

```bash
npm install --save-dev @brakebein/prisma-generator-nestjs-dto@1.24.0-beta5
npm uninstall --save-dev prisma-class-generator
```

We delete the old generated code and create a new one.

_Commands_

```bash
rm -rf libs/feature/webhook/src/lib/generated
rm -rf apps/server/src/app/generated
npm run prisma:generate
```

### 2. Create a NestJS module to store the code needed for validation

_Commands_

```bash
./node_modules/.bin/nx g @nestjs-mod/schematics:library validation --buildable --publishable --directory=libs/core/validation --simpleName=true --projectNameAndRootFormat=as-provided --strict=true
```

{% spoiler Console output %}

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

{% endspoiler %}

**Module environment variables**

Add an environment variable to enable and disable global input data validation.

Since the fields in the database have their own validation and if we want to check the correctness of the validation at the database level, then checking the input data in the backend will not allow us to do this, for such a check during the development and testing of functionality, you need to be able to temporarily disable validation at the entrance to the backend.

The module comes with a built-in filter for correct display of errors, if you need to customize it, you can create your own version and at the same time disable the filter built into the module.

Updating the file _libs/core/validation/src/lib/validation.environments.ts_

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

Example of environment variables:

| Key          | Description  | Sources                                                             | Constraints  | Default | Value  |
| ------------ | ------------ | ------------------------------------------------------------------- | ------------ | ------- | ------ |
| `usePipes`   | Use pipes.   | `obj['usePipes']`, `process.env['SERVER_VALIDATION_USE_PIPES']`     | **optional** | `true`  | `true` |
| `useFilters` | Use filters. | `obj['useFilters']`, `process.env['SERVER_VALIDATION_USE_FILTERS']` | **optional** | `true`  | `true` |

**Module Configuration**

Currently there is only one parameter here, this is the configuration for creating `ValidationPipe`.

Updating the file _libs/core/validation/src/lib/validation.configuration.ts_

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

**Class with module errors**

Since at this stage the project is being developed as a `REST` backend, which is available on the frontend as an `OpenApi` library, the class with errors is also published in the `Swagger` schema.

In order to make the error description more detailed, it uses decorators that add meta information that will be output to the `Swagger` schema.

Create a file _libs/core/validation/src/lib/validation.errors.ts_

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

**Filter for module errors**

To convert module errors to `Http` error, create `ValidationExceptionsFilter`.

Create a file _libs/core/validation/src/lib/validation.filter.ts_

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

**NestJS-mod module**

Create a file _libs/core/validation/src/lib/validation.module.ts_

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

### 3. We correct types throughout the project, since the new generator creates types with different names and contents

We start regeneration of all SDK and other additional code, during generation type errors will be displayed, it is necessary to correct everything and re-run regeneration and so on until all errors are corrected.

_Commands_

```bash
npm run manual:prepare
```

### 4. In the web hook creation and editing form, we display server errors

To display errors in the `Formly` form, we use dynamic creation of validators that always return an error and put in the error text what we received from the backend.

An example of a server response with errors:

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

Updating the file _libs/feature/webhook-angular/src/lib/forms/webhook-form/webhook-form.component.ts_

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

### 5. Create a server E2E test to check the validation

Create a file _apps/server-e2e/src/server/validation.spec.ts_

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

### 6. Create a client E2E test to check the validation

Create a file _apps/client-e2e/src/validation.spec.ts_

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

### 7. We launch the infrastructure with applications in development mode and check the operation through E2E tests

_Commands_

```bash
npm run pm2-full:dev:start
npm run pm2-full:dev:test:e2e
```

### Conclusion

In the current post, I added a module to the backend to enable serialization and validation of input `REST` data.

The code on the frontend is not unified and is implemented specifically in one form, with a large number of forms with such processing, it will be necessary to move the common code to a separate file.

The method I chose to create dynamic errors for `Formly` forms based on responses from the backend may not seem like a very beautiful solution, but I could not come up with a simpler and more working solution, perhaps as the project develops, another method will appear.

### Plans

In the next post I will add support for multiple languages ​​for backend and frontend applications...

### Links

- https://nestjs.com - the official website of the framework
- https://nestjs-mod.com - the official website of additional utilities
- https://fullstack.nestjs-mod.com - website from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/82e050c24a0d1a2111f499460896c6d00e0f5af4..a5efa43f571a7b48402275e1ee6a9b1e325d0eb0 - current changes

#angular #validation #nestjsmod #fullstack
