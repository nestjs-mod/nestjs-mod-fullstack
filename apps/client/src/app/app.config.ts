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
import { provideTransloco } from '@jsverse/transloco';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import {
  RestClientApiModule,
  RestClientConfiguration,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import {
  AUTHORIZER_URL,
  AuthProfileFormService,
  AuthService,
} from '@nestjs-mod-fullstack/auth-angular';
import {
  ImageFileComponent,
  MINIO_URL,
} from '@nestjs-mod-fullstack/files-angular';
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
import { provideAppAuthConfiguration } from './integrations/auth.configuration';
import { CustomAuthProfileFormService } from './integrations/custom-auth-profile-form.service';
import { CustomAuthService } from './integrations/custom-auth.service';
import { TranslocoHttpLoader } from './integrations/transloco-http.loader';

export const appConfig = ({
  authorizerURL,
  minioURL,
}: {
  authorizerURL: string;
  minioURL: string;
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
        FormlyModule.forRoot({
          types: [
            {
              name: 'image-file',
              component: ImageFileComponent,
              extends: 'input',
            },
          ],
        }),
        FormlyNgZorroAntdModule
      ),
      { provide: ErrorHandler, useClass: AppErrorHandler },
      {
        provide: AUTHORIZER_URL,
        useValue: authorizerURL,
      },
      {
        provide: MINIO_URL,
        useValue: minioURL,
      },
      provideAppAuthConfiguration(),
      // Transloco Config
      provideTransloco({
        config: {
          availableLangs: [
            {
              id: marker('en'),
              label: marker('app.locale.name.english'),
            },
            {
              id: marker('ru'),
              label: marker('app.locale.name.russian'),
            },
          ],
          defaultLang: 'en',
          fallbackLang: 'en',
          reRenderOnLangChange: true,
          prodMode: true,
          missingHandler: {
            logMissingKey: true,
            useFallbackTranslation: true,
            allowEmpty: true,
          },
        },
        loader: TranslocoHttpLoader,
      }),
      {
        provide: APP_INITIALIZER,
        useFactory: (appInitializer: AppInitializer) => () =>
          appInitializer.resolve(),
        multi: true,
        deps: [AppInitializer],
      },
      {
        provide: AuthProfileFormService,
        useClass: CustomAuthProfileFormService,
      },
      {
        provide: AuthService,
        useClass: CustomAuthService,
      },
    ],
  };
};
