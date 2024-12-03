import { ErrorHandler, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { WebhookErrorInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  constructor(
    private nzNotificationService: NzNotificationService,
    private translocoService: TranslocoService
  ) {}

  handleError(err: { error: WebhookErrorInterface }) {
    if ('error' in err && 'code' in err['error']) {
      this.nzNotificationService.error(
        err.error.code,
        this.translocoService.translate(err.error.message)
      );
    } else {
      console.log(err);
    }
  }
}
