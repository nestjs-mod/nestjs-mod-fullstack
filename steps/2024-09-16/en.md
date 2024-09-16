## [2024-09-16] Semantic versioning of NestJS and Angular applications in the NX monorepository

Connecting and configuring the `nx-semantic-release` plugin for the NX monorepository to automatically create a release followed by the deployment of applications.

### 1. Adding an NX plugin for semantic versioning

For versioning, we will use https://github.com/TheUnderScorer/nx-semantic-release .

Unlike https://github.com/semantic-release/semantic-release , plugin https://github.com/TheUnderScorer/nx-semantic-release pre-starts building a dependency graph between libraries and applications, and then starts the release process for all related code.

After the release is created, the versions of the applications that we check in the CI/CD configuration will be changed in order to run or exclude some of the steps during deployment.

_Commands_

```bash
npm i --save-dev @theunderscorer/nx-semantic-release
```

_Console output_

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

### 2. Adding the configuration for the plugin

At the moment, we will not publish anything to the npm register, so we set the `npm` option to `false`.

Creating the `.nxreleaserc.json`

```json
{
  "changelog": true,
  "npm": false,
  "github": true,
  "repositoryUrl": "https://github.com/nestjs-mod/nestjs-mod-fullstack",
  "branches": ["master"]
}
```

### 3. Enabling semantic versioning for our applications

Currently, during the deployment process, we use only the version of the root `package.json` and the `package.json` from NestJS applications, we have to switch the root version with our hands when our list of dependencies changes, but let the NX plugin switch the application version.

To connect a plugin to a library or application, you need to run a special command.

_Commands_

```bash
npm run nx -- g @theunderscorer/nx-semantic-release:setup-project server
```

_Console output_

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

### 4. Adding additional tasks and steps to the CI/CD configuration to launch semantic versioning and create releases

We will disable the automatic launch of creating releases with any commit to the wizard and add the condition that there is a special label `[release]` in the comment to the commit, this is necessary so that we do not accidentally send the current code from the wizard to the release.

Adding a release creation task to `.github/workflows/kubernetes.yml`

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

In all tasks that start with `check...` we are adding a dependency on the `release` task, since the version may change in the `release` task and all further tasks should receive information about this.

Updating `.github/workflows/kubernetes.yml`

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


### 5. Commit the changes and wait for CI/CD to work successfully

The current result of CI/CD operation: https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/10879176772

### Conclusion

Since the work with the graph of the dependent code takes place inside the plugin, we do not need to use the `nx affected` command.

At the moment, there is a small amount of code in the project, so it makes no sense to use `affected`, but in the future, as the code base grows, `affected` will begin to be implemented to cache and speed up the processes of building and linting code.

### Plans

In the next post, I will add git hooks for preformatting code during commit, and also add frontend versioning to prevent unnecessary launches of release creation...

### Links

https://nestjs.com - the official website of the framework
https://nestjs-mod.com - the official website of additional utilities
https://fullstack.nestjs-mod.com - website from the post
https://github.com/nestjs-mod/nestjs-mod-fullstack - the project from the post
https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/49806d9680fd8045172597e930e69185fabe33cf..2190202deeb42cd6176123c4d574653b849ef5ed - current changes

#nx #github #nestjsmod #fullstack