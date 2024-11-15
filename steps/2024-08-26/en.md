## [2024-08-26] Adding the CI/CD config for deployment NestJS and Angular applications to a dedicated server using GitHub Actions.

We register secret environment variables in github.

Install the "GitHub Actions" runner on a dedicated server.

Setting up workflow for "GitHub Actions".

### 1. Adding a new environment

Go to the address https://github.com/nestjs-mod/nestjs-mod-fullstack/settings/environments/new and add the `docker-compose-full` environment.

### 2. Adding new environment variables

Go to the parameters of the previously created environment and alternately add all the variables to the `Environment secrets` section, at this stage you can already generate protected values for some variables.

```bash
SERVER_ROOT_DATABASE_URL=postgres://postgres:DN7DHoMWd2D13YNH116cFWeJgfVAFO9e@nestjs-mod-fullstack-postgre-sql:5432/postgres?schema=public
SERVER_APP_DATABASE_URL=postgres://app:9UwcpRh12srXoPlTSN53ZOUc9ev9qNYg@nestjs-mod-fullstack-postgre-sql:5432/app?schema=public
SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME=postgres
SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD=DN7DHoMWd2D13YNH116cFWeJgfVAFO9e
SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE=postgres
SERVER_DOMAIN=fullstack.nestjs-mod.com
HTTPS_PORTAL_STAGE=production
```

### 3. Installing the "GitHub Actions" runner on a dedicated server

Go to the address https://github.com/nestjs-mod/nestjs-mod-fullstack/settings/actions/runners/new?arch=x64&os=linux and there we will see commands for use on a dedicated server.

We connect to a dedicated server and run all the commands in turn.

```bash
ssh root@194.226.49.162
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.319.1.tar.gz -L https://github.com/actions/runner/releases/download/v2.319.1/actions-runner-linux-x64-2.319.1.tar.gz
echo "3f6efb7488a183e291fc2c62876e14c9ee732864173734facc85a1bfb1744464  actions-runner-linux-x64-2.319.1.tar.gz" | shasum -a 256 -c
tar xzf ./actions-runner-linux-x64-2.319.1.tar.gz
```

{% spoiler Console output %}

```bash
$ ssh root@194.226.49.162
Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-119-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Sat Aug 24 13:26:35 MSK 2024

  System load:                      0.46630859375
  Usage of /:                       73.6% of 24.05GB
  Memory usage:                     52%
  Swap usage:                       0%
  Processes:                        171
  Users logged in:                  0
  IPv4 address for br-8ea5713b0ec7: 172.18.0.1
  IPv4 address for docker0:         172.17.0.1
  IPv4 address for eth0:            194.226.49.162

 * Strictly confined Kubernetes makes edge and IoT secure. Learn how MicroK8s
   just raised the bar for easy, resilient and secure K8s cluster deployment.

   https://ubuntu.com/engage/secure-kubernetes-at-the-edge

Expanded Security Maintenance for Applications is not enabled.

50 updates can be applied immediately.
To see these additional updates run: apt list --upgradable

11 additional security updates can be applied with ESM Apps.
Learn more about enabling ESM Apps service at https://ubuntu.com/esm


Last login: Wed Aug 21 22:43:04 2024 from 94.41.238.146

root@vps1724252356:~# mkdir actions-runner && cd actions-runner
root@vps1724252356:~/actions-runner#

root@vps1724252356:~/actions-runner# curl -o actions-runner-linux-x64-2.319.1.tar.gz -L https://github.com/actions/runner/releases/download/v2.319.1/actions-runner-linux-x64-2.319.1.tar.gz
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
100  208M  100  208M    0     0  11.5M      0  0:00:18  0:00:18 --:--:-- 12.3M

root@vps1724252356:~/actions-runner# echo "3f6efb7488a183e291fc2c62876e14c9ee732864173734facc85a1bfb1744464  actions-runner-linux-x64-2.319.1.tar.gz" | shasum -a 256 -c
actions-runner-linux-x64-2.319.1.tar.gz: OK

root@vps1724252356:~/actions-runner# tar xzf ./actions-runner-linux-x64-2.319.1.tar.gz
```

{% endspoiler %}

### 4. Launching the "GitHub Actions" runner on a dedicated server

_Commands_

```bash
export RUNNER_ALLOW_RUNASROOT="0" && ./config.sh --url https://github.com/nestjs-mod/nestjs-mod-fullstack --token SOME_RANDOM_CHARS
sudo ./svc.sh install
sudo ./svc.sh start
```

{% spoiler Console output %}

```bash
root@vps1724252356:~/actions-runner# export RUNNER_ALLOW_RUNASROOT="0" && ./config.sh --url https://github.com/nestjs-mod/nestjs-mod-fullstack --token SOME_RANDOM_CHARS

--------------------------------------------------------------------------------
|        ____ _ _   _   _       _          _        _   _                      |
|       / ___(_) |_| | | |_   _| |__      / \   ___| |_(_) ___  _ __  ___      |
|      | |  _| | __| |_| | | | | '_ \    / _ \ / __| __| |/ _ \| '_ \/ __|     |
|      | |_| | | |_|  _  | |_| | |_) |  / ___ \ (__| |_| | (_) | | | \__ \     |
|       \____|_|\__|_| |_|\__,_|_.__/  /_/   \_\___|\__|_|\___/|_| |_|___/     |
|                                                                              |
|                       Self-hosted runner registration                        |
|                                                                              |
--------------------------------------------------------------------------------

# Authentication


√ Connected to GitHub

# Runner Registration

Enter the name of the runner group to add this runner to: [press Enter for Default]

Enter the name of runner: [press Enter for vps1724252356]

This runner will have the following labels: 'self-hosted', 'Linux', 'X64'
Enter any additional labels (ex. label-1,label-2): [press Enter to skip]

√ Runner successfully added
√ Runner connection is good

# Runner settings

Enter name of work folder: [press Enter for _work]

√ Settings Saved.

root@vps1724252356:~/actions-runner# ./run.sh

√ Connected to GitHub

Current runner version: '2.319.1'
2024-08-24 10:34:46Z: Listening for Jobs
^CExiting...
Runner listener exit with 0 return code, stop the service, no retry needed.
Exiting runner...
root@vps1724252356:~/actions-runner# sudo ./svc.sh install
Creating launch runner in /etc/systemd/system/actions.runner.nestjs-mod-nestjs-mod-fullstack.vps1724252356.service
Run as user: root
Run as uid: 0
gid: 0
Created symlink /etc/systemd/system/multi-user.target.wants/actions.runner.nestjs-mod-nestjs-mod-fullstack.vps1724252356.service → /etc/systemd/system/actions.runner.nestjs-mod-nestjs-mod-fullstack.vps1724252356.service.
root@vps1724252356:~/actions-runner# sudo ./svc.sh start

/etc/systemd/system/actions.runner.nestjs-mod-nestjs-mod-fullstack.vps1724252356.service
● actions.runner.nestjs-mod-nestjs-mod-fullstack.vps1724252356.service - GitHub Actions Runner (nestjs-mod-nestjs-mod-fullstack.vps1724252356)
     Loaded: loaded (/etc/systemd/system/actions.runner.nestjs-mod-nestjs-mod-fullstack.vps1724252356.service; enabled; vendor preset: enabled)
     Active: active (running) since Sat 2024-08-24 13:35:43 MSK; 33ms ago
   Main PID: 1476204 (runsvc.sh)
      Tasks: 2 (limit: 2309)
     Memory: 1.7M
        CPU: 16ms
     CGroup: /system.slice/actions.runner.nestjs-mod-nestjs-mod-fullstack.vps1724252356.service
             ├─1476204 /bin/bash /root/actions-runner/runsvc.sh
             └─1476206 ./externals/node16/bin/node ./bin/RunnerService.js

Aug 24 13:35:43 vps1724252356 systemd[1]: Started GitHub Actions Runner (nestjs-mod-nestjs-mod-fullstack.vps1724252356).
Aug 24 13:35:43 vps1724252356 runsvc.sh[1476204]: .path=/root/.nvm/versions/node/v20.16.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:…mes:/snap/bin
Hint: Some lines were ellipsized, use -l to show in full.
```

{% endspoiler %}

### 5. We connect to a dedicated server and set the "PM2" and "Docker Compose" modes and delete the Volume from the database

_Commands_

```bash
cd nestjs-mod-fullstack/
npm run docker-compose-full:prod:stop
npm run pm2-full:prod:stop
docker volume rm nestjs-mod-fullstack-postgre-sql-volume
docker volume rm server-postgre-sql-volume
```

{% spoiler Console output %}

```bash
root@vps1724252356:~# cd nestjs-mod-fullstack/
root@vps1724252356:~/nestjs-mod-fullstack# npm run docker-compose-full:prod:stop

> @nestjs-mod-fullstack/source@0.0.0 docker-compose-full:prod:stop
> export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./.docker/docker-compose-full.yml --env-file ./.docker/docker-compose-full.env --compatibility down

WARN[0000] /root/nestjs-mod-fullstack/.docker/docker-compose-full.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion
[+] Running 6/6
 ✔ Container nestjs-mod-fullstack-https-portal            Removed                                                                                                             10.8s
 ✔ Container nestjs-mod-fullstack-nginx                   Removed                                                                                                              0.4s
 ✔ Container nestjs-mod-fullstack-server                  Removed                                                                                                              0.4s
 ✔ Container nestjs-mod-fullstack-postgre-sql-migrations  Removed                                                                                                              0.1s
 ✔ Container nestjs-mod-fullstack-postgre-sql             Removed                                                                                                              0.4s
 ✔ Network docker_nestjs-mod-fullstack-network            Removed                                                                                                              0.2s
root@vps1724252356:~/nestjs-mod-fullstack# npm run pm2-full:prod:stop

> @nestjs-mod-fullstack/source@0.0.0 pm2-full:prod:stop
> npm run docker-compose:stop-prod:server && npm run pm2:stop


> @nestjs-mod-fullstack/source@0.0.0 docker-compose:stop-prod:server
> export COMPOSE_INTERACTIVE_NO_CLI=1 && docker compose -f ./apps/server/docker-compose-prod.yml --env-file ./apps/server/docker-compose-prod.env down

WARN[0000] /root/nestjs-mod-fullstack/apps/server/docker-compose-prod.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion

> @nestjs-mod-fullstack/source@0.0.0 pm2:stop
> ./node_modules/.bin/pm2 delete all

[PM2][WARN] No process found
root@vps1724252356:~/nestjs-mod-fullstack# docker volume rm nestjs-mod-fullstack-postgre-sql-volume
nestjs-mod-fullstack-postgre-sql-volume
root@vps1724252356:~/nestjs-mod-fullstack# docker volume rm server-postgre-sql-volume
server-postgre-sql-volume
```

{% endspoiler %}

### 6. Since the launch of the runner consumes resources, we need to increase the server capacity

On the site where I bought a dedicated server, it is possible to change the tariff plan for extra money, I changed it to a slightly more expensive tariff.

_Operating system_: `Ubuntu 22.04 x64`
_Access to the world_: `100 MB/sec (shared)`
_RAM_: `4GB`
_CPU_: `2 vCPUs`
_Number of IPv4 address_: `1`

### 7. Creating a workflow configuration for deployment in the "Docker Compose" mode

The created file is `.github/workflows/docker-compose.workflows.yml`

```yaml
name: 'Docker Compose'

on:
  push:
    branches: [master]

jobs:
  deploy:
    name: Deploy
    environment: docker-compose-full
    runs-on: [self-hosted]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          # We must fetch at least the immediate parents so that if this is
          # a pull request then we can checkout the head.
          fetch-depth: 2

      - name: Deploy
        env:
          SERVER_ROOT_DATABASE_URL: ${{ secrets.SERVER_ROOT_DATABASE_URL }}
          SERVER_APP_DATABASE_URL: ${{ secrets.SERVER_APP_DATABASE_URL }}
          SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME: ${{ secrets.SERVER_POSTGRE_SQL_POSTGRESQL_USERNAME }}
          SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD: ${{ secrets.SERVER_POSTGRE_SQL_POSTGRESQL_PASSWORD }}
          SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE: ${{ secrets.SERVER_POSTGRE_SQL_POSTGRESQL_DATABASE }}
          SERVER_DOMAIN: ${{ secrets.SERVER_DOMAIN }}
          HTTPS_PORTAL_STAGE: ${{ secrets.HTTPS_PORTAL_STAGE }}
          COMPOSE_INTERACTIVE_NO_CLI: 1
          NX_DAEMON: false
          DISABLE_SERVE_STATIC: true
        run: |
          docker compose -f ./.docker/docker-compose-full.yml --compatibility down || echo 'docker-compose-full not started'
          npm i
          npx playwright install
          cp -r ./example.env ./.env
          npm run generate
          npm run build -- -c production
          npm run docker:build:server:latest
          docker compose -f ./.docker/docker-compose-full.yml --compatibility up -d

      - name: E2E-tests
        env:
          BASE_URL: https://${{ secrets.SERVER_DOMAIN }}
          NX_DAEMON: false
          NODE_TLS_REJECT_UNAUTHORIZED: 0
        run: |
          npm run wait-on -- --log https://${{ secrets.SERVER_DOMAIN }}/api/health --log https://${{ secrets.SERVER_DOMAIN }}
          npm run test:e2e
```

### 8. Since the server has become a little slower, it is necessary to reconfigure the settings for running E2E tests for the frontend application and the tests themselves

Updated file `apps/client-e2e/playwright.config.ts`

```typescript
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 60 * 1000,
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

Updated file `apps/client-e2e/src/example.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/', {
    timeout: 5000, // <- updated
  });

  // Expect h1 to contain a substring.
  expect(await page.locator('h1').innerText()).toContain('Welcome');
});

test('has serverMessage', async ({ page }) => {
  await page.goto('/', {
    timeout: 5000, // <- updated
  });

  // Expect h1 to contain a substring.
  expect(await page.locator('#serverMessage').innerText()).toContain('Hello API');
});
```

### 9. Commit the updates to the repository and see the result of the work in Github

For the current project, the workflow of the runners can be seen here: https://github.com/nestjs-mod/nestjs-mod-fullstack/actions

The current runner workflow is: https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/10563577662/job/29264098375
Current time of full deployment: `10m 8s`
Current run of all E2E tests: `50s`

In the next post, I will speed up the deployment by using public GitHub runners and creating intermediate images...

### Links

- https://nestjs.com - the official website of the framework
- https://nestjs-mod.com - the official website of additional utilities
- https://fullstack.nestjs-mod.com - website from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/6dd40bb74621315c79e24f86b3856e58e159c73f..1b8f3f0a96e87f71408422518f63d424b3db7f28 - current changes

#docker #github #nestjsmod #fullstack
