import { Webhook } from './webhook';
import { WebhookRole } from '@prisma/webhook-client';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookUser {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  externalTenantId!: string;

  @ApiProperty({ type: String })
  externalUserId!: string;

  @ApiProperty({ enum: WebhookRole, enumName: 'WebhookRole' })
  userRole!: WebhookRole;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;

  @ApiProperty({ isArray: true, type: () => Webhook })
  Webhook_Webhook_createdByToWebhookUser!: Webhook[];

  @ApiProperty({ isArray: true, type: () => Webhook })
  Webhook_Webhook_updatedByToWebhookUser!: Webhook[];
}
