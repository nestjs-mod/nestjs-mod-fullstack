import { ApiProperty } from '@nestjs/swagger';

export class AppData {
  @ApiProperty({ type: String })
  message!: string;
}
