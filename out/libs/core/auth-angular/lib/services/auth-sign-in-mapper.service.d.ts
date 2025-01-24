import { LoginInput } from '@authorizerdev/authorizer-js';
import * as i0 from '@angular/core';
export declare class AuthSignInMapperService {
  toModel(data: LoginInput): {
    email: string | undefined;
    password: string;
  };
  toJson(data: LoginInput): {
    email: string | undefined;
    password: string;
  };
  static ɵfac: i0.ɵɵFactoryDeclaration<AuthSignInMapperService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<AuthSignInMapperService>;
}
