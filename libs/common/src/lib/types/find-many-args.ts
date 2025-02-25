import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumberString, IsOptional } from 'class-validator';

export class FindManyArgs {
  @ApiPropertyOptional({ type: Number })
  @IsNumberString()
  @IsOptional()
  @Type(() => Number)
  curPage?: number;

  @ApiPropertyOptional({ type: Number })
  @IsNumberString()
  @IsOptional()
  @Type(() => Number)
  perPage?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  searchText?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  sort?: string;
}
