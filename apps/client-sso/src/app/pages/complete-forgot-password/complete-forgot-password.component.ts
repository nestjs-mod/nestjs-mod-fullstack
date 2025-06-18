import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthRoleInterface } from '@nestjs-mod-fullstack/fullstack-rest-sdk-angular';
import { AuthCompleteForgotPasswordFormComponent, AuthService } from '@nestjs-mod-fullstack/auth-afat';
import { searchIn } from '@nestjs-mod/misc';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'app-complete-forgot-password',
  templateUrl: './complete-forgot-password.component.html',
  imports: [NzBreadCrumbModule, TranslocoDirective, AuthCompleteForgotPasswordFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class CompleteForgotPasswordComponent {
  code?: string | null;
  redirectUri?: string | null;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
  ) {
    this.code = this.activatedRoute.snapshot.queryParamMap.get('code');
    this.redirectUri = this.activatedRoute.snapshot.queryParamMap.get('redirect_uri');
  }

  onAfterCompleteForgotPassword() {
    if (!this.redirectUri) {
      if (searchIn([AuthRoleInterface.Admin, AuthRoleInterface.User], this.authService.profile$.value?.roles)) {
        this.router.navigate(['/webhooks']);
      } else {
        this.router.navigate(['/home']);
      }
    } else {
      location.href = this.redirectUri;
    }
  }
}
