import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { isObservable, Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { AuthEnvironments } from '../auth.environments';
import { AuthCacheService } from '../services/auth-cache.service';
import { AuthTimezoneService, TData } from '../services/auth-timezone.service';
import { AuthAsyncLocalStorageData } from '../types/auth-async-local-storage-data';
import { AuthRequest } from '../types/auth-request';

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
    const store = { authTimezone: req.authUser?.timezone || 0 };
    const wrapObservableForWorkWithAsyncLocalStorage = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      observable: Observable<any>
    ) =>
      new Observable((observer) => {
        this.asyncLocalStorage.run(store, () => {
          observable.subscribe({
            next: (res) => observer.next(res),
            error: (error) => observer.error(error),
            complete: () => observer.complete(),
          });
        });
      });

    const run = () => {
      const result = this.asyncLocalStorage.run(store, () => next.handle());

      if (isObservable(result)) {
        return wrapObservableForWorkWithAsyncLocalStorage(result).pipe(
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
            return wrapObservableForWorkWithAsyncLocalStorage(data).pipe(
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

    return run();
  }
}
