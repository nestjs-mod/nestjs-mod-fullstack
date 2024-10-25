import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  DefaultRestService,
  WebhookUserObjectInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import {
  WebhookAuthCredentials,
  WebhookAuthService,
} from '@nestjs-mod-fullstack/webhook-angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@UntilDestroy()
@Component({
  standalone: true,
  imports: [
    RouterModule,
    NzMenuModule,
    NzLayoutModule,
    NzTypographyModule,
    AsyncPipe,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'client';
  serverMessage$ = new BehaviorSubject('');
  webhookAuthCredentials$: Observable<WebhookAuthCredentials>;
  webhookUser$: Observable<WebhookUserObjectInterface | null>;

  constructor(
    private readonly defaultRestService: DefaultRestService,
    private readonly webhookAuthService: WebhookAuthService,
    private readonly router: Router
  ) {
    this.webhookAuthCredentials$ =
      this.webhookAuthService.webhookAuthCredentialsUpdates();
    this.webhookUser$ = this.webhookAuthService.webhookUserUpdates();
  }

  ngOnInit() {
    this.defaultRestService
      .appControllerGetData()
      .pipe(
        tap((result) => this.serverMessage$.next(result.message)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  signOut() {
    this.webhookAuthService.setWebhookAuthCredentials({
      xExternalTenantId: undefined,
      xExternalUserId: undefined,
    });
    this.router.navigate(['/home']);
  }
}
