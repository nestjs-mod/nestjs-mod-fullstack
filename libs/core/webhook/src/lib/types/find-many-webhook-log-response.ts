import { FindManyResponseMeta } from '@nestjs-mod-fullstack/common';
import { ApiProperty } from '@nestjs/swagger';
import { WebhookLog } from '../generated/rest/dto/webhook-log.entity';

export class FindManyWebhookLogResponse {
  @ApiProperty({ type: () => [WebhookLog] })
  webhookLogs!: WebhookLog[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
