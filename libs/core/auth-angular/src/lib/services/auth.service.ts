import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, mergeMap, of } from 'rxjs';
import {
  AUTH_CONFIGURATION_TOKEN,
  AuthConfiguration,
} from './auth.configuration';
import {
  AuthLoginInput,
  AuthSignupInput,
  AuthUpdateProfileInput,
  AuthUser,
  AuthUserAndTokens,
} from './auth.types';
import { TokensService } from './tokens.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  profile$ = new BehaviorSubject<AuthUser | undefined>(undefined);

  constructor(
    protected readonly tokensService: TokensService,
    @Inject(AUTH_CONFIGURATION_TOKEN)
    protected readonly authConfiguration: AuthConfiguration
  ) {}

  signUp(data: AuthSignupInput) {
    return this.authConfiguration
      .signup({
        ...data,
        email: data.email?.toLowerCase(),
      })
      .pipe(
        mergeMap((result) => {
          return this.setProfileAndTokens(result).pipe(
            map((profile) => ({
              profile,
              tokens: result.tokens,
            }))
          );
        })
      );
  }

  updateProfile(data: AuthUpdateProfileInput) {
    return this.authConfiguration
      .updateProfile({
        ...data,
      })
      .pipe(
        mergeMap(() => this.authConfiguration.getProfile()),
        mergeMap((result) => this.setProfile(result))
      );
  }

  signIn(data: AuthLoginInput) {
    return this.authConfiguration
      .login({
        ...data,
        email: data.email?.toLowerCase(),
      })
      .pipe(
        mergeMap((result) => {
          return this.setProfileAndTokens(result).pipe(
            map((profile) => ({
              profile,
              tokens: result.tokens,
            }))
          );
        })
      );
  }

  signOut() {
    return this.authConfiguration.logout().pipe(
      mergeMap(() => {
        return this.clearProfileAndTokens();
      })
    );
  }

  refreshToken() {
    return this.authConfiguration.refreshToken().pipe(
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
    return this.setProfileAndTokens({} as AuthUserAndTokens);
  }

  setProfileAndTokens(result: AuthUserAndTokens | undefined) {
    this.tokensService.setTokens(result?.tokens);
    return this.setProfile(result?.user);
  }

  setProfile(result: AuthUser | undefined) {
    this.profile$.next(result);
    return of(result);
  }
}
