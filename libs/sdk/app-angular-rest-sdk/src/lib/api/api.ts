export * from './default-rest.service';
import { DefaultRestService } from './default-rest.service';
export * from './webhook-rest.service';
import { WebhookRestService } from './webhook-rest.service';
export const APIS = [DefaultRestService, WebhookRestService];
