import { Prisma } from '../../../../../../../../node_modules/@prisma/webhook-client';
export declare class WebhookDto {
    id: string;
    eventName: string;
    endpoint: string;
    enabled: boolean;
    headers: Prisma.JsonValue | null;
    requestTimeout: number | null;
    externalTenantId: string;
    createdAt: Date;
    updatedAt: Date;
    workUntilDate: Date | null;
}
