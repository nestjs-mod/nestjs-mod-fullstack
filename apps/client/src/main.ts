import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { authorizerURL, minioURL } from './environments/environment';

bootstrapApplication(
  AppComponent,
  appConfig({ authorizerURL, minioURL })
).catch((err) => console.error(err));
