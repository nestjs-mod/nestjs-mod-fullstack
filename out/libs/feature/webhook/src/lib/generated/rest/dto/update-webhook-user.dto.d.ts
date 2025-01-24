import { WebhookRole } from '../../../../../../../../node_modules/@prisma/webhook-client';
export declare class UpdateWebhookUserDto {
  externalTenantId?: string;
  externalUserId?: string;
  userRole?: WebhookRole;
}
