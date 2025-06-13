import { Pipe, PipeTransform } from '@angular/core';
import { AuthGuardService } from '../services/auth-guard.service';

@Pipe({
  name: 'checkUserRoles',
  pure: true,
  standalone: true,
})
export class CheckUserRolesPipe implements PipeTransform {
  constructor(private readonly authGuardService: AuthGuardService) {}

  public transform(authRoles?: string[]) {
    return this.authGuardService.checkUserRoles(authRoles);
  }
}
