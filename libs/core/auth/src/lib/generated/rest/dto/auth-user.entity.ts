import { AuthRole } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';

export class AuthUser {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
  })
  externalUserId!: string;
  @ApiProperty({
    enum: AuthRole,
    enumName: 'AuthRole',
  })
  userRole!: AuthRole;
  @ApiProperty({
    type: 'number',
    format: 'float',
    nullable: true,
  })
  timezone!: number | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt!: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt!: Date;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  lang!: string | null;
}
