import { Prisma } from '../../../../../../../../node_modules/@prisma/webhook-client';
export declare class CreateWebhookDto {
    eventName: string;
    endpoint: string;
    enabled: boolean;
    headers?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
    requestTimeout?: number | null;
    workUntilDate?: Date | null;
}
