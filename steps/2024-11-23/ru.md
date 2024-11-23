## [2024-11-23] Получение серверного времени через WebSockets и отображение его в Angular-приложении

Предыдущая статья: [Кэширование информации в Redis на NestJS](https://nestjs-mod.com/docs/ru-posts/fullstack/2024-11-20)

В этом посте я опишу как создать веб-сокетный стрим в бэкенде на `NestJS` и подписаться на него из фронтенд приложения на `Angular`.

### 1. Устанавливаем новый генератор кода

Устанавливаем новый генератор `DTO` из `Prisma`-схемы и удаляем старый, так как в старом нет добавления декораторов валидации.

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

Модуль идет вместе с втроенным фильтром для корректного отображения ошибок, если вам нужно кастомизировать его, вы можете создать свой вариант и при этом отключить встроенный в модуль фильтр.

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

Для того чтобы описание ошибки было более подробным в нем используется декораторы добавляющие мета информацию которая будет выведенна в `Swagger`-схему.

Создаем файл _libs/feature/webhook/src/lib/webhook.errors.ts_

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WebhookErrorEnum {
  COMMON = 'WEBHOOK-000',
  FORBIDDEN = 'WEBHOOK-001',
  EXTERNAL_USER_ID_NOT_SET = 'WEBHOOK-002',
  EXTERNAL_TENANT_ID_NOT_SET = 'WEBHOOK-003',
  USER_NOT_FOUND = 'WEBHOOK-004',
  EVENT_NOT_FOUND = 'WEBHOOK-005',
}

export const WEBHOOK_ERROR_ENUM_TITLES: Record<WebhookErrorEnum, string> = {
  [WebhookErrorEnum.COMMON]: 'Webhook error',
  [WebhookErrorEnum.EXTERNAL_TENANT_ID_NOT_SET]: 'Tenant ID not set',
  [WebhookErrorEnum.EXTERNAL_USER_ID_NOT_SET]: 'User ID not set',
  [WebhookErrorEnum.FORBIDDEN]: 'Forbidden',
  [WebhookErrorEnum.USER_NOT_FOUND]: 'User not found',
  [WebhookErrorEnum.EVENT_NOT_FOUND]: 'Event not found',
};

export class WebhookError<T = unknown> extends Error {
  @ApiProperty({
    type: String,
    description: Object.entries(WEBHOOK_ERROR_ENUM_TITLES)
      .map(([key, value]) => `${value} (${key})`)
      .join(', '),
    example: WEBHOOK_ERROR_ENUM_TITLES[WebhookErrorEnum.COMMON],
  })
  override message: string;

  @ApiProperty({
    enum: WebhookErrorEnum,
    enumName: 'WebhookErrorEnum',
    example: WebhookErrorEnum.COMMON,
  })
  code = WebhookErrorEnum.COMMON;

  @ApiPropertyOptional({ type: Object })
  metadata?: T;

  constructor(message?: string | WebhookErrorEnum, code?: WebhookErrorEnum, metadata?: T) {
    const messageAsCode = Boolean(message && Object.values(WebhookErrorEnum).includes(message as WebhookErrorEnum));
    const preparedCode = messageAsCode ? (message as WebhookErrorEnum) : code;
    const preparedMessage = preparedCode ? WEBHOOK_ERROR_ENUM_TITLES[preparedCode] : message;

    code = preparedCode || WebhookErrorEnum.COMMON;
    message = preparedMessage || WEBHOOK_ERROR_ENUM_TITLES[code];

    super(message);

    this.code = code;
    this.message = message;
    this.metadata = metadata;
  }
}
```

**Фильтр для ошибок модуля**

Для преобразования ошибок модуля в `Http`-ошибку создаем `WebhookExceptionsFilter`.

Создаем файл _libs/feature/webhook/src/lib/webhook.filter.ts_

```typescript
import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { WebhookError } from './webhook.errors';

@Catch()
export class WebhookExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(WebhookExceptionsFilter.name);

  override catch(exception: WebhookError | HttpException, host: ArgumentsHost) {
    if (exception instanceof WebhookError) {
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
      this.logger.error(exception, exception.stack);
      super.catch(exception, host);
    }
  }
}
```
