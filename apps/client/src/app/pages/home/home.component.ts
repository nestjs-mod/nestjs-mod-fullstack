import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [NzBreadCrumbModule, NzTypographyModule, NzCollapseModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
