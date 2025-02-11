import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import {
  authorizerURL,
  minioURL,
  supabaseKey,
  supabaseURL,
} from '../environments/environment';
import { authorizerAppConfig } from './authorizer-app.config';
import { supabaseAppConfig } from './supabase-app.config';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(), provideClientHydration()],
};

export const config = mergeApplicationConfig(
  authorizerURL
    ? authorizerAppConfig({ authorizerURL, minioURL })
    : supabaseAppConfig({ minioURL, supabaseKey, supabaseURL }),
  serverConfig
);
