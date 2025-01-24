import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthCacheService } from '../services/auth-cache.service';
import { AuthTimezoneService, TData } from '../services/auth-timezone.service';
import { AuthEnvironments } from '../auth.environments';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AuthAsyncLocalStorageData } from '../types/auth-async-local-storage-data';
export declare class AuthTimezoneInterceptor
  implements NestInterceptor<TData, TData>
{
  private readonly authTimezoneService;
  private readonly authCacheService;
  private readonly authEnvironments;
  private readonly asyncLocalStorage;
  constructor(
    authTimezoneService: AuthTimezoneService,
    authCacheService: AuthCacheService,
    authEnvironments: AuthEnvironments,
    asyncLocalStorage: AsyncLocalStorage<AuthAsyncLocalStorageData>
  );
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> | Promise<Observable<unknown>>;
}
