import { ApiProperty } from '@nestjs/swagger';

export class WebhookEvent {
  @ApiProperty({ type: String })
  eventName!: string;

  @ApiProperty({ type: String })
  description!: string;

  descriptionLocale?: Record<string, string>;

  @ApiProperty({ type: Object })
  example!: object;
}
