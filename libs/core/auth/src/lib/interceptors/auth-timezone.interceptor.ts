import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { addHours } from 'date-fns';
import { isObservable, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthRequest } from '../types/auth-request';

type TObject = Record<string, unknown>;

type TData = unknown | unknown[] | TObject | TObject[];

@Injectable()
export class AuthTimezoneInterceptor implements NestInterceptor<TData, TData> {
  private logger = new Logger(AuthTimezoneInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler) {
    const req: AuthRequest = getRequestFromExecutionContext(context);
    const timezone = req.authUser?.timezone;

    const result = next.handle();

    if (isObservable(result)) {
      return result.pipe(
        map((data) => {
          return this.convertObject(data, timezone);
        })
      );
    }
    if (result instanceof Promise && typeof result?.then === 'function') {
      return result.then(async (data) => {
        if (isObservable(result)) {
          return result.pipe(map((data) => this.convertObject(data, timezone)));
        } else {
          // need for correct map types with base method of NestInterceptor
          return this.convertObject(data, timezone) as Observable<TData>;
        }
      });
    }
    // need for correct map types with base method of NestInterceptor
    return this.convertObject(result, timezone) as Observable<TData>;
  }

  convertObject(
    data: TData,
    timezone: number | null | undefined,
    depth = 10
  ): TData {
    if (depth === 0) {
      return data;
    }
    if (Array.isArray(data)) {
      const newArray: unknown[] = [];
      for (const item of data) {
        newArray.push(this.convertObject(item, timezone, depth - 1));
      }
      return newArray;
    }
    if (
      (typeof data === 'string' ||
        typeof data === 'number' ||
        typeof data === 'function') &&
      !this.isValidStringDate(data) &&
      !this.isValidDate(data)
    ) {
      return data;
    }
    try {
      if (data && timezone) {
        if (this.isValidStringDate(data) || this.isValidDate(data)) {
          if (this.isValidStringDate(data) && typeof data === 'string') {
            data = new Date(data);
          }
          data = addHours(data as Date, timezone);
        } else {
          const keys = Object.keys(data);
          for (const key of keys) {
            (data as TObject)[key] = this.convertObject(
              (data as TObject)[key],
              timezone,
              depth - 1
            );
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(err, err.stack);
      }
    }
    return data;
  }

  private isValidStringDate(data: string | number | unknown) {
    return (
      typeof data === 'string' &&
      data.length === '0000-00-00T00:00:00.000Z'.length &&
      !isNaN(+new Date(data))
    );
  }

  private isValidDate(data: string | number | Date | object | unknown) {
    if (data && typeof data === 'object') {
      return !isNaN(+data);
    }
    return typeof data === 'string' && !isNaN(+new Date(data));
  }
}
