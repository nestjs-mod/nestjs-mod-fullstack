import { Inject, InjectionToken, Provider } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import {
  AuthRestService,
  AuthRoleInterface,
} from '@nestjs-mod-fullstack/fullstack-angular-rest-sdk';
import {
  AUTH_CONFIGURATION_TOKEN,
  AuthCompleteForgotPasswordInput,
  AuthCompleteSignUpInput,
  AuthConfiguration,
  AuthForgotPasswordInput,
  AuthLoginInput,
  AuthSignupInput,
  AuthUpdateProfileInput,
  AuthUser,
  AuthUserAndTokens,
  OAuthVerificationInput,
  TokensService,
} from '@nestjs-mod-fullstack/auth-angular';
import { FilesService } from '@nestjs-mod/files-afat';
import { searchIn } from '@nestjs-mod/misc';
import {
  AuthError,
  AuthResponse,
  AuthTokenResponsePassword,
  Session,
  SupabaseClient,
  User,
  UserResponse,
} from '@supabase/supabase-js';
import { NzMessageService } from 'ng-zorro-antd/message';
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

export class SupabaseAuthConfiguration implements AuthConfiguration {
  private supabaseClient: SupabaseClient;

  constructor(
    @Inject(SUPABASE_URL)
    private readonly supabaseUrl: string,
    @Inject(SUPABASE_KEY)
    private readonly supabaseKey: string,
    private readonly authRestService: AuthRestService,
    private readonly filesService: FilesService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    private readonly nzMessageService: NzMessageService
  ) {
    this.supabaseClient = new SupabaseClient(supabaseUrl, supabaseKey);
  }

  oAuthVerification({ verificationCode }: OAuthVerificationInput) {
    return throwError(() => new Error('not implemented'));
  }

  oAuthProviders() {
    return of([]);
  }

  logout(): Observable<void | null> {
    return from(this.supabaseClient.auth.signOut({ scope: 'local' })).pipe(
      mapAuthError(),
      map(() => {
        this.tokensService.setTokens({});
        return null;
      })
    );
  }

  getProfile(): Observable<AuthUser | undefined> {
    return from(this.supabaseClient.auth.getUser()).pipe(
      mapUserResponse(),
      map((result) => {
        return result.user ? this.mapToAuthUser(result.user) : undefined;
      })
    );
  }

  private mapToAuthTokens(tokens: Session) {
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  private mapToAuthUser(result: User): {
    phoneNumber: string | null;
    email: string;
    id: string;
    preferredUsername: string;
    roles: string[];
    picture: string | null;
  } {
    return {
      phoneNumber: result.phone || null,
      email: result.email || '',
      id: result.id,
      preferredUsername: 'empty',
      roles: searchIn(AuthRoleInterface.Admin, result.role)
        ? [AuthRoleInterface.Admin]
        : [AuthRoleInterface.User],
      picture: result.user_metadata['picture'],
    };
  }

  updateProfile(data: AuthUpdateProfileInput): Observable<void | null> {
    const oldData = data;
    return (
      data.picture
        ? this.filesService.getPresignedUrlAndUploadFile(data.picture)
        : of('')
    ).pipe(
      catchError((err) => {
        console.error(err);
        this.nzMessageService.error(
          this.translocoService.translate('Error while saving image')
        );
        return of(undefined);
      }),
      mergeMap((picture) => {
        return from(
          this.supabaseClient.auth.updateUser({
            data: { ...data.appData, picture },
            email: data.email,
            password: data.newPassword,
            phone: data.phoneNumber,
          })
        ).pipe(
          mapUserResponse(),
          map((result) =>
            result.user ? this.mapToAuthUser(result.user) : undefined
          )
        );
      }),
      mergeMap((newData) => {
        if (
          oldData?.picture &&
          typeof oldData?.picture === 'string' &&
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

  refreshToken(): Observable<AuthUserAndTokens | undefined> {
    const refreshToken = this.tokensService.getRefreshToken();
    return from(
      this.supabaseClient.auth.refreshSession(
        refreshToken ? { refresh_token: refreshToken } : undefined
      )
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
          tokens: this.mapToAuthTokens(result.session),
          user: this.mapToAuthUser(result.user),
        };
      }),
      catchError(() => of({}))
    );
  }

  signup(data: AuthSignupInput): Observable<AuthUserAndTokens> {
    const { confirmPassword, password, email, nickname } = data;
    if (!email) {
      throw new Error('email not set');
    }
    if (!confirmPassword) {
      throw new Error('confirmPassword not set');
    }
    if (!password) {
      throw new Error('password not set');
    }
    return from(
      this.supabaseClient.auth.signUp({
        email: email.toLowerCase(),
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })
    ).pipe(
      mapAuthResponse(),
      map((result) => ({
        tokens: result.session
          ? this.mapToAuthTokens(result.session)
          : undefined,
        user: result.user ? this.mapToAuthUser(result.user) : undefined,
      }))
    );
  }

  login(data: AuthLoginInput): Observable<AuthUserAndTokens> {
    const { password, email } = data;
    if (!email) {
      throw new Error('email not set');
    }
    return from(
      this.supabaseClient.auth.signInWithPassword({
        email,
        password,
      })
    ).pipe(
      mapAuthTokenResponsePassword(),
      map((result) => ({
        tokens: result.session
          ? this.mapToAuthTokens(result.session)
          : undefined,
        user: result.user ? this.mapToAuthUser(result.user) : undefined,
      }))
    );
  }

  getAuthorizationHeaders(): Record<string, string> {
    const lang = this.translocoService.getActiveLang();
    const accessToken = this.tokensService.getAccessToken();
    if (!accessToken) {
      return {
        'Accept-language': lang,
      };
    }
    return {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'Accept-language': lang,
    };
  }

  completeSignUp(data: AuthCompleteSignUpInput): Observable<AuthUserAndTokens> {
    return throwError(() => new Error('not implemented'));
  }

  completeForgotPassword(
    data: AuthCompleteForgotPasswordInput
  ): Observable<AuthUserAndTokens> {
    return throwError(() => new Error('not implemented'));
  }

  forgotPassword(data: AuthForgotPasswordInput): Observable<true> {
    return throwError(() => new Error('not implemented'));
  }
}

export function provideSupabaseAuthConfiguration(): Provider {
  return {
    provide: AUTH_CONFIGURATION_TOKEN,
    useClass: SupabaseAuthConfiguration,
    deps: [
      SUPABASE_URL,
      SUPABASE_KEY,
      AuthRestService,
      FilesService,
      TranslocoService,
      TokensService,
      NzMessageService,
    ],
  };
}
