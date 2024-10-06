import { ApiProperty } from '@nestjs/swagger';

export class StatusResponse {
  @ApiProperty({ type: String })
  message!: string;
}
