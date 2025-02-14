# [2024-02-14] Как я развернул фулстек-приложение на "NestJS" с "Angular" в "Supabase" и "Vercel"

**Предыдущая статья:** [Конвертация даты по временной зоне пользователя в "NestJS", а также ввод и отображение даты в "Angular"](https://habr.com/ru/articles/870854/)

Я разработал небольшое [фулстек-приложение](https://github.com/nestjs-mod/nestjs-mod-fullstack) в качестве примера `REST` + `WebSockets` бойлерплейта на `NestJS` и `Angular`. В приложении используется `PostgreSQL` для хранения данных, `Redis` для кэширования и `Minio` для работы с файлами. Изначально целевой средой для развертывания был `Kubernetes`, но для ускорения разработки и тестирования `MVP` я решил использовать бесплатные облачные сервисы: `Supabase` для инфраструктуры и `Vercel` для деплоя бэкенда и фронтенда.

## 1. Проблемы

- **Инфраструктура для разработки**: Для локальной разработки необходимо поднимать `PostgreSQL`, `Redis`, `Minio` и сервер авторизации (`Authorizer.dev`). Это занимает время и требует ресурсов.
- **Сложность деплоя в `Kubernetes`**: Настройка сборки `Docker`-образов, процесс билда и деплоя в `Kubernetes` занимает много времени, особенно если `Docker`-образы имеют большой размер.
- **Ограниченный бюджет**: Для небольших проектов или тестирования `MVP` нет бюджета на выделенные серверы или полноценную инфраструктуру `Kubernetes`.

## 2. Решение

Я решил добавить возможность деплоя приложения не только в `Kubernetes`, но и в бесплатные облачные сервисы, такие как `Supabase` (для баз данных, хранилища и авторизации) и `Vercel` (для деплоя бэкенда и фронтенда). Это позволило ускорить процесс разработки и тестирования, а также снизить затраты на инфраструктуру.

## 3. Исходное состояние

- **Бэкенд**: `NestJS` с `REST API` и `WebSockets` для рассылки событий (например, текущее серверное время).
- **Фронтенд**: `Angular` для взаимодействия с бэкендом через `REST` и `WebSockets`.
- **Инфраструктура**:
  - Локально запущенные сервисы: `Authorizer.dev` для авторизации, `PostgreSQL` для базы данных, `Redis` для кэширования, `Minio` для хранения файлов.
  - Деплой в `Kubernetes` с использованием `Docker`-образов для бэкенда и фронтенда.
  - `PostgreSQL` и миграции запускались через `Docker Compose`.
  - `E2E`-тесты также запускались через `Docker Compose`.

## 4. Текущее состояние

- **Бэкенд и фронтенд**: Работают локально, но инфраструктура полностью перенесена в `Supabase`
- **Используемые облачные сервисы**:
  - **`Supabase Auth`**: Заменен локальный `Authorizer.dev`.
  - **`Supabase Database`**: Заменены локальные `PostgreSQL` и `Redis`.
  - **`Supabase Storage`**: Заменен локальный `Minio`.
- **Деплой**: Бэкенд и фронтенд деплоятся на `Vercel`. Из-за `serverless`-архитектуры `Vercel` `WebSockets` не работают, поэтому соответствующие тесты отключены.
- **`CI/CD`**: Сборка и деплой происходят через `GitHub Actions`, включая применение миграций и запуск `E2E`-тестов.

## 5. Этапы реализации

### 5.1. Переход на `Supabase Database`

- Локальная `PostgreSQL` заменена на `Supabase Database`.
- Для миграций использован `pg-flyway` (мини-версия `Flyway` без `Java`). Я не хотел отказываться от функционала `Flyway`, но при этом не хотел ставить `Java` в момент деплоя приложения. В итоге я написал миниверсию `flyway` — [`pg-flyway`](https://www.npmjs.com/package/pg-flyway).
- В `Supabase` нельзя создавать несколько баз данных, поэтому миграции запускаются в одной базе с использованием разных таблиц для учета миграций. Для решения этой проблемы при запуске мигратора можно передать название таблицы, где будет сохраняться информация о миграциях.
- Один пользователь используется для всех баз данных, так как `Supabase` не позволяет создавать новых пользователей с правами на создание баз. Это ограничение потребовало пересмотра логики работы с базами данных.

### 5.2. Переход на `Supabase` вместо `Redis`

- `Redis` заменен на `Keyv` с поддержкой `PostgreSQL`. В рамках текущего проекта нет специфичных для `Redis` задач, поэтому я принял решение подменить `Redis` на некую имплементацию.
- В процессе поиска я увидел, что `CacheModule` для `NestJS` переходит на использование `Keyv`, и я написал свою обертку [`nestjs-mod/keyv`](https://nestjs-mod.com/docs/packages/core/keyv), которая поддерживает как `Redis`, так и `PostgreSQL`.
- Это не полная замена, такая замена справедлива только в простых приложениях, где мы кэшируем часть данных.

### 5.3. Переход на `Supabase Storage`

- `Minio` заменен на `Supabase Storage`.
- Основные изменения касались логики формирования ссылок для загрузки файлов. В отличие от `Minio`, в `Supabase` бакеты и политики создаются через `GUI`, что немного усложняет автоматизацию (я только такой способ смог найти).
- Из проблем в коде, была проблема в том, что `FilesModule` был жестко связан с `Minio`, пришлось связь разорвать и создать конфигурацию для переопределения методов с уровня приложения через интеграционную конфигурацию.

### 5.4. Переход на `Supabase Auth`

- Локальный `Authorizer.dev` заменен на `Supabase Auth`.
- Проблемы начались сразу, так как ранее `AuthModule` базировал свою логику полностью на логиках и коде для работы с `Authorizer`.
- Написан новый `NestJS`-модуль для работы с `Supabase Auth`, совместимый с предыдущей реализацией. Этот модуль был написан не с нуля, а путем копирования кода существующего [`nestjs-mod/authorizer`](https://nestjs-mod.com/docs/packages/core/authorizer).
- Сейчас этот новый модуль лежит в этом проекте, но в дальнейшем он будет перенесен в [`nestjs-mod/nestjs-mod-contrib`](https://github.com/nestjs-mod/nestjs-mod-contrib). Просто у меня сейчас по работе возникло слишком много проблем с готовыми серверами авторизации, и нужно написать свою кастомную реализацию. Когда она будет написана и протестирована на обратную совместимость с `Supabase` и `Authorizer`, тогда и появится реализация `Supabase` в публичном `npm`-пакете.

### 5.5. Деплой на `Vercel`

- Эта штука сожрала очень много времени, я не буду описывать все проблемы на пути, но их было очень много. Просто закину ссылку на примеры конфигураций, жалко, что я увидел их только недавно: [примеры конфигураций `Vercel`](https://github.com/vercel/vercel/tree/main/packages/node/test/fixtures), а это мой конфиг для [`vercel.json`](https://github.com/nestjs-mod/nestjs-mod-fullstack/blob/master/vercel.json).
- После того как вы настроите деплой на `Vercel` и у вас есть `e2e`-тесты, часть из них будет падать с ошибками, так как `Vercel` поднимает приложение на каждый запрос, и если приложение не оптимизировано под `serverless`, как мое текущее, то тесты будут падать из-за долго отвечающего сайта. Проблемы с долгим бэком я решил, просто увеличив таймаут ожидания в тестах.

### 5.6. Переменные окружения

- Это не такая уж и проблема, но она есть. Когда мы деплоим на собственный виртуальный сервер, то сервер — это безличная штука, которую можно снести в любой момент, и она не хранит в себе переменные окружения. Они все хранятся у нас в `CI/CD`.
- При использовании `Vercel` и `Supabase` у нас появляются еще два места, где можно хранить переменные окружения, и нужно как-то так спроектировать деплой и запуск, чтобы учесть различные варианты. Над эту задачку я тоже много времени потратил.

### 5.7. Регистрация и авторизация в облаках

- Не стану описывать регистрацию в сервисах [`Supabase`](https://supabase.com/dashboard/new) и [`Vercel`](https://vercel.com/new). Просто приложу небольшое [видео](https://github.com/nestjs-mod/nestjs-mod-fullstack/raw/refs/heads/master/steps/2025-02-12/create-supabase-project-and-link-it-to-vercel.mp4) о том, как создавать приложения на `Supabase` и прописать переменные окружения в `Vercel`.

## 6. Инструкция по запуску локального кода с внешней инфраструктурой на `Supabase`

### 6.1. Инициализация

```sh
git clone git@github.com:nestjs-mod/nestjs-mod-fullstack.git
cd nestjs-mod-fullstack
npm i
cp ./example-supabase.env ./.env
```

### 6.2. Подготовка

1. Создать организацию и проект на [Supabase](https://supabase.com/)
2. Создать `bucket` с названием "images" в хранилище (пример ссылки: https://supabase.com/dashboard/project/XXX/storage/buckets)
3. Создайте новые "S3 Access Keys" с "Access key ID" и "Secret access key" (пример ссылки: https://supabase.com/dashboard/project/gustcjgbrmmipkizqzso/settings/storage)
4. Откройте `.env` и заполните пустые значения

   ```sh
   # https://supabase.com/dashboard/project/XXX/settings/api - API Settings - Project URL - URL
   SUPABASE_URL=empty_value
   # https://supabase.com/dashboard/project/XXX/settings/database?showConnect=true - Connection String - Direct connection
   POSTGRES_URL=empty_value
   # https://supabase.com/dashboard/project/XXX/settings/api - API Settings - Project API Keys - anon public
   SUPABASE_ANON_KEY=empty_value
   # https://supabase.com/dashboard/project/gustcjgbrmmipkizqzso/settings/storage - S3 Access Keys - New access key - Access key ID
   SERVER_MINIO_ACCESS_KEY=empty_value
   # https://supabase.com/dashboard/project/gustcjgbrmmipkizqzso/settings/storage - S3 Access Keys - New access key - Secret access key
   SERVER_MINIO_SECRET_KEY=empty_value
   ```

5. Создайте и заполните все необходимые новые ключи окружения

   ```sh
   npx --yes tsx update-files-for-vercel.ts
   ```

### 6.3. Запуск

```sh
npm run pm2-supabase-full:dev:start
```

### 6.4. Откройте браузер

http://localhost:4200

### 6.5. Тестирование

```sh
npm run pm2-supabase-full:dev:test:e2e
```

### 6.6. Остановка

```sh
npm run pm2-supabase-full:dev:stop
```

## Заключение

Проектирование и разработка кода для этой статьи заняла у меня почти два месяца частичной занятости. Так что можно задуматься о необходимости поддержки нескольких окружений для запуска приложения.

Примеры кода не буду тут приводить, так как [изменений](https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/ac8ce1e94a24f912f73c5eb1950458ebc77c12d4..2c4ae81cd32a7b186e4b63c567a30ad7e0c2a239) было очень много.

Поддержка обратной совместимости решается с помощью подмены необходимой имплементацией конфигурации и разными имплементациями сервисов, как в [бэкенде](https://github.com/nestjs-mod/nestjs-mod-fullstack/tree/master/apps/server/src/app/integrations) так и на [фронтенде](https://github.com/nestjs-mod/nestjs-mod-fullstack/tree/master/apps/client/src/app/integrations).

Бесплатная версия облачной инфраструктуры от `Supabase` ограничена по мощностям и долго отвечает, деплой в такое окружение можно использовать только во время разработки `MVP` версии.

Так как задеплоенный в `Vercel` вариант работает как `serverless`, то у нас нет возможности использовать некие внутренние `EventEmitter`-ы или `RxJS Subject`-ы которые мы могли емитить с помощью фоновых глобальных `setInterval` в коде, такие логики нужно решать иначе, используя `Supabase Cron`, `Supabase Queues`, `Supabase realtime`.

Внедрение поддержки нескольких вариантов деплоя и запуска приложения — это очень трудозатратная штука и лучше всегда выбирать только один путь деплоя приложения.

## Планы

Так как мне по работе нужно будет написать кастомный сервис авторизации, который можно будет расширять по мере необходимости, то в следующем посте я и опишу создание базовой простой версии...

## Ссылки

- https://nestjs.com - официальный сайт фреймворка
- https://nestjs-mod.com - официальный сайт дополнительных утилит
- https://fullstack.nestjs-mod.com - сайт из поста
- https://nestjs-mod-fullstack.vercel.app - сайт из поста на Vercel
- https://github.com/nestjs-mod/nestjs-mod-fullstack - проект из поста
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/ac8ce1e94a24f912f73c5eb1950458ebc77c12d4..2c4ae81cd32a7b186e4b63c567a30ad7e0c2a239 - изменения
- https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/13308995633/artifacts/2585972924 - видео с E2E-тестов фронтенда

#angular #nestjsmod #supabase #vercel
