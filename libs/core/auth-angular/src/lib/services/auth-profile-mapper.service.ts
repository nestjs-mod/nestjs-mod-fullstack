import { Injectable } from '@angular/core';
import { AuthUpdateProfileInput } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthProfileMapperService {
  toModel(data: AuthUpdateProfileInput) {
    return {
      old_password: data['old_password'],
      new_password: data['new_password'],
      confirm_new_password: data['confirm_new_password'],
      picture: data['picture'],
    };
  }

  toJson(data: AuthUpdateProfileInput) {
    return {
      old_password: data['old_password'],
      new_password: data['new_password'],
      confirm_new_password: data['confirm_new_password'],
      picture: data['picture'],
    };
  }
}
