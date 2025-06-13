import { Injectable } from '@angular/core';
import {
  AuthProfileMapperService,
  AuthUpdateProfileInput,
} from '@nestjs-mod-fullstack/auth-afat';

@Injectable({ providedIn: 'root' })
export class CustomAuthProfileMapperService extends AuthProfileMapperService {
  override toModel(data: AuthUpdateProfileInput) {
    return {
      oldPassword: data['oldPassword'],
      newPassword: data['newPassword'],
      confirmNewPassword: data['confirmNewPassword'],
      picture: data['picture'],
      timezone: data['timezone'],
    };
  }

  override toJson(data: AuthUpdateProfileInput) {
    return {
      oldPassword: data['oldPassword'],
      newPassword: data['newPassword'],
      confirmNewPassword: data['confirmNewPassword'],
      picture: data['picture'],
      timezone: data['timezone'],
    };
  }
}
