export declare enum WebhookErrorEnum {
  COMMON = 'WEBHOOK-000',
  FORBIDDEN = 'WEBHOOK-001',
  EXTERNAL_USER_ID_NOT_SET = 'WEBHOOK-002',
  EXTERNAL_TENANT_ID_NOT_SET = 'WEBHOOK-003',
  USER_NOT_FOUND = 'WEBHOOK-004',
  EVENT_NOT_FOUND = 'WEBHOOK-005',
}
export declare const WEBHOOK_ERROR_ENUM_TITLES: Record<
  WebhookErrorEnum,
  string
>;
export declare class WebhookError<T = unknown> extends Error {
  message: string;
  code: WebhookErrorEnum;
  metadata?: T;
  constructor(
    message?: string | WebhookErrorEnum,
    code?: WebhookErrorEnum,
    metadata?: T
  );
}
