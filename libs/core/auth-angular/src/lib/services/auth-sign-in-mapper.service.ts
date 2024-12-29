import { Injectable } from '@angular/core';
import { LoginInput } from '@authorizerdev/authorizer-js';

@Injectable({ providedIn: 'root' })
export class AuthSignInMapperService {
  toModel(data: LoginInput) {
    return {
      email: data['email'],
      password: data['password'],
    };
  }

  toJson(data: LoginInput) {
    return {
      email: data['email'],
      password: data['password'],
    };
  }
}
