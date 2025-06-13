export * from './app-rest.service';
export * from './auth-rest.service';
export * from './authorizer-rest.service';
export * from './fake-endpoint-rest.service';
import { AppRestService } from './app-rest.service';
import { AuthRestService } from './auth-rest.service';
import { AuthorizerRestService } from './authorizer-rest.service';
import { FakeEndpointRestService } from './fake-endpoint-rest.service';
import { TerminusHealthCheckRestService } from './terminus-health-check-rest.service';
import { TimeRestService } from './time-rest.service';

export * from './terminus-health-check-rest.service';
export * from './time-rest.service';
export const APIS = [
  AppRestService,
  AuthRestService,
  AuthorizerRestService,
  FakeEndpointRestService,
  TerminusHealthCheckRestService,
  TimeRestService,
];
