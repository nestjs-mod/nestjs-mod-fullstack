import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';
import * as i0 from '@angular/core';
export declare const AUTH_GUARD_DATA_ROUTE_KEY = 'authGuardData';
export declare class AuthGuardData {
  roles?: string[];
  constructor(options?: AuthGuardData);
}
export declare class AuthGuardService implements CanActivate {
  private readonly authAuthService;
  constructor(authAuthService: AuthService);
  canActivate(
    route: ActivatedRouteSnapshot
  ): import('rxjs').Observable<boolean>;
  static ɵfac: i0.ɵɵFactoryDeclaration<AuthGuardService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<AuthGuardService>;
}
