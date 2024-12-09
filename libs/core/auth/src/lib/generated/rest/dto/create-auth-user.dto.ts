import { AuthRole } from '../../../../../../../../node_modules/@prisma/auth-client';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAuthUserDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  externalUserId!: string;
  @ApiProperty({
    enum: AuthRole,
    enumName: 'AuthRole',
  })
  @IsNotEmpty()
  userRole!: AuthRole;
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
