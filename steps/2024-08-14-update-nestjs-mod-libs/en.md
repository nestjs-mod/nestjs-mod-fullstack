## [2024-08-14-updating-NestJS-mod-libraries] An example of a simple update of NestJS-mod libraries.

When writing the last post, I found small errors and urgently fixed them.

NestJS-mod decided to describe the process of updating libraries in the form of a small unscheduled article.

### 1. Run the package version update command and install them

_Commands_

```bash
# Update all dependencies
npm run update:nestjs-mod-versions

# Install all dependencies
npm i
```

{% spoiler Console output %}

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

{% endspoiler %}

### 2. We go to the repository with an example of generation and study the commit with changes

Repository with an example of generation: https://github.com/nestjs-mod/nestjs-mod-example
The required commit: https://github.com/nestjs-mod/nestjs-mod-example/commit/1c01ef9b7e5dec1a93b239326740780a4a756dea

We do not pay attention to various changes in the documentation, we are only interested in changes in the code and package.json

_Changes in the package.json_

```diff
...
-    "docs:infrastructure": "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@project-name/source --all -t=start --parallel=1",
+    "docs:infrastructure": "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@project-name/source --all -t=serve --parallel=1 -- --watch=false --inspect=false",
...
-    "manual:prepare": "npm run generate && npm run build && npm run docs:infrastructure && npm run test",
+    "manual:prepare": "npm run generate && npm run docs:infrastructure && npm run test",
...
```

### 3. We are making similar edits in our project

_Changes in the package.json_

```diff
...
-    "docs:infrastructure": "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=start --parallel=1 --watch=false",
+    "docs:infrastructure": "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source,client* --all -t=serve --parallel=1 -- --watch=false --inspect=false",
...
-    "manual:prepare": "npm run generate && npm run build && npm run docs:infrastructure && npm run test",
+    "manual:prepare": "npm run generate && npm run docs:infrastructure && npm run test",
...
```

We see that when starting in infrastructure mode, another option is now passed, we find similar places and change them there.

_Changes in apps/server/project.json_

```diff
...
-    "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx serve server --host=0.0.0.0 --watch=false",
+    "export NESTJS_MODE=infrastructure && ./node_modules/.bin/nx serve server --host=0.0.0.0 --watch=false --inspect=false",
...
```

### 4. Since the generation example contains only basic differences between versions, other differences need to be looked at through the release descriptions.

Since the NestJS-mod project has automatic semantic versioning enabled, it is sometimes difficult to understand exactly where the changes were.

The current changes are just difficult to analyze, since I am the only developer of these packages, I am the only one who knows what happened (perhaps in the future commits for changes will have a description of how to migrate the code).

The current major emergency changes relate to the package `@nestjs-mod/pm2`, the list of changes for it: https://github.com/nestjs-mod/nestjs-mod-contrib/blob/master/libs/infrastructure/pm2/CHANGELOG.md

We are interested in the commit: https://github.com/nestjs-mod/nestjs-mod-contrib/commit/4d126b8b42fdc50b2f4222202e6151ba49568baa

_Changes in libs/infrastructure/pm2/src/lib/pm2.service.ts_

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

_Logic before changes:_

1. After running the `npm run generate` command, the file `ecosystem.config.json` is created
2. After manually editing the file `ecosystem.config.json` and re-running the command `npm run generate`, all manual changes were erased.

_Logic after changes:_

1. After running the `npm run generate` command, the file `ecosystem.config.json` is created
2. After manually editing the file `ecosystem.config.json` and running the command `npm run generate` again, all manual changes remain.

### Links

https://nestjs.com - the official website of the framework
https://nestjs-mod.com - the official website of additional utilities
https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
https://github.com/nestjs-mod/nestjs-mod-fullstack/commit/554f2fa53a62b6171a63d465a67fcdde7b333f69 - commit to current changes

#pm2 #bug #nestjsmod #fullstack
