## [2024-10-11] Создание фронтенд части конфигурируемого Webhook-модуля для NestJS-приложении

Предыдущая статья: [Создание конфигурируемого Webhook-модуля для NestJS-приложении](https://habr.com/ru/articles/848634/)

### 1. Создаем Angular библиотеку

This library will be used to work with the backend.

_Commands_

```bash
# Create Angular library
./node_modules/.bin/nx g @nx/angular:library webhook-angular --buildable --publishable --directory=libs/feature/webhook-angular --simpleName=true --projectNameAndRootFormat=as-provided --strict=true --prefix= --standalone=true --selector= --changeDetection=OnPush --importPath=@nestjs-mod-fullstack/webhook-angular

# Change file with test options
rm -rf libs/feature/webhook-angular/src/test-setup.ts
cp apps/client/src/test-setup.ts libs/feature/webhook-angular/src/test-setup.ts
```

{% spoiler Console output %}

```bash
$ ./node_modules/.bin/nx g @nx/angular:library webhook-angular --buildable --publishable --directory=libs/feature/webhook-angular --simpleName=true --projectNameAndRootFormat=as-provided --strict=true --prefix= --standalone=true --selector= --changeDetection=OnPush --importPath=@nestjs-mod-fullstack/webhook-angular

 NX  Generating @nx/angular:library

CREATE libs/feature/webhook-angular/project.json
CREATE libs/feature/webhook-angular/README.md
CREATE libs/feature/webhook-angular/ng-package.json
CREATE libs/feature/webhook-angular/package.json
CREATE libs/feature/webhook-angular/tsconfig.json
CREATE libs/feature/webhook-angular/tsconfig.lib.json
CREATE libs/feature/webhook-angular/tsconfig.lib.prod.json
CREATE libs/feature/webhook-angular/src/index.ts
CREATE libs/feature/webhook-angular/jest.config.ts
CREATE libs/feature/webhook-angular/src/test-setup.ts
CREATE libs/feature/webhook-angular/tsconfig.spec.json
CREATE libs/feature/webhook-angular/src/lib/webhook-angular/webhook-angular.component.css
CREATE libs/feature/webhook-angular/src/lib/webhook-angular/webhook-angular.component.html
CREATE libs/feature/webhook-angular/src/lib/webhook-angular/webhook-angular.component.spec.ts
CREATE libs/feature/webhook-angular/src/lib/webhook-angular/webhook-angular.component.ts
CREATE libs/feature/webhook-angular/.eslintrc.json
UPDATE package.json
UPDATE tsconfig.base.json

> @nestjs-mod-fullstack/source@0.0.9 prepare
> npx -y husky install

install command is DEPRECATED

removed 2 packages, changed 5 packages, and audited 2726 packages in 13s

332 packages are looking for funding
  run `npm fund` for details

33 vulnerabilities (4 low, 12 moderate, 17 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.

 NX   👀 View Details of webhook-angular

Run "nx show project webhook-angular" to view details about this project.
```

{% endspoiler %}

### 2. Создаем общую Angular библиотеку

This library will be used to work with the backend.

_Commands_

```bash
# Create Angular library
./node_modules/.bin/nx g @nx/angular:library common-angular --buildable --publishable --directory=libs/common-angular --simpleName=true --projectNameAndRootFormat=as-provided --strict=true --prefix= --standalone=true --selector= --changeDetection=OnPush --importPath=@nestjs-mod-fullstack/common-angular

# Change file with test options
rm -rf libs/common-angular/src/test-setup.ts
cp apps/client/src/test-setup.ts libs/common-angular/src/test-setup.ts
```

{% spoiler Console output %}

```bash
$ ./node_modules/.bin/nx g @nx/angular:library common-angular --buildable --publishable --directory=libs/common-angular --simpleName=true --projectNameAndRootFormat=as-provided --strict=true --prefix= --standalone=true --selector= --changeDetection=OnPush --importPath=@nestjs-mod-fullstack/common-angular

 NX  Generating @nx/angular:library

CREATE libs/common-angular/project.json
CREATE libs/common-angular/README.md
CREATE libs/common-angular/ng-package.json
CREATE libs/common-angular/package.json
CREATE libs/common-angular/tsconfig.json
CREATE libs/common-angular/tsconfig.lib.json
CREATE libs/common-angular/tsconfig.lib.prod.json
CREATE libs/common-angular/src/index.ts
CREATE libs/common-angular/jest.config.ts
CREATE libs/common-angular/src/test-setup.ts
CREATE libs/common-angular/tsconfig.spec.json
CREATE libs/common-angular/src/lib/common-angular/common-angular.component.css
CREATE libs/common-angular/src/lib/common-angular/common-angular.component.html
CREATE libs/common-angular/src/lib/common-angular/common-angular.component.spec.ts
CREATE libs/common-angular/src/lib/common-angular/common-angular.component.ts
CREATE libs/common-angular/.eslintrc.json
UPDATE tsconfig.base.json

 NX   👀 View Details of common-angular

Run "nx show project common-angular" to view details about this project.
```

{% endspoiler %}

### 3. Устанавливаем дополнительные библиотеки

This library will be used to work with the backend.

_Commands_

```bash
npm install --save ng-zorro-antd @ngx-formly/core @ngx-formly/ng-zorro-antd @ngneat/until-destroy lodash
```

{% spoiler Console output %}

```bash
$ npm install --save ng-zorro-antd @ngx-formly/core @ngx-formly/ng-zorro-antd @ngneat/until-destroy

added 8 packages, removed 2 packages, and audited 2794 packages in 25s

343 packages are looking for funding
  run `npm fund` for details

38 vulnerabilities (8 low, 12 moderate, 18 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

{% endspoiler %}

### 3. Удаляем ненужные файлы

```sh
rm -rf libs/feature/webhook-angular/src/lib/webhook-angular
rm -rf libs/common-angular/src/lib/common-angular
```
