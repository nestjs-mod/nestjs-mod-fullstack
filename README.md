<p align="center">
  <a href="https://github.com/nestjs-mod/" target="blank"><img src="https://avatars.githubusercontent.com/u/155752954?s=200&v=4" width="120" alt="NestJS-mod Logo" /></a>
</p>

  <p align="center">A collection of utilities for unifying <a href="https://nestjs.com/" target="_blank">NestJS</a> applications and modules.</p>
    <p align="center">
<a href="https://www.npmjs.com/org/nestjs-mod" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs-mod/common.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/org/nestjs-mod" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs-mod/common.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/org/nestjs-mod" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs-mod/common.svg" alt="NPM Downloads" /></a>
<a href="https://github.com/nestjs-mod/nestjs-mod/actions/workflows/release.yml" target="_blank"><img src="https://github.com/nestjs-mod/nestjs-mod/actions/workflows/release.yml/badge.svg" alt="Release to NPM" /></a>
<a href="https://t.me/nestjs_mod" target="_blank"><img src="https://img.shields.io/badge/group-telegram-blue.svg?maxAge=2592000" alt="Telegram Group"/></a>
<a href="https://discord.gg/meY7UXaG" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

## Description

NestJS is a great framework and you can do great things with it, but often when developing a large number of applications within the same organization, we end up with different application architectures, file structures, and a lot of duplicate code.

The NestJS-mod collection of utilities are designed to unify applications and modules, and also introduce new logical options for dividing responsibilities between modules (Core, Feature, Integration, System, Infrastructure).

Since all parts of the application are unified, you can create a report on the entire project infrastructure.

## Getting started

### Create new application

Commands for create empty NestJS-mod application

```bash
# Create empty nx project
npx --yes create-nx-workspace@20.3.0 --name=project-name --preset=apps --interactive=false --ci=skip

# Go to created project
cd project-name

# Install all need main dev-dependencies
npm install --save-dev @nestjs-mod/schematics@latest

# Create NestJS-mod application
./node_modules/.bin/nx g @nestjs-mod/schematics:application --linter=eslint --unitTestRunner=jest --directory=apps/app-name --name=app-name --strict=true
```

Start created application

```bash
# Prepare all files
npm run manual:prepare

# Start application in dev mode
npm run serve:dev:app-name

# Build and start application in prod mode

## Build
npm run build:prod:app-name

## Start
npm run start:prod:app-name
```

### Create new library

Commands for create empty NestJS-mod library

```bash
# Create NestJS-mod library
./node_modules/.bin/nx g @nestjs-mod/schematics:library --linter=eslint --unitTestRunner=jest --buildable --publishable --directory=libs/feature-name --simpleName=true --strict=true
```

Add created library to `apps/app-name/src/main.ts`

```ts

// Example without options
bootstrapNestApplication({
  ...
  modules: {
    feature: [FeatureName.forRoot()],
  }
});

// Example with options
bootstrapNestApplication({
  ...
  modules: {
    feature: [FeatureName.forRoot({
      configuration: { optionsName: 'options name' },
    })],
  }
});


// By default, in the example, the application looks for env by the key `APP_NAME_ENV_NAME`, but you can override it, for example:
bootstrapNestApplication({
  ...
  modules: {
    feature: [FeatureName.forRoot({
      environments: { envName: 'env name' },
    })],
  }
});
```

### Create an infrastructure report

You can generate a report for all modules and their configurations.

```bash
# Generate markdown report
npm run docs:infrastructure
```

After which the file `INFRASTRUCTURE.MD` appear in the application folder `apps/app-name`.

## Links

- https://github.com/nestjs-mod/nestjs-mod - A collection of utilities for unifying NestJS applications and modules
- https://github.com/nestjs-mod/nestjs-mod-contrib - Contrib repository for the NestJS-mod
- https://github.com/nestjs-mod/nestjs-mod-example - Example application built with [@nestjs-mod/schematics](https://github.com/nestjs-mod/nestjs-mod/tree/master/libs/schematics)
- https://github.com/nestjs-mod/nestjs-mod/blob/master/apps/example-basic/INFRASTRUCTURE.MD - A simple example of infrastructure documentation.
- https://github.com/nestjs-mod/nestjs-mod-contrib/blob/master/apps/example-prisma/INFRASTRUCTURE.MD - An extended example of infrastructure documentation with a docker-compose file and a data base.
- https://dev.to/endykaufman/collection-of-nestjs-mod-utilities-for-unifying-applications-and-modules-on-nestjs-5256 - Article about the project NestJS-mod
- https://habr.com/ru/articles/788916 - Коллекция утилит NestJS-mod для унификации приложений и модулей на NestJS

## Questions

For questions and support please use the official [Telegram group](https://t.me/nestjs_mod) or [Discord](https://discord.gg/meY7UXaG). The issue list of this repo is **exclusively** for bug reports and feature requests.

## Stay in touch

- Author - [Ilshat Khamitov](https://t.me/KaufmanEndy)

## License

MIT
