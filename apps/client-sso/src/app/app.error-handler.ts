import { ErrorHandler, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  constructor(
    private nzNotificationService: NzNotificationService,
    private translocoService: TranslocoService,
  ) {}

  handleError(err: { error: { message: string; code: string } } | Error) {
    if ('error' in err && 'code' in err['error']) {
      this.nzNotificationService.error(err.error.code, this.translocoService.translate(err.error.message));
    } else {
      if ('message' in err) {
        this.nzNotificationService.error(err.message, this.translocoService.translate(err.message));
      }
      console.error(err);
    }
  }
}
