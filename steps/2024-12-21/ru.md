## [2024-12-21]

В этой статье я добавлю новое поле `workUntilDate` с типом `timestamp(6)` в таблицу `Webhook` базы данных `Webhook`.

На стороне фронтенда (в `Angular`-приложении) для этого поля будет добавлено поле с календарём и выбором времени.

Пользователь сможет выбирать дату и время в своей временной зоне, однако бэкенд (`NestJS`-приложение) будет сохранять эти данные в базе данных в формате `UTC+0`.

Календарь, а также другие элементы интерфейса, отображающие даты, будут формироваться в соответствии с языком пользователя.

### 1. Устанавливаем все необходимые библиотеки

Установим библиотеку `@jsverse/transloco-locale`, которая необходима для форматирования дат и чисел в соответствии с выбранной локалью.

_Команды_

```bash
npm install --save @jsverse/transloco-locale @jsverse/transloco-messageformat --prefer-offline --no-audit --progress=false
```

### Создаем миграцию

_Команды_

```bash
npm run flyway:create:webhook --args=AddFieldWorkUntilDateToAuthUser
```

Обновляем файл _libs/feature/webhook/src/migrations/V202412200905\_\_AddFieldWorkUntilDateToAuthUser.sql_

```sql
DO $$
BEGIN
    ALTER TABLE "Webhook"
        ADD "workUntilDate" timestamp(6);
EXCEPTION
    WHEN duplicate_column THEN
        NULL;
END
$$;


```

### Применяем миграцию и пересоздаем Prisma-схемы и запускаем Prisma-генераторы

_Команды_

```bash
npm run docker-compose:start-prod:server
npm run db:create-and-fill
npm run prisma:pull
npm run generate
```

### Добавляем "Pip" в бэкенде для конвертации входных "дата-время"-полей в формат "UTC+0"

### Добавляем "e2e"-тест для "NestJS"-бэкенда

### Добавляем отправку нового поля в форме Webhook и сервисе по работе с бэкендом

### Добавляем отображение полей с датами на языке пользователя в различных интерфейсах
