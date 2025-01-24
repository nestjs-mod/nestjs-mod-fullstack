import {
  Prisma,
  WebhookStatus,
} from '../../../../../../../../node_modules/@prisma/webhook-client';
export declare class WebhookLogDto {
  id: string;
  request: Prisma.JsonValue;
  responseStatus: string;
  response: Prisma.JsonValue | null;
  webhookStatus: WebhookStatus;
  externalTenantId: string;
  createdAt: Date;
  updatedAt: Date;
}
