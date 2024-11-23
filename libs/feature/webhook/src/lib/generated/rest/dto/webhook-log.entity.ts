import {
  Prisma,
  WebhookStatus,
} from '../../../../../../../../node_modules/@prisma/webhook-client';
import { ApiProperty } from '@nestjs/swagger';
import { Webhook } from './webhook.entity';

export class WebhookLog {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: () => Object,
  })
  request!: Prisma.JsonValue;
  @ApiProperty({
    type: 'string',
  })
  responseStatus!: string;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  response!: Prisma.JsonValue | null;
  @ApiProperty({
    enum: WebhookStatus,
    enumName: 'WebhookStatus',
  })
  webhookStatus!: WebhookStatus;
  @ApiProperty({
    type: 'string',
  })
  webhookId!: string;
  @ApiProperty({
    type: 'string',
  })
  externalTenantId!: string;
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
    required: false,
  })
  Webhook?: Webhook;
}
