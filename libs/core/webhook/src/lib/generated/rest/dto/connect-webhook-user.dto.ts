import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WebhookUserExternalTenantIdExternalUserIdUniqueInputDto {
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
}

@ApiExtraModels(WebhookUserExternalTenantIdExternalUserIdUniqueInputDto)
export class ConnectWebhookUserDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: WebhookUserExternalTenantIdExternalUserIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => WebhookUserExternalTenantIdExternalUserIdUniqueInputDto)
  externalTenantId_externalUserId?: WebhookUserExternalTenantIdExternalUserIdUniqueInputDto;
}
