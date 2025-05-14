import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { authorizerURL, minioURL } from './environments/environment';

bootstrapApplication(
  AppComponent,
  appConfig({ authorizerURL, minioURL })
).catch((err) => console.error(err));
