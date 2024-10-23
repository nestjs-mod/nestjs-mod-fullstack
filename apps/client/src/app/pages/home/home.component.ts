import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [NzBreadCrumbModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
