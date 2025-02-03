import { Inject, InjectionToken, Provider } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { AuthRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import {
  AUTH_CONFIGURATION_TOKEN,
  AuthConfiguration,
  AuthLoginInput,
  AuthSignupInput,
  AuthUpdateProfileInput,
  AuthUser,
  AuthUserAndTokens,
  TokensService,
} from '@nestjs-mod-fullstack/auth-angular';
import { FilesService } from '@nestjs-mod-fullstack/files-angular';
import {
  AuthError,
  AuthResponse,
  AuthTokenResponsePassword,
  SupabaseClient,
  UserResponse,
} from '@supabase/supabase-js';
import {
  catchError,
  from,
  map,
  mergeMap,
  Observable,
  of,
  throwError,
} from 'rxjs';

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

export class AuthSupabaseConfiguration implements AuthConfiguration {
  private supabaseClient: SupabaseClient;

  constructor(
    @Inject(SUPABASE_URL)
    private readonly supabaseUrl: string,
    @Inject(SUPABASE_KEY)
    private readonly supabaseKey: string,
    private readonly authRestService: AuthRestService,
    private readonly filesService: FilesService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService
  ) {
    this.supabaseClient = new SupabaseClient(supabaseUrl, supabaseKey);
  }

  logout(): Observable<void | null> {
    return from(this.supabaseClient.auth.signOut({ scope: 'local' })).pipe(
      mapAuthError(),
      map(() => null)
    );
  }

  getProfile(): Observable<AuthUser | undefined> {
    return from(this.supabaseClient.auth.getUser()).pipe(
      mapUserResponse(),
      map((result) => {
        if (!result.user) {
          throw new Error('result.user not set');
        }
        if (!result.user.email) {
          throw new Error('result.user.email not set');
        }
        return {
          email: result.user.email,
          id: result.user.id,
          preferred_username: 'empty',
          roles: ['user'],
          picture: result.user?.user_metadata['picture'],
        };
      })
    );
  }

  updateProfile(data: AuthUpdateProfileInput): Observable<void | null> {
    let oldData = data;
    return (
      data.picture
        ? this.filesService.getPresignedUrlAndUploadFile(data.picture)
        : of('')
    ).pipe(
      mergeMap((picture) =>
        this.authRestService
          .authControllerProfile()
          .pipe(map((profile) => ({ ...profile, picture })))
      ),
      catchError(() => of(null)),
      mergeMap((profile) => {
        if (data && profile) {
          Object.assign(data, profile);
        }
        oldData = data;
        return from(
          this.supabaseClient.auth.updateUser({
            data: { ...data.app_data, picture: data.picture },
            email: data.email,
            password: data.new_password,
            phone: data.phone_number,
          })
        ).pipe(
          mapUserResponse(),
          map((result) => ({
            email: result.user?.email || '',
            id: result.user?.id || '',
            preferred_username: 'empty',
            roles: ['user'],
            picture: result.user?.user_metadata['picture'],
          }))
        );
      }),
      mergeMap((newData) => {
        if (
          oldData?.picture &&
          (newData as AuthUpdateProfileInput)?.picture !== oldData.picture
        ) {
          return this.filesService
            .deleteFile(oldData.picture)
            .pipe(map(() => newData));
        }
        return of(newData);
      }),
      map(() => null)
    );
  }

  refreshToken(): Observable<AuthUserAndTokens> {
    const refreshToken = this.tokensService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('refreshToken not set'));
    }
    return from(
      this.supabaseClient.auth.refreshSession({
        refresh_token: refreshToken,
      })
    ).pipe(
      mapAuthResponse(),
      map((result) => {
        if (!result.session) {
          throw new Error('result.session not set');
        }
        if (!result.user) {
          throw new Error('result.user not set');
        }
        if (!result.user.email) {
          throw new Error('result.user.email not set');
        }
        return {
          tokens: {
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          },
          user: {
            email: result.user.email,
            id: result.user.id,
            preferred_username: 'empty',
            roles: ['user'],
            picture: result.user.user_metadata['picture'],
          },
        };
      })
    );
  }

  signup(data: AuthSignupInput): Observable<AuthUserAndTokens> {
    if (!data.email) {
      return throwError(() => new Error('data.email not set'));
    }
    return from(
      this.supabaseClient.auth.signUp({
        email: data.email.toLowerCase(),
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })
    ).pipe(
      mapAuthResponse(),
      map((result) => {
        if (!result.session) {
          throw new Error('result.session not set');
        }
        if (!result.user) {
          throw new Error('result.user not set');
        }
        if (!result.user.email) {
          throw new Error('result.user.email not set');
        }
        const tokens = {
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        };
        const user = {
          email: result.user.email,
          id: result.user.id,
          preferred_username: 'empty',
          roles: ['user'],
          picture: result.user.user_metadata['picture'],
        };
        return { tokens, user };
      })
    );
  }

  login(data: AuthLoginInput): Observable<AuthUserAndTokens> {
    if (!data.email) {
      return throwError(() => new Error('data.email not set'));
    }
    return from(
      this.supabaseClient.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
    ).pipe(
      mapAuthTokenResponsePassword(),
      map((result) => {
        if (!result.session) {
          throw new Error('result.session not set');
        }
        if (!result.user) {
          throw new Error('result.user not set');
        }
        if (!result.user.email) {
          throw new Error('result.user.email not set');
        }
        const tokens = {
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        };
        const user = {
          email: result.user.email,
          email_verified: true,
          id: result.user.id,
          preferred_username: 'empty',
          signup_methods: 'empty',
          created_at: +new Date(result.user.created_at),
          updated_at: result.user.updated_at
            ? +new Date(result.user.updated_at)
            : 0,
          roles: ['user'],
          picture: result.user.user_metadata['picture'],
        };
        return { tokens, user };
      })
    );
  }

  getAuthorizationHeaders(): Record<string, string> {
    const lang = this.translocoService.getActiveLang();

    if (!this.tokensService.getAccessToken()) {
      return {
        'Accept-language': lang,
      };
    }
    return {
      Authorization: `Bearer ${this.tokensService.getAccessToken()}`,
      'Accept-language': lang,
    };
  }
}

export function provideSupabaseAuthConfiguration(): Provider {
  return {
    provide: AUTH_CONFIGURATION_TOKEN,
    useClass: AuthSupabaseConfiguration,
    deps: [
      SUPABASE_URL,
      SUPABASE_KEY,
      AuthRestService,
      FilesService,
      TranslocoService,
      TokensService,
    ],
  };
}
