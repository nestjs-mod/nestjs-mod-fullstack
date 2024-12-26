import { Injectable } from '@angular/core';
import { UpdateProfileInput } from '@authorizerdev/authorizer-js';

@Injectable({ providedIn: 'root' })
export class AuthProfileMapperService {
  toModel(data: UpdateProfileInput) {
    return {
      old_password: data['old_password'],
      new_password: data['new_password'],
      confirm_new_password: data['confirm_new_password'],
      picture: data['picture'],
    };
  }

  toJson(data: UpdateProfileInput) {
    return {
      old_password: data['old_password'],
      new_password: data['new_password'],
      confirm_new_password: data['confirm_new_password'],
      picture: data['picture'],
    };
  }
}
