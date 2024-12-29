import { SERVER_TIMEZONE_OFFSET } from '@nestjs-mod-fullstack/common';
import { Injectable, PipeTransform } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AuthEnvironments } from '../auth.environments';
import { AuthTimezoneService } from '../services/auth-timezone.service';
import { AuthAsyncLocalStorageData } from '../types/auth-async-local-storage-data';

@Injectable()
export class AuthTimezonePipe implements PipeTransform {
  constructor(
    private readonly asyncLocalStorage: AsyncLocalStorage<AuthAsyncLocalStorageData>,
    private readonly authTimezoneService: AuthTimezoneService,
    private readonly authEnvironments: AuthEnvironments
  ) {}

  transform(value: unknown) {
    if (!this.authEnvironments.usePipes) {
      return value;
    }
    const result = this.authTimezoneService.convertObject(
      value,
      -1 * (this.asyncLocalStorage.getStore()?.authTimezone || 0) -
        SERVER_TIMEZONE_OFFSET
    );
    return result;
  }
}
