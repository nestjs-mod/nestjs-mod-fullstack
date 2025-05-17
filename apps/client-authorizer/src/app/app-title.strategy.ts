import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { APP_TITLE } from './app.constants';

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  constructor(
    private readonly titleService: Title,
    private readonly translocoService: TranslocoService
  ) {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);
    if (title !== undefined) {
      this.titleService.setTitle(
        `${this.translocoService.translate(
          APP_TITLE
        )} - ${this.translocoService.translate(title)}`
      );
    }
  }
}
