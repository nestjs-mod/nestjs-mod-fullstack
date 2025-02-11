import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { isObservable, Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { AuthCacheService } from '../services/auth-cache.service';
import { AuthTimezoneService, TData } from '../services/auth-timezone.service';
import { AuthRequest } from '../types/auth-request';
import { AuthEnvironments } from '../auth.environments';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AuthAsyncLocalStorageData } from '../types/auth-async-local-storage-data';

@Injectable()
export class AuthTimezoneInterceptor implements NestInterceptor<TData, TData> {
  constructor(
    private readonly authTimezoneService: AuthTimezoneService,
    private readonly authCacheService: AuthCacheService,
    private readonly authEnvironments: AuthEnvironments,
    private readonly asyncLocalStorage: AsyncLocalStorage<AuthAsyncLocalStorageData>
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const req: AuthRequest = getRequestFromExecutionContext(context);
    const userId = req.authUser?.externalUserId;

    if (!this.authEnvironments.useInterceptors) {
      return next.handle();
    }

    if (!userId) {
      return next.handle();
    }

    const run = () => {
      const result = next.handle();

      if (isObservable(result)) {
        return result.pipe(
          concatMap(async (data) => {
            const user =
              await this.authCacheService.getCachedUserByExternalUserId(userId);
            const newData = this.authTimezoneService.convertObject(
              data,
              user?.timezone
            );

            return newData;
          })
        );
      }
      if (result instanceof Promise && typeof result?.then === 'function') {
        return result.then(async (data) => {
          if (isObservable(data)) {
            return data.pipe(
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
    };

    if (!this.authEnvironments.usePipes) {
      return run();
    }

    return this.asyncLocalStorage.run(
      { authTimezone: req.authUser?.timezone || 0 },
      () => run()
    );
  }
}
