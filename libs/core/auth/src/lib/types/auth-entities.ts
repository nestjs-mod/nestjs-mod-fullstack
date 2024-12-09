import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/auth-client';

export class AuthEntities {
  @ApiProperty({
    enum: Prisma.AuthUserScalarFieldEnum,
    enumName: 'AuthUserScalarFieldEnum',
  })
  authUser!: Prisma.AuthUserScalarFieldEnum;
}
