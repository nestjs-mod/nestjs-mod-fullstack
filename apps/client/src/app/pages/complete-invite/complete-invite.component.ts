import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import {
  AuthCompleteForgotPasswordFormComponent,
  AuthService,
} from '@nestjs-mod-fullstack/auth-angular';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'app-complete-invite',
  templateUrl: './complete-invite.component.html',
  imports: [
    NzBreadCrumbModule,
    TranslocoDirective,
    AuthCompleteForgotPasswordFormComponent,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompleteInviteComponent {
  code?: string | null;
  redirectUri?: string | null;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService
  ) {
    this.code = this.activatedRoute.snapshot.queryParamMap.get('code');
    this.redirectUri =
      this.activatedRoute.snapshot.queryParamMap.get('redirect_uri');
  }

  onAfterCompleteForgotPassword() {
    if (!this.redirectUri) {
      if (
        this.authService.profile$.value?.roles?.includes('admin') ||
        this.authService.profile$.value?.roles?.includes('user')
      ) {
        this.router.navigate(['/webhooks']);
      } else {
        this.router.navigate(['/home']);
      }
    } else {
      location.href = this.redirectUri;
    }
  }
}
