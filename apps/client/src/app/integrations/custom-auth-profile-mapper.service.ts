import { Injectable } from '@angular/core';
import {
  AuthProfileMapperService,
  AuthUpdateProfileInput,
} from '@nestjs-mod-fullstack/auth-angular';

@Injectable({ providedIn: 'root' })
export class CustomAuthProfileMapperService extends AuthProfileMapperService {
  override toModel(data: AuthUpdateProfileInput) {
    return {
      old_password: data['old_password'],
      new_password: data['new_password'],
      confirm_new_password: data['confirm_new_password'],
      picture: data['picture'],
      timezone: data['timezone'],
    };
  }

  override toJson(data: AuthUpdateProfileInput) {
    return {
      old_password: data['old_password'],
      new_password: data['new_password'],
      confirm_new_password: data['confirm_new_password'],
      picture: data['picture'],
      timezone: data['timezone'],
    };
  }
}
