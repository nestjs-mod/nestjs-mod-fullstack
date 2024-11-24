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
    nullable: true,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: WebhookUserExternalTenantIdExternalUserIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => WebhookUserExternalTenantIdExternalUserIdUniqueInputDto)
  externalTenantId_externalUserId?: WebhookUserExternalTenantIdExternalUserIdUniqueInputDto;
}
