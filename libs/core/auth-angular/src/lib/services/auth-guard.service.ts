import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
export const AUTH_GUARD_DATA_ROUTE_KEY = 'authGuardData';

export class AuthGuardData {
  roles?: string[];

  constructor(options?: AuthGuardData) {
    Object.assign(this, options);
  }
}

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {
  constructor(private readonly authAuthService: AuthService) {}
  canActivate(route: ActivatedRouteSnapshot) {
    if (route.data[AUTH_GUARD_DATA_ROUTE_KEY] instanceof AuthGuardData) {
      const authGuardData = route.data[AUTH_GUARD_DATA_ROUTE_KEY];
      const authUser = this.authAuthService.profile$.value;
      const authGuardDataRoles = (authGuardData.roles || []).map((role) =>
        role.toLowerCase()
      );
      const result = Boolean(
        (authUser &&
          authGuardDataRoles.length > 0 &&
          authGuardDataRoles.some((r) => authUser.roles?.includes(r))) ||
          (authGuardDataRoles.length === 0 && !authUser?.roles)
      );
      if (!result) {
        console.log(result, [
          [
            authUser,
            authGuardDataRoles.length > 0,
            authUser &&
              authGuardDataRoles.some((r) => authUser.roles?.includes(r)),
          ],
          [authGuardDataRoles.length === 0, !authUser?.roles],
        ]);
      }
      return of(result);
    }
    return of(true);
  }
}
