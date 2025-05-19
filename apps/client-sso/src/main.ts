import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { ssoURL, minioURL } from './environments/environment';

bootstrapApplication(AppComponent, appConfig({ ssoURL, minioURL })).catch(
  (err) => console.error(err)
);
