import { Injectable } from '@angular/core';
import { AuthToken } from '@authorizerdev/authorizer-js';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TokensService {
  tokens$ = new BehaviorSubject<AuthToken | undefined>(undefined);
}
