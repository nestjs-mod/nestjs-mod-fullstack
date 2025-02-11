import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { supabaseAppConfig } from './app/supabase-app.config';
import {
  minioURL,
  authorizerURL,
  supabaseKey,
  supabaseURL,
} from './environments/environment';
import { authorizerAppConfig } from './app/authorizer-app.config';

bootstrapApplication(
  AppComponent,
  authorizerURL
    ? authorizerAppConfig({ authorizerURL, minioURL })
    : supabaseAppConfig({ minioURL, supabaseKey, supabaseURL })
).catch((err) => console.error(err));
