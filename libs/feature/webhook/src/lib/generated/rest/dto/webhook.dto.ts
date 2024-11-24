import { Prisma } from '../../../../../../../../node_modules/@prisma/webhook-client';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookDto {
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
    format: 'date-time',
  })
  createdAt!: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt!: Date;
}
