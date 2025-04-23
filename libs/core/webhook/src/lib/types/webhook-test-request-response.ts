import { ApiProperty } from '@nestjs/swagger';
import { WebhookStatus } from '@prisma/webhook-client';

export class WebhookTestRequestResponse {
  @ApiProperty({
    type: () => Object,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request!: any;

  @ApiProperty({
    type: 'string',
  })
  responseStatus!: string;

  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response!: any | null;

  @ApiProperty({
    enum: WebhookStatus,
    enumName: 'WebhookStatus',
  })
  webhookStatus!: WebhookStatus;
}
