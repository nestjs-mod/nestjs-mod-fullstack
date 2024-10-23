import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  WebhookGridComponent,
  WebhookLogGridComponent,
} from '@nestjs-mod-fullstack/webhook-angular';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@Component({
  standalone: true,
  selector: 'app-webhook',
  templateUrl: './webhook.component.html',
  imports: [
    NzBreadCrumbModule,
    WebhookGridComponent,
    WebhookLogGridComponent,
    NzGridModule,
    NzLayoutModule,
    AsyncPipe,
    NgIf,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhookComponent {}
