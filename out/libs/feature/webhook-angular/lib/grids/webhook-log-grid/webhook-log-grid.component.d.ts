import { OnChanges, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  WebhookLogInterface,
  WebhookLogScalarFieldEnumInterface,
} from '@nestjs-mod-fullstack/app-angular-rest-sdk';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { BehaviorSubject } from 'rxjs';
import { NgChanges, RequestMeta } from '@nestjs-mod-fullstack/common-angular';
import { WebhookLogService } from '../../services/webhook-log.service';
import * as i0 from '@angular/core';
export declare class WebhookLogGridComponent implements OnInit, OnChanges {
  private readonly webhookLogService;
  webhookId: string | undefined;
  items$: BehaviorSubject<WebhookLogInterface[]>;
  meta$: BehaviorSubject<RequestMeta | undefined>;
  searchField: FormControl<string | null>;
  selectedIds$: BehaviorSubject<string[]>;
  keys: WebhookLogScalarFieldEnumInterface[];
  columns: {
    [x: string]:
      | 'webhook-log.grid.columns.id'
      | 'webhook-log.grid.columns.request'
      | 'webhook-log.grid.columns.response'
      | 'webhook-log.grid.columns.response-status'
      | 'webhook-log.grid.columns.webhook-status';
  };
  WebhookLogScalarFieldEnumInterface: {
    id: WebhookLogScalarFieldEnumInterface;
    request: WebhookLogScalarFieldEnumInterface;
    responseStatus: WebhookLogScalarFieldEnumInterface;
    response: WebhookLogScalarFieldEnumInterface;
    webhookStatus: WebhookLogScalarFieldEnumInterface;
    webhookId: WebhookLogScalarFieldEnumInterface;
    externalTenantId: WebhookLogScalarFieldEnumInterface;
    createdAt: WebhookLogScalarFieldEnumInterface;
    updatedAt: WebhookLogScalarFieldEnumInterface;
  };
  private filters?;
  constructor(webhookLogService: WebhookLogService);
  ngOnChanges(changes: NgChanges<WebhookLogGridComponent>): void;
  ngOnInit(): void;
  loadMany(args?: {
    filters?: Record<string, string>;
    meta?: RequestMeta;
    queryParams?: NzTableQueryParams;
    force?: boolean;
  }): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<WebhookLogGridComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    WebhookLogGridComponent,
    'webhook-log-grid',
    never,
    { webhookId: { alias: 'webhookId'; required: true } },
    {},
    never,
    never,
    true,
    never
  >;
}
