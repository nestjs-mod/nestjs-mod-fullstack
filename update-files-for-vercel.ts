import { config } from 'dotenv';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const envFile = join(__dirname, '.env');
const processEnv = {};
const parsedEnvs = config({ path: envFile, processEnv }).parsed || {};
const supabaseUrl = parsedEnvs.SUPABASE_URL;
const postgresUrl = parsedEnvs.POSTGRES_URL;
const supabaseAnonKey = parsedEnvs.SUPABASE_ANON_KEY;
const supabaseName = supabaseUrl?.split('//')[1].split('.')[0];

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL not set');
}

if (!postgresUrl) {
  throw new Error('POSTGRES_URL not set');
}

if (!supabaseName) {
  throw new Error('supabaseName not set');
}

if (!supabaseAnonKey) {
  throw new Error('SUPABASE_ANON_KEY not set');
}

if (!parsedEnvs.SERVER_MINIO_ACCESS_KEY) {
  throw new Error('SERVER_MINIO_ACCESS_KEY not set');
}

if (!parsedEnvs.SERVER_MINIO_SECRET_KEY) {
  throw new Error('SERVER_MINIO_SECRET_KEY not set');
}

parsedEnvs.SERVER_ROOT_DATABASE_URL = postgresUrl;
parsedEnvs.SERVER_AUTH_DATABASE_URL = postgresUrl;
parsedEnvs.SERVER_APP_DATABASE_URL = postgresUrl;
parsedEnvs.SERVER_WEBHOOK_DATABASE_URL = postgresUrl;
parsedEnvs.SERVER_KEYV_URL = postgresUrl.replace('?schema=public', '');

parsedEnvs.CLIENT_MINIO_URL = `https://${supabaseName}.supabase.co/storage/v1/s3`;
parsedEnvs.SERVER_MINIO_URL = `https://${supabaseName}.supabase.co/storage/v1/s3`;
parsedEnvs.SERVER_MINIO_SERVER_HOST = `${supabaseName}.supabase.co`;
parsedEnvs.SERVER_SUPABASE_URL = `https://${supabaseName}.supabase.co`;

parsedEnvs.SERVER_SUPABASE_KEY = supabaseAnonKey;
parsedEnvs.DISABLE_SERVE_STATIC = 'true';
parsedEnvs.SERVER_PORT = '3000';

// check real process envs
parsedEnvs.SERVER_AUTH_ADMIN_EMAIL =
  process.env.SERVER_AUTH_ADMIN_EMAIL || 'nestjs-mod-fullstack@site15.ru';
parsedEnvs.SERVER_AUTH_ADMIN_PASSWORD =
  process.env.SERVER_AUTH_ADMIN_PASSWORD || 'SbxcbII7RUvCOe9TDXnKhfRrLJW5cGDA';
parsedEnvs.SERVER_AUTH_ADMIN_USERNAME =
  process.env.SERVER_AUTH_ADMIN_USERNAME || 'admin';
parsedEnvs.SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
parsedEnvs.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:4200';

writeFileSync(
  join(__dirname, 'apps/client/src/environments/environment.supabase-prod.ts'),
  `export const serverUrl = '';
export const authorizerURL = '';
export const minioURL =
  'https://${supabaseName}.supabase.co/storage/v1/s3';
export const supabaseURL = 'https://${supabaseName}.supabase.co';
export const supabaseKey =
  '${supabaseAnonKey}';
`
);
writeFileSync(
  join(__dirname, 'apps/client/src/environments/environment.supabase.ts'),
  `export const serverUrl = 'http://localhost:3000';
export const authorizerURL = '';
export const minioURL =
  'https://${supabaseName}.supabase.co/storage/v1/s3';
export const supabaseURL = 'https://${supabaseName}.supabase.co';
export const supabaseKey =
  '${supabaseAnonKey}';
`
);

const envContent = Object.entries(parsedEnvs)
  .filter(([key]) => !key.startsWith('TURBO') && !key.startsWith('VERCEL'))
  .map(([key, value]) => {
    if (key.trim().startsWith('#')) {
      return `${key}${value ? value : ''}`;
    }
    if (value !== undefined && value !== null && !isNaN(+value)) {
      return `${key}=${value}`;
    }
    if (
      value &&
      (value.includes('*') ||
        value.includes('!') ||
        value.includes('$') ||
        value.includes(' '))
    ) {
      if (value.includes("'")) {
        return `${key}='${value.split("'").join("\\'")}'`;
      }
      return `${key}='${value}'`;
    }
    return `${key}=${value}`;
  })
  .join('\n');

writeFileSync(envFile, envContent);
