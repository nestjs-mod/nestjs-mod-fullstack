import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import {
  authorizerURL,
  minioURL,
  supabaseKey,
  supabaseURL,
} from '../environments/environment';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(), provideClientHydration()],
};

export const config = mergeApplicationConfig(
  appConfig({ authorizerURL, minioURL, supabaseKey, supabaseURL }),
  serverConfig
);
