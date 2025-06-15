import { Inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  mergeMap,
  Observable,
  of,
  Subject,
} from 'rxjs';
import {
  AUTH_CONFIGURATION_TOKEN,
  AuthConfiguration,
} from './auth.configuration';
import {
  AuthCompleteForgotPasswordInput,
  AuthCompleteSignUpInput,
  AuthForgotPasswordInput,
  AuthLoginInput,
  AuthSignupInput,
  AuthUpdateProfileInput,
  AuthUser,
  AuthUserAndTokens,
  OAuthVerificationInput,
} from './auth.types';
import { TokensService } from './tokens.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  profile$ = new BehaviorSubject<AuthUser | undefined>(undefined);
  updateHeaders$ = new Subject<boolean>();

  constructor(
    protected readonly tokensService: TokensService,
    @Inject(AUTH_CONFIGURATION_TOKEN)
    protected readonly authConfiguration: AuthConfiguration,
  ) {}

  updateHeaders() {
    this.updateHeaders$.next(true);
  }

  completeSignUp(
    data: AuthCompleteSignUpInput,
  ): Observable<AuthUserAndTokens | null> {
    return this.authConfiguration.completeSignUp
      ? this.authConfiguration.completeSignUp(data).pipe(
          mergeMap((result) => {
            return this.setProfileAndTokens(result).pipe(
              map((profile) => ({
                profile,
                tokens: result.tokens,
              })),
            );
          }),
        )
      : of(null);
  }

  forgotPassword(data: AuthForgotPasswordInput): Observable<true | null> {
    return this.authConfiguration.forgotPassword
      ? this.authConfiguration.forgotPassword(data)
      : of(null);
  }

  completeForgotPassword(
    data: AuthCompleteForgotPasswordInput,
  ): Observable<AuthUserAndTokens | null> {
    return this.authConfiguration.completeForgotPassword
      ? this.authConfiguration.completeForgotPassword(data).pipe(
          mergeMap((result) => {
            return this.setProfileAndTokens(result).pipe(
              map((profile) => ({
                profile,
                tokens: result.tokens,
              })),
            );
          }),
        )
      : of(null);
  }

  getAuthorizationHeaders() {
    return this.authConfiguration.getAuthorizationHeaders
      ? this.authConfiguration.getAuthorizationHeaders()
      : undefined;
  }

  signUp(data: AuthSignupInput) {
    return this.authConfiguration
      .signup({
        ...data,
        email: data.email?.toLowerCase(),
      })
      .pipe(
        mergeMap((result) => {
          return this.setProfileAndTokens(result).pipe(
            map((profile) => ({
              profile,
              tokens: result.tokens,
            })),
          );
        }),
      );
  }

  updateProfile(data: AuthUpdateProfileInput) {
    return this.authConfiguration.updateProfile(data).pipe(
      mergeMap(() => this.authConfiguration.getProfile()),
      mergeMap((result) => this.setProfile(result)),
    );
  }

  signIn(data: AuthLoginInput) {
    return this.authConfiguration
      .login({
        ...data,
        email: data.email?.toLowerCase(),
      })
      .pipe(
        mergeMap((result) => {
          return this.setProfileAndTokens(result).pipe(
            map((profile) => ({
              profile,
              tokens: result.tokens,
            })),
          );
        }),
      );
  }

  signOut() {
    return this.authConfiguration.logout().pipe(
      mergeMap(() => {
        return this.clearProfileAndTokens();
      }),
      catchError((err) => {
        console.error(err);
        return this.clearProfileAndTokens();
      }),
    );
  }

  refreshToken() {
    return this.authConfiguration.refreshToken().pipe(
      mergeMap((result) => {
        return this.setProfileAndTokens(result);
      }),
      catchError((err) => {
        console.error(err);
        return this.clearProfileAndTokens();
      }),
    );
  }

  clearProfileAndTokens() {
    return this.setProfileAndTokens({} as AuthUserAndTokens);
  }

  setProfileAndTokens(result: AuthUserAndTokens | undefined) {
    this.tokensService.setTokens(result?.tokens);
    return this.setProfile(result?.user);
  }

  setProfile(result: AuthUser | undefined) {
    this.profile$.next(result);
    return of(result);
  }

  getOAuthProviders() {
    return this.authConfiguration.oAuthProviders();
  }

  oAuthVerification(oAuthVerificationInput: OAuthVerificationInput) {
    return this.authConfiguration.oAuthVerification(oAuthVerificationInput);
  }
}
