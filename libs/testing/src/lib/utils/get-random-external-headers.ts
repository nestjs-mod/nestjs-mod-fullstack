import { randomUUID } from 'crypto';

export function getRandomExternalHeaders() {
  return {
    ['x-external-user-id']: randomUUID(),
    ['x-external-tenant-id']: randomUUID(),
  };
}
