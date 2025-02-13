import { get } from 'env-var';

export function getUrls() {
  return {
    serverUrl: get('SERVER_URL')
      .default('http://localhost:3000/api')
      .asString(),
    authorizerUrl: get('SERVER_AUTHORIZER_URL').asString(),
    minioUrl: get('SERVER_MINIO_URL').required().asString(),
    supabaseUrl: get('SERVER_SUPABASE_URL').asString(),
    supabaseKey: get('SERVER_SUPABASE_KEY').asString(),
  };
}
