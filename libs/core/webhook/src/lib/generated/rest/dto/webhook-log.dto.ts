import {
  Prisma,
  WebhookStatus,
} from '../../../../../../../../node_modules/@prisma/webhook-client';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookLogDto {
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
}
