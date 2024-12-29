import { Prisma } from '../../../../../../../../node_modules/@prisma/webhook-client';
import { ApiProperty } from '@nestjs/swagger';
import { WebhookUser } from './webhook-user.entity';
import { WebhookLog } from './webhook-log.entity';

export class Webhook {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  eventName!: string;
  @ApiProperty({
    type: 'string',
  })
  endpoint!: string;
  @ApiProperty({
    type: 'boolean',
  })
  enabled!: boolean;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  headers!: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  requestTimeout!: number | null;
  @ApiProperty({
    type: 'string',
  })
  externalTenantId!: string;
  @ApiProperty({
    type: 'string',
  })
  createdBy!: string;
  @ApiProperty({
    type: 'string',
  })
  updatedBy!: string;
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
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  workUntilDate!: Date | null;
  @ApiProperty({
    type: () => WebhookUser,
    required: false,
  })
  WebhookUser_Webhook_createdByToWebhookUser?: WebhookUser;
  @ApiProperty({
    type: () => WebhookUser,
    required: false,
  })
  WebhookUser_Webhook_updatedByToWebhookUser?: WebhookUser;
  @ApiProperty({
    type: () => WebhookLog,
    isArray: true,
    required: false,
  })
  WebhookLog?: WebhookLog[];
}
