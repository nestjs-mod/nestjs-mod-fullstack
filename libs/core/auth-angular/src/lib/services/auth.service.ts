import { Inject, Injectable, Optional } from '@angular/core';
import {
  AuthToken,
  LoginInput,
  SignupInput,
  UpdateProfileInput,
  User,
} from '@authorizerdev/authorizer-js';
import { mapGraphqlErrors } from '@nestjs-mod-fullstack/common-angular';
import {
  BehaviorSubject,
  catchError,
  from,
  map,
  mergeMap,
  of,
  tap,
} from 'rxjs';
import {
  AUTH_CONFIGURATION_TOKEN,
  AuthConfiguration,
} from './auth.configuration';
import { AuthorizerService } from './authorizer.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  profile$ = new BehaviorSubject<User | undefined>(undefined);
  tokens$ = new BehaviorSubject<AuthToken | undefined>(undefined);

  constructor(
    private readonly authorizerService: AuthorizerService,
    @Optional()
    @Inject(AUTH_CONFIGURATION_TOKEN)
    private readonly authConfiguration?: AuthConfiguration
  ) {}

  getAuthorizerClientID() {
    return this.authorizerService.config.clientID;
  }

  setAuthorizerClientID(clientID: string) {
    this.authorizerService.config.clientID = clientID;
  }

  signUp(data: SignupInput) {
    return from(
      this.authorizerService.signup({
        ...data,
        email: data.email?.toLowerCase(),
      })
    ).pipe(
      mapGraphqlErrors(),
      map((result) => {
        this.setProfileAndTokens(result);
        return {
          profile: result?.user,
          tokens: this.tokens$.value,
        };
      })
    );
  }

  updateProfile(data: UpdateProfileInput) {
    const oldProfile = this.profile$.value;
    return (
      this.authConfiguration?.beforeUpdateProfile
        ? this.authConfiguration.beforeUpdateProfile(data)
        : of(data)
    ).pipe(
      mergeMap((data) =>
        from(
          this.authorizerService.updateProfile({
            ...data,
          })
        )
      ),
      mapGraphqlErrors(),
      mergeMap(() => this.authorizerService.getProfile()),
      mapGraphqlErrors(),
      tap((result) => this.setProfile(result)),
      mergeMap((updatedProfile) =>
        this.authConfiguration?.afterUpdateProfile
          ? this.authConfiguration.afterUpdateProfile({
              new: updatedProfile,
              old: oldProfile,
            })
          : of({
              new: updatedProfile,
            })
      )
    );
  }

  signIn(data: LoginInput) {
    return from(
      this.authorizerService.login({
        ...data,
        email: data.email?.toLowerCase(),
      })
    ).pipe(
      mapGraphqlErrors(),
      map((result) => {
        this.setProfileAndTokens(result);
        return {
          profile: result?.user,
          tokens: this.tokens$.value,
        };
      })
    );
  }

  signOut() {
    return from(
      this.authorizerService.logout(this.getAuthorizationHeaders())
    ).pipe(
      mapGraphqlErrors(),
      tap(() => {
        this.clearProfileAndTokens();
      })
    );
  }

  refreshToken() {
    return from(this.authorizerService.browserLogin()).pipe(
      mapGraphqlErrors(),
      tap((result) => {
        this.setProfileAndTokens(result);
      }),
      catchError((err) => {
        console.error(err);
        this.clearProfileAndTokens();
        return of(null);
      })
    );
  }

  clearProfileAndTokens() {
    this.setProfileAndTokens({} as AuthToken);
  }

  setProfileAndTokens(result: AuthToken | undefined) {
    this.tokens$.next(result as AuthToken);
    this.setProfile(result?.user);
  }

  getAuthorizationHeaders() {
    if (!this.tokens$.value?.access_token) {
      return undefined;
    }
    return {
      Authorization: `Bearer ${this.tokens$.value.access_token}`,
    };
  }

  setProfile(result: User | undefined) {
    this.profile$.next(result);
  }
}