import { PipeTransform } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AuthEnvironments } from '../auth.environments';
import { AuthTimezoneService } from '../services/auth-timezone.service';
import { AuthAsyncLocalStorageData } from '../types/auth-async-local-storage-data';
export declare class AuthTimezonePipe implements PipeTransform {
    private readonly asyncLocalStorage;
    private readonly authTimezoneService;
    private readonly authEnvironments;
    constructor(asyncLocalStorage: AsyncLocalStorage<AuthAsyncLocalStorageData>, authTimezoneService: AuthTimezoneService, authEnvironments: AuthEnvironments);
    transform(value: unknown): unknown;
}
