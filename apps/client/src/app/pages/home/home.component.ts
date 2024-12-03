import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import {
  NzTextCopyComponent,
  NzTypographyModule,
} from 'ng-zorro-antd/typography';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [
    NzBreadCrumbModule,
    NzTypographyModule,
    TranslocoDirective,
    NzCollapseModule,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
