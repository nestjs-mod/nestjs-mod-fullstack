import { Inject, InjectionToken, Provider } from '@angular/core';
import { Authorizer, ConfigType } from '@authorizerdev/authorizer-js';
import { TranslocoService } from '@jsverse/transloco';
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
import { mapGraphqlErrors } from '@nestjs-mod-fullstack/common-angular';
import { FilesService } from '@nestjs-mod-fullstack/files-angular';
import { catchError, from, map, mergeMap, Observable, of } from 'rxjs';

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

  logout(): Observable<void | null> {
    return from(this.authorizer.logout(this.getAuthorizationHeaders())).pipe(
      mapGraphqlErrors(),
      map(() => null)
    );
  }

  getProfile(): Observable<AuthUser | undefined> {
    return from(
      this.authorizer.getProfile(this.getAuthorizationHeaders())
    ).pipe(mapGraphqlErrors());
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
        return this.authorizer.updateProfile(
          data,
          this.getAuthorizationHeaders()
        );
      }),
      mapGraphqlErrors(),
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
    return from(this.authorizer.browserLogin()).pipe(
      mapGraphqlErrors(),
      map((result) => ({ tokens: result, user: result?.user }))
    );
  }

  signup(data: AuthSignupInput): Observable<AuthUserAndTokens> {
    return from(this.authorizer.signup(data)).pipe(
      mapGraphqlErrors(),
      map((result) => ({ tokens: result, user: result?.user }))
    );
  }

  login(data: AuthLoginInput): Observable<AuthUserAndTokens> {
    return from(this.authorizer.login(data)).pipe(
      mapGraphqlErrors(),
      map((result) => ({ tokens: result, user: result?.user }))
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
