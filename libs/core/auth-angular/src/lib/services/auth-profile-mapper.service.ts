import { Injectable } from '@angular/core';
import { AuthUpdateProfileInput } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthProfileMapperService {
  toModel(data: AuthUpdateProfileInput) {
    return {
      oldPassword: data['oldPassword'],
      newPassword: data['newPassword'],
      confirmNewPassword: data['confirmNewPassword'],
      picture: data['picture'],
    };
  }

  toJson(data: AuthUpdateProfileInput) {
    return {
      oldPassword: data['oldPassword'],
      newPassword: data['newPassword'],
      confirmNewPassword: data['confirmNewPassword'],
      picture: data['picture'],
    };
  }
}
