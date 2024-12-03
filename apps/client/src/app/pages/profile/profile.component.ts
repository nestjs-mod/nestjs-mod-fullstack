import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthProfileFormComponent } from '@nestjs-mod-fullstack/auth-angular';
import { UntilDestroy } from '@ngneat/until-destroy';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@UntilDestroy()
@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [NzBreadCrumbModule, AuthProfileFormComponent, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {}
