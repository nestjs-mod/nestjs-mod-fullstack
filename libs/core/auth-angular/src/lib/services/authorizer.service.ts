import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Authorizer, ConfigType } from '@authorizerdev/authorizer-js';

export const AUTHORIZER_URL = new InjectionToken<string>('AuthorizerURL');

@Injectable({ providedIn: 'root' })
export class AuthorizerService extends Authorizer {
  constructor(
    @Inject(AUTHORIZER_URL)
    private readonly authorizerURL: string
  ) {
    super({
      authorizerURL:
        // need for override from e2e-tests
        localStorage.getItem('authorizerURL') ||
        // use from environments
        authorizerURL,
      clientID: '',
      redirectURL: window.location.origin,
    } as ConfigType);
  }
}
