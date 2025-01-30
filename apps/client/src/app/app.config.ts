import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';

import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';
import {
  RestClientApiModule,
  RestClientConfiguration,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import {
  AuthProfileFormService,
  AuthProfileMapperService,
  AuthService,
} from '@nestjs-mod-fullstack/auth-angular';
import { COMMON_FORMLY_FIELDS } from '@nestjs-mod-fullstack/common-angular';
import {
  FILES_FORMLY_FIELDS,
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
  supabaseKey,
  supabaseURL,
  webhookSuperAdminExternalUserId,
} from '../environments/environment';
import { AppInitializer } from './app-initializer';
import { AppErrorHandler } from './app.error-handler';
import { appRoutes } from './app.routes';
import {
  AUTHORIZER_URL,
  provideAppAuthConfiguration,
} from './integrations/auth.configuration';
import { CustomAuthProfileFormService } from './integrations/custom-auth-profile-form.service';
import { CustomAuthProfileMapperService } from './integrations/custom-auth-profile-mapper.service';
import { CustomSupabaseAuthService } from './integrations/custom-supabase-auth.service';
import { TranslocoHttpLoader } from './integrations/transloco-http.loader';
import { SUPABASE_URL, SUPABASE_KEY } from './integrations/supabase.service';

export const appConfig = ({
  authorizerURL,
  minioURL,
}: {
  authorizerURL: string;
  minioURL: string;
  supabaseURL: string;
  supabaseKey: string;
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
          types: [...FILES_FORMLY_FIELDS, ...COMMON_FORMLY_FIELDS],
        }),
        FormlyNgZorroAntdModule
      ),
      { provide: ErrorHandler, useClass: AppErrorHandler },
      {
        provide: AUTHORIZER_URL,
        useValue: authorizerURL,
      },
      {
        provide: SUPABASE_URL,
        useValue: supabaseURL,
      },
      {
        provide: SUPABASE_KEY,
        useValue: supabaseKey,
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
      provideTranslocoLocale({
        defaultLocale: 'en-US',
        langToLocaleMapping: {
          en: 'en-US',
          ru: 'ru-RU',
        },
      }),
      provideTranslocoMessageformat({
        locales: ['en-US', 'ru-RU'],
      }),
      provideAppInitializer(() => {
        const initializerFn = (
          (appInitializer: AppInitializer) => () =>
            appInitializer.resolve()
        )(inject(AppInitializer));
        return initializerFn();
      }),
      {
        provide: AuthProfileMapperService,
        useClass: CustomAuthProfileMapperService,
      },
      {
        provide: AuthProfileFormService,
        useClass: CustomAuthProfileFormService,
      },
      {
        provide: AuthService,
        useClass: CustomSupabaseAuthService,
      },
    ],
  };
};
