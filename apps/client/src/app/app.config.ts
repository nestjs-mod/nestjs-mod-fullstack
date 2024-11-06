import { provideHttpClient } from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import {
  DefaultRestService,
  RestClientApiModule,
  RestClientConfiguration,
  WebhookRestService,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import {
  AUTHORIZER_URL,
  AuthService,
} from '@nestjs-mod-fullstack/auth-angular';
import {
  WEBHOOK_CONFIGURATION_TOKEN,
  WebhookConfiguration,
} from '@nestjs-mod-fullstack/webhook-angular';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import {
  serverUrl,
  webhookSuperAdminExternalUserId,
} from '../environments/environment';
import { AppInitializer } from './app-initializer';
import { AppErrorHandler } from './app.error-handler';
import { appRoutes } from './app.routes';

export const appConfig = ({
  authorizerURL,
}: {
  authorizerURL?: string;
}): ApplicationConfig => {
  return {
    providers: [
      provideClientHydration(),
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(appRoutes),
      provideHttpClient(),
      provideNzI18n(en_US),
      {
        provide: WEBHOOK_CONFIGURATION_TOKEN,
        useValue: new WebhookConfiguration({ webhookSuperAdminExternalUserId }),
      },
      importProvidersFrom(
        BrowserAnimationsModule,
        RestClientApiModule.forRoot(
          () =>
            new RestClientConfiguration({
              basePath: serverUrl,
            })
        ),
        FormlyModule.forRoot(),
        FormlyNgZorroAntdModule
      ),
      { provide: ErrorHandler, useClass: AppErrorHandler },
      {
        provide: AUTHORIZER_URL,
        useValue: authorizerURL,
      },
      {
        provide: APP_INITIALIZER,
        useFactory:
          (
            defaultRestService: DefaultRestService,
            webhookRestService: WebhookRestService,
            authService: AuthService
          ) =>
          () =>
            new AppInitializer(
              defaultRestService,
              webhookRestService,
              authService
            ).resolve(),
        multi: true,
        deps: [DefaultRestService, WebhookRestService, AuthService],
      },
    ],
  };
};
