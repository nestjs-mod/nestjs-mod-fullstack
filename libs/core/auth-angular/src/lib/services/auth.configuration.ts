import { InjectionToken } from '@angular/core';
import { UpdateProfileInput } from '@authorizerdev/authorizer-js';
import { Observable } from 'rxjs';

export class AuthConfiguration {
  constructor(options?: AuthConfiguration) {
    Object.assign(this, options);
  }

  beforeUpdateProfile?(
    data: UpdateProfileInput
  ): Observable<UpdateProfileInput>;
}

export const AUTH_CONFIGURATION_TOKEN = new InjectionToken<string>(
  'AUTH_CONFIGURATION_TOKEN'
);
