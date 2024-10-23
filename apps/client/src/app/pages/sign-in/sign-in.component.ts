import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { WebhookAuthFormComponent } from '@nestjs-mod-fullstack/webhook-angular';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  standalone: true,
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  imports: [NzBreadCrumbModule, WebhookAuthFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  constructor(private readonly router: Router) {}
  onAfterSignIn() {
    this.router.navigate(['/webhook']);
  }
}
