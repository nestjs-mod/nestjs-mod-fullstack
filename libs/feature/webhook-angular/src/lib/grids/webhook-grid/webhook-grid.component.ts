import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WebhookInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
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
import { BehaviorSubject, debounceTime, distinctUntilChanged, tap } from 'rxjs';

import {
  TranslocoDirective,
  TranslocoPipe,
  TranslocoService,
} from '@jsverse/transloco';
import {
  getQueryMeta,
  getQueryMetaByParams,
  NzTableSortOrderDetectorPipe,
  RequestMeta,
} from '@nestjs-mod-fullstack/common-angular';
import { WebhookFormComponent } from '../../forms/webhook-form/webhook-form.component';
import { WebhookService } from '../../services/webhook.service';
import { marker } from '@jsverse/transloco-keys-manager/marker';

@UntilDestroy()
@Component({
  standalone: true,
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
  ],
  selector: 'webhook-grid',
  templateUrl: './webhook-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhookGridComponent implements OnInit {
  items$ = new BehaviorSubject<WebhookInterface[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);
  keys = [
    'id',
    'enabled',
    'endpoint',
    'eventName',
    'headers',
    'requestTimeout',
  ];
  columns = {
    id: marker('webhook.grid.columns.id'),
    enabled: marker('webhook.grid.columns.enabled'),
    endpoint: marker('webhook.grid.columns.endpoint'),
    eventName: marker('webhook.grid.columns.event-name'),
    headers: marker('webhook.grid.columns.headers'),
    requestTimeout: marker('webhook.grid.columns.request-timeout'),
  };

  private filters?: Record<string, string>;

  constructor(
    private readonly webhookService: WebhookService,
    private readonly nzModalService: NzModalService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly translocoService: TranslocoService
  ) {
    this.searchField.valueChanges
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        tap(() => this.loadMany({ force: true })),
        untilDestroyed(this)
      )
      .subscribe();
  }

  ngOnInit(): void {
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

    this.webhookService
      .findMany({ filters, meta })
      .pipe(
        tap((result) => {
          this.items$.next(
            result.webhooks.map((item) => ({
              ...item,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              headers: JSON.stringify(item.headers) as any,
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

  showCreateOrUpdateModal(id?: string): void {
    const modal = this.nzModalService.create<
      WebhookFormComponent,
      WebhookFormComponent
    >({
      nzTitle: id
        ? this.translocoService.translate('webhook.update-modal.title')
        : this.translocoService.translate('webhook.create-modal.title'),
      nzContent: WebhookFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        hideButtons: true,
        id,
      } as WebhookFormComponent,
      nzFooter: [
        {
          label: this.translocoService.translate('Cancel'),
          onClick: () => {
            modal.close();
          },
        },
        {
          label: id
            ? this.translocoService.translate('Save')
            : this.translocoService.translate('Create'),
          onClick: () => {
            modal.componentInstance?.afterUpdate
              .pipe(
                tap(() => {
                  modal.close();
                  this.loadMany({ force: true });
                }),
                untilDestroyed(modal.componentInstance)
              )
              .subscribe();

            modal.componentInstance?.afterCreate
              .pipe(
                tap(() => {
                  modal.close();
                  this.loadMany({ force: true });
                }),
                untilDestroyed(modal.componentInstance)
              )
              .subscribe();

            modal.componentInstance?.submitForm();
          },
          type: 'primary',
        },
      ],
    });
  }

  showDeleteModal(id: string) {
    this.nzModalService.confirm({
      nzTitle: this.translocoService
        .translate(`webhook.delete-modal.title`)
        .replace('{{ id }}', id),
      nzOkText: this.translocoService.translate('Yes'),
      nzCancelText: this.translocoService.translate('No'),
      nzOnOk: () => {
        this.webhookService
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
