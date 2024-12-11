import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { isObservable, Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { AuthCacheService } from '../services/auth-cache.service';
import { AuthTimezoneService, TData } from '../services/auth-timezone.service';
import { AuthRequest } from '../types/auth-request';

@Injectable()
export class AuthTimezoneInterceptor implements NestInterceptor<TData, TData> {
  private logger = new Logger(AuthTimezoneInterceptor.name);

  constructor(
    private readonly authTimezoneService: AuthTimezoneService,
    private readonly authCacheService: AuthCacheService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const req: AuthRequest = getRequestFromExecutionContext(context);
    const userId = req.authUser?.externalUserId;
    const result = next.handle();

    if (!userId) {
      return result;
    }

    if (isObservable(result)) {
      return result.pipe(
        concatMap(async (data) => {
          const user =
            await this.authCacheService.getCachedUserByExternalUserId(userId);
          return this.authTimezoneService.convertObject(data, user?.timezone);
        })
      );
    }
    if (result instanceof Promise && typeof result?.then === 'function') {
      return result.then(async (data) => {
        if (isObservable(result)) {
          return result.pipe(
            concatMap(async (data) => {
              const user =
                await this.authCacheService.getCachedUserByExternalUserId(
                  userId
                );
              return this.authTimezoneService.convertObject(
                data,
                user?.timezone
              );
            })
          );
        } else {
          const user =
            await this.authCacheService.getCachedUserByExternalUserId(userId);
          // need for correct map types with base method of NestInterceptor
          return this.authTimezoneService.convertObject(
            data,
            user?.timezone
          ) as Observable<TData>;
        }
      });
    }
    // need for correct map types with base method of NestInterceptor
    return this.authTimezoneService.convertObject(
      result,
      req.authUser?.timezone
    ) as Observable<TData>;
  }
}
