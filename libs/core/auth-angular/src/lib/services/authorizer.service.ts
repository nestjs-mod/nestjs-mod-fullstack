import { Injectable } from '@angular/core';
import { Authorizer, ConfigType } from '@authorizerdev/authorizer-js';

@Injectable({ providedIn: 'root' })
export class AuthorizerService extends Authorizer {
  constructor() {
    super({
      authorizerURL: `${window.location.protocol}//${window.location.hostname}:8080`,
      clientID: '',
      redirectURL: window.location.origin,
    } as ConfigType);
  }
}
