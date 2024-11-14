import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthProfileFormComponent } from '@nestjs-mod-fullstack/auth-angular';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [NzBreadCrumbModule, AuthProfileFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {}
