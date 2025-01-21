export * from './app-rest.service';
import { AppRestService } from './app-rest.service';
export * from './auth-rest.service';
import { AuthRestService } from './auth-rest.service';
export * from './files-rest.service';
import { FilesRestService } from './files-rest.service';
export * from './terminus-health-check-rest.service';
import { TerminusHealthCheckRestService } from './terminus-health-check-rest.service';
export * from './time-rest.service';
import { TimeRestService } from './time-rest.service';
export * from './webhook-rest.service';
import { WebhookRestService } from './webhook-rest.service';
export const APIS = [
  AppRestService,
  AuthRestService,
  FilesRestService,
  TerminusHealthCheckRestService,
  TimeRestService,
  WebhookRestService,
];
