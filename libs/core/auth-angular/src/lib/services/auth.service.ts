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
import { TokensService } from './tokens.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  profile$ = new BehaviorSubject<User | undefined>(undefined);

  constructor(
    protected readonly authorizerService: AuthorizerService,
    protected readonly tokensService: TokensService,
    @Optional()
    @Inject(AUTH_CONFIGURATION_TOKEN)
    protected readonly authConfiguration?: AuthConfiguration
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
      mergeMap((result) => {
        return this.setProfileAndTokens(result).pipe(
          map(() => ({
            profile: result?.user,
            tokens: this.tokensService.tokens$.value,
          }))
        );
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
          this.authorizerService.updateProfile(
            {
              ...data,
            },
            this.getAuthorizationHeaders()
          )
        )
      ),
      mapGraphqlErrors(),
      mergeMap(() =>
        this.authorizerService.getProfile(this.getAuthorizationHeaders())
      ),
      mapGraphqlErrors(),
      mergeMap((result) => this.setProfile(result)),
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
      mergeMap((result) => {
        return this.setProfileAndTokens(result).pipe(
          map(() => ({
            profile: result?.user,
            tokens: this.tokensService.tokens$.value,
          }))
        );
      })
    );
  }

  signOut() {
    return from(
      this.authorizerService.logout(this.getAuthorizationHeaders())
    ).pipe(
      mapGraphqlErrors(),
      mergeMap(() => {
        return this.clearProfileAndTokens();
      })
    );
  }

  refreshToken() {
    return from(this.authorizerService.browserLogin()).pipe(
      mapGraphqlErrors(),
      mergeMap((result) => {
        return this.setProfileAndTokens(result);
      }),
      catchError((err) => {
        console.error(err);
        return this.clearProfileAndTokens();
      })
    );
  }

  clearProfileAndTokens() {
    return this.setProfileAndTokens({} as AuthToken);
  }

  setProfileAndTokens(result: AuthToken | undefined) {
    this.tokensService.tokens$.next(result as AuthToken);
    return this.setProfile(result?.user);
  }

  getAuthorizationHeaders(): Record<string, string> {
    if (this.authConfiguration?.getAuthorizationHeaders) {
      return this.authConfiguration.getAuthorizationHeaders();
    }
    if (!this.tokensService.tokens$.value?.access_token) {
      return {};
    }
    return {
      Authorization: `Bearer ${this.tokensService.tokens$.value.access_token}`,
    };
  }

  setProfile(result: User | undefined) {
    this.profile$.next(result);
    return of(result);
  }
}
