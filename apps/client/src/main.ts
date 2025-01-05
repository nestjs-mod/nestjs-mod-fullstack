import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {
  authorizerURL,
  minioURL,
  supabaseKey,
  supabaseURL,
} from './environments/environment';

bootstrapApplication(
  AppComponent,
  appConfig({ authorizerURL, minioURL, supabaseKey, supabaseURL })
).catch((err) => console.error(err));
