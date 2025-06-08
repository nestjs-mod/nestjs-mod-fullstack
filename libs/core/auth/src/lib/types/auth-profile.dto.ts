import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { AuthRole } from '../auth.prisma-sdk';
import { CreateAuthUserDto } from '../generated/rest/dto/create-auth-user.dto';

export class AuthProfileDto extends PickType(CreateAuthUserDto, [
  'timezone',
  'lang',
]) {
  @ApiProperty({
    enum: AuthRole,
    enumName: 'AuthRole',
    required: false,
    nullable: true,
  })
  @IsOptional()
  userRole?: AuthRole | null;
}
