import { InjectionToken } from '@angular/core';
import { UpdateProfileInput, User } from '@authorizerdev/authorizer-js';
import { Observable } from 'rxjs';

export type AfterUpdateProfileEvent = {
  old?: User;
  new?: User;
};

export class AuthConfiguration {
  constructor(options?: AuthConfiguration) {
    Object.assign(this, options);
  }

  beforeUpdateProfile?(
    data: UpdateProfileInput
  ): Observable<UpdateProfileInput>;

  afterUpdateProfile?(
    data: AfterUpdateProfileEvent
  ): Observable<User | undefined>;

  getAuthorizationHeaders?(): Record<string, string>;
}

export const AUTH_CONFIGURATION_TOKEN = new InjectionToken<string>(
  'AUTH_CONFIGURATION_TOKEN'
);
