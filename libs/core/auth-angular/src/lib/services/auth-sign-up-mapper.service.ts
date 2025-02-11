import { Injectable } from '@angular/core';
import { AuthSignupInput } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthSignUpMapperService {
  toModel(data: AuthSignupInput) {
    return {
      email: data['email'],
      password: data['password'],
      confirm_password: data['confirm_password'],
    };
  }

  toJson(data: AuthSignupInput) {
    return {
      email: data['email'],
      password: data['password'],
      confirm_password: data['confirm_password'],
    };
  }
}
