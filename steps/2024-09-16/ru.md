## [2024-09-16] Семантическое версионирование NestJS и Angular приложений в NX-монорепозитории

Предыдущая статья: [Доступ к сайту на NestJS и Angular по доменному имени c SSL-сертификатом в Kubernetes через Ingress](https://habr.com/ru/articles/843572/)

Подключение и настройка `nx-semantic-release` плагина для NX-монорепозитория для автоматического создания релиза с последующим деплоем приложений.

### 1. Добавляем NX-плагин для семантического версионирования

Для версионирования будем использовать https://github.com/TheUnderScorer/nx-semantic-release.

В отличие от https://github.com/semantic-release/semantic-release, плагин https://github.com/TheUnderScorer/nx-semantic-release предварительно запускает построение графика зависимостей между библиотеками и приложениями, а затем запускает процесс релиза для всего связанного кода.

После создания релиза произойдет изменение версий приложений, которые мы проверяем в CI/CD-конфигурации для того чтобы запускать или исключать часть шагов при деплое.

_Команды_

```bash
npm i --save-dev @theunderscorer/nx-semantic-release
```

_Вывод консоли_

```bash
$ npm i --save-dev @theunderscorer/nx-semantic-release

removed 391 packages, changed 3 packages, and audited 2764 packages in 18s

330 packages are looking for funding
  run `npm fund` for details

52 vulnerabilities (31 moderate, 21 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
```

### 2. Добавляем конфигурацию для плагина

В данный момент публиковать в npm-регистр мы ничего не будет, поэтому опцию `npm` ставим в `false`.

Создаем файл `.nxreleaserc.json`

```json
{
  "changelog": true,
  "npm": false,
  "github": true,
  "repositoryUrl": "https://github.com/nestjs-mod/nestjs-mod-fullstack",
  "branches": ["master"]
}
```

### 3. Включаем семантическое версионирование у наших приложений

Сейчас в процессе деплоя мы используем только версию корневого `package.json` и версию `package.json` от NestJS приложения, корневую версию мы должны переключать руками когда у нас меняется список зависимостей, а вот версию приложения пусть переключает NX-плагин.

Для подключения плагина к библиотеке или приложению нужно запустить специальную команду.

_Команды_

```bash
npm run nx -- g @theunderscorer/nx-semantic-release:setup-project server
```

_Вывод консоли_

```bash
$ npm run nx -- g @theunderscorer/nx-semantic-release:setup-project server

> @nestjs-mod-fullstack/source@0.0.2 nx
> nx g @theunderscorer/nx-semantic-release:setup-project server


 NX  Generating @theunderscorer/nx-semantic-release:setup-project

✔ Would you want to create github releases? (Y/n) · true
✔ Would you want to create changelog file for this project? (Y/n) · true
✔ Would you want to create npm releases for this project? (Y/n) · false
✔ What tag format would you like to use for this project. Hint: you can use ${PROJECT_NAME} and ${VERSION} tokens here. · ${PROJECT_NAME}-v${VERSION}
UPDATE apps/server/project.json
```

### 4. Добавляем в CI/CD-конфигурацию дополнительные задачи и шаги для запуска семантического версионирования и создания релизов

Автоматический запуск создания релизов при любом коммите в мастер отключим и добавим условие наличия в комментарии к коммиту специальной метки `[release]`, это нужно чтобы мы случайно не отправили в релиз текущий код из мастере.

Добавляем задачу создания релиза в `.github/workflows/kubernetes.yml`

```yaml
name: 'Kubernetes'

on:
  push:
    branches: ['master']
env:
  REGISTRY: ghcr.io
  BASE_SERVER_IMAGE_NAME: ${{ github.repository }}-base-server
  BUILDER_IMAGE_NAME: ${{ github.repository }}-builder
  MIGRATIONS_IMAGE_NAME: ${{ github.repository }}-migrations
  SERVER_IMAGE_NAME: ${{ github.repository }}-server
  NGINX_IMAGE_NAME: ${{ github.repository }}-nginx
  E2E_TESTS_IMAGE_NAME: ${{ github.repository }}-e2e-tests
  COMPOSE_INTERACTIVE_NO_CLI: 1
  NX_DAEMON: false
  NX_PARALLEL: 1
  NX_SKIP_NX_CACHE: true
  DISABLE_SERVE_STATIC: true
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write # to be able to publish a GitHub release
      issues: write # to be able to comment on released issues
      pull-requests: write # to be able to comment on released pull requests
      id-token: write # to enable use of OIDC for npm provenance
    steps:
      - uses: actions/checkout@v4
        if: ${{ contains(github.event.head_commit.message, '[release]') }}
      - run: npm install --prefer-offline --no-audit --progress=false
        if: ${{ contains(github.event.head_commit.message, '[release]') }}
      - run: npm run nx -- run-many --target=semantic-release --all --parallel=1
        if: ${{ contains(github.event.head_commit.message, '[release]') }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
# ...
```

В всех задачах которые начинаются на `check...` добавляем зависимость от задачи `release`, так как версия может сменится в задаче `release` и все дальнейшие задачи должны получить информацию об этом.

Обновляем `.github/workflows/kubernetes.yml`

```yaml
# ...
jobs:
  # ...
  check-base-server-image:
    runs-on: ubuntu-latest
    needs: [release]
    # ...
  check-builder-image:
    runs-on: ubuntu-latest
    needs: [release]
    # ...
  check-migrations-image:
    runs-on: ubuntu-latest
    needs: [release]
    # ...
  check-server-image:
    runs-on: ubuntu-latest
    needs: [release]
    # ...
  check-nginx-image:
    runs-on: ubuntu-latest
    needs: [release]
    # ...
  check-e2e-tests-image:
    runs-on: ubuntu-latest
    needs: [release]
    # ...
```


### 5. Коммитим изменения и ждем когда CI/CD отработает успешно

Текущий результат работы CI/CD: https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/10879176772

### Заключение

Так как работа с графом зависимого кода происходит внутри плагина, то нам не нужно использовать команду `nx affected`.

В данный момент в проекте небольшое количество кода, поэтому и нет смысла использовать `affected`, но в дальнейшем по мере увеличения кодовой базы `affected` начнет внедряться для кэширования и ускорения процессов сборки и линтования кода.

### Планы

В следующем посте я добавлю git-хуки для предварительного форматирования кода при коммите, а также добавлю версионирование фронтенда, для предотвращения лишних запусков создания релизов...

### Ссылки

https://nestjs.com - официальный сайт фреймворка
https://nestjs-mod.com - официальный сайт дополнительных утилит
https://fullstack.nestjs-mod.com - сайт из поста
https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/49806d9680fd8045172597e930e69185fabe33cf..2190202deeb42cd6176123c4d574653b849ef5ed - изменения

#nx #github #nestjsmod #fullstack