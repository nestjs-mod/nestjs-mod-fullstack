import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindManyArgs {
  @ApiPropertyOptional({ type: Number })
  curPage?: number;

  @ApiPropertyOptional({ type: Number })
  perPage?: number;

  @ApiPropertyOptional({ type: String })
  searchText?: string;
}
