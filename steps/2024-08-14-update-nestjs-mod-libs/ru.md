## [2024-08-14-обновление-NestJS-mod-библиотек] Пример простого обновления NestJS-mod библиотек.

При написании последнего поста я обнаружил небольшие ошибки и экстренно их устранил.

Процесс обновления библиотек NestJS-mod решил описать в виде небольшой внеплановой статьи.

### 1. Запускаем команду по обновлению версий пакетов и устанавливаем их

_Команды_

```bash
# Update all dependencies
npm run update:nestjs-mod-versions

# Install all dependencies
npm i
```

<spoiler title="Вывод консоли">

```bash
$ npm run update:nestjs-mod-versions

> @nestjs-mod-fullstack/source@0.0.0 update:nestjs-mod-versions
> npx -y npm-check-updates @nestjs-mod/* nestjs-mod -u

Upgrading /home/endy/Projects/nestjs-mod/nestjs-mod-fullstack/package.json
[====================] 10/10 100%

 @nestjs-mod/common           2.14.0  →   2.14.2
 @nestjs-mod/docker-compose  ^1.15.0  →  ^1.15.2
 @nestjs-mod/flyway           ^1.6.0  →   ^1.6.2
 @nestjs-mod/pino             1.14.0  →   1.14.2
 @nestjs-mod/pm2              1.12.0  →   1.12.2
 @nestjs-mod/prisma           ^1.9.0  →   ^1.9.2
 @nestjs-mod/reports          2.14.0  →   2.14.2
 @nestjs-mod/schematics       ^2.9.2  →   ^2.9.5
 @nestjs-mod/terminus         1.13.0  →   1.13.2
 @nestjs-mod/testing          2.14.0  →   2.14.2

Run npm install to install new versions.

npm i

changed 10 packages, and audited 2768 packages in 12s

331 packages are looking for funding
  run `npm fund` for details

18 vulnerabilities (6 moderate, 12 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

</spoiler>

### 2. Идем в репозиторий с примером генерации и изучаем коммит с изменениями

Репозиторий с примером генерации: https://github.com/nestjs-mod/nestjs-mod-example
Нужный коммит: https://github.com/nestjs-mod/nestjs-mod-example/commit/1c01ef9b7e5dec1a93b239326740780a4a756dea

Не обращаем внимание на различные изменения в документации, нас интересуют только изменения в коде и package.json

_Изменения в package.json_

```diff
...
-    "docs:infrastructure": "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@project-name/source --all -t=start --parallel=1",
+    "docs:infrastructure": "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@project-name/source --all -t=serve --parallel=1 -- --watch=false --inspect=false",
...
-    "manual:prepare": "npm run generate && npm run build && npm run docs:infrastructure && npm run test",
+    "manual:prepare": "npm run generate && npm run docs:infrastructure && npm run test",
...
```

### 3. Вносим аналогичные правки в нашем проекте

_Изменения в package.json_

```diff
...
-    "docs:infrastructure": "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=start --parallel=1 --watch=false",
+    "docs:infrastructure": "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source,client* --all -t=serve --parallel=1 -- --watch=false --inspect=false",
...
-    "manual:prepare": "npm run generate && npm run build && npm run docs:infrastructure && npm run test",
+    "manual:prepare": "npm run generate && npm run docs:infrastructure && npm run test",
...
```

Мы видим что при запуске в режиме инфраструктуры теперь передается еще одна опция, находим похожие места и меняем там.

_Изменения в apps/server/project.json_

```diff
...
-    "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx serve server --host=0.0.0.0 --watch=false",
...
-    "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx serve server --host=0.0.0.0 --watch=false --inspect=false",
...
```

### 4. Так как пример генерации содержит только базовые различия между версиями, другие различия нужно уже смотреть через описания релизов

Так как в проекте NestJS-mod подключено автоматическое семантическое версионирование, иногда сложно понять где именно были изменения.

Текущие изменения как раз сложно анализируемые, так как я единственный разработчик этих пакетов, только я один знаю что произошло (возможно в будущем коммиты по изменениям будут иметь описание о том как мигрировать код).

Текущие основные экстренные изменения касаются пакета `@nestjs-mod/pm2`, список изменний по нему: https://github.com/nestjs-mod/nestjs-mod-contrib/blob/master/libs/infrastructure/pm2/CHANGELOG.md

Нас интересует коммит: https://github.com/nestjs-mod/nestjs-mod-contrib/commit/4d126b8b42fdc50b2f4222202e6151ba49568baa

_Изменения в libs/infrastructure/pm2/src/lib/pm2.service.ts_

```diff
...
    currentConfig.apps = currentConfig.apps.map((app) => {
      if (app.name === appName) {
-        return currentApp;
+        return { ...currentApp, ...app };
      }
      return app;
    }) as StartOptions[];
...
```

_Логика до изменений:_

1. После запуска команды `npm run generate` происходит создание файла `ecosystem.config.json`
2. После ручной правки файла `ecosystem.config.json` и повтороного запуска команды `npm run generate` все ручные изменения перетирались.

_Логика после изменений:_

1. После запуска команды `npm run generate` происходит создание файла `ecosystem.config.json`
2. После ручной правки файла `ecosystem.config.json` и повтороного запуска команды `npm run generate` все ручные изменения остаются.

### Ссылки

https://nestjs.com - официальный сайт фреймворка
https://nestjs-mod.com - официальный сайт дополнительных утилит
https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
https://github.com/nestjs-mod/nestjs-mod-fullstack/commit/554f2fa53a62b6171a63d465a67fcdde7b333f69 - коммит на текущие изменения

#pm2 #bug #nestjsmod #fullstack
