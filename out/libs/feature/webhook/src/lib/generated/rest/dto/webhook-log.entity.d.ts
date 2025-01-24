import {
  Prisma,
  WebhookStatus,
} from '../../../../../../../../node_modules/@prisma/webhook-client';
import { Webhook } from './webhook.entity';
export declare class WebhookLog {
  id: string;
  request: Prisma.JsonValue;
  responseStatus: string;
  response: Prisma.JsonValue | null;
  webhookStatus: WebhookStatus;
  webhookId: string;
  externalTenantId: string;
  createdAt: Date;
  updatedAt: Date;
  Webhook?: Webhook;
}
