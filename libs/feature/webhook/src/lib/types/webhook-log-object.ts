import { FindManyResponseMeta } from '@nestjs-mod-fullstack/common';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { WebhookLog } from '../generated/rest/dto/webhook_log';

export class WebhookLogObject extends OmitType(WebhookLog, [
  'Webhook',
  'webhookId',
]) {}

export class FindManyWebhookLogResponse {
  @ApiProperty({ type: () => [WebhookLogObject] })
  webhookLogs!: WebhookLogObject[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
