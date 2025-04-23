import { Injectable } from '@angular/core';
import {
  WebhookErrorInterface,
  WebhookRestService,
  WebhookUserInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { UntilDestroy } from '@ngneat/until-destroy';
import { BehaviorSubject, catchError, of, tap, throwError } from 'rxjs';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class WebhookAuthService {
  private webhookUser$ = new BehaviorSubject<WebhookUserInterface | null>(null);

  constructor(private readonly webhookRestService: WebhookRestService) {}

  getWebhookUser() {
    return this.webhookUser$.value;
  }

  loadWebhookUser() {
    return this.webhookRestService.webhookControllerProfile().pipe(
      tap((profile) => this.webhookUser$.next(profile)),
      catchError((err: { error?: WebhookErrorInterface }) => {
        if (err.error?.code === 'WEBHOOK-002') {
          return of(null);
        }
        return throwError(() => err);
      })
    );
  }

  webhookUserUpdates() {
    return this.webhookUser$.asObservable();
  }
}
