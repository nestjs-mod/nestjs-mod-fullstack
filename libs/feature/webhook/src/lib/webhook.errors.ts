import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WebhookErrorEnum {
  COMMON = 'WEBHOOK-000',
  FORBIDDEN = 'WEBHOOK-001',
  EXTERNAL_USER_ID_NOT_SET = 'WEBHOOK-002',
  EXTERNAL_TENANT_ID_NOT_SET = 'WEBHOOK-003',
  USER_NOT_FOUND = 'WEBHOOK-004',
  EVENT_NOT_FOUND = 'WEBHOOK-005',
}

export const WEBHOOK_ERROR_ENUM_TITLES: Record<WebhookErrorEnum, string> = {
  [WebhookErrorEnum.COMMON]: 'Webhook error',
  [WebhookErrorEnum.EXTERNAL_TENANT_ID_NOT_SET]: 'Tenant ID not set',
  [WebhookErrorEnum.EXTERNAL_USER_ID_NOT_SET]: 'User ID not set',
  [WebhookErrorEnum.FORBIDDEN]: 'Forbidden',
  [WebhookErrorEnum.USER_NOT_FOUND]: 'User not found',
  [WebhookErrorEnum.EVENT_NOT_FOUND]: 'Event not found',
};

export class WebhookError<T = unknown> extends Error {
  @ApiProperty({
    type: String,
    description: Object.entries(WEBHOOK_ERROR_ENUM_TITLES)
      .map(([key, value]) => `${value} (${key})`)
      .join(', '),
    example: WEBHOOK_ERROR_ENUM_TITLES[WebhookErrorEnum.COMMON],
  })
  override message: string;

  @ApiProperty({
    enum: WebhookErrorEnum,
    enumName: 'WebhookErrorEnum',
    example: WebhookErrorEnum.COMMON,
  })
  code = WebhookErrorEnum.COMMON;

  @ApiPropertyOptional({ type: Object })
  metadata?: T;

  constructor(
    message?: string | WebhookErrorEnum,
    code?: WebhookErrorEnum,
    metadata?: T
  ) {
    const messageAsCode = Boolean(
      message &&
        Object.values(WebhookErrorEnum).includes(message as WebhookErrorEnum)
    );
    const preparedCode = messageAsCode ? (message as WebhookErrorEnum) : code;
    const preparedMessage = preparedCode
      ? WEBHOOK_ERROR_ENUM_TITLES[preparedCode]
      : message;

    code = preparedCode || WebhookErrorEnum.COMMON;
    message = preparedMessage || WEBHOOK_ERROR_ENUM_TITLES[code];

    super(message);

    this.code = code;
    this.message = message;
    this.metadata = metadata;
  }
}
