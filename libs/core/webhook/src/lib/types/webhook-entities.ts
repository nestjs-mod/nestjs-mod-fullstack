import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/webhook-client';

export class WebhookEntities {
  @ApiProperty({
    enum: Prisma.WebhookScalarFieldEnum,
    enumName: 'WebhookScalarFieldEnum',
  })
  webhook!: Prisma.WebhookScalarFieldEnum;

  @ApiProperty({
    enum: Prisma.WebhookLogScalarFieldEnum,
    enumName: 'WebhookLogScalarFieldEnum',
  })
  webhookLog!: Prisma.WebhookLogScalarFieldEnum;

  @ApiProperty({
    enum: Prisma.WebhookUserScalarFieldEnum,
    enumName: 'WebhookUserScalarFieldEnum',
  })
  webhookUser!: Prisma.WebhookUserScalarFieldEnum;
}
