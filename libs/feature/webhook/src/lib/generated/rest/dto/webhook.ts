import { WebhookUser } from './webhook_user';
import { WebhookLog } from './webhook_log';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Webhook {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  eventName!: string;

  @ApiProperty({ type: String })
  endpoint!: string;

  @ApiProperty({ type: Boolean })
  enabled!: boolean;

  @ApiPropertyOptional({ type: Object })
  headers?: object;

  @ApiPropertyOptional({ type: Number })
  requestTimeout?: number;

  @ApiProperty({ type: String })
  externalTenantId!: string;

  @ApiProperty({ type: String })
  createdBy!: string;

  @ApiProperty({ type: String })
  updatedBy!: string;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;

  @ApiProperty({ type: () => WebhookUser })
  WebhookUser_Webhook_createdByToWebhookUser!: WebhookUser;

  @ApiProperty({ type: () => WebhookUser })
  WebhookUser_Webhook_updatedByToWebhookUser!: WebhookUser;

  @ApiProperty({ isArray: true, type: () => WebhookLog })
  WebhookLog!: WebhookLog[];
}
