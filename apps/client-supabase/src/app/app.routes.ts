import { Route } from '@angular/router';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { AuthRoleInterface } from '@nestjs-mod-fullstack/fullstack-rest-sdk-angular';
import {
  AUTH_COMPLETE_GUARD_DATA_ROUTE_KEY,
  AUTH_GUARD_DATA_ROUTE_KEY,
  AuthCompleteGuardData,
  AuthCompleteGuardService,
  AuthGuardData,
  AuthGuardService,
  CompleteSignUpOptions,
  OnActivateOptions,
} from '@nestjs-mod-fullstack/auth-angular';
import { DemoComponent } from './pages/demo/demo.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { WebhooksComponent } from './pages/webhooks/webhooks.component';
import { CompleteForgotPasswordComponent } from './pages/complete-forgot-password/complete-forgot-password.component';
import { CompleteInviteComponent } from './pages/complete-invite/complete-invite.component';
import { CompleteSignUpComponent } from './pages/complete-sign-up/complete-sign-up.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { searchIn } from '@nestjs-mod/misc';

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, title: marker('Home') },
  { path: 'demo', component: DemoComponent, title: marker('Demo') },
  {
    path: 'webhooks',
    component: WebhooksComponent,
    title: marker('Webhooks'),
    canActivate: [AuthGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({
        roles: [AuthRoleInterface.Admin, AuthRoleInterface.User],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'profile',
    component: ProfileComponent,
    title: marker('Profile'),
    canActivate: [AuthGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({
        roles: [AuthRoleInterface.Admin, AuthRoleInterface.User],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    title: marker('Sign-in'),
    canActivate: [AuthGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({
        roles: [],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
    title: marker('Sign-up'),
    canActivate: [AuthGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({
        roles: [],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'complete-sign-up',
    component: CompleteSignUpComponent,
    title: marker('Complete sign up'),
    canActivate: [AuthCompleteGuardService],
    data: {
      [AUTH_COMPLETE_GUARD_DATA_ROUTE_KEY]: new AuthCompleteGuardData({
        type: 'complete-sign-up',

        afterCompleteSignUp: async (options: CompleteSignUpOptions) => {
          if (options.error) {
            return false;
          }

          const redirectUri =
            options.activatedRouteSnapshot.queryParamMap.get('redirect_uri');
          if (!redirectUri) {
            if (options.authService && options.router) {
              if (
                searchIn(
                  [AuthRoleInterface.Admin, AuthRoleInterface.User],
                  options.authService.profile$.value?.roles
                )
              ) {
                options.router.navigate(['/webhooks']);
              } else {
                options.router.navigate(['/home']);
              }
            }
          } else {
            location.href = redirectUri;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'complete-oauth-sign-up',
    component: CompleteSignUpComponent,
    title: marker('Complete OAuth sign up'),
    canActivate: [AuthCompleteGuardService],
    data: {
      [AUTH_COMPLETE_GUARD_DATA_ROUTE_KEY]: new AuthCompleteGuardData({
        type: 'complete-oauth-sign-up',

        afterCompleteSignUp: async (options: CompleteSignUpOptions) => {
          if (options.error) {
            return false;
          }

          const redirectUri =
            options.activatedRouteSnapshot.queryParamMap.get('redirect_uri');
          if (!redirectUri) {
            if (options.authService && options.router) {
              if (
                searchIn(
                  [AuthRoleInterface.Admin, AuthRoleInterface.User],
                  options.authService.profile$.value?.roles
                )
              ) {
                options.router.navigate(['/webhooks']);
              } else {
                options.router.navigate(['/home']);
              }
            }
          } else {
            location.href = redirectUri;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    title: marker('Password recovery'),
    canActivate: [AuthGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({
        roles: [],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
    },
  },
  {
    path: 'complete-forgot-password',
    component: CompleteForgotPasswordComponent,
    title: marker('Сomplete forgot password'),
    canActivate: [AuthGuardService, AuthCompleteGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({
        roles: [],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
      [AUTH_COMPLETE_GUARD_DATA_ROUTE_KEY]: new AuthCompleteGuardData({
        type: 'complete-forgot-password',
      }),
    },
  },
  {
    path: 'complete-invite',
    component: CompleteInviteComponent,
    title: marker('Completing registration'),
    canActivate: [AuthGuardService, AuthCompleteGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({
        roles: [],
        afterActivate: async (options: OnActivateOptions) => {
          if (options.error) {
            options.router.navigate(['/home']);
            return false;
          }
          return true;
        },
      }),
      [AUTH_COMPLETE_GUARD_DATA_ROUTE_KEY]: new AuthCompleteGuardData({
        type: 'complete-invite',
      }),
    },
  },
];
