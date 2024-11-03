import { Route } from '@angular/router';
import {
  AUTH_GUARD_DATA_ROUTE_KEY,
  AuthGuardData,
  AuthGuardService,
} from '@nestjs-mod-fullstack/auth-angular';
import { DemoComponent } from './pages/demo/demo.component';
import { HomeComponent } from './pages/home/home.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { WebhookComponent } from './pages/webhook/webhook.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'demo', component: DemoComponent },
  {
    path: 'webhook',
    component: WebhookComponent,
    canActivate: [AuthGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({
        roles: ['Admin', 'User'],
      }),
    },
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [AuthGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({ roles: [] }),
    },
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
    canActivate: [AuthGuardService],
    data: {
      [AUTH_GUARD_DATA_ROUTE_KEY]: new AuthGuardData({ roles: [] }),
    },
  },
];
