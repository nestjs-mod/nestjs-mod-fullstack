import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { authorizerURL } from './environments/environment';

bootstrapApplication(AppComponent, appConfig({ authorizerURL })).catch((err) =>
  console.error(err)
);
