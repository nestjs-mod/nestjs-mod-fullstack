import { Injectable } from '@angular/core';
import { AuthSignupInput } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthSignUpMapperService {
  toModel(data: AuthSignupInput) {
    return {
      email: data['email'],
      password: data['password'],
      confirmPassword: data['confirmPassword'],
    };
  }

  toJson(data: AuthSignupInput) {
    return {
      email: data['email'],
      password: data['password'],
      confirmPassword: data['confirmPassword'],
    };
  }
}
