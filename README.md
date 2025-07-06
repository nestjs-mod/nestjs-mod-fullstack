<p align="center">
  <a href="https://github.com/nestjs-mod/" target="blank"><img src="https://avatars.githubusercontent.com/u/155752954?s=200&v=4" width="120" alt="NestJS-mod Logo" /></a>
</p>

  <p align="center">Boilerplate for creating a fullstack application on NestJS and Angular</p>

## Demo

https://fullstack.nestjs-mod.com - live demo on Kubernetes

https://nestjs-mod-fullstack.vercel.app - live demo on Vercel

## Dev/Watch mode

Infrastructure is running using docker-compose, applications are launched in watch pm2 mode.

### Init

```sh
git clone git@github.com:nestjs-mod/nestjs-mod-fullstack.git
cd nestjs-mod-fullstack
npm i
npm run manual:prepare
```

### Start

```sh
npm run pm2-full:dev:start
```

### Open in browser

http://localhost:4200

### Testing

```sh
npm run pm2-full:dev:test:e2e
```

### Stop

```sh
npm run pm2-full:dev:stop
```

## Prod mode

Infrastructure is running using docker-compose, built applications are launched using pm2.

### Init

```sh
git clone git@github.com:nestjs-mod/nestjs-mod-fullstack.git
cd nestjs-mod-fullstack
npm i
cp ./example.env ./.env
npm run manual:prepare
```

### Start

```sh
npm run pm2-full:prod:start
```

### Open in browser

http://localhost:3000

### Testing

```sh
npm run pm2-full:prod:test:e2e
```

### Stop

```sh
npm run pm2-full:prod:stop
```

## Docker-compose prod mode

Infrastructure and applications built into Docker images are run using docker-compose.

### Init

```sh
git clone git@github.com:nestjs-mod/nestjs-mod-fullstack.git
cd nestjs-mod-fullstack
npm i
cp ./example.env ./.env
npm run manual:prepare
```

### Start

```sh
npm run docker-compose-full:prod:start
```

### Open in browser

http://localhost:8080

### Testing

```sh
npm run docker-compose-full:prod:test:e2e
```

### Stop

```sh
npm run docker-compose-full:prod:stop
```

## Supabase Dev/Watch mode

Infrastructure is running on [Supabase](https://supabase.com/), applications are launched in watch pm2 mode.

### Init

```sh
git clone git@github.com:nestjs-mod/nestjs-mod-fullstack.git
cd nestjs-mod-fullstack
npm i
cp ./example-supabase.env ./.env
```

### Prepare

1. Create organization and project on [Supabase](https://supabase.com/)
2. Create bucket "images" in storage (example link: https://supabase.com/dashboard/project/XXX/storage/buckets)
3. Create new "S3 Access Keys" with "Access key ID" and "Secret access key" (example link: https://supabase.com/dashboard/project/gustcjgbrmmipkizqzso/settings/storage)
4. Open `.env` and fill empty_value's

   ```sh

   ```

# https://supabase.com/dashboard/project/XXX/settings/api - API Settings - Project URL - URL

SUPABASE_URL=empty_value

# https://supabase.com/dashboard/project/XXX/settings/database?showConnect=true - Connection String - Direct connection

POSTGRES_URL=empty_value

# https://supabase.com/dashboard/project/XXX/settings/api - API Settings - Project API Keys - anon public

SUPABASE_ANON_KEY=empty_value

# https://supabase.com/dashboard/project/gustcjgbrmmipkizqzso/settings/storage - S3 Access Keys - New access key - Access key ID

SERVER_SUPABASE_MINIO_ACCESS_KEY=empty_value

# https://supabase.com/dashboard/project/gustcjgbrmmipkizqzso/settings/storage - S3 Access Keys - New access key - Secret access key

SERVER_SUPABASE_MINIO_SECRET_KEY=empty_value

````

5. Create and fill all need new env keys

```sh
npx --yes tsx update-files-for-vercel.ts
````

### Start

```sh
npm run pm2-supabase-full:dev:start
```

### Open in browser

http://localhost:4200

### Testing

```sh
npm run pm2-supabase-full:dev:test:e2e
```

### Stop

```sh
npm run pm2-supabase-full:dev:stop
```

## Links

- https://fullstack.nestjs-mod.com - live demo on Kubernetes
- https://nestjs-mod-fullstack.vercel.app - live demo on Vercel
- https://github.com/nestjs-mod/nestjs-mod - A collection of utilities for unifying NestJS applications and modules
- https://github.com/nestjs-mod/nestjs-mod-contrib - Contrib repository for the NestJS-mod
- https://github.com/nestjs-mod/nestjs-mod-example - Example application built with [@nestjs-mod/schematics](https://github.com/nestjs-mod/nestjs-mod/tree/master/libs/schematics)
- https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/INFRASTRUCTURE.MD - A simple example of infrastructure documentation.
- https://github.com/nestjs-mod/nestjs-mod-contrib/blob/master/apps/example-prisma/INFRASTRUCTURE.MD - An extended example of infrastructure documentation with a docker-compose file and a data base.
- https://dev.to/endykaufman/collection-of-nestjs-mod-utilities-for-unifying-applications-and-modules-on-nestjs-5256 - Article about the project NestJS-mod
- https://habr.com/ru/articles/788916 - Коллекция утилит NestJS-mod для унификации приложений и модулей на NestJS

## Questions

For questions and support please use the official [Telegram group](https://t.me/nestjs_mod). The issue list of this repo is **exclusively** for bug reports and feature requests.

## Stay in touch

- Author - [Ilshat Khamitov](https://t.me/KaufmanEndy)

## License

[MIT licensed](LICENSE).
