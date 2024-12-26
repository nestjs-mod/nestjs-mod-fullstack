import { Injectable } from '@angular/core';
import { SignupInput } from '@authorizerdev/authorizer-js';

@Injectable({ providedIn: 'root' })
export class AuthSignUpMapperService {
  toModel(data: SignupInput) {
    return {
      email: data['email'],
      password: data['password'],
      confirm_password: data['confirm_password'],
    };
  }

  toJson(data: SignupInput) {
    return {
      email: data['email'],
      password: data['password'],
      confirm_password: data['confirm_password'],
    };
  }
}
