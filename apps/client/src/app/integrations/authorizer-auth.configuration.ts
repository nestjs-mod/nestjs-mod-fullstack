import { Inject, InjectionToken, Provider } from '@angular/core';
import {
  Authorizer,
  AuthToken,
  ConfigType,
  User,
} from '@authorizerdev/authorizer-js';
import { TranslocoService } from '@jsverse/transloco';
import { AuthRestService } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
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
import { mapGraphqlErrors } from '@nestjs-mod-fullstack/common-angular';
import { FilesService } from '@nestjs-mod-fullstack/files-angular';
import {
  catchError,
  from,
  map,
  mergeMap,
  Observable,
  of,
  throwError,
} from 'rxjs';

export const AUTHORIZER_URL = new InjectionToken<string>('AuthorizerURL');

export class AuthorizerAuthConfiguration implements AuthConfiguration {
  private authorizer: Authorizer;

  constructor(
    private readonly authRestService: AuthRestService,
    private readonly filesService: FilesService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    @Inject(AUTHORIZER_URL)
    private readonly authorizerURL: string
  ) {
    this.authorizer = new Authorizer({
      authorizerURL:
        // need for override from e2e-tests
        localStorage.getItem('authorizerURL') ||
        // use from environments
        authorizerURL ||
        '',
      clientID: '',
      redirectURL: window.location.origin,
    } as ConfigType);
  }

  oAuthVerification({ verificationCode }: OAuthVerificationInput) {
    return throwError(() => new Error('not implemented'));
  }

  oAuthProviders() {
    return of([]);
  }

  logout(): Observable<void | null> {
    return from(this.authorizer.logout(this.getAuthorizationHeaders())).pipe(
      mapGraphqlErrors(),
      map(() => {
        this.tokensService.setTokens({});
        return null;
      })
    );
  }

  getProfile(): Observable<AuthUser | undefined> {
    return from(
      this.authorizer.getProfile(this.getAuthorizationHeaders())
    ).pipe(
      mapGraphqlErrors(),
      map((result) => (result ? this.mapToAuthUser(result) : undefined))
    );
  }

  private mapToAuthTokens(tokens: AuthToken) {
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
      phoneNumber: result.phone_number || null,
      email: result.email,
      id: result.id,
      preferredUsername: result.preferred_username || '',
      roles: result.roles ? result.roles : [],
      picture: result.picture || null,
    };
  }

  updateProfile(data: AuthUpdateProfileInput): Observable<void | null> {
    const oldData = data;
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
          data = { ...data, ...profile };
        }
        return this.authorizer.updateProfile(
          {
            old_password: data.oldPassword,
            new_password: data.newPassword,
            confirm_new_password: data.confirmNewPassword,
            email: data.email,
            given_name: data.givenName,
            family_name: data.familyName,
            middle_name: data.middleName,
            nickname: data.nickname,
            gender: data.gender,
            birthdate: data.birthdate,
            phone_number: data.phoneNumber,
            picture: data.picture,
            app_data: data.appData,
          },
          this.getAuthorizationHeaders()
        );
      }),
      mapGraphqlErrors(),
      mergeMap(() =>
        this.authorizer.getProfile(this.getAuthorizationHeaders())
      ),
      mergeMap(({ data: newData }) => {
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
    return from(this.authorizer.browserLogin()).pipe(
      mapGraphqlErrors(),
      map((result) =>
        !result
          ? undefined
          : {
              tokens: this.mapToAuthTokens(result),
              user: result.user ? this.mapToAuthUser(result.user) : undefined,
            }
      )
    );
  }

  signup(data: AuthSignupInput): Observable<AuthUserAndTokens> {
    return from(
      this.authorizer.signup({
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
        given_name: data.givenName,
        family_name: data.familyName,
        middle_name: data.middleName,
        nickname: data.nickname,
        picture: data.picture,
        gender: data.gender,
        birthdate: data.birthdate,
        phone_number: data.phoneNumber,
        roles: data.roles,
        redirect_uri: data.redirectUri,
        app_data: data.appData,
      })
    ).pipe(
      mapGraphqlErrors(),
      map((result) => {
        if (result?.message && !result.access_token) {
          throw new Error(result?.message);
        }
        return {
          tokens: result ? this.mapToAuthTokens(result) : undefined,
          user: result?.user ? this.mapToAuthUser(result.user) : undefined,
        };
      })
    );
  }

  login(data: AuthLoginInput): Observable<AuthUserAndTokens> {
    return from(this.authorizer.login(data)).pipe(
      mapGraphqlErrors(),
      map((result) => {
        if (result?.message && !result.access_token) {
          throw new Error(result?.message);
        }
        return {
          tokens: result ? this.mapToAuthTokens(result) : undefined,
          user: result?.user ? this.mapToAuthUser(result.user) : undefined,
        };
      })
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

export function provideAuthorizerAuthConfiguration(): Provider {
  return {
    provide: AUTH_CONFIGURATION_TOKEN,
    useClass: AuthorizerAuthConfiguration,
    deps: [
      AuthRestService,
      FilesService,
      TranslocoService,
      TokensService,
      AUTHORIZER_URL,
    ],
  };
}
