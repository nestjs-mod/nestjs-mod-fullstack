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
        localStorage.getItem('authorizerURL') ||
        authorizerURL ||
        `${window.location.protocol}//${window.location.hostname}:8080`,
      clientID: '',
      redirectURL: window.location.origin,
    } as ConfigType);
  }
}
