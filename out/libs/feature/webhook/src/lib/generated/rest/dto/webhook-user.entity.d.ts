import { WebhookRole } from '../../../../../../../../node_modules/@prisma/webhook-client';
import { Webhook } from './webhook.entity';
export declare class WebhookUser {
  id: string;
  externalTenantId: string;
  externalUserId: string;
  userRole: WebhookRole;
  createdAt: Date;
  updatedAt: Date;
  Webhook_Webhook_createdByToWebhookUser?: Webhook[];
  Webhook_Webhook_updatedByToWebhookUser?: Webhook[];
}
