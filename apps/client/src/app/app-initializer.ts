import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  AppRestService,
  AuthorizerRestService,
  FilesRestService,
  TimeRestService,
  WebhookRestService,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { AuthService, TokensService } from '@nestjs-mod-fullstack/auth-angular';
import {
  catchError,
  map,
  merge,
  mergeMap,
  of,
  Subscription,
  tap,
  throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppInitializer {
  private subscribeToTokenUpdatesSubscription?: Subscription;

  constructor(
    private readonly authorizerRestService: AuthorizerRestService,
    private readonly appRestService: AppRestService,
    private readonly webhookRestService: WebhookRestService,
    private readonly timeRestService: TimeRestService,
    private readonly authService: AuthService,
    private readonly filesRestService: FilesRestService,
    private readonly translocoService: TranslocoService,
    private readonly tokensService: TokensService
  ) {}

  resolve() {
    this.subscribeToTokenUpdates();
    return (
      this.authService.getAuthorizerClientID()
        ? of(null)
        : this.authorizerRestService
            .authorizerControllerGetAuthorizerClientID()
            .pipe(
              map(({ clientID }) => {
                this.authService.setAuthorizerClientID(clientID);
                return null;
              })
            )
    ).pipe(
      mergeMap(() => {
        const lang =
          localStorage.getItem('activeLang') ||
          this.translocoService.getDefaultLang();

        this.translocoService.setActiveLang(lang);
        localStorage.setItem('activeLang', lang);

        return this.translocoService.load(lang);
      }),
      mergeMap(() => this.authService.refreshToken()),
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
      this.tokensService.tokens$,
      this.translocoService.langChanges$
    )
      .pipe(
        tap(() => {
          const authorizationHeaders =
            this.authService.getAuthorizationHeaders();
          if (authorizationHeaders) {
            this.appRestService.defaultHeaders = new HttpHeaders(
              authorizationHeaders
            );
            this.webhookRestService.defaultHeaders = new HttpHeaders(
              authorizationHeaders
            );
            this.authorizerRestService.defaultHeaders = new HttpHeaders(
              authorizationHeaders
            );
            this.filesRestService.defaultHeaders = new HttpHeaders(
              authorizationHeaders
            );
            this.timeRestService.defaultHeaders = new HttpHeaders(
              authorizationHeaders
            );
          }
        })
      )
      .subscribe();
  }
}
