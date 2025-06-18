import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { DemoGridComponent } from './grids/demo-grid/demo-grid.component';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  imports: [NzBreadCrumbModule, DemoGridComponent, NzGridModule, NzLayoutModule, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class DemoComponent {}
