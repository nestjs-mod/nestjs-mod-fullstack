import { Route } from '@angular/router';
import {
  WEBHOOK_GUARD_DATA_ROUTE_KEY,
  WebhookGuardData,
  WebhookGuardService,
} from '@nestjs-mod-fullstack/webhook-angular';
import { HomeComponent } from './pages/home/home.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { WebhookComponent } from './pages/webhook/webhook.component';
import { DemoComponent } from './pages/demo/demo.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'demo', component: DemoComponent },
  {
    path: 'webhook',
    component: WebhookComponent,
    canActivate: [WebhookGuardService],
    data: {
      [WEBHOOK_GUARD_DATA_ROUTE_KEY]: new WebhookGuardData({
        roles: ['Admin', 'User'],
      }),
    },
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [WebhookGuardService],
    data: {
      [WEBHOOK_GUARD_DATA_ROUTE_KEY]: new WebhookGuardData({ roles: [] }),
    },
  },
];
