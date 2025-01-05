import { Injectable } from '@angular/core';
import { AuthToken } from '@authorizerdev/authorizer-js';
import { BehaviorSubject, merge, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TokensService {
  private tokens$ = new BehaviorSubject<AuthToken | undefined>(undefined);

  getRefreshToken() {
    return (
      this.tokens$.value?.refresh_token || localStorage.getItem('refreshToken')
    );
  }

  getAccessToken() {
    return (
      this.tokens$.value?.access_token || localStorage.getItem('accessToken')
    );
  }

  setTokens(tokens: AuthToken) {
    this.tokens$.next(tokens);
    if (tokens.refresh_token) {
      localStorage.setItem('refreshToken', tokens.refresh_token);
    }
  }

  getStream() {
    return merge(of(this.tokens$.value), this.tokens$.asObservable());
  }
}
