import { Webhook } from './webhook';
import { WebhookStatus } from '@prisma/webhook-client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebhookLog {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: Object })
  request!: object;

  @ApiProperty({ type: String })
  responseStatus!: string;

  @ApiPropertyOptional({ type: Object })
  response?: object;

  @ApiProperty({ enum: WebhookStatus, enumName: 'WebhookStatus' })
  webhookStatus!: WebhookStatus;

  @ApiProperty({ type: String })
  webhookId!: string;

  @ApiProperty({ type: String })
  externalTenantId!: string;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;

  @ApiProperty({ type: () => Webhook })
  Webhook!: Webhook;
}
