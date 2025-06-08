import { AuthRole } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAuthUserDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  externalUserId?: string;
  @ApiProperty({
    enum: AuthRole,
    enumName: 'AuthRole',
    required: false,
  })
  @IsOptional()
  @IsEnum(AuthRole)
  userRole?: AuthRole;
  @ApiProperty({
    type: 'number',
    format: 'float',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  timezone?: number | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  lang?: string | null;
}
