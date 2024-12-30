import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { DemoGridComponent } from './grids/demo-grid/demo-grid.component';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  imports: [
    NzBreadCrumbModule,
    DemoGridComponent,
    NzGridModule,
    NzLayoutModule,
    AsyncPipe,
    NgIf,
    TranslocoDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoComponent {}
