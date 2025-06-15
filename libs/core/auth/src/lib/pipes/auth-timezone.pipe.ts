import { TIMEZONE_OFFSET } from '@nestjs-mod/misc';
import { Injectable, PipeTransform } from '@nestjs/common';
import { AuthStaticEnvironments } from '../auth.environments';
import { AuthTimezoneService } from '../services/auth-timezone.service';
import { AuthAsyncLocalStorageContext } from '../types/auth-async-local-storage-data';

@Injectable()
export class AuthTimezonePipe implements PipeTransform {
  constructor(
    private readonly asyncLocalStorage: AuthAsyncLocalStorageContext,
    private readonly authTimezoneService: AuthTimezoneService,
    private readonly authStaticEnvironments: AuthStaticEnvironments,
  ) {}

  transform(value: unknown) {
    if (!this.authStaticEnvironments.usePipes) {
      return value;
    }

    const result = this.authTimezoneService.convertObject(
      value,
      -1 * (this.asyncLocalStorage.get()?.authTimezone || 0) - TIMEZONE_OFFSET,
    );

    return this.authTimezoneService.convertDatesInObjectToDateStrings(result);
  }
}
