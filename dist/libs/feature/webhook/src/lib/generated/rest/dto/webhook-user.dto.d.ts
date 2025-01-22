import { WebhookRole } from '../../../../../../../../node_modules/@prisma/webhook-client';
export declare class WebhookUserDto {
    id: string;
    externalTenantId: string;
    externalUserId: string;
    userRole: WebhookRole;
    createdAt: Date;
    updatedAt: Date;
}
