import { InjectionToken, Provider } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
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
} from '@nestjs-mod-fullstack/auth-afat';
import { FullstackRestSdkAngularService } from '@nestjs-mod-fullstack/fullstack-rest-sdk-angular';
import { FilesService } from '@nestjs-mod/files-afat';
import {
  SsoRestSdkAngularService,
  SsoUserDtoInterface,
  TokensResponseInterface,
} from '@nestjs-mod/sso-rest-sdk-angular';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  catchError,
  map,
  mergeMap,
  Observable,
  of,
  tap,
  throwError,
} from 'rxjs';

export const SSO_URL = new InjectionToken<string>('SsoURL');

export class AuthIntegrationConfiguration implements AuthConfiguration {
  constructor(
    private readonly fullstackRestSdkAngularService: FullstackRestSdkAngularService,
    private readonly filesService: FilesService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    private readonly nzMessageService: NzMessageService,
    private readonly ssoRestSdkAngularService: SsoRestSdkAngularService,
  ) {
    this.tokensService
      .getStream()
      .pipe(
        tap(() =>
          ssoRestSdkAngularService.updateHeaders(
            this.getAuthorizationHeaders(),
          ),
        ),
      )
      .subscribe();
  }

  oAuthVerification({ verificationCode }: OAuthVerificationInput) {
    return throwError(() => new Error('not implemented'));
  }

  oAuthProviders() {
    return of([]);
  }

  logout(): Observable<void | null> {
    const refreshToken = this.tokensService.getRefreshToken();
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoControllerSignOut(
        refreshToken
          ? {
              refreshToken,
            }
          : {},
      )
      .pipe(
        map(() => {
          this.tokensService.setTokens({});
        }),
      );
  }

  getProfile(): Observable<AuthUser | undefined> {
    return this.ssoRestSdkAngularService
      .getSsoApi()
      .ssoControllerProfile()
      .pipe(
        map((result) => {
          return this.mapToSsoUser(result);
        }),
      );
  }

  private mapToSsoTokens(tokens: TokensResponseInterface) {
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  private mapToSsoUser(result: SsoUserDtoInterface): {
    phoneNumber: string | null;
    email: string;
    id: string;
    preferredUsername: string;
    roles: string[];
    picture: string | null;
    timezone: number | null;
  } {
    return {
      phoneNumber: result.phone,
      email: result.email,
      id: result.id,
      preferredUsername: result.username || '',
      roles: result.roles ? result.roles.split(',') : [],
      picture: result.picture,
      timezone: result.timezone,
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
          this.translocoService.translate('Error while saving image'),
        );
        return of(undefined);
      }),
      mergeMap((picture) =>
        this.fullstackRestSdkAngularService
          .getAuthApi()
          .authControllerProfile()
          .pipe(map((profile) => ({ ...profile, picture }))),
      ),
      mergeMap(({ picture }) => {
        return this.ssoRestSdkAngularService
          .getSsoApi()
          .ssoControllerUpdateProfile({
            birthdate: data.birthdate,
            firstname: data.givenName,
            gender: data.gender,
            lastname: data.familyName,
            picture,
            password: data.newPassword,
            confirmPassword: data.confirmNewPassword,
            oldPassword: data.oldPassword,
          });
      }),
      mergeMap(() =>
        this.ssoRestSdkAngularService.getSsoApi().ssoControllerProfile(),
      ),
      mergeMap((newData) => {
        if (
          oldData?.picture &&
          typeof oldData?.picture === 'string' &&
          newData.picture !== oldData.picture
        ) {
          return this.filesService
            .deleteFile(oldData.picture)
            .pipe(map(() => newData));
        }
        return of(newData);
      }),
      map(() => null),
    );
  }

  refreshToken(): Observable<AuthUserAndTokens | undefined> {
    const refreshToken = this.tokensService.getRefreshToken();
    return this.getFingerprint().pipe(
      mergeMap((fingerprint) =>
        this.ssoRestSdkAngularService
          .getSsoApi()
          .ssoControllerRefreshTokens({
            ...(refreshToken
              ? {
                  refreshToken,
                }
              : {}),
            fingerprint,
          })
          .pipe(
            map((result: TokensResponseInterface) => ({
              tokens: this.mapToSsoTokens(result),
              user: this.mapToSsoUser(result.user),
            })),
          ),
      ),
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
    return this.getFingerprint().pipe(
      mergeMap((fingerprint) =>
        this.ssoRestSdkAngularService
          .getSsoApi()
          .ssoControllerSignUp({
            email,
            fingerprint,
            password,
            username: nickname,
            confirmPassword: confirmPassword,
          })
          .pipe(
            map((result) => ({
              tokens: this.mapToSsoTokens(result),
              user: this.mapToSsoUser(result.user),
            })),
          ),
      ),
    );
  }

  login(data: AuthLoginInput): Observable<AuthUserAndTokens> {
    const { password, email } = data;
    if (!email) {
      throw new Error('email not set');
    }
    return this.getFingerprint().pipe(
      mergeMap((fingerprint) =>
        this.ssoRestSdkAngularService
          .getSsoApi()
          .ssoControllerSignIn({
            email,
            fingerprint,
            password,
          })
          .pipe(
            map((result) => ({
              tokens: this.mapToSsoTokens(result),
              user: this.mapToSsoUser(result.user),
            })),
          ),
      ),
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
    data: AuthCompleteForgotPasswordInput,
  ): Observable<AuthUserAndTokens> {
    return throwError(() => new Error('not implemented'));
  }

  forgotPassword(data: AuthForgotPasswordInput): Observable<true> {
    return throwError(() => new Error('not implemented'));
  }

  getFingerprint() {
    return of('fingerprint');
  }
}

export function provideAuthIntegrationConfiguration(): Provider {
  return {
    provide: AUTH_CONFIGURATION_TOKEN,
    useClass: AuthIntegrationConfiguration,
    deps: [
      FullstackRestSdkAngularService,
      FilesService,
      TranslocoService,
      TokensService,
      NzMessageService,
      SsoRestSdkAngularService,
    ],
  };
}
