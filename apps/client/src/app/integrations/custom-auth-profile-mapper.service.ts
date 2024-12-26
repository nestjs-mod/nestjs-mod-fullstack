import { Injectable } from '@angular/core';
import { UpdateProfileInput } from '@authorizerdev/authorizer-js';
import { AuthProfileMapperService } from '@nestjs-mod-fullstack/auth-angular';

@Injectable({ providedIn: 'root' })
export class CustomAuthProfileMapperService extends AuthProfileMapperService {
  override toModel(data: UpdateProfileInput) {
    return {
      old_password: data['old_password'],
      new_password: data['new_password'],
      confirm_new_password: data['confirm_new_password'],
      picture: data['picture'],
      timezone: data['timezone'],
    };
  }

  override toJson(data: UpdateProfileInput) {
    return {
      old_password: data['old_password'],
      new_password: data['new_password'],
      confirm_new_password: data['confirm_new_password'],
      picture: data['picture'],
      timezone: data['timezone'],
    };
  }
}
