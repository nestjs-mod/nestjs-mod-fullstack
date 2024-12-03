import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  WebhookGridComponent,
  WebhookLogGridComponent,
} from '@nestjs-mod-fullstack/webhook-angular';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@Component({
  standalone: true,
  selector: 'app-webhooks',
  templateUrl: './webhooks.component.html',
  imports: [
    NzBreadCrumbModule,
    WebhookGridComponent,
    WebhookLogGridComponent,
    NzGridModule,
    NzLayoutModule,
    AsyncPipe,
    NgIf,
    TranslocoDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhooksComponent {}
