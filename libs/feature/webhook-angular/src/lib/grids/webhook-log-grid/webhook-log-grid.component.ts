import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WebhookLogObjectInterface } from '@nestjs-mod-fullstack/app-angular-rest-sdk';
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
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { BehaviorSubject, debounceTime, distinctUntilChanged, tap } from 'rxjs';

import {
  getQueryMeta,
  getQueryMetaByParams,
  NgChanges,
  NzTableSortOrderDetectorPipe,
  RequestMeta,
} from '@nestjs-mod-fullstack/common-angular';
import { WebhookLogService } from '../../services/webhook-log.service';

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
  ],
  selector: 'webhook-log-grid',
  templateUrl: './webhook-log-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhookLogGridComponent implements OnInit, OnChanges {
  @Input({ required: true })
  webhookId!: string | undefined;

  items$ = new BehaviorSubject<WebhookLogObjectInterface[]>([]);
  meta$ = new BehaviorSubject<RequestMeta | undefined>(undefined);
  searchField = new FormControl('');
  selectedIds$ = new BehaviorSubject<string[]>([]);
  columns = ['id', 'request', 'response', 'responseStatus', 'webhookStatus'];

  private filters?: Record<string, string>;

  constructor(private readonly webhookLogService: WebhookLogService) {
    this.searchField.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => this.loadMany({ force: true })),
        untilDestroyed(this)
      )
      .subscribe();
  }

  ngOnChanges(changes: NgChanges<WebhookLogGridComponent>): void {
    // need for ignore dbl load
    if (!changes.webhookId.firstChange) {
      this.loadMany({ force: true });
    } else {
      this.loadMany();
    }
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
}
