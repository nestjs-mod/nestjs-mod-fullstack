import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, concatMap, from, map, mergeMap, of } from 'rxjs';
import { AuthService } from './auth.service';

export const AUTH_COMPLETE_GUARD_DATA_ROUTE_KEY = 'authGuardCompleteData';

export type CompleteSignUpOptions = {
  activatedRouteSnapshot: ActivatedRouteSnapshot;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  authService: AuthService;
  router: Router;
};

export class AuthCompleteGuardData {
  type?:
    | 'complete-sign-up'
    | 'complete-forgot-password'
    | 'complete-invite'
    | 'complete-oauth-sign-up';

  beforeCompleteSignUp?: (options: CompleteSignUpOptions) => Promise<boolean>;

  afterCompleteSignUp?: (options: CompleteSignUpOptions) => Promise<boolean>;

  constructor(options?: AuthCompleteGuardData) {
    Object.assign(this, options);
  }
}

@Injectable({ providedIn: 'root' })
export class AuthCompleteGuardService implements CanActivate {
  constructor(
    private readonly nzMessageService: NzMessageService,
    private readonly translocoService: TranslocoService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot) {
    const authCompleteGuardData =
      route.data &&
      route.data[AUTH_COMPLETE_GUARD_DATA_ROUTE_KEY] instanceof
        AuthCompleteGuardData
        ? route.data[AUTH_COMPLETE_GUARD_DATA_ROUTE_KEY]
        : null;
    if (authCompleteGuardData) {
      if (authCompleteGuardData.type === 'complete-oauth-sign-up') {
        const verificationCode = route.queryParamMap.get('verification_code');
        const clientId = route.queryParamMap.get('client_id');
        if (verificationCode) {
          return (
            authCompleteGuardData.beforeCompleteSignUp
              ? from(
                  authCompleteGuardData.beforeCompleteSignUp({
                    activatedRouteSnapshot: route,
                    authService: this.authService,
                    router: this.router,
                  })
                )
              : of(true)
          ).pipe(
            mergeMap(() =>
              this.authService.oAuthVerification({
                verificationCode,
                clientId: clientId || undefined,
              })
            ),
            map(async () => {
              this.nzMessageService.success(
                this.translocoService.translate(
                  'Successful login using external single sign-on system'
                )
              );
              return true;
            }),
            mergeMap(() => this.authService.refreshToken()),
            concatMap(async () => {
              if (authCompleteGuardData.afterCompleteSignUp) {
                await authCompleteGuardData.afterCompleteSignUp({
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
                this.translocoService.translate(
                  err.error?.message || err.message
                )
              );
              if (authCompleteGuardData.afterCompleteSignUp) {
                return from(
                  authCompleteGuardData.afterCompleteSignUp({
                    activatedRouteSnapshot: route,
                    authService: this.authService,
                    router: this.router,
                    error: err,
                  })
                );
              }
              return of(false);
            })
          );
        }
      }
      if (authCompleteGuardData.type === 'complete-sign-up') {
        const code = route.queryParamMap.get('code');
        if (code) {
          return (
            authCompleteGuardData.beforeCompleteSignUp
              ? from(
                  authCompleteGuardData.beforeCompleteSignUp({
                    activatedRouteSnapshot: route,
                    authService: this.authService,
                    router: this.router,
                  })
                )
              : of(true)
          ).pipe(
            mergeMap(() =>
              this.authService.completeSignUp({
                code,
              })
            ),
            map(async () => {
              this.nzMessageService.success(
                this.translocoService.translate(
                  'Email address successfully verified'
                )
              );
              return true;
            }),
            mergeMap(() => this.authService.refreshToken()),
            concatMap(async () => {
              if (authCompleteGuardData.afterCompleteSignUp) {
                await authCompleteGuardData.afterCompleteSignUp({
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
                this.translocoService.translate(
                  err.error?.message || err.message
                )
              );
              if (authCompleteGuardData.afterCompleteSignUp) {
                return from(
                  authCompleteGuardData.afterCompleteSignUp({
                    activatedRouteSnapshot: route,
                    authService: this.authService,
                    router: this.router,
                    error: err,
                  })
                );
              }
              return of(false);
            })
          );
        }
      }
    }
    return of(true);
  }
}
