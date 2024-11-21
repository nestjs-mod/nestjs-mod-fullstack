import { get } from 'env-var';

export function getUrls() {
  return {
    clientUrl: get('BASE_URL').required().asString(),
    serverUrl: get('SERVER_URL').required().asString(),
    authorizerUrl: get('SERVER_AUTHORIZER_URL').required().asString(),
    minioUrl: get('SERVER_MINIO_URL').required().asString(),
  };
}
