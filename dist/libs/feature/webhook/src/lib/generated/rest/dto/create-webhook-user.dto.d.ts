import { WebhookRole } from '../../../../../../../../node_modules/@prisma/webhook-client';
export declare class CreateWebhookUserDto {
    externalTenantId: string;
    externalUserId: string;
    userRole: WebhookRole;
}
