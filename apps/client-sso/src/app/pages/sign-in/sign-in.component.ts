import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthRoleInterface } from '@nestjs-mod-fullstack/fullstack-rest-sdk-angular';
import { AuthService, AuthSignInFormComponent } from '@nestjs-mod-fullstack/auth-afat';
import { searchIn } from '@nestjs-mod/misc';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  imports: [NzBreadCrumbModule, TranslocoDirective, AuthSignInFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SignInComponent {
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}
  onAfterSignIn() {
    if (searchIn([AuthRoleInterface.Admin, AuthRoleInterface.User], this.authService.profile$.value?.roles)) {
      this.router.navigate(['/webhooks']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
