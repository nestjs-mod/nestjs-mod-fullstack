import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { minioURL, supabaseKey, supabaseURL } from './environments/environment';

bootstrapApplication(
  AppComponent,
  appConfig({ minioURL, supabaseKey, supabaseURL }),
).catch((err) => console.error(err));
