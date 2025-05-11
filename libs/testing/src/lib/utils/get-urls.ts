import { get } from 'env-var';

export function getUrls() {
  return {
    serverUrl: get('E2E_SERVER_URL').required().asString(),
    authorizerUrl: get(
      'SERVER_AUTHORIZER_AUTHORIZER_AUTHORIZER_URL'
    ).asString(),
    minioUrl: get('SERVER_AUTHORIZER_MINIO_URL').required().asString(),
    supabaseUrl: get('SERVER_AUTHORIZER_SUPABASE_URL').asString(),
    supabaseKey: get('SERVER_AUTHORIZER_SUPABASE_KEY').asString(),
  };
}
