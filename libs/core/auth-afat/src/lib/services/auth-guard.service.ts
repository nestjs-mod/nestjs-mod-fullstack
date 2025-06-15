import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, concatMap, first, from, map, of } from 'rxjs';
import { AuthService } from './auth.service';
export const AUTH_GUARD_DATA_ROUTE_KEY = 'authGuardData';

export type OnActivateOptions = {
  activatedRouteSnapshot: ActivatedRouteSnapshot;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  authService: AuthService;
  router: Router;
};

export class AuthGuardData {
  roles?: string[];

  afterActivate?: (options: OnActivateOptions) => Promise<boolean>;

  constructor(options?: AuthGuardData) {
    Object.assign(this, options);
  }
}

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {
  constructor(
    private readonly authAuthService: AuthService,
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot) {
    const authGuardData =
      route.data &&
      route.data[AUTH_GUARD_DATA_ROUTE_KEY] instanceof AuthGuardData
        ? route.data[AUTH_GUARD_DATA_ROUTE_KEY]
        : null;
    if (authGuardData) {
      return this.checkUserRoles(authGuardData?.roles).pipe(
        first(),
        concatMap(async (result) => {
          if (!result) {
            throw new Error('Forbidden');
          }
          return result;
        }),
        concatMap(async () => {
          if (authGuardData.afterActivate) {
            await authGuardData.afterActivate({
              activatedRouteSnapshot: route,
              authService: this.authService,
              router: this.router,
            });
          }
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.nzMessageService.error(
            this.translocoService.translate(err.error?.message || err.message),
          );
          if (authGuardData.afterActivate) {
            return from(
              authGuardData.afterActivate({
                activatedRouteSnapshot: route,
                authService: this.authService,
                router: this.router,
                error: err,
              }),
            );
          }
          return of(false);
        }),
      );
    }
    return of(true);
  }

  checkUserRoles(authRoles?: string[]) {
    return this.authAuthService.profile$.pipe(
      map((authUser) => {
        const authGuardDataRoles = (authRoles || []).map((role) =>
          role.toLowerCase(),
        );
        const result = Boolean(
          (authUser &&
            authGuardDataRoles.length > 0 &&
            authGuardDataRoles.some((r) =>
              authUser.roles?.map((r) => r.toLowerCase()).includes(r),
            )) ||
            (authGuardDataRoles.length === 0 && !authUser?.roles),
        );
        if (!result) {
          console.log(result, { authUser, authGuardDataRoles }, [
            [
              authUser,
              authGuardDataRoles.length > 0,
              authUser &&
                authGuardDataRoles
                  .map((role) => role.toLowerCase())
                  .some((r) =>
                    authUser.roles?.map((r) => r.toLowerCase()).includes(r),
                  ),
            ],
            [authGuardDataRoles.length === 0, !authUser?.roles],
          ]);
        }
        return result;
      }),
    );
  }
}
