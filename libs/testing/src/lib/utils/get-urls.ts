import { get } from 'env-var';

export function getUrls() {
  return {
    serverUrl: get('E2E_SERVER_URL').required().asString(),
    internalServerUrl: get('E2E_INTERNAL_SERVER_URL').asString(),
    authorizerUrl: get(
      'SERVER_AUTHORIZER_AUTHORIZER_AUTHORIZER_URL'
    ).asString(),
    minioUrl:
      get('SERVER_AUTHORIZER_MINIO_URL').asString() ||
      get('SERVER_SUPABASE_MINIO_URL').asString(),
    supabaseUrl: get('SERVER_SUPABASE_SUPABASE_URL').asString(),
    supabaseKey: get('SERVER_SUPABASE_SUPABASE_KEY').asString(),
  };
}
