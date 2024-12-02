import { marker } from '@jsverse/transloco-keys-manager/marker';
import { map } from 'rxjs';

export function mapGraphqlErrors<T>() {
  return map((result: { data: T; errors: { message: string }[] }) => {
    const message = result.errors?.[0]?.message;
    if (message) {
      if (message === 'unauthorized') {
        throw new Error(marker('Unauthorized'));
      } else {
        throw new Error(message);
      }
    }
    return result.data;
  });
}
