import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthForgotPasswordFormComponent } from '@nestjs-mod-fullstack/auth-afat';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  imports: [NzBreadCrumbModule, TranslocoDirective, AuthForgotPasswordFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ForgotPasswordComponent {}
