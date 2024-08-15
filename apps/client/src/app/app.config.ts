import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RestClientApiModule, RestClientConfiguration } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    importProvidersFrom(RestClientApiModule.forRoot(() => new RestClientConfiguration(
      {
        basePath: 'http://localhost:3000'
      }
    )))
  ],
};
