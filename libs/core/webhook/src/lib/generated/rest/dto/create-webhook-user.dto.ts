import { WebhookRole } from '../../../../../../../../node_modules/@prisma/webhook-client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateWebhookUserDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  externalTenantId!: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  externalUserId!: string;
  @ApiProperty({
    enum: WebhookRole,
    enumName: 'WebhookRole',
  })
  @IsNotEmpty()
  @IsEnum(WebhookRole)
  userRole!: WebhookRole;
}
