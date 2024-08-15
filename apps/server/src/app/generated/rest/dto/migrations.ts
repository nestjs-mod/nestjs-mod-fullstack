import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class migrations {
  @ApiProperty({ type: Number })
  installed_rank: number;

  @ApiPropertyOptional({ type: String })
  version?: string;

  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: String })
  script: string;

  @ApiPropertyOptional({ type: Number })
  checksum?: number;

  @ApiProperty({ type: String })
  installed_by: string;

  @ApiProperty({ type: Date })
  installed_on: Date;

  @ApiProperty({ type: Number })
  execution_time: number;

  @ApiProperty({ type: Boolean })
  success: boolean;
}
