import { FindManyResponseMeta } from '@nestjs-mod-fullstack/common';
import { WebhookUser } from '../generated/rest/dto/webhook-user.entity';
export declare class FindManyWebhookUserResponse {
    webhookUsers: WebhookUser[];
    meta: FindManyResponseMeta;
}
