import { HttpHeaders } from '@angular/common/http';
import {
  AppRestService,
  WebhookRestService,
  AuthorizerRestService,
  FilesRestService,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { AuthService } from '@nestjs-mod-fullstack/auth-angular';
import {
  catchError,
  map,
  mergeMap,
  of,
  Subscription,
  tap,
  throwError,
} from 'rxjs';

export class AppInitializer {
  private subscribeToTokenUpdatesSubscription?: Subscription;

  constructor(
    private readonly appRestService: AppRestService,
    private readonly webhookRestService: WebhookRestService,
    private readonly authService: AuthService,
    private readonly authorizerRestService: AuthorizerRestService,
    private readonly filesRestService: FilesRestService
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
    this.subscribeToTokenUpdatesSubscription = this.authService.tokens$
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
          }
        })
      )
      .subscribe();
  }
}
