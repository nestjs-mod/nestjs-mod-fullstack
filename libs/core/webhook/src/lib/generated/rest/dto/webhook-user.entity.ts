import { WebhookRole } from '../../../../../../../../node_modules/@prisma/webhook-client';
import { ApiProperty } from '@nestjs/swagger';
import { Webhook } from './webhook.entity';

export class WebhookUser {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  externalTenantId!: string;
  @ApiProperty({
    type: 'string',
  })
  externalUserId!: string;
  @ApiProperty({
    enum: WebhookRole,
    enumName: 'WebhookRole',
  })
  userRole!: WebhookRole;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt!: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt!: Date;
  @ApiProperty({
    type: () => Webhook,
    isArray: true,
    required: false,
  })
  Webhook_Webhook_createdByToWebhookUser?: Webhook[];
  @ApiProperty({
    type: () => Webhook,
    isArray: true,
    required: false,
  })
  Webhook_Webhook_updatedByToWebhookUser?: Webhook[];
}
