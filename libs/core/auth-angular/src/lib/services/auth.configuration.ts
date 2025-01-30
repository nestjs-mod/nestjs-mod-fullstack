import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AuthLoginInput,
  AuthSignupInput,
  AuthUpdateProfileInput,
  AuthUser,
  AuthUserAndTokens,
} from './auth.types';

export type AfterUpdateProfileEvent = {
  old?: AuthUser;
  new?: AuthUser;
};

export class AuthConfiguration {
  constructor(options?: AuthConfiguration) {
    Object.assign(this, options);
  }
  logout!: () => Observable<void | null>;
  getProfile!: () => Observable<AuthUser | undefined>;
  refreshToken!: () => Observable<AuthUserAndTokens>;
  signup!: (data: AuthSignupInput) => Observable<AuthUserAndTokens>;
  login!: (data: AuthLoginInput) => Observable<AuthUserAndTokens>;
  updateProfile!: (data: AuthUpdateProfileInput) => Observable<void | null>;

  beforeUpdateProfile?: (
    data: AuthUpdateProfileInput
  ) => Observable<AuthUpdateProfileInput>;

  afterUpdateProfile?: (
    data: AfterUpdateProfileEvent
  ) => Observable<AuthUser | undefined>;

  getAuthorizationHeaders?: () => Record<string, string>;
}

export const AUTH_CONFIGURATION_TOKEN = new InjectionToken<string>(
  'AUTH_CONFIGURATION_TOKEN'
);
