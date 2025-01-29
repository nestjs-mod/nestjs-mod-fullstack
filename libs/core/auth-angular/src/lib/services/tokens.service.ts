import { Injectable } from '@angular/core';
import { BehaviorSubject, merge, of } from 'rxjs';
import { AuthTokens } from './auth.types';

@Injectable({ providedIn: 'root' })
export class TokensService {
  private tokens$ = new BehaviorSubject<AuthTokens | undefined>(undefined);

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

  setTokens(tokens: AuthTokens | undefined) {
    this.tokens$.next(tokens);
    if (tokens?.refresh_token) {
      localStorage.setItem('refreshToken', tokens.refresh_token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  getStream() {
    return merge(of(this.tokens$.value), this.tokens$.asObservable());
  }
}
