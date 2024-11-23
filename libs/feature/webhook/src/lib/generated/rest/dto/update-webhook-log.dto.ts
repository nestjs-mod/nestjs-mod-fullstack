import {
  Prisma,
  WebhookStatus,
} from '../../../../../../../../node_modules/@prisma/webhook-client';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateWebhookLogDto {
  @ApiProperty({
    type: () => Object,
    required: false,
  })
  @IsOptional()
  request?: Prisma.InputJsonValue;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  responseStatus?: string;
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  @IsOptional()
  response?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  @ApiProperty({
    enum: WebhookStatus,
    enumName: 'WebhookStatus',
    required: false,
  })
  @IsOptional()
  webhookStatus?: WebhookStatus;
}
