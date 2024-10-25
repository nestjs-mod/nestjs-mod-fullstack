import { Injectable } from '@angular/core';
import {
  WebhookErrorInterface,
  WebhookRestService,
  WebhookUserObjectInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, catchError, of, tap, throwError } from 'rxjs';

export type WebhookAuthCredentials = {
  xExternalUserId?: string;
  xExternalTenantId?: string;
};

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class WebhookAuthService {
  private webhookAuthCredentials$ = new BehaviorSubject<WebhookAuthCredentials>(
    {}
  );
  private webhookUser$ = new BehaviorSubject<WebhookUserObjectInterface | null>(
    null
  );

  constructor(private readonly webhookRestService: WebhookRestService) {}

  getWebhookAuthCredentials() {
    return this.webhookAuthCredentials$.value;
  }

  getWebhookUser() {
    return this.webhookUser$.value;
  }

  setWebhookAuthCredentials(webhookAuthCredentials: WebhookAuthCredentials) {
    this.webhookAuthCredentials$.next(webhookAuthCredentials);
    this.loadWebhookUser().pipe(untilDestroyed(this)).subscribe();
  }

  loadWebhookUser() {
    return this.webhookRestService
      .webhookControllerProfile(
        this.getWebhookAuthCredentials().xExternalUserId,
        this.getWebhookAuthCredentials().xExternalTenantId
      )
      .pipe(
        tap((profile) => this.webhookUser$.next(profile)),
        catchError((err: { error?: WebhookErrorInterface }) => {
          if (err.error?.code === 'WEBHOOK-002') {
            return of(null);
          }
          return throwError(() => err);
        })
      );
  }

  webhookAuthCredentialsUpdates() {
    return this.webhookAuthCredentials$.asObservable();
  }

  webhookUserUpdates() {
    return this.webhookUser$.asObservable();
  }
}
