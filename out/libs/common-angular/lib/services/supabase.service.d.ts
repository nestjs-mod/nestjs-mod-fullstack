import { InjectionToken } from '@angular/core';
import {
  AuthError,
  AuthResponse,
  AuthTokenResponsePassword,
  SupabaseClient,
  UserResponse,
} from '@supabase/supabase-js';
import * as i0 from '@angular/core';
export declare const SUPABASE_URL: InjectionToken<string>;
export declare const SUPABASE_KEY: InjectionToken<string>;
export declare function mapAuthResponse(): import('rxjs').OperatorFunction<
  AuthResponse,
  | {
      user: import('@supabase/supabase-js').AuthUser | null;
      session: import('@supabase/supabase-js').AuthSession | null;
    }
  | {
      user: null;
      session: null;
    }
>;
export declare function mapAuthError(): import('rxjs').OperatorFunction<
  {
    error: AuthError | null;
  },
  null
>;
export declare function mapUserResponse(): import('rxjs').OperatorFunction<
  UserResponse,
  | {
      user: import('@supabase/supabase-js').AuthUser;
    }
  | {
      user: null;
    }
>;
export declare function mapAuthTokenResponsePassword(): import('rxjs').OperatorFunction<
  AuthTokenResponsePassword,
  | {
      user: import('@supabase/supabase-js').AuthUser;
      session: import('@supabase/supabase-js').AuthSession;
      weakPassword?: import('@supabase/supabase-js').WeakPassword;
    }
  | {
      user: null;
      session: null;
      weakPassword?: null;
    }
>;
export declare class SupabaseService extends SupabaseClient {
  private readonly _supabaseUrl;
  private readonly _supabaseKey;
  constructor(_supabaseUrl: string, _supabaseKey: string);
  static ɵfac: i0.ɵɵFactoryDeclaration<SupabaseService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<SupabaseService>;
}
