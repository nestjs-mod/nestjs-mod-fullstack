import { WebhookRole } from '../../../../../../../../node_modules/@prisma/webhook-client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateWebhookUserDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  externalTenantId?: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  externalUserId?: string;
  @ApiProperty({
    enum: WebhookRole,
    enumName: 'WebhookRole',
    required: false,
  })
  @IsOptional()
  @IsEnum(WebhookRole)
  userRole?: WebhookRole;
}
