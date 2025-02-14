# [2024-02-14] How I Deployed a Full-Stack Application with "NestJS" with "Angular" on "Supabase" and "Vercel"

I developed a small [full-stack](https://github.com/nestjs-mod/nestjs-mod-fullstack) application as an example of a `REST` + `WebSockets` boilerplate using `NestJS` and `Angular`. The application uses `PostgreSQL` for data storage, `Redis` for caching, and `Minio` for file handling. Initially, the target deployment environment was `Kubernetes`, but to speed up development and MVP testing, I decided to use free cloud services: `Supabase` for infrastructure and `Vercel` for deploying the backend and frontend.

## 1. Problems

- **Development Infrastructure**: For local development, it was necessary to set up `PostgreSQL`, `Redis`, `Minio`, and an authorization server (`Authorizer.dev`). This was time-consuming and resource-intensive.
- **Complexity of Deployment in `Kubernetes`**: Configuring Docker image builds and deploying to `Kubernetes` took a lot of time, especially if the Docker images were large.
- **Limited Budget**: For small projects or MVP testing, there was no budget for dedicated servers or a full-fledged `Kubernetes` infrastructure.

## 2. Solution

I decided to add the ability to deploy the application not only to `Kubernetes` but also to free cloud services like `Supabase` (for databases, storage, and authentication) and `Vercel` (for backend and frontend deployment). This allowed me to speed up the development and testing process while reducing infrastructure costs.

## 3. Initial State

- **Backend**: `NestJS` with `REST API` and `WebSockets` for broadcasting events (e.g., current server time).
- **Frontend**: `Angular` for interacting with the backend via `REST` and `WebSockets`.
- **Infrastructure**:
  - Locally running services: `Authorizer.dev` for authentication, `PostgreSQL` for the database, `Redis` for caching, and `Minio` for file storage.
  - Deployment to `Kubernetes` using Docker images for the backend and frontend.
  - `PostgreSQL` and migrations were run via `Docker Compose`.
  - `E2E` tests were also run via `Docker Compose`.

## 4. Current State

- **Backend and Frontend**: Work locally, but the infrastructure has been fully migrated to `Supabase`.
- **Cloud Services Used**:
  - **`Supabase Auth`**: Replaced the local `Authorizer.dev`.
  - **`Supabase Database`**: Replaced the local `PostgreSQL` and `Redis`.
  - **`Supabase Storage`**: Replaced the local `Minio`.
- **Deployment**: The backend and frontend are deployed to `Vercel`. Due to `Vercel`'s serverless architecture, `WebSockets` do not work, so related tests have been disabled.
- **`CI/CD`**: Build and deployment are done via `GitHub Actions`, including applying migrations and running `E2E` tests.

## 5. Implementation Steps

### 5.1. Transition to `Supabase Database`

- Local `PostgreSQL` was replaced with `Supabase Database`.
- For migrations, `pg-flyway` (a mini-version of `Flyway` without `Java`) was used. I didn’t want to lose the functionality of `Flyway` but also didn’t want to install `Java` during deployment. As a result, I created a mini-version of `flyway` — [`pg-flyway`](https://www.npmjs.com/package/pg-flyway).
- In `Supabase`, you cannot create multiple databases, so migrations are run in a single database using different tables to track migrations. To solve this issue, the migration table name can be passed when running the migrator.
- A single user is used for all databases since `Supabase` does not allow creating new users with database creation rights. This limitation required rethinking the database logic.

### 5.2. Transition to `Supabase` Instead of `Redis`

- `Redis` was replaced with `Keyv` with `PostgreSQL` support. Since the current project did not have any `Redis`-specific tasks, I decided to replace `Redis` with an alternative implementation.
- During my research, I noticed that the `CacheModule` for `NestJS` was transitioning to using `Keyv`, so I created my own wrapper, [`nestjs-mod/keyv`](https://nestjs-mod.com/docs/packages/core/keyv), which supports both `Redis` and `PostgreSQL`.
- This is not a full replacement; it only works for simple applications where we cache some data.

### 5.3. Transition to `Supabase Storage`

- `Minio` was replaced with `Supabase Storage`.
- The main changes involved the logic for generating file upload links. Unlike `Minio`, in `Supabase`, buckets and policies are created via the `GUI`, which complicates automation (this was the only method I could find).
- One issue in the code was that the `FilesModule` was tightly coupled with `Minio`. I had to decouple it and create a configuration to override methods at the application level through integration configuration.

### 5.4. Transition to `Supabase Auth`

- The local `Authorizer.dev` was replaced with `Supabase Auth`.
- Problems arose immediately since the `AuthModule` was previously based entirely on the logic and code for working with `Authorizer`.
- A new `NestJS` module for working with `Supabase Auth` was written, compatible with the previous implementation. This module was not written from scratch but by copying code from the existing [`nestjs-mod/authorizer`](https://nestjs-mod.com/docs/packages/core/authorizer).
- Currently, this new module resides in this project, but it will eventually be moved to [`nestjs-mod/nestjs-mod-contrib`](https://github.com/nestjs-mod/nestjs-mod-contrib). I’ve had too many issues with existing authorization servers, so I need to write my own custom implementation. Once it’s written and tested for backward compatibility with `Supabase` and `Authorizer`, the `Supabase` implementation will be published as a public `npm` package.

### 5.5. Deployment to `Vercel`

- This step consumed a lot of time. I won’t describe all the issues I encountered, but there were many. Here’s a link to example configurations I found useful: [Vercel configuration examples](https://github.com/vercel/vercel/tree/main/packages/node/test/fixtures), and here’s my config for [`vercel.json`](https://github.com/nestjs-mod/nestjs-mod-fullstack/blob/master/vercel.json).
- After setting up deployment to `Vercel`, if you have `e2e` tests, some of them will fail because `Vercel` spins up the application for each request. If the application is not optimized for serverless, like mine, the tests will fail due to slow response times. I solved this by increasing the timeout in the tests.

### 5.6. Environment Variables

- This isn’t a major issue, but it exists. When deploying to your own virtual server, the server is impersonal and can be destroyed at any time, and it doesn’t store environment variables. They are all stored in `CI/CD`.
- When using `Vercel` and `Supabase`, there are two additional places where environment variables can be stored. Designing the deployment and launch to account for these variations took a lot of time.

### 5.7. Registration and Authorization in the Cloud

- I won’t describe the registration process for [`Supabase`](https://supabase.com/dashboard/new) and [`Vercel`](https://vercel.com/new). Instead, I’ll share a short [video](https://github.com/nestjs-mod/nestjs-mod-fullstack/raw/refs/heads/master/steps/2025-02-12/create-supabase-project-and-link-it-to-vercel.mp4) on how to create applications on `Supabase` and set environment variables in `Vercel`.

## 6. Instructions for Running Local Code with External Infrastructure on `Supabase`

### 6.1. Initialization

```sh
git clone git@github.com:nestjs-mod/nestjs-mod-fullstack.git
cd nestjs-mod-fullstack
npm i
cp ./example-supabase.env ./.env
```

### 6.2. Preparation

1. Create an organization and project on [Supabase](https://supabase.com/).
2. Create a bucket named "images" in the storage (example link: https://supabase.com/dashboard/project/XXX/storage/buckets).
3. Create new "S3 Access Keys" with "Access key ID" and "Secret access key" (example link: https://supabase.com/dashboard/project/gustcjgbrmmipkizqzso/settings/storage).
4. Open `.env` and fill in the empty values.

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

5. Create and fill in all necessary new environment keys.

   ```sh
   npx --yes tsx update-files-for-vercel.ts
   ```

### 6.3. Running

```sh
npm run pm2-supabase-full:dev:start
```

### 6.4. Open the Browser

http://localhost:4200

### 6.5. Testing

```sh
npm run pm2-supabase-full:dev:test:e2e
```

### 6.6. Stopping

```sh
npm run pm2-supabase-full:dev:stop
```

## Conclusion

Designing and developing the code for this article took me almost two months of part-time work. This makes you think about the necessity of supporting multiple environments for running an application.

I won’t provide code examples here because there were too many [changes](https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/ac8ce1e94a24f912f73c5eb1950458ebc77c12d4..2c4ae81cd32a7b186e4b63c567a30ad7e0c2a239).

Backward compatibility is achieved by substituting the necessary implementation of configurations and different service implementations, both in the [backend](https://github.com/nestjs-mod/nestjs-mod-fullstack/tree/master/apps/server/src/app/integrations) and the [frontend](https://github.com/nestjs-mod/nestjs-mod-fullstack/tree/master/apps/client/src/app/integrations).

The free version of the cloud infrastructure from `Supabase` is limited in resources and responds slowly. Deployment to such an environment can only be used during the development of the `MVP` version.

Since the version deployed to `Vercel` works as `serverless`, we don’t have the ability to use internal `EventEmitter`s or `RxJS Subject`s that we could emit using background global `setInterval`s in the code. Such logic needs to be solved differently, using `Supabase Cron`, `Supabase Queues`, or `Supabase Realtime`.

Implementing support for multiple deployment and launch options is very labor-intensive, and it’s always better to choose a single deployment path for your application.

## Plans

Since I need to write a custom authorization service for work that can be extended as needed, in the next post, I will describe the creation of a basic, simple version...

## Links

- https://nestjs.com - official framework website
- https://nestjs-mod.com - official website for additional utilities
- https://fullstack.nestjs-mod.com - website from the post
- https://nestjs-mod-fullstack.vercel.app - website from the post on Vercel
- https://github.com/nestjs-mod/nestjs-mod-fullstack - project from the post
- https://github.com/nestjs-mod/nestjs-mod-fullstack/compare/ac8ce1e94a24f912f73c5eb1950458ebc77c12d4..2c4ae81cd32a7b186e4b63c567a30ad7e0c2a239 - changes
- https://github.com/nestjs-mod/nestjs-mod-fullstack/actions/runs/13308995633/artifacts/2585972924 - video of frontend E2E tests

#angular #nestjsmod #supabase #vercel
