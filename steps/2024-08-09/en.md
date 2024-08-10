## [2024-08-09] Creating an empty Angular project and linking it to an existing server on NestJS.

The application is created through the nx schematic for Angular.

The server address is set rigidly in the code, in the following posts the address will be transferred to the environment variables.

To run E2E tests, "Playwright" is used.

### Install the necessary libraries and create an empty Angular application

_Commands_

```bash
# Install all need main dev-dependencies
npm install --save-dev @nx/angular@19.5.3

# Create Angular application
./node_modules/.bin/nx g @nx/angular:application --directory=apps/client --name=client --projectNameAndRootFormat=as-provided --style=scss --ssr=true --viewEncapsulation=None --addTailwind=true --e2eTestRunner=playwright --bundler=webpack
```

_Console output_

```bash
$ npm install --save-dev @nx/angular@19.5.3

added 222 packages, removed 278 packages, changed 3 packages, and audited 2136 packages in 39s

292 packages are looking for funding
  run `npm fund` for details

14 vulnerabilities (4 moderate, 10 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

$ ./node_modules/.bin/nx g @nx/angular:application --directory=apps/client --name=client --projectNameAndRootFormat=as-provided --style=scss --ssr=true --viewEncapsulation=None --addTailwind=true --e2eTestRunner=playwright --bundler=webpack

 NX  Generating @nx/angular:application

Fetching @nx/playwright...
UPDATE .gitignore
UPDATE .prettierignore
UPDATE package.json
UPDATE nx.json
CREATE apps/client/project.json
CREATE apps/client/src/index.html
CREATE apps/client/src/styles.scss
CREATE apps/client/tsconfig.app.json
CREATE apps/client/tsconfig.editor.json
CREATE apps/client/tsconfig.json
CREATE apps/client/public/favicon.ico
CREATE apps/client/src/app/app.component.scss
CREATE apps/client/src/app/app.component.html
CREATE apps/client/src/app/app.component.spec.ts
CREATE apps/client/src/app/app.component.ts
CREATE apps/client/src/app/app.config.ts
CREATE apps/client/src/app/app.routes.ts
CREATE apps/client/src/app/nx-welcome.component.ts
CREATE apps/client/src/main.ts
CREATE apps/client/tailwind.config.js
CREATE apps/client/.eslintrc.json
CREATE apps/client/jest.config.ts
CREATE apps/client/src/test-setup.ts
CREATE apps/client/tsconfig.spec.json
CREATE apps/client-e2e/project.json
CREATE apps/client-e2e/src/example.spec.ts
CREATE apps/client-e2e/playwright.config.ts
CREATE apps/client-e2e/tsconfig.json
CREATE apps/client-e2e/.eslintrc.json
UPDATE .vscode/extensions.json
CREATE apps/client/src/main.server.ts
CREATE apps/client/src/app/app.config.server.ts
CREATE apps/client/tsconfig.server.json
CREATE apps/client/server.ts
npm WARN deprecated abab@2.0.6: Use your platform's native atob() and btoa() methods instead
npm WARN deprecated domexception@4.0.0: Use your platform's native DOMException instead

added 364 packages, removed 57 packages, changed 10 packages, and audited 2443 packages in 24s

297 packages are looking for funding
  run `npm fund` for details

12 vulnerabilities (2 moderate, 10 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

 NX   👀 View Details of client

Run "nx show project client" to view details about this project.

```

### We are launching a trial build of all projects

_Commands_

```bash
# Build all applications and library
npm run build
```

_Console output_

```bash
$ npm run build

> @nestjs-mod-fullstack/source@0.0.0 build
> npm run generate && npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=build --skip-nx-cache=true


> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix

 NX   Successfully ran target generate for 0 projects (37ms)


> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json

apps/client/src/test-setup.ts:1:1 - error TS2578: Unused '@ts-expect-error' directive.

1 // @ts-expect-error https://thymikee.github.io/jest-preset-angular/docs/getting-started/test-environment
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Found 1 error in apps/client/src/test-setup.ts:1
```

### We get the error "Unused '@ts-expect-error' directive." and solve it

Since nx contains many different templates for different frameworks, you can often find implicit errors that are not clear how to fix, to bypass the current error, just simply interrupt the typing and delete the directive.

Updated file `apps/client/src/test-setup.ts`

```ts
(globalThis as any).ngJest = {
  testEnvironmentOptions: {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  },
};
import 'jest-preset-angular/setup-jest';
```

### Re-launching the trial build of all projects

_Commands_

```bash
# Build all applications and library
npm run build
```

_Console output_

```bash
$ npm run build

> @nestjs-mod-fullstack/source@0.0.0 build
> npm run generate && npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=build --skip-nx-cache=true


> @nestjs-mod-fullstack/source@0.0.0 generate
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=generate --skip-nx-cache=true && npm run make-ts-list && npm run lint:fix

 NX   Successfully ran target generate for 0 projects (25ms)


> @nestjs-mod-fullstack/source@0.0.0 make-ts-list
> ./node_modules/.bin/rucken make-ts-list


> @nestjs-mod-fullstack/source@0.0.0 lint:fix
> npm run tsc:lint && ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=lint --fix


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run server:lint  [existing outputs match the cache, left as is]
   ✔  nx run server-e2e:lint  [existing outputs match the cache, left as is]
   ✔  nx run client:lint (1s)

—————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target lint for 3 projects (1s)

      With additional flags:
        --fix=true

Nx read the output from the cache instead of running the command for 2 out of 3 tasks.


> @nestjs-mod-fullstack/source@0.0.0 tsc:lint
> ./node_modules/.bin/tsc --noEmit -p tsconfig.base.json


   ✔  nx run server:build:production (3s)
   ✔  nx run client:build:production (15s)

—————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target build for 2 projects (15s)

```

### Add a command to the pm2 configuration to launch the Angular application in watch mode

Updated PM2 configuration `ecosystem.config.json`

```ts
{
  "apps": [
    {
      "name": "server",
      "script": "node ./dist/apps/server/main.js",
      "node_args": "-r dotenv/config"
    },
    {
      "name": "client",
      "script": "./node_modules/.bin/nx serve client --host=0.0.0.0 --disable-host-check",
      "node_args": "-r dotenv/config"
    }
  ]
}
```

### We launch all projects in watch mode via pm2

_Commands_

```bash
nm run pm2:start
```

_Console output_

```bash
$ npm run pm2:start

> @nestjs-mod-fullstack/source@0.0.0 pm2:start
> ./node_modules/.bin/pm2 start ./ecosystem.config.json


>>>> In-memory PM2 is out-of-date, do:
>>>> $ pm2 update
In memory PM2 version: 3.1.3
Local PM2 version: 5.4.2

[PM2][WARN] Applications server, client not running, starting...
[PM2] App [server] launched (1 instances)
[PM2] App [client] launched (1 instances)
┌────┬───────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name      │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼───────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 1  │ client    │ default     │ N/A     │ fork    │ 454827   │ 0s     │ 0    │ online    │ 0%       │ 13.2mb   │ endy     │ disabled │
│ 0  │ server    │ default     │ N/A     │ fork    │ 454826   │ 0s     │ 0    │ online    │ 0%       │ 25.6mb   │ endy     │ disabled │
└────┴───────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

### Running unit tests

_Commands_

```bash
npm run test
```

_Console output_

```bash
$ npm run test

> @nestjs-mod-fullstack/source@0.0.0 test
> ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=test --skip-nx-cache=true --passWithNoTests --output-style=stream-without-prefixes



> nx run client:test --passWithNoTests


> nx run server:test --passWithNoTests



 NX   Running target test for 2 projects

      With additional flags:
        --passWithNoTests=true

   ✔  nx run server:test (3s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target test for 2 projects

      With additional flags:
        --passWithNoTests=true

   →  Executing 1/1 remaining tasks...
   ✔  nx run client:test (3s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target test for 2 projects (3s)

      With additional flags:
        --passWithNoTests=true


 NX   Nx detected a flaky task

  server:test

Flaky tasks can disrupt your CI pipeline. Automatically retry them with Nx Cloud. Learn more at https://nx.dev/ci/features/flaky-tasks
```

### ### To run e2e tests on Angular, you need to install additional libraries

_Commands_

```bash
npx playwright install
```

_Console output_

```bash
$ npx playwright install
Downloading Chromium 128.0.6613.18 (playwright build v1129) from https://playwright.azureedge.net/builds/chromium/1129/chromium-linux.zip
162.8 MiB [====================] 100% 0.0s
Chromium 128.0.6613.18 (playwright build v1129) downloaded to /home/endy/.cache/ms-playwright/chromium-1129
Downloading FFMPEG playwright build v1009 from https://playwright.azureedge.net/builds/ffmpeg/1009/ffmpeg-linux.zip
2.6 MiB [====================] 100% 0.0s
FFMPEG playwright build v1009 downloaded to /home/endy/.cache/ms-playwright/ffmpeg-1009
Downloading Firefox 128.0 (playwright build v1458) from https://playwright.azureedge.net/builds/firefox/1458/firefox-ubuntu-20.04.zip
85.6 MiB [====================] 100% 0.0s
Firefox 128.0 (playwright build v1458) downloaded to /home/endy/.cache/ms-playwright/firefox-1458
Downloading Webkit 18.0 (playwright build v2051) from https://playwright.azureedge.net/builds/webkit/2051/webkit-ubuntu-20.04.zip
134.5 MiB [====================] 100% 0.0s
Webkit 18.0 (playwright build v2051) downloaded to /home/endy/.cache/ms-playwright/webkit-2051
```

### Running e2e tests

_Commands_

```bash
./node_modules/.bin/nx runmany --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes
```

_Console output_

```bash
$ ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes


> nx run client-e2e:e2e

> playwright test

 NX   Running target e2e for 2 projects and 1 task they depend on


 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/3 remaining tasks...

   ⠇  nx run client-e2e:e2e
   ✔  nx run client-e2e:e2e (4s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
   ✔  nx run server:build:production (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————



————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/1 remaining tasks...

   ⠋  nx run server-e2e:e2e

   ✔  nx run server-e2e:e2e (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target e2e for 2 projects and 1 task they depend on (8s)
```

### Adding work with http in the Angular application

Updated config `apps/client/src/app/app.config.ts`

```ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http'; // <---

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(), // <---
  ],
};
```

### Adding receiving data from the server and saving it to a local variable

Updated root typescript file `apps/client/src/app/app.component.ts`

```ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcomeComponent } from './nx-welcome.component';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [NxWelcomeComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  title = 'client';
  serverMessage!: string;

  constructor(private readonly httpClient: HttpClient) {}

  ngOnInit() {
    this.httpClient.get<{ message: string }>('http://localhost:3000/api').subscribe((result) => (this.serverMessage = result.message));
  }
}
```

### Adding the display of receiving data from the server

Updated root html file `apps/client/src/app/app.component.html `

```html
<app-nx-welcome></app-nx-welcome> <router-outlet></router-outlet>
<div id="serverMessage">{{ serverMessage }}</div>
```

### Updating the E2E test in which we check the receipt and display of data from the server

Updated test file `apps/client-e2e/src/example.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect h1 to contain a substring.
  expect(await page.locator('h1').innerText()).toContain('Welcome');
});

test('has serverMessage', async ({ page }) => {
  await page.goto('/');

  // Expect h1 to contain a substring.
  expect(await page.locator('#serverMessage').innerText()).toContain('Hello API');
});
```

### Re-running the e2e tests

_Commands_

```bash
./node_modules/.bin/nx runmany --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes
```

_Console output_

```bash
$ ./node_modules/.bin/nx run-many --exclude=@nestjs-mod-fullstack/source --all -t=e2e --skip-nx-cache=true --output-style=stream-without-prefixes


> nx run client-e2e:e2e

> playwright test

 NX   Running target e2e for 2 projects and 1 task they depend on


 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/3 remaining tasks...

   ⠹  nx run client-e2e:e2e
   ✔  nx run client-e2e:e2e (5s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————


————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
   ✔  nx run server:build:production (3s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————



————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Running target e2e for 2 projects and 1 task they depend on

   →  Executing 1/1 remaining tasks...

   ⠦  nx run server-e2e:e2e

   ✔  nx run server-e2e:e2e (2s)

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Successfully ran target e2e for 2 projects and 1 task they depend on (10s)
```

### Stopping pm2 projects

_Commands_

```bash
nm run pm2:stop
```

_Console output_

```bash
$ npm run pm2:stop

> @nestjs-mod-fullstack/source@0.0.0 pm2:stop
> ./node_modules/.bin/pm2 delete all


>>>> In-memory PM2 is out-of-date, do:
>>>> $ pm2 update
In memory PM2 version: 3.1.3
Local PM2 version: 5.4.2

[PM2] Applying action deleteProcessId on app [all](ids: [ 0, 1 ])
[PM2] [server](0) ✓
[PM2] [client](1) ✓
┌────┬───────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name      │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
└────┴───────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

There are no pictures in the post, the application is checked through tests, but if someone needs to see the result, the server's response can be received at: http://localhost:3000/api , and the client's response to the address: http://localhost:4200/

In the next post, I will add a docker image with the Postgres database and writing and running migrations via Flyaway...

### Links

https://nestjs.com -the official website of the framework
https://nestjs-mod.com -the official website of additional utilities
https://github.com/nestjs-mod/nestjs-mod-fullstack -the project from the post

#angular #typescript #browser #nestjsmod #fullstack
