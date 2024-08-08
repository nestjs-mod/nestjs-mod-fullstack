## [2024-08-08] Создание пустого проекта с помощью NestJS-mod.

После многих лет написания различных проектов на NestJS и Angular, я решил переписать группу проектов из репозитория https://github.com/rucken и использовать текущий стиль кодирования, он не сильно поменялся, просто стало меньше однотипного кода.

Разработку основного fullstack-болерплейта для фронтенд и бэкэнд без бизнес функционала буду вести в отдельной организации "NestJS-Mod" (https://github.com/nestjs-mod).

После завершения болерплейта, дальнейшее развитие продолжится в организации "Rucken" (https://github.com/rucken).

Все шаги буду документировать и описывать в стиле как это делал для проекта "KaufmanBot" (https://dev.to/endykaufman/series/16805)

### Создаем пустой NestJS-mod проект и указываем в качестве названия нашу организацию

Создаем пустой монорепозиторий с nx-workspace, далее в нем будем создавать приложения и библиотеки, которые уже будут иметь необходимые имена.

_Команды_

```bash
# Create empty nx project
npx --yes create-nx-workspace@19.5.3 --name=nestjs-mod-fullstack --preset=apps --interactive=false --ci=skip

# Go to created project
cd nestjs-mod-fullstack
```

_Вывод консоли_

```bash
$ npx --yes create-nx-workspace@19.5.3 --name=nestjs-mod-fullstack --preset=apps --interactive=false --ci=skip
NX   Let's create a new workspace [https://nx.dev/getting-started/intro]


 NX   Creating your v19.5.3 workspace.

✔ Installing dependencies with npm
✔ Successfully created the workspace: nestjs-mod-fullstack.

 NX   Directory is already under version control. Skipping initialization of git.


——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


 NX   Nx CLI is not installed globally.

This means that you will have to use "npx nx" to execute commands in the workspace.
Run "npm i -g nx" to be able to execute command directly.


——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


 NX   First time using Nx? Check out this interactive Nx tutorial.

https://nx.dev/getting-started/tutorials/npm-workspaces-tutorial
```

### Устанавливаем необходимые библиотеки и создаем пустое NestJS-mod - приложение

_Команды_

```bash
# Install all need main dev-dependencies
npm install --save-dev @nestjs-mod/schematics@latest

# Create NestJS-mod application
./node_modules/.bin/nx g @nestjs-mod/schematics:application --directory=apps/server --name=server --projectNameAndRootFormat=as-provided --strict=true
```

_Вывод консоли_

```bash
$ npm install --save-dev @nestjs-mod/schematics@latest
npm WARN deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm WARN deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported

added 199 packages, and audited 560 packages in 12s

64 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

$ ./node_modules/.bin/nx g @nestjs-mod/schematics:application --directory=apps/server --name=server --projectNameAndRootFormat=as-provided --strict=true

 NX  Generating @nestjs-mod/schematics:application

Fetching prettier...
Fetching @nx/webpack...
UPDATE package.json
CREATE rucken.json
CREATE .nxignore
UPDATE README.md
CREATE tsconfig.base.json
CREATE .prettierrc
CREATE .prettierignore
UPDATE .vscode/extensions.json
CREATE apps/server/src/assets/.gitkeep
CREATE apps/server/src/main.ts
CREATE apps/server/tsconfig.app.json
CREATE apps/server/tsconfig.json
CREATE apps/server/webpack.config.js
UPDATE nx.json
CREATE apps/server/project.json
CREATE .eslintrc.json
CREATE .eslintignore
CREATE apps/server/.eslintrc.json
CREATE jest.preset.js
CREATE jest.config.ts
CREATE apps/server/jest.config.ts
CREATE apps/server/tsconfig.spec.json
CREATE apps/server-e2e/project.json
CREATE apps/server-e2e/jest.config.ts
CREATE apps/server-e2e/src/server/server.spec.ts
CREATE apps/server-e2e/src/support/global-setup.ts
CREATE apps/server-e2e/src/support/global-teardown.ts
CREATE apps/server-e2e/src/support/test-setup.ts
CREATE apps/server-e2e/tsconfig.json
CREATE apps/server-e2e/tsconfig.spec.json
CREATE apps/server-e2e/.eslintrc.json
CREATE apps/server/src/app/app.controller.spec.ts
CREATE apps/server/src/app/app.controller.ts
CREATE apps/server/src/app/app.module.ts
CREATE apps/server/src/app/app.service.spec.ts
CREATE apps/server/src/app/app.service.ts
CREATE .env
CREATE apps/server/package.json
npm WARN deprecated @humanwhocodes/config-array@0.11.14: Use @eslint/config-array instead
npm WARN deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm WARN deprecated @ngneat/transloco-utils@3.0.4: NOTICE: Transloco has moved to a new scope, this package will no longer receive updates. please use @jsverse/transloco-utils instead.
npm WARN deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
npm WARN deprecated glob@7.1.7: Glob versions prior to v9 are no longer supported
npm WARN deprecated @ngneat/transloco-scoped-libs@3.0.4: NOTICE: Transloco has moved to a new scope, this package will no longer receive updates. please use @jsverse/transloco-scoped-libs instead.
npm WARN deprecated q@1.5.1: You or someone you depend on is using Q, the JavaScript Promise library that gave JavaScript developers strong feelings about promises. They can almost certainly migrate to the native JavaScript promise now. Thank you literally everyone for joining me in this bet against the odds. Be excellent to each other.
npm WARN deprecated
npm WARN deprecated (For a CapTP with native promises, see @endo/eventual-send and @endo/captp)
npm WARN deprecated @ngneat/transloco-keys-manager@3.4.2: NOTICE: Transloco has moved to a new scope, this package will no longer receive updates. please use @jsverse/transloco-keys-manager instead.

added 1152 packages, removed 9 packages, changed 14 packages, and audited 1913 packages in 25s

241 packages are looking for funding
  run `npm fund` for details

11 vulnerabilities (1 moderate, 10 high)
```

### Создаем документацию по проекту и параллельно создаем дополнительный код и скрипты для запуска проекта

_Команды_

```bash
# Build all applications and library
npm run build

# Generate markdown report
npm run docs:infrastructure
```

_Вывод консоли_

```bash
$  npm run build

> @nestjs-mod-fullstack/source@0.0.0 build
> npm run generate && npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=build --skip-nx-cache=true


> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix

 NX   Successfully ran target generate for 0 projects (23ms)


> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run server-e2e:lint (1s)
   ✔  nx run server:lint (1s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 2 projects (1s)

      With additional flags:
        --fix=true


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run server:build:production (3s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for project server (3s)

$ npm run docs:infrastructure

> @nestjs-mod-fullstack/source@0.0.0 docs:infrastructure
> export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=start --parallel=1


 NX   Running target start for project server:

- server

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

> nx run server:start

> node dist/apps/server/main.js

[00:14:38.808] INFO (390376): Starting Nest application...
    context: "NestFactory"
[00:14:38.808] INFO (390376): DefaultNestApp dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): ProjectUtilsSettings dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): DefaultNestApplicationInitializerSettings dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): DefaultNestApplicationInitializerShared dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): NestjsPinoLoggerModuleSettings dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): NestjsPinoLoggerModuleShared dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): TerminusHealthCheckModuleSettings dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): DefaultNestApplicationListenerSettings dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): DefaultNestApplicationListenerShared dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): AppModuleSettings dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): AppModuleShared dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): InfrastructureMarkdownReportGeneratorSettings dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): Pm2Settings dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): Pm2Shared dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): InfrastructureMarkdownReportGeneratorSettings dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): InfrastructureMarkdownReportStorage dependencies initialized
    context: "InstanceLoader"
[00:14:38.808] INFO (390376): InfrastructureMarkdownReportStorageSettings dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): DefaultNestApplicationListenerSettings dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): DefaultNestApplicationListenerShared dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): InfrastructureMarkdownReportStorageShared dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): AppModule dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): ProjectUtils dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): DefaultNestApplicationInitializer dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): DefaultNestApplicationListener dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): InfrastructureMarkdownReportGenerator dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): DefaultNestApplicationListener dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): NestjsPinoLoggerModule dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): TerminusModule dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): TerminusModule dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): ProjectUtilsShared dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): InfrastructureMarkdownReportGeneratorShared dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): Pm2 dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): InfrastructureMarkdownReportGeneratorShared dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): InfrastructureMarkdownReportGenerator dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): LoggerModule dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): TerminusHealthCheckModuleShared dependencies initialized
    context: "InstanceLoader"
[00:14:38.809] INFO (390376): TerminusHealthCheckModule dependencies initialized
    context: "InstanceLoader"
[00:14:38.815] INFO (390376): TerminusHealthCheckController {/health}:
    context: "RoutesResolver"
[00:14:38.817] INFO (390376): Mapped {/health, GET} route
    context: "RouterExplorer"
[00:14:38.817] INFO (390376): AppController {/}:
    context: "RoutesResolver"
[00:14:38.817] INFO (390376): Mapped {/, GET} route
    context: "RouterExplorer"
[00:14:38.823] DEBUG (390376):
    0: "SERVER_PORT: Description='The port on which to run the server.', Default='3000', Original Name='port'"
    1: "SERVER_HOSTNAME: Description='Hostname on which to listen for incoming packets.', Original Name='hostname'"
    context: "All application environments"
[00:14:38.828] INFO (390376): Nest application successfully started
    context: "NestApplication"

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target start for project server
```

### Запускаем проект в watch режиме через pm2

_Команды_

```bash
npm run pm2:start
```

_Вывод консоли_

```bash
$ npm run pm2:start

> @nestjs-mod-fullstack/source@0.0.0 pm2:start
> ./node_modules/.bin/pm2 start ./ecosystem.config.json


>>>> In-memory PM2 is out-of-date, do:
>>>> $ pm2 update
In memory PM2 version: 3.1.3
Local PM2 version: 5.4.2

[PM2][WARN] Applications server not running, starting...
[PM2] App [server] launched (1 instances)
┌────┬───────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name      │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼───────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ server    │ default     │ N/A     │ fork    │ 390932   │ 0s     │ 0    │ online    │ 0%       │ 45.3mb   │ endy     │ disabled │
└────┴───────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

### Запускаем юнит-тесты

_Команды_

```bash
npm run test
```

_Вывод консоли_

```bash
$ npm run test

> @nestjs-mod-fullstack/source@0.0.0 test
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=test --skip-nx-cache=true --passWithNoTests --output-style=stream-without-prefixes



> nx run server:test --passWithNoTests

 NX   Running target test for project server

      With additional flags:
        --passWithNoTests=true

   →  Executing 1/1 remaining tasks...

   ✔  nx run server:test (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target test for project server (2s)

      With additional flags:
        --passWithNoTests=true
```

### Запускаем e2e-тесты

_Команды_

```bash
./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --passWithNoTests --output-style=stream-without-prefixes
```

_Вывод консоли_

```bash
$ ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --passWithNoTests --output-style=stream-without-prefixes


> nx run server:build:production

 NX   Running target e2e for project server-e2e and 1 task it depends on

   ✔  nx run server:build:production (3s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————




————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target e2e for project server-e2e and 1 task it depends on

      With additional flags:
        --passWithNoTests=true

   ✔  nx run server-e2e:e2e (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target e2e for project server-e2e and 1 task it depends on (4s)

      With additional flags:
        --passWithNoTests=true
```

### Останавливаем pm2 проект

_Команды_

```bash
npm run pm2:stop
```

_Вывод консоли_

```bash
$  npm run pm2:stop

> @nestjs-mod-fullstack/source@0.0.0 pm2:stop
> ./node_modules/.bin/pm2 delete all


>>>> In-memory PM2 is out-of-date, do:
>>>> $ pm2 update
In memory PM2 version: 3.1.3
Local PM2 version: 5.4.2

[PM2] Applying action deleteProcessId on app [all](ids: [ 0 ])
[PM2] [server](0) ✓
┌────┬───────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name      │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
└────┴───────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

В следующем посте я добавлю пустое фронтенд приложение на Angular и из него вызову методы бэкенд приложения...

### Ссылки

https://nestjs.com - официальный сайт фреймворка
https://nestjs-mod.com - официальный сайт дополнительных утилит
https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста

#nestjs #typescript #node #nestjsmod #fullstack