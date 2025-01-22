import { FindManyResponseMeta } from '@nestjs-mod-fullstack/common';
import { WebhookLog } from '../generated/rest/dto/webhook-log.entity';
export declare class FindManyWebhookLogResponse {
    webhookLogs: WebhookLog[];
    meta: FindManyResponseMeta;
}
