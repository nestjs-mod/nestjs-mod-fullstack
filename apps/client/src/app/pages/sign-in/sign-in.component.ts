import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  AuthService,
  AuthSignInFormComponent,
} from '@nestjs-mod-fullstack/auth-angular';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  imports: [NzBreadCrumbModule, TranslocoDirective, AuthSignInFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}
  onAfterSignIn() {
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
