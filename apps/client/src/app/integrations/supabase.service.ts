import { Inject, Injectable, InjectionToken } from '@angular/core';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import {
  AuthError,
  AuthResponse,
  AuthTokenResponsePassword,
  SupabaseClient,
  UserResponse,
} from '@supabase/supabase-js';
import { map } from 'rxjs';

export const SUPABASE_URL = new InjectionToken<string>('SupabaseUrl');
export const SUPABASE_KEY = new InjectionToken<string>('SupabaseKey');

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

@Injectable({ providedIn: 'root' })
export class SupabaseAngularService extends SupabaseClient {
  constructor(
    @Inject(SUPABASE_URL)
    private readonly _supabaseUrl: string,
    @Inject(SUPABASE_KEY)
    private readonly _supabaseKey: string
  ) {
    super(_supabaseUrl, _supabaseKey);
  }
}
