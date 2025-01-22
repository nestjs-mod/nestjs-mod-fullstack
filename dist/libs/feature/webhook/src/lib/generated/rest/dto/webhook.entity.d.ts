import { Prisma } from '../../../../../../../../node_modules/@prisma/webhook-client';
import { WebhookUser } from './webhook-user.entity';
import { WebhookLog } from './webhook-log.entity';
export declare class Webhook {
    id: string;
    eventName: string;
    endpoint: string;
    enabled: boolean;
    headers: Prisma.JsonValue | null;
    requestTimeout: number | null;
    externalTenantId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    workUntilDate: Date | null;
    WebhookUser_Webhook_createdByToWebhookUser?: WebhookUser;
    WebhookUser_Webhook_updatedByToWebhookUser?: WebhookUser;
    WebhookLog?: WebhookLog[];
}
