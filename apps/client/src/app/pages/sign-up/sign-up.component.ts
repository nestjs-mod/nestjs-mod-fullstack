import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  AuthService,
  AuthSignUpFormComponent,
} from '@nestjs-mod-fullstack/auth-angular';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  imports: [NzBreadCrumbModule, TranslocoDirective, AuthSignUpFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent {
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}
  onAfterSignUp() {
    if (
      this.authService.profile$.value?.roles?.includes('admin') ||
      this.authService.profile$.value?.roles?.includes('user')
    ) {
      this.router.navigate(['/webhooks']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
