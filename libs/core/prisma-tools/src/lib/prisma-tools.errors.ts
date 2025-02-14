import { getText } from 'nestjs-translates';
export enum DatabaseErrorEnum {
  COMMON = 'DB-000',
  UNHANDLED_ERROR = 'DB-001',
  UNIQUE_ERROR = 'DB-002',
  INVALID_IDENTIFIER = 'DB-003',
  INVALID_LINKED_TABLE_IDENTIFIER = 'DB-004',
  DATABASE_QUERY_ERROR = 'DB-005',
  NOT_FOUND_ERROR = 'DB-006',
}

export const DATABASE_ERROR_ENUM_TITLES: Record<DatabaseErrorEnum, string> = {
  [DatabaseErrorEnum.COMMON]: getText('Common db error'),
  [DatabaseErrorEnum.UNHANDLED_ERROR]: getText('Unhandled error'),
  [DatabaseErrorEnum.UNIQUE_ERROR]: getText('Unique error'),
  [DatabaseErrorEnum.INVALID_IDENTIFIER]: getText('Invalid identifier'),
  [DatabaseErrorEnum.INVALID_LINKED_TABLE_IDENTIFIER]: getText(
    'Invalid linked table identifier'
  ),
  [DatabaseErrorEnum.DATABASE_QUERY_ERROR]: getText('Database query error'),
  [DatabaseErrorEnum.NOT_FOUND_ERROR]: getText('Not found error'),
};

export class DatabaseError<T = unknown> extends Error {
  code = DatabaseErrorEnum.COMMON;
  metadata?: T;

  constructor(
    message?: string | DatabaseErrorEnum,
    code?: DatabaseErrorEnum,
    metadata?: T
  ) {
    const messageAsCode = Boolean(
      message &&
        Object.values(DatabaseErrorEnum).includes(message as DatabaseErrorEnum)
    );
    const preparedCode = messageAsCode ? (message as DatabaseErrorEnum) : code;
    const preparedMessage =
      messageAsCode && preparedCode
        ? DATABASE_ERROR_ENUM_TITLES[preparedCode]
        : message;

    code = preparedCode || DatabaseErrorEnum.COMMON;
    message = preparedMessage || DATABASE_ERROR_ENUM_TITLES[code];

    super(message);

    this.code = code;
    this.message = message;
    this.metadata = metadata;
  }
}
