import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { getText } from 'nestjs-translates';

export enum AuthErrorEnum {
  COMMON = 'AUTH-000',
  FORBIDDEN = 'AUTH-001',
  USER_NOT_FOUND = 'AUTH-002',
}

export const AUTH_ERROR_ENUM_TITLES: Record<AuthErrorEnum, string> = {
  [AuthErrorEnum.COMMON]: getText('Auth error'),
  [AuthErrorEnum.FORBIDDEN]: getText('Forbidden'),
  [AuthErrorEnum.USER_NOT_FOUND]: getText('User not found'),
};

export class AuthError<T = unknown> extends Error {
  @ApiProperty({
    type: String,
    description: Object.entries(AUTH_ERROR_ENUM_TITLES)
      .map(([key, value]) => `${value} (${key})`)
      .join(', '),
    example: AUTH_ERROR_ENUM_TITLES[AuthErrorEnum.COMMON],
  })
  override message: string;

  @ApiProperty({
    enum: AuthErrorEnum,
    enumName: 'AuthErrorEnum',
    example: AuthErrorEnum.COMMON,
  })
  code = AuthErrorEnum.COMMON;

  @ApiPropertyOptional({ type: Object })
  metadata?: T;

  constructor(
    message?: string | AuthErrorEnum,
    code?: AuthErrorEnum,
    metadata?: T
  ) {
    const messageAsCode = Boolean(
      message && Object.values(AuthErrorEnum).includes(message as AuthErrorEnum)
    );
    const preparedCode = messageAsCode ? (message as AuthErrorEnum) : code;
    const preparedMessage = preparedCode
      ? AUTH_ERROR_ENUM_TITLES[preparedCode]
      : message;

    code = preparedCode || AuthErrorEnum.COMMON;
    message = preparedMessage || AUTH_ERROR_ENUM_TITLES[code];

    super(message);

    this.code = code;
    this.message = message;
    this.metadata = metadata;
  }
}
