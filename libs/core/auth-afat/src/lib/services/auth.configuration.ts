/* eslint-disable @typescript-eslint/no-unused-vars */
import { InjectionToken } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  AuthCompleteForgotPasswordInput,
  AuthCompleteSignUpInput,
  AuthForgotPasswordInput,
  AuthLoginInput,
  AuthSignupInput,
  AuthUpdateProfileInput,
  AuthUser,
  AuthUserAndTokens,
  OAuthProvider,
  OAuthVerificationInput,
} from './auth.types';

export type AfterUpdateProfileEvent = {
  old?: AuthUser;
  new?: AuthUser;
};

export class AuthConfiguration {
  constructor(options?: AuthConfiguration) {
    Object.assign(this, options);
  }
  logout(): Observable<void | null> {
    return throwError(() => new Error('not implemented'));
  }
  getProfile(): Observable<AuthUser | undefined> {
    return throwError(() => new Error('not implemented'));
  }
  refreshToken(): Observable<AuthUserAndTokens | undefined> {
    return throwError(() => new Error('not implemented'));
  }
  signup(data: AuthSignupInput): Observable<AuthUserAndTokens> {
    return throwError(() => new Error('not implemented'));
  }
  login(data: AuthLoginInput): Observable<AuthUserAndTokens> {
    return throwError(() => new Error('not implemented'));
  }
  updateProfile(data: AuthUpdateProfileInput): Observable<void | null> {
    return throwError(() => new Error('not implemented'));
  }
  completeSignUp(data: AuthCompleteSignUpInput): Observable<AuthUserAndTokens> {
    return throwError(() => new Error('not implemented'));
  }
  forgotPassword(data: AuthForgotPasswordInput): Observable<true> {
    return throwError(() => new Error('not implemented'));
  }
  completeForgotPassword(
    data: AuthCompleteForgotPasswordInput,
  ): Observable<AuthUserAndTokens> {
    return throwError(() => new Error('not implemented'));
  }
  getAuthorizationHeaders(): Record<string, string> {
    throw new Error('not implemented');
  }
  oAuthProviders(): Observable<OAuthProvider[]> {
    return throwError(() => new Error('not implemented'));
  }
  oAuthVerification({
    verificationCode,
    clientId,
  }: OAuthVerificationInput): Observable<AuthUserAndTokens> {
    return throwError(() => new Error('not implemented'));
  }
}

export const AUTH_CONFIGURATION_TOKEN = new InjectionToken<string>(
  'AUTH_CONFIGURATION_TOKEN',
);
