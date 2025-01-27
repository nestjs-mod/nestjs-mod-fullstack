import { FindManyResponseMeta } from '@nestjs-mod-fullstack/common';
import { Webhook } from '../generated/rest/dto/webhook.entity';
export declare class FindManyWebhookResponse {
    webhooks: Webhook[];
    meta: FindManyResponseMeta;
}
