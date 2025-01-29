import { HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  AppRestService,
  AuthRestService,
  FilesRestService,
  TimeRestService,
  WebhookRestService,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import {
  AUTH_CONFIGURATION_TOKEN,
  AuthActiveLangService,
  AuthConfiguration,
  AuthService,
  TokensService,
} from '@nestjs-mod-fullstack/auth-angular';
import { ActiveLangService } from '@nestjs-mod-fullstack/common-angular';
import {
  catchError,
  map,
  merge,
  mergeMap,
  Subscription,
  tap,
  throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppInitializer {
  private subscribeToTokenUpdatesSubscription?: Subscription;

  constructor(
    @Inject(AUTH_CONFIGURATION_TOKEN)
    private readonly authConfiguration: AuthConfiguration,
    private readonly appRestService: AppRestService,
    private readonly webhookRestService: WebhookRestService,
    private readonly timeRestService: TimeRestService,
    private readonly authService: AuthService,
    private readonly filesRestService: FilesRestService,
    private readonly authRestService: AuthRestService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService,
    private readonly authActiveLangService: AuthActiveLangService,
    private readonly activeLangService: ActiveLangService
  ) {}

  resolve() {
    this.subscribeToTokenUpdates();
    return this.authService.refreshToken().pipe(
      mergeMap(() => this.authActiveLangService.getActiveLang()),
      mergeMap((activeLang) =>
        this.translocoService.load(activeLang).pipe(map(() => activeLang))
      ),
      tap((activeLang) => this.activeLangService.applyActiveLang(activeLang)),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      })
    );
  }

  private subscribeToTokenUpdates() {
    if (this.subscribeToTokenUpdatesSubscription) {
      this.subscribeToTokenUpdatesSubscription.unsubscribe();
      this.subscribeToTokenUpdatesSubscription = undefined;
    }
    this.subscribeToTokenUpdatesSubscription = merge(
      this.tokensService.getStream(),
      this.translocoService.langChanges$
    )
      .pipe(
        tap(() => {
          const authorizationHeaders =
            this.authConfiguration.getAuthorizationHeaders?.();
          if (authorizationHeaders) {
            this.appRestService.defaultHeaders = new HttpHeaders(
              authorizationHeaders
            );
            this.webhookRestService.defaultHeaders = new HttpHeaders(
              authorizationHeaders
            );
            this.filesRestService.defaultHeaders = new HttpHeaders(
              authorizationHeaders
            );
            this.timeRestService.defaultHeaders = new HttpHeaders(
              authorizationHeaders
            );
            this.authRestService.defaultHeaders = new HttpHeaders(
              authorizationHeaders
            );
          }
        })
      )
      .subscribe();
  }
}
