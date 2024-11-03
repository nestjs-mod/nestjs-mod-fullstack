import { HttpHeaders } from '@angular/common/http';
import {
  DefaultRestService,
  WebhookRestService,
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
    private readonly defaultRestService: DefaultRestService,
    private readonly webhookRestService: WebhookRestService,
    private readonly authService: AuthService
  ) {}

  resolve() {
    this.subscribeToTokenUpdates();
    return (
      this.authService.getAuthorizerClientID()
        ? of(null)
        : this.defaultRestService
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
            this.defaultRestService.defaultHeaders = new HttpHeaders(
              authorizationHeaders
            );
            this.webhookRestService.defaultHeaders = new HttpHeaders(
              authorizationHeaders
            );
          }
        })
      )
      .subscribe();
  }
}
