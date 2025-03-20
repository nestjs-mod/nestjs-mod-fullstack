import { FindManyResponseMeta } from '@nestjs-mod-fullstack/common';
import { ApiProperty } from '@nestjs/swagger';
import { WebhookUser } from '../generated/rest/dto/webhook-user.entity';

export class FindManyWebhookUserResponse {
  @ApiProperty({ type: () => [WebhookUser] })
  webhookUsers!: WebhookUser[];

  @ApiProperty({ type: () => FindManyResponseMeta })
  meta!: FindManyResponseMeta;
}
