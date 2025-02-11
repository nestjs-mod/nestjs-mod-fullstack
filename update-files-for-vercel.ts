import { config } from 'dotenv';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const parsedEnvs = config({ path: '.env' }).parsed || {};

if (parsedEnvs.SUPABASE_URL) {
  const supabaseName = parsedEnvs.SUPABASE_URL.split('//')[1].split('.')[0];
  if (parsedEnvs.POSTGRES_URL) {
    parsedEnvs.SERVER_ROOT_DATABASE_URL = parsedEnvs.POSTGRES_URL;
    parsedEnvs.SERVER_AUTH_DATABASE_URL = parsedEnvs.POSTGRES_URL;
    parsedEnvs.SERVER_APP_DATABASE_URL = parsedEnvs.POSTGRES_URL;
    parsedEnvs.SERVER_WEBHOOK_DATABASE_URL = parsedEnvs.POSTGRES_URL;
    parsedEnvs.SERVER_KEYV_URL = parsedEnvs.POSTGRES_URL.replace(
      '?schema=public',
      ''
    );
  }

  if (supabaseName) {
    parsedEnvs.CLIENT_MINIO_URL = `https://${supabaseName}.supabase.co/storage/v1/s3`;
    parsedEnvs.SERVER_MINIO_URL = `https://${supabaseName}.supabase.co/storage/v1/s3`;
    parsedEnvs.SERVER_MINIO_SERVER_HOST = `${supabaseName}.supabase.co`;
    parsedEnvs.SERVER_SUPABASE_URL = `https://${supabaseName}.supabase.co`;
  }

  if (parsedEnvs.SUPABASE_ANON_KEY) {
    parsedEnvs.SERVER_SUPABASE_KEY = parsedEnvs.SUPABASE_ANON_KEY;
  }

  if (!parsedEnvs.SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID) {
    parsedEnvs.SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID =
      '248ec37f-628d-43f0-8de2-f58da037dd0f';
  }

  parsedEnvs.CLIENT_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID =
    parsedEnvs.SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID;

  if (!parsedEnvs.SERVER_AUTH_ADMIN_EMAIL) {
    parsedEnvs.SERVER_AUTH_ADMIN_EMAIL = 'nestjs-mod-fullstack@site15.ru';
  }

  if (!parsedEnvs.SERVER_AUTH_ADMIN_PASSWORD) {
    parsedEnvs.SERVER_AUTH_ADMIN_PASSWORD = 'SbxcbII7RUvCOe9TDXnKhfRrLJW5cGDA';
  }

  if (!parsedEnvs.SERVER_AUTH_ADMIN_USERNAME) {
    parsedEnvs.SERVER_AUTH_ADMIN_USERNAME = 'admin';
  }

  if (!parsedEnvs.SERVER_MINIO_ACCESS_KEY) {
    throw new Error('SERVER_MINIO_ACCESS_KEY not set');
  }

  if (!parsedEnvs.SERVER_MINIO_SECRET_KEY) {
    throw new Error('SERVER_MINIO_SECRET_KEY not set');
  }

  writeFileSync(
    join(
      __dirname,
      'apps/client/src/environments/environment.supabase-prod.ts'
    ),
    `export const serverUrl = '';
export const webhookSuperAdminExternalUserId =
  '${parsedEnvs.SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID}';
export const authorizerURL = '';
export const minioURL =
  'https://${supabaseName}.supabase.co/storage/v1/s3';
export const supabaseURL = 'https://${supabaseName}.supabase.co';
export const supabaseKey =
  '${parsedEnvs.SUPABASE_ANON_KEY}';
`
  );
}
