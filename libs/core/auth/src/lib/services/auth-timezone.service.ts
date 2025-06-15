import { Injectable, Logger } from '@nestjs/common';
import { addHours, isValid } from 'date-fns';

export type TObject = Record<string, unknown>;

export type TData = unknown | unknown[] | TObject | TObject[];

@Injectable()
export class AuthTimezoneService {
  private logger = new Logger(AuthTimezoneService.name);

  convertObject(
    data: TData,
    timezone: number | null | undefined,
    depth = 10,
  ): TData {
    if (depth === 0) {
      return data;
    }
    if (Array.isArray(data)) {
      const newData = this.convertArray(data, timezone, depth);
      return newData;
    }
    if (
      (typeof data === 'string' ||
        typeof data === 'number' ||
        typeof data === 'function') &&
      !this.isValidDate(data) &&
      !this.isValidStringDate(data)
    ) {
      return data;
    }
    try {
      if (data) {
        if (this.isValidDate(data)) {
          data = this.convertPrimitive(data, timezone);
        } else {
          this.convertComplexObject(data, timezone, depth);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
    }
    return data;
  }

  convertDatesInObjectToDateStrings(data: TData, depth = 10): TData {
    if (depth === 0) {
      return data;
    }
    if (Array.isArray(data)) {
      const newArray: unknown[] = [];
      for (const item of data) {
        newArray.push(this.convertDatesInObjectToDateStrings(item, depth - 1));
      }
      return newArray;
    }
    if (
      (typeof data === 'string' ||
        typeof data === 'number' ||
        typeof data === 'function') &&
      !this.isValidDate(data) &&
      !this.isValidStringDate(data)
    ) {
      return data;
    }
    try {
      if (data) {
        if (this.isValidDate(data)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data = (data as any)['toISOString']
            ? (data as Date).toISOString()
            : data;
        } else {
          const keys = Object.keys(data as object);
          for (const key of keys) {
            (data as TObject)[key] = this.convertDatesInObjectToDateStrings(
              (data as TObject)[key],
              depth - 1,
            );
          }
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
    }
    return data;
  }

  private convertComplexObject(
    data: TData,
    timezone: number | null | undefined,
    depth: number,
  ) {
    const keys = Object.keys(data as object);
    for (const key of keys) {
      (data as TObject)[key] = this.convertObject(
        (data as TObject)[key],
        timezone,
        depth - 1,
      );
    }
  }

  private convertPrimitive(data: unknown, timezone: number | null | undefined) {
    if (this.isValidStringDate(data) && typeof data === 'string') {
      data = new Date(data);
    }
    if (this.isValidDate(data)) {
      data = data as Date;
    }
    data = addHours(data as Date, timezone || 0);
    return data;
  }

  private convertArray(
    data: unknown[] | TObject[],
    timezone: number | null | undefined,
    depth: number,
  ) {
    const newArray: unknown[] = [];
    for (const item of data) {
      newArray.push(this.convertObject(item, timezone, depth - 1));
    }
    return newArray;
  }

  private isValidStringDate(data: string | number | unknown) {
    return typeof data === 'string' && isNaN(+data) && isValid(new Date(data));
  }

  private isValidDate(data: string | number | Date | object | unknown) {
    if (data && typeof data === 'object' && isValid(data)) {
      return true;
    }
    return typeof data === 'string' && isNaN(+data) && isValid(new Date(data));
  }
}
