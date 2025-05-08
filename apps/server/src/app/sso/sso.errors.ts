import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { getText } from 'nestjs-translates';

export enum SsoErrorEnum {
  COMMON = 'SUPABASE-000',
  FORBIDDEN = 'SUPABASE-001',
  UNAUTHORIZED = 'SUPABASE-002',
}

export const SUPABASE_ERROR_ENUM_TITLES: Record<SsoErrorEnum, string> = {
  [SsoErrorEnum.COMMON]: getText('Sso error'),
  [SsoErrorEnum.FORBIDDEN]: getText('Forbidden'),
  [SsoErrorEnum.UNAUTHORIZED]: getText('Unauthorized'),
};

export class SsoError<T = unknown> extends Error {
  @ApiProperty({
    type: String,
    description: Object.entries(SUPABASE_ERROR_ENUM_TITLES)
      .map(([key, value]) => `${value} (${key})`)
      .join(', '),
    example: SUPABASE_ERROR_ENUM_TITLES[SsoErrorEnum.COMMON],
  })
  override message: string;

  @ApiProperty({
    enum: SsoErrorEnum,
    enumName: 'SsoErrorEnum',
    example: SsoErrorEnum.COMMON,
  })
  code = SsoErrorEnum.COMMON;

  @ApiPropertyOptional({ type: Object })
  metadata?: T;

  constructor(
    message?: string | SsoErrorEnum,
    code?: SsoErrorEnum,
    metadata?: T
  ) {
    const messageAsCode = Boolean(
      message && Object.values(SsoErrorEnum).includes(message as SsoErrorEnum)
    );
    const preparedCode = messageAsCode ? (message as SsoErrorEnum) : code;
    const preparedMessage =
      messageAsCode && preparedCode
        ? SUPABASE_ERROR_ENUM_TITLES[preparedCode]
        : message;

    code = preparedCode || SsoErrorEnum.COMMON;
    message = preparedMessage || SUPABASE_ERROR_ENUM_TITLES[code];

    super(message);

    this.code = code;
    this.message = message;
    this.metadata = metadata;
  }
}
