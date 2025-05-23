import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  WebhookLogInterface,
  WebhookLogScalarFieldEnumInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import isEqual from 'lodash/fp/isEqual';
import omit from 'lodash/fp/omit';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  merge,
  Observable,
  tap,
} from 'rxjs';

import {
  TranslocoDirective,
  TranslocoPipe,
  TranslocoService,
} from '@jsverse/transloco';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { TranslocoDatePipe } from '@jsverse/transloco-locale';
import {
  getQueryMetaByParams,
  NgChanges,
  NzTableSortOrderDetectorPipe,
} from '@nestjs-mod/afat';
import { getQueryMeta, RequestMeta } from '@nestjs-mod/misc';
import { WebhookLogFormComponent } from '../../forms/webhook-log-form/webhook-log-form.component';
import { WebhookLogService } from '../../services/webhook-log.service';

@UntilDestroy()
@Component({
  imports: [
    NzGridModule,
    NzMenuModule,
    NzLayoutModule,
    NzTableModule,
    NzDividerModule,
    CommonModule,
    RouterModule,
    NzModalModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableSortOrderDetectorPipe,
    TranslocoDirective,
    TranslocoPipe,
    TranslocoDatePipe,
  ],
  selector: 'webhook-log-grid',
  templateUrl: './webhook-log-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhookLogGridComponent implements OnInit, OnChanges {
  @Input({ required: true })
  webhookId!: string | undefined;
  @Input()
  forceLoadStream?: Observable<unknown>[];

  items$ = new BehaviorSubject<WebhookLogInterface[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);
  keys = [
    WebhookLogScalarFieldEnumInterface.id,
    WebhookLogScalarFieldEnumInterface.request,
    WebhookLogScalarFieldEnumInterface.response,
    WebhookLogScalarFieldEnumInterface.responseStatus,
    WebhookLogScalarFieldEnumInterface.webhookStatus,
  ];
  columns = {
    [WebhookLogScalarFieldEnumInterface.id]: marker(
      'webhook-log.grid.columns.id'
    ),
    [WebhookLogScalarFieldEnumInterface.request]: marker(
      'webhook-log.grid.columns.request'
    ),
    [WebhookLogScalarFieldEnumInterface.response]: marker(
      'webhook-log.grid.columns.response'
    ),
    [WebhookLogScalarFieldEnumInterface.responseStatus]: marker(
      'webhook-log.grid.columns.response-status'
    ),
    [WebhookLogScalarFieldEnumInterface.webhookStatus]: marker(
      'webhook-log.grid.columns.webhook-status'
    ),
  };
  WebhookLogScalarFieldEnumInterface = WebhookLogScalarFieldEnumInterface;

  private filters?: Record<string, string>;

  constructor(
    private readonly webhookLogService: WebhookLogService,
    private readonly nzModalService: NzModalService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly translocoService: TranslocoService
  ) {}

  ngOnChanges(changes: NgChanges<WebhookLogGridComponent>): void {
    // need for ignore dbl load
    if (!changes.webhookId.firstChange) {
      this.loadMany({ force: true });
    } else {
      this.loadMany();
    }
  }

  ngOnInit(): void {
    merge(
      this.searchField.valueChanges.pipe(
        debounceTime(700),
        distinctUntilChanged()
      ),
      ...(this.forceLoadStream ? this.forceLoadStream : [])
    )
      .pipe(
        tap(() => this.loadMany({ force: true })),
        untilDestroyed(this)
      )
      .subscribe();
    this.loadMany();
  }

  loadMany(args?: {
    filters?: Record<string, string>;
    meta?: RequestMeta;
    queryParams?: NzTableQueryParams;
    force?: boolean;
  }) {
    let meta = { meta: {}, ...(args || {}) }.meta as RequestMeta;
    const { queryParams, filters } = { filters: {}, ...(args || {}) };

    if (!args?.force && queryParams) {
      meta = getQueryMetaByParams(queryParams);
    }

    meta = getQueryMeta(meta, this.meta$.value);

    if (!filters['search'] && this.searchField.value) {
      filters['search'] = this.searchField.value;
    }

    if (!filters['webhookId'] && this.webhookId) {
      filters['webhookId'] = this.webhookId;
    }

    if (
      !args?.force &&
      isEqual(
        omit(['totalResults'], { ...meta, ...filters }),
        omit(['totalResults'], {
          ...this.meta$.value,
          ...this.filters,
        })
      )
    ) {
      return;
    }

    if (!filters['webhookId']) {
      this.items$.next([]);
      this.selectedIds$.next([]);
    } else {
      this.webhookLogService
        .findMany({ filters, meta })
        .pipe(
          tap((result) => {
            this.items$.next(
              result.webhookLogs.map((item) => ({
                ...item,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                request: JSON.stringify(item.request) as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                response: JSON.stringify(item.response) as any,
              }))
            );
            this.meta$.next({ ...result.meta, ...meta });
            this.filters = filters;
            this.selectedIds$.next([]);
          }),
          untilDestroyed(this)
        )
        .subscribe();
    }
  }

  showCreateOrUpdateModal(id?: string): void {
    const modal = this.nzModalService.create<
      WebhookLogFormComponent,
      WebhookLogFormComponent
    >({
      nzTitle: this.translocoService.translate('webhook-log.view-modal.title', {
        id,
      }),
      nzContent: WebhookLogFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
      } as WebhookLogFormComponent,
      nzWidth: 800,
      nzFooter: [
        {
          label: this.translocoService.translate('Close'),
          onClick: () => {
            modal.close();
          },
        },
      ],
    });
  }

  showDeleteModal(id?: string) {
    if (!id) {
      return;
    }
    this.nzModalService.confirm({
      nzTitle: this.translocoService.translate(
        `webhook-log.delete-modal.title`,
        {
          id,
        }
      ),
      nzOkText: this.translocoService.translate('Yes'),
      nzCancelText: this.translocoService.translate('No'),
      nzOnOk: () => {
        this.webhookLogService
          .deleteOne(id)
          .pipe(
            tap(() => {
              this.loadMany({ force: true });
            }),
            untilDestroyed(this)
          )
          .subscribe();
      },
    });
  }
}
