import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  AppRestService,
  AuthRestService,
  TimeRestService,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import {
  AuthActiveLangService,
  AuthService,
  TokensService,
} from '@nestjs-mod-fullstack/auth-angular';
import { FilesRestSdkAngularService } from '@nestjs-mod/files-afat';
import { WebhookRestSdkAngularService } from '@nestjs-mod/webhook-afat';
import { catchError, merge, mergeMap, of, Subscription, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppInitializer {
  private subscribeToTokenUpdatesSubscription?: Subscription;

  constructor(
    private readonly appRestService: AppRestService,
    private readonly webhookRestSdkAngularService: WebhookRestSdkAngularService,
    private readonly timeRestService: TimeRestService,
    private readonly authService: AuthService,
    private readonly filesRestSdkAngularService: FilesRestSdkAngularService,
    private readonly authRestService: AuthRestService,
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
    if (authorizationHeaders) {
      this.appRestService.defaultHeaders = new HttpHeaders(
        authorizationHeaders
      );
      this.timeRestService.defaultHeaders = new HttpHeaders(
        authorizationHeaders
      );
      this.authRestService.defaultHeaders = new HttpHeaders(
        authorizationHeaders
      );
      this.webhookRestSdkAngularService.updateHeaders(authorizationHeaders);
      this.filesRestSdkAngularService.updateHeaders(authorizationHeaders);
    }
  }
}
