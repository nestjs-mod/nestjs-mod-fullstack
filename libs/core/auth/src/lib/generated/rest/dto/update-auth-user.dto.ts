import { AuthRole } from '../../../../../../../../node_modules/@prisma/auth-client';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

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
}
