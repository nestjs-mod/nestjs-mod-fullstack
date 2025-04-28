import {
  Prisma,
  WebhookStatus,
} from '../../../../../../../../node_modules/@prisma/webhook-client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWebhookLogDto {
  @ApiProperty({
    type: () => Object,
  })
  @IsNotEmpty()
  request!: Prisma.InputJsonValue;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  responseStatus!: string;
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
  })
  @IsNotEmpty()
  @IsEnum(WebhookStatus)
  webhookStatus!: WebhookStatus;
}
