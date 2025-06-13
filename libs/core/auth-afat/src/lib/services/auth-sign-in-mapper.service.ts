import { Injectable } from '@angular/core';
import { AuthLoginInput } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthSignInMapperService {
  toModel(data: AuthLoginInput) {
    return {
      email: data['email'],
      password: data['password'],
    };
  }

  toJson(data: AuthLoginInput) {
    return {
      email: data['email'],
      password: data['password'],
    };
  }
}
