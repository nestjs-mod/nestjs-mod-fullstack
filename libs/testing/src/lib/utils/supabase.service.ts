import { marker } from '@jsverse/transloco-keys-manager/marker';
import {
  AuthError,
  AuthResponse,
  AuthTokenResponsePassword,
  SupabaseClient,
  UserResponse,
} from '@supabase/supabase-js';
import { map } from 'rxjs';

export function mapAuthResponse() {
  return map((result: AuthResponse) => {
    const message = result.error?.message;
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

export function mapAuthError() {
  return map((result: { error: AuthError | null }) => {
    if (!result.error) {
      return result.error;
    }
    const message = result.error.message;
    throw new Error(message);
  });
}

export function mapUserResponse() {
  return map((result: UserResponse) => {
    const message = result.error?.message;
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

export function mapAuthTokenResponsePassword() {
  return map((result: AuthTokenResponsePassword) => {
    const message = result.error?.message;
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

export class SupabaseService extends SupabaseClient {
  constructor(
    private readonly _supabaseUrl: string,
    private readonly _supabaseKey: string
  ) {
    super(_supabaseUrl, _supabaseKey);
  }
}
