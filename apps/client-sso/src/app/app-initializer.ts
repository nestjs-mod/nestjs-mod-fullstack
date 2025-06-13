import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  AuthActiveLangService,
  AuthService,
  TokensService,
} from '@nestjs-mod-fullstack/auth-afat';
import { FullstackRestSdkAngularService } from '@nestjs-mod-fullstack/fullstack-rest-sdk-angular';
import { FilesRestSdkAngularService } from '@nestjs-mod/files-afat';
import { WebhookRestSdkAngularService } from '@nestjs-mod/webhook-afat';
import { catchError, merge, mergeMap, of, Subscription, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppInitializer {
  private subscribeToTokenUpdatesSubscription?: Subscription;

  constructor(
    private readonly fullstackRestSdkAngularService: FullstackRestSdkAngularService,
    private readonly webhookRestSdkAngularService: WebhookRestSdkAngularService,
    private readonly authService: AuthService,
    private readonly filesRestSdkAngularService: FilesRestSdkAngularService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    private readonly authActiveLangService: AuthActiveLangService
  ) {}

  resolve() {
    this.subscribeToTokenUpdates();
    return this.authService.refreshToken().pipe(
      mergeMap(() => this.authActiveLangService.refreshActiveLang(true)),
      catchError((err) => {
        console.error(err);
        return of(true);
      })
    );
  }

  private subscribeToTokenUpdates() {
    if (this.subscribeToTokenUpdatesSubscription) {
      this.subscribeToTokenUpdatesSubscription.unsubscribe();
      this.subscribeToTokenUpdatesSubscription = undefined;
    }
    this.updateHeaders();
    this.subscribeToTokenUpdatesSubscription = merge(
      this.authService.updateHeaders$.asObservable(),
      this.tokensService.getStream(),
      this.translocoService.langChanges$
    )
      .pipe(tap(() => this.updateHeaders()))
      .subscribe();
  }

  private updateHeaders() {
    const authorizationHeaders = this.authService.getAuthorizationHeaders();
    this.fullstackRestSdkAngularService.updateHeaders(
      authorizationHeaders || {}
    );
    this.webhookRestSdkAngularService.updateHeaders(authorizationHeaders || {});
    this.filesRestSdkAngularService.updateHeaders(authorizationHeaders || {});
  }
}
