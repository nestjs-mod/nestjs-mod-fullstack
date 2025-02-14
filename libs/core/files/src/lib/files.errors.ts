import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { getText } from 'nestjs-translates';

export enum FilesErrorEnum {
  COMMON = 'FILES-000',
  FORBIDDEN = 'FILES-001',
}

export const FILES_ERROR_ENUM_TITLES: Record<FilesErrorEnum, string> = {
  [FilesErrorEnum.COMMON]: getText('Files error'),
  [FilesErrorEnum.FORBIDDEN]: getText('Forbidden'),
};

export class FilesError<T = unknown> extends Error {
  @ApiProperty({
    type: String,
    description: Object.entries(FILES_ERROR_ENUM_TITLES)
      .map(([key, value]) => `${value} (${key})`)
      .join(', '),
    example: FILES_ERROR_ENUM_TITLES[FilesErrorEnum.COMMON],
  })
  override message: string;

  @ApiProperty({
    enum: FilesErrorEnum,
    enumName: 'FilesErrorEnum',
    example: FilesErrorEnum.COMMON,
  })
  code = FilesErrorEnum.COMMON;

  @ApiPropertyOptional({ type: Object })
  metadata?: T;

  constructor(
    message?: string | FilesErrorEnum,
    code?: FilesErrorEnum,
    metadata?: T
  ) {
    const messageAsCode = Boolean(
      message &&
        Object.values(FilesErrorEnum).includes(message as FilesErrorEnum)
    );
    const preparedCode = messageAsCode ? (message as FilesErrorEnum) : code;
    const preparedMessage =
      messageAsCode && preparedCode
        ? FILES_ERROR_ENUM_TITLES[preparedCode]
        : message;

    code = preparedCode || FilesErrorEnum.COMMON;
    message = preparedMessage || FILES_ERROR_ENUM_TITLES[code];

    super(message);

    this.code = code;
    this.message = message;
    this.metadata = metadata;
  }
}
