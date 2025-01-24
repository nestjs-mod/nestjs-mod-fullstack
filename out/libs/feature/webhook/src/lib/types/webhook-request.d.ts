import { WebhookUser } from '../generated/rest/dto/webhook-user.entity';
export type WebhookRequest = {
  webhookUser?: Omit<
    WebhookUser,
    | 'Webhook_Webhook_createdByToWebhookUser'
    | 'Webhook_Webhook_updatedByToWebhookUser'
  > | null;
  externalUserId: string;
  externalTenantId: string;
  headers: Record<string, string>;
};
