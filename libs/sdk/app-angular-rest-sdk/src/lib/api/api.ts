export * from './app-rest.service';
import { AppRestService } from './app-rest.service';
export * from './authorizer-rest.service';
import { AuthorizerRestService } from './authorizer-rest.service';
export * from './files-rest.service';
import { FilesRestService } from './files-rest.service';
export * from './terminus-health-check-rest.service';
import { TerminusHealthCheckRestService } from './terminus-health-check-rest.service';
export * from './webhook-rest.service';
import { WebhookRestService } from './webhook-rest.service';
export const APIS = [
  AppRestService,
  AuthorizerRestService,
  FilesRestService,
  TerminusHealthCheckRestService,
  WebhookRestService,
];
