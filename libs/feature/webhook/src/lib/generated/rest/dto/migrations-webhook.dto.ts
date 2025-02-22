import { ApiProperty } from '@nestjs/swagger';

export class MigrationsWebhookDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  installed_rank!: number;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  version!: string | null;
  @ApiProperty({
    type: 'string',
  })
  description!: string;
  @ApiProperty({
    type: 'string',
  })
  type!: string;
  @ApiProperty({
    type: 'string',
  })
  script!: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  checksum!: number | null;
  @ApiProperty({
    type: 'string',
  })
  installed_by!: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  installed_on!: Date;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  execution_time!: number;
  @ApiProperty({
    type: 'boolean',
  })
  success!: boolean;
}
