import {
  Prisma,
  WebhookStatus,
} from '../../../../../../../../node_modules/@prisma/webhook-client';
export declare class CreateWebhookLogDto {
  request: Prisma.InputJsonValue;
  responseStatus: string;
  response?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  webhookStatus: WebhookStatus;
}
